import { RoomSettings } from "@/app/shared-types"
import { updateRoomSettings } from "@/app/lib/actions/room.actions"
import { toast } from "@/app/components/ui/use-toast"

export const handlePlayerCountChange = async (
    roomCode: string,
    newPlayerCount: string,
    duration: string,
    roundCount: string,
    setPlayerCount: React.Dispatch<React.SetStateAction<string>>,
    onPlayerCountChange: (newPlayerCount: string) => void
) => {
    const updatedSettings: RoomSettings = {
        duration: Number(duration),
        roundCount: Number(roundCount),
        playerCount: newPlayerCount,
    }

    try {
        const result = await updateRoomSettings(roomCode, updatedSettings)
        if (result === "success") {
            setPlayerCount(newPlayerCount)
            onPlayerCountChange(newPlayerCount)
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
            description: "An error occurred while updating room settings.",
            variant: "destructive",
        })
    }
}

export const handleDurationChange = async (
    roomCode: string,
    newDuration: string,
    playerCount: string,
    roundCount: string,
    setDuration: React.Dispatch<React.SetStateAction<string>>
) => {
    const updatedSettings: RoomSettings = {
        duration: Number(newDuration),
        roundCount: Number(roundCount),
        playerCount: playerCount,
    }

    try {
        const result = await updateRoomSettings(roomCode, updatedSettings)
        if (result === "success") {
            setDuration(newDuration)
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
            description: "An error occurred while updating room settings.",
            variant: "destructive",
        })
    }
}

export const handleRoundCountChange = async (
    roomCode: string,
    newRoundCount: string,
    duration: string,
    playerCount: string,
    setRoundCount: React.Dispatch<React.SetStateAction<string>>
) => {
    const updatedSettings: RoomSettings = {
        duration: Number(duration),
        roundCount: Number(newRoundCount),
        playerCount: playerCount,
    }

    try {
        const result = await updateRoomSettings(roomCode, updatedSettings)
        if (result === "success") {
            setRoundCount(newRoundCount)
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
            description: "An error occurred while updating room settings.",
            variant: "destructive",
        })
    }
}
