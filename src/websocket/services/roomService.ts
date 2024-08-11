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

// Delete a room by room code
export const deleteRoom = async (roomCode: string): Promise<void> => {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("rooms")

        await collection.deleteOne({ roomCode })
        console.log(`Room with code ${roomCode} deleted from the database`)
    } catch (error) {
        console.error("Error deleting room:", error)
        throw error
    }
}

// Remove a user from a room
export const removeUserFromRoom = async (
    roomCode: string,
    userId: string
): Promise<boolean> => {
    try {
        const db = await connectToDatabase()
        const collection = db.collection("rooms")

        const updateResult = await collection.updateOne(
            { roomCode },
            { $pull: { users: { id: userId } } }
        )

        if (updateResult.modifiedCount > 0) {
            console.log(`User ${userId} removed from room ${roomCode}`)
            return true
        } else {
            console.log(`User ${userId} not found in room ${roomCode}`)
            return false
        }
    } catch (error) {
        console.error(
            `Error removing user ${userId} from room ${roomCode}:`,
            error
        )
        throw error
    }
}
