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

        // Update the ready status in the database
        await updateUserReadyStatus(roomData.roomCode, userId, newIsReady)

        // Emit the readyStatusChanged event to the server with correct parameters
        if (socket) {
            socket.emit("readyStatusChanged", {
                roomCode: roomData.roomCode,
                userId: userId,
                isReady: newIsReady,
            })
        }

        // Update the local state
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
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
        // console.log(`User ${userId} joined room ${roomCode}`)
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
            // If roomData is null, it means the room has been deleted successfully
            // console.log(`Room ${roomCode} has been deleted after the last user left.`)
            return false // No need to emit an error or proceed further
        }

        const updatedUsers = roomData.users.filter((user) => user.id !== userId)

        socket.leave(roomCode)

        if (updatedUsers.length > 0) {
            io.to(roomCode).emit("playerListUpdated", updatedUsers)
            io.to(roomCode).emit("roomSettingsUpdated", {
                ...roomData,
                users: updatedUsers,
            })
        } else {
            // No users left in the room, which means the room will be deleted
            // console.log(`Room ${roomCode} will be deleted as there are no users left.`)
            // We avoid sending updates or errors here since this is expected behavior
        }

        // console.log(`User ${userId} left room ${roomCode}`)
    } catch (error) {
        // Type guard to check if error is an instance of Error
        if (error instanceof Error) {
            if (error.message !== "Room not found") {
                console.error("Error in leaveRoomHandler:", error)
                socket.emit(
                    "error",
                    "An error occurred while leaving the room."
                )
            } else {
                // console.log("Room was not found, likely already deleted.")
            }
        } else {
            // If error is not an instance of Error, log a generic message
            console.error("An unexpected error occurred:", error)
            socket.emit(
                "error",
                "An unexpected error occurred while leaving the room."
            )
        }
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
