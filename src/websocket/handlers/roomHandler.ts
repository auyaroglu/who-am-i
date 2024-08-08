import { Server as SocketIOServer, Socket as IOSocket } from "socket.io"
import { User } from "@/app/shared-types"
import { getRoomData } from "@/websocket/services/roomService"
import { updateUserReadyStatus } from "@/websocket/services/roomService" // Move necessary server-side functions to roomService

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

        // Check if the user is already in the room to prevent duplication
        const existingUser = roomData.users.find((u) => u.id === userId)
        if (!existingUser) {
            roomData.users.push(user)
        }

        socket.join(roomCode) // Ensure socket is of type IOSocket

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

        socket.leave(roomCode) // Ensure socket is of type IOSocket

        io.to(roomCode).emit("playerListUpdated", updatedUsers)
        console.log(`User ${userId} left room ${roomCode}`)
    } catch (error) {
        console.error("Error in leaveRoomHandler:", error)
        socket.emit("error", "Could not leave room")
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
        const roomData = await getRoomData(roomCode)

        if (!roomData) {
            console.error(`Room ${roomCode} not found`)
            socket.emit("error", "Room not found")
            return
        }

        await updateUserReadyStatus(roomCode, userId, isReady)
        io.to(roomCode).emit("readyStatusChanged", userId, isReady)
    } catch (error) {
        console.error("Error in handleReadyStatusChange:", error)
        socket.emit("error", "Could not update ready status")
    }
}
