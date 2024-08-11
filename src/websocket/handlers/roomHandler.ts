import { Server as SocketIOServer, Socket as IOSocket } from "socket.io"
import { User, RoomSettings } from "@/app/shared-types"
import { getRoomData } from "@/websocket/services/roomService"

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

        const updatedUsers = roomData.users.filter((user) => user.id !== userId)

        socket.leave(roomCode)

        io.to(roomCode).emit("playerListUpdated", updatedUsers)
        io.to(roomCode).emit("roomSettingsUpdated", {
            ...roomData,
            users: updatedUsers,
        })
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
        console.log("Emitted roomSettingsUpdated event:", {
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
        // Ensure the event is being emitted with correct data
        console.log("readyStatusChanged event received:", {
            roomCode,
            userId,
            isReady,
        })

        // Emit the event to all clients in the room
        io.to(roomCode).emit("readyStatusChanged", { userId, isReady })
    } catch (error) {
        console.error("Error in handleReadyStatusChange:", error)
        socket.emit("error", "Could not update ready status")
    }
}
