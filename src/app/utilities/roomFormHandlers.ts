import { RoomSettings } from "@/app/shared-types"
import { updateRoomSettings } from "@/app/lib/actions/room.actions"
import { toast } from "@/app/components/ui/use-toast"
import { Socket } from "socket.io-client"

export const handlePlayerCountChange = async (
    roomCode: string,
    newPlayerCount: string,
    duration: string,
    roundCount: string,
    setPlayerCount: (value: string) => void,
    onPlayerCountChange: (value: string) => void,
    socket: Socket | null
) => {
    try {
        const newSettings: RoomSettings = {
            duration: Number(duration),
            playerCount: newPlayerCount,
            roundCount: Number(roundCount),
        }

        const result = await updateRoomSettings(roomCode, newSettings)
        if (result === "success") {
            setPlayerCount(newPlayerCount)
            onPlayerCountChange(newPlayerCount)
            if (socket) {
                socket.emit("roomSettingsUpdated", {
                    roomCode,
                    settings: newSettings,
                })
            }
            toast({
                title: "Success",
                description: "Room settings updated successfully.",
                variant: "success",
            })
        } else {
            toast({
                title: "Error",
                description: result,
                variant: "destructive",
            })
        }
    } catch (error) {
        toast({
            title: "Error",
            description: "An error occurred while updating the player count.",
            variant: "destructive",
        })
    }
}

export const handleDurationChange = async (
    roomCode: string,
    newDuration: string,
    playerCount: string,
    roundCount: string,
    setDuration: (value: string) => void,
    socket: Socket | null
) => {
    try {
        const newSettings: RoomSettings = {
            duration: Number(newDuration),
            playerCount: playerCount,
            roundCount: Number(roundCount),
        }

        const result = await updateRoomSettings(roomCode, newSettings)
        if (result === "success") {
            setDuration(newDuration)
            if (socket) {
                socket.emit("roomSettingsUpdated", {
                    roomCode,
                    settings: newSettings,
                })
            }
            toast({
                title: "Success",
                description: "Room settings updated successfully.",
                variant: "success",
            })
        } else {
            toast({
                title: "Error",
                description: result,
                variant: "destructive",
            })
        }
    } catch (error) {
        toast({
            title: "Error",
            description: "An error occurred while updating the duration.",
            variant: "destructive",
        })
    }
}

export const handleRoundCountChange = async (
    roomCode: string,
    newRoundCount: string,
    duration: string,
    playerCount: string,
    setRoundCount: (value: string) => void,
    socket: Socket | null
) => {
    try {
        const newSettings: RoomSettings = {
            duration: Number(duration),
            playerCount: playerCount,
            roundCount: Number(newRoundCount),
        }

        const result = await updateRoomSettings(roomCode, newSettings)
        if (result === "success") {
            setRoundCount(newRoundCount)
            if (socket) {
                socket.emit("roomSettingsUpdated", {
                    roomCode,
                    settings: newSettings,
                })
            }
            toast({
                title: "Success",
                description: "Room settings updated successfully.",
                variant: "success",
            })
        } else {
            toast({
                title: "Error",
                description: result,
                variant: "destructive",
            })
        }
    } catch (error) {
        toast({
            title: "Error",
            description: "An error occurred while updating the round count.",
            variant: "destructive",
        })
    }
}
