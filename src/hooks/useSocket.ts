import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

const useSocket = (url: string): Socket | null => {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        if (!url) return

        const socketInstance: Socket = io(url, {
            path: "/api/socket",
        })

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
