import express from "express"
import { createServer } from "http"
import { Server as SocketIOServer, Socket as IOSocket } from "socket.io"
import dotenv from "dotenv"
import {
    joinRoomHandler,
    leaveRoomHandler,
    handleReadyStatusChange,
} from "@/websocket/handlers/roomHandler" // Adjusted import
import { connectToDatabase } from "@/websocket/database"
import { User } from "@/app/shared-types"

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

const PORT = process.env.PORT || 4000

io.on("connection", (socket: IOSocket) => {
    // Explicitly type the socket
    console.log("New client connected:", socket.id)

    socket.on("joinRoom", (roomCode: string, userId: string, user: User) => {
        console.log(
            `joinRoom event received for user ${userId} and room ${roomCode}`
        )
        joinRoomHandler(io, socket, roomCode, userId, user)
    })

    socket.on("leaveRoom", (roomCode: string, userId: string) => {
        console.log(
            `leaveRoom event received for user ${userId} and room ${roomCode}`
        )
        leaveRoomHandler(io, socket, roomCode, userId)
    })

    socket.on(
        "readyStatusChanged",
        (roomCode: string, userId: string, isReady: boolean) => {
            console.log(
                `readyStatusChanged event received for user ${userId} in room ${roomCode}`
            )
            handleReadyStatusChange(io, socket, roomCode, userId, isReady)
        }
    )

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
    })
})

const startServer = async () => {
    try {
        await connectToDatabase()
        httpServer.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error("Error starting the server:", error)
        process.exit(1)
    }
}

startServer()
