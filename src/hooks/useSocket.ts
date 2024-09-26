import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

// Define the custom type extending the Socket.IO `Socket` type
interface CustomSocket extends Socket {
    data: {
        roomCode?: string
        userId?: string
    }
}

const useSocket = (url: string): CustomSocket | null => {
    const [socket, setSocket] = useState<CustomSocket | null>(null)

    useEffect(() => {
        if (!url) return

        const socketInstance: CustomSocket = io(url, {
            path: "/api/socket",
            transports: ["websocket"],
            secure: process.env.NODE_ENV === "production", // Production'da secure: true
        }) as CustomSocket // Casting to CustomSocket type

        setSocket(socketInstance)

        socketInstance.on("connect", () => {
            console.log("Connected to server:", socketInstance.id)
        })

        socketInstance.on("disconnect", () => {
            console.log("Disconnected from server")
            setSocket(null)
        })

        return () => {
            socketInstance.disconnect()
        }
    }, [url])

    return socket
}

export default useSocket
