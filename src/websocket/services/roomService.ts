import { connectToDatabase } from "@/websocket/database"
import { Room } from "@/app/shared-types"

// Fetch room data by room code
export const getRoomData = async (roomCode: string): Promise<Room | null> => {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("rooms")

        const room = await collection.findOne({ roomCode })
        return room as Room | null
    } catch (error) {
        console.error("Error fetching room data:", error)
        return null
    }
}

export const updateUserReadyStatus = async (
    roomCode: string,
    userId: string,
    isReady: boolean
): Promise<void> => {
    try {
        const room = await getRoomData(roomCode)
        if (!room) {
            throw new Error("Room not found")
        }

        const updatedUsers = room.users.map((user) =>
            user.id === userId ? { ...user, isReady } : user
        )

        const db = await connectToDatabase()
        const collection = db.collection("rooms")
        await collection.updateOne(
            { roomCode },
            { $set: { users: updatedUsers } }
        )
    } catch (error) {
        console.error("Error updating user ready status:", error)
        throw error
    }
}
