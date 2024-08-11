import { Server as SocketIOServer, Socket as IOSocket } from "socket.io"
import { User, RoomSettings } from "@/app/shared-types"
import {
    getRoomData,
    deleteRoom,
    removeUserFromRoom,
} from "@/websocket/services/roomService"

export async function joinRoomHandler(
    io: SocketIOServer,
    socket: IOSocket,
    roomCode: string,
    userId: string,
    user: User
) {
    try {
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
        const roomData = await getRoomData(roomCode)

        if (!roomData) {
            console.error(`Room ${roomCode} not found`)
            socket.emit("error", "Room not found")
            return
        }

        // Remove the user from the room in the database
        const userRemoved = await removeUserFromRoom(roomCode, userId)
        if (!userRemoved) return

        const updatedUsers = roomData.users.filter((user) => user.id !== userId)

        socket.leave(roomCode)

        if (updatedUsers.length > 0) {
            io.to(roomCode).emit("playerListUpdated", updatedUsers)
            io.to(roomCode).emit("roomSettingsUpdated", {
                ...roomData,
                users: updatedUsers,
            })
        } else {
            // No users left in the room, delete the room from the database
            await deleteRoom(roomCode)
            console.log(`Room ${roomCode} deleted because it was empty`)
        }

        console.log(`User ${userId} left room ${roomCode}`)
    } catch (error) {
        console.error("Error in leaveRoomHandler:", error)
        socket.emit("error", "Could not leave room")
    }
}

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

// New function to handle disconnections
export const handleDisconnect = async (
    io: SocketIOServer,
    socket: IOSocket
) => {
    const { roomCode, userId } = socket.data

    if (roomCode && userId) {
        console.log(`Client disconnected: ${userId} from room: ${roomCode}`)
        await leaveRoomHandler(io, socket, roomCode, userId)
    } else {
        console.log(
            "Client disconnected but no roomCode or userId found on socket"
        )
    }
}
