import express from "express"
import { createServer } from "https"
import { Server as SocketIOServer } from "socket.io"
import dotenv from "dotenv"
import { readFileSync } from "fs"
import {
    joinRoomHandler,
    leaveRoomHandler,
    handleRoomSettingsChange,
    handleReadyStatusChange,
    handleDisconnect,
} from "@/websocket/handlers/roomHandler"
import { connectToDatabase } from "@/websocket/database"

// Environment değişkenlerini yükle
dotenv.config()

const app = express()

// SSL sertifika ve anahtar dosyalarını env dosyasından alıyoruz
const httpsOptions = {
    key: readFileSync(process.env.SSL_KEY_PATH!), // env dosyasından anahtar dosyası yolu
    cert: readFileSync(process.env.SSL_CERT_PATH!), // env dosyasından sertifika dosyası yolu
}

// HTTPS sunucusunu oluştur
const httpsServer = createServer(httpsOptions, app)

const io = new SocketIOServer(httpsServer, {
    path: "/api/socket",
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

const PORT = process.env.PORT || 4000

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id)

    socket.on("joinRoom", (roomCode: string, userId: string, user) => {
        joinRoomHandler(io, socket, roomCode, userId, user)
    })

    socket.on("leaveRoom", (roomCode: string, userId: string) => {
        leaveRoomHandler(io, socket, roomCode, userId)
    })

    socket.on("roomSettingsUpdated", ({ roomCode, settings }) => {
        handleRoomSettingsChange(io, socket, roomCode, settings)
    })

    socket.on("readyStatusChanged", ({ roomCode, userId, isReady }) => {
        handleReadyStatusChange(io, socket, roomCode, userId, isReady)
    })

    socket.on("disconnect", () => {
        handleDisconnect(io, socket)
        console.log("Client disconnected:", socket.id)
    })
})

const startServer = async () => {
    try {
        await connectToDatabase()
        httpsServer.listen(PORT, () => {
            console.log(`Server is running on https://localhost:${PORT}`)
        })
    } catch (error) {
        console.error("Error starting the server:", error)
        process.exit(1)
    }
}

startServer()
