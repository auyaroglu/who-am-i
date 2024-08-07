import { Room, User } from "@/app/shared-types"
import {
    updateUserReadyStatus,
    leaveRoom,
} from "@/app/lib/actions/room.actions"
import { toast } from "@/app/components/ui/use-toast"

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
    setUsers: React.Dispatch<React.SetStateAction<User[]>>
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
    redirect: () => void
) => {
    try {
        await leaveRoom(roomData.roomCode, userId)
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
