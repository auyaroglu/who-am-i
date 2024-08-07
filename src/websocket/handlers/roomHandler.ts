import { Server as SocketIOServer, Socket } from "socket.io"
import { User } from "@/app/shared-types" // Import User from shared-types
import { getRoomData } from "@/websocket/services/roomService"

export async function joinRoomHandler(
    io: SocketIOServer,
    socket: Socket,
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
    socket: Socket,
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
        console.log(`User ${userId} left room ${roomCode}`)
    } catch (error) {
        console.error("Error in leaveRoomHandler:", error)
        socket.emit("error", "Could not leave room")
    }
}
