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
