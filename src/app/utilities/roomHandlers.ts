import { Room, User } from "@/app/shared-types"
import {
    updateUserReadyStatus,
    leaveRoom,
    getRoomData,
} from "@/app/lib/actions/room.actions"
import { toast } from "@/app/components/ui/use-toast"
import { Socket as ClientSocket } from "socket.io-client"
import { Server as SocketIOServer, Socket as IOSocket } from "socket.io" // Import SocketIOServer and IOSocket

export const handlePlayerCountChange = (
    newPlayerCount: string,
    users: User[]
) => {
    if (users.length > parseInt(newPlayerCount, 10)) {
        toast({
            title: "Error",
            description: "The current number of players exceeds the new value.",
            variant: "destructive",
        })
    }
}

export const handleReadyToggle = async (
    roomData: Room,
    userId: string,
    currentUser: User | null,
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    socket: ClientSocket | null
) => {
    try {
        if (currentUser?.isAdmin) {
            toast({
                title: "Error",
                description: "Admin cannot change their ready status.",
                variant: "destructive",
            })
            return
        }

        const newIsReady = !currentUser?.isReady
        await updateUserReadyStatus(roomData.roomCode, userId, newIsReady)

        // Emit the change to the server
        if (socket) {
            socket.emit(
                "readyStatusChanged",
                roomData.roomCode,
                userId,
                newIsReady
            )
        }

        setUsers((prevUsers: User[]) =>
            prevUsers.map((user: User) =>
                user.id === userId ? { ...user, isReady: newIsReady } : user
            )
        )
    } catch (error) {
        toast({
            title: "Error",
            description: "An error occurred while updating readiness status.",
            variant: "destructive",
        })
    }
}

export const handleLeaveRoom = async (
    roomData: Room,
    userId: string,
    redirect: () => void,
    socket?: ClientSocket | null
) => {
    try {
        await leaveRoom(roomData.roomCode, userId)
        if (socket) {
            socket.emit("leaveRoom", roomData.roomCode, userId)
        }
        redirect()
        toast({
            title: "Success",
            description: "You have successfully left the room.",
            variant: "success",
        })
    } catch (error) {
        toast({
            title: "Error",
            description: "An error occurred while leaving the room.",
            variant: "destructive",
        })
    }
}

export const handleStartGame = (users: User[]) => {
    const allReady = users.every((user) => user.isReady)

    if (!allReady) {
        toast({
            title: "Error",
            description: "All players must be ready to start the game.",
            variant: "destructive",
        })
        return
    }

    // Oyun başlatma işlemleri burada yapılabilir
    toast({
        title: "Game Started",
        description: "The game has been started by the admin.",
        variant: "success",
    })
}

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
