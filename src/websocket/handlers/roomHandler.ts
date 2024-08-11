import { Server as SocketIOServer, Socket as IOSocket } from "socket.io"
import { connectToDatabase } from "@/websocket/database"
import { Room, RoomSettings, User } from "@/app/shared-types"

// Store users who have disconnected temporarily
const disconnectedUsers = new Map<string, NodeJS.Timeout>()

// Function to get room data from the database
async function getRoomData(roomCode: string): Promise<Room | null> {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("rooms")
        const room = await collection.findOne({ roomCode })
        return room as Room | null
    } catch (error) {
        console.error("Error fetching room data:", error)
        return null
    }
}

export async function joinRoomHandler(
    io: SocketIOServer,
    socket: IOSocket,
    roomCode: string,
    userId: string,
    user: User
) {
    try {
        // If the user was temporarily disconnected, clear their removal timeout
        if (disconnectedUsers.has(userId)) {
            clearTimeout(disconnectedUsers.get(userId)!)
            disconnectedUsers.delete(userId)
            console.log(`User ${userId} rejoined room ${roomCode}`)
        }

        const roomData = await getRoomData(roomCode)

        if (!roomData) {
            console.error(`Room ${roomCode} not found`)
            socket.emit("error", "Room not found")
            return
        }

        const existingUser = roomData.users.find((u) => u.id === userId)
        if (!existingUser) {
            roomData.users.push(user)
        }

        // Store roomCode and userId on the socket object
        socket.data = { roomCode, userId }

        socket.join(roomCode)
        io.to(roomCode).emit("playerListUpdated", roomData.users)
        console.log(`User ${userId} joined room ${roomCode}`)
    } catch (error) {
        console.error("Error in joinRoomHandler:", error)
        socket.emit("error", "Could not join room")
    }
}

export async function leaveRoomHandler(
    io: SocketIOServer,
    socket: IOSocket,
    roomCode: string,
    userId: string
) {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("rooms")

        const roomData = await collection.findOne({ roomCode })

        if (!roomData) {
            console.error(`Room ${roomCode} not found`)
            socket.emit("error", "Room not found")
            return
        }

        let updatedUsers = roomData.users.filter(
            (user: User) => user.id !== userId
        )

        // If the leaving user is the admin, promote the next user to admin
        const leavingUser = roomData.users.find(
            (user: User) => user.id === userId
        )
        if (leavingUser?.isAdmin && updatedUsers.length > 0) {
            updatedUsers[0].isAdmin = true
            updatedUsers[0].isReady = true

            // Update the new admin's status in the database
            await collection.updateOne(
                { roomCode, "users.id": updatedUsers[0].id },
                {
                    $set: {
                        "users.$.isAdmin": true,
                        "users.$.isReady": true,
                    },
                }
            )

            console.log(
                `User ${updatedUsers[0].id} is now the admin of room ${roomCode}`
            )
        }

        if (updatedUsers.length > 0) {
            // Update the room with the new list of users in the database
            await collection.updateOne(
                { roomCode },
                {
                    $set: {
                        users: updatedUsers,
                    },
                }
            )

            io.to(roomCode).emit("playerListUpdated", updatedUsers)
            io.to(roomCode).emit("roomSettingsUpdated", {
                ...roomData,
                users: updatedUsers,
            })
        } else {
            // No users left in the room, delete the room from the database
            await collection.deleteOne({ roomCode })
            console.log(`Room ${roomCode} deleted because it was empty`)
        }

        socket.leave(roomCode)
        console.log(`User ${userId} left room ${roomCode}`)
    } catch (error) {
        console.error("Error in leaveRoomHandler:", error)
        socket.emit("error", "Could not leave room")
    }
}

// Handle room settings change
export const handleRoomSettingsChange = async (
    io: SocketIOServer,
    socket: IOSocket,
    roomCode: string,
    newSettings: RoomSettings
) => {
    try {
        const roomData = await getRoomData(roomCode)

        if (!roomData) {
            console.error(`Room ${roomCode} not found`)
            socket.emit("error", "Room not found")
            return
        }

        io.to(roomCode).emit("roomSettingsUpdated", {
            ...roomData,
            settings: newSettings,
        })
    } catch (error) {
        console.error("Error in handleRoomSettingsChange:", error)
        socket.emit("error", "Could not update room settings")
    }
}

// Handle ready status change
export const handleReadyStatusChange = async (
    io: SocketIOServer,
    socket: IOSocket,
    roomCode: string,
    userId: string,
    isReady: boolean
) => {
    try {
        io.to(roomCode).emit("readyStatusChanged", { userId, isReady })
    } catch (error) {
        console.error("Error in handleReadyStatusChange:", error)
        socket.emit("error", "Could not update ready status")
    }
}

// Handles user disconnections with a grace period for reconnection
export const handleDisconnect = async (
    io: SocketIOServer,
    socket: IOSocket
) => {
    const { roomCode, userId } = socket.data

    if (roomCode && userId) {
        console.log(`Client disconnected: ${userId} from room: ${roomCode}`)

        // Set a grace period for the user to reconnect
        const gracePeriod = 10000 // 10 seconds (you can adjust this)

        const timeout = setTimeout(async () => {
            await leaveRoomHandler(io, socket, roomCode, userId)
            disconnectedUsers.delete(userId)
        }, gracePeriod)

        // Store the user's disconnect timeout
        disconnectedUsers.set(userId, timeout)
    } else {
        console.log(
            "Client disconnected but no roomCode or userId found on socket"
        )
    }
}
