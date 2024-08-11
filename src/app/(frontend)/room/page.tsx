import RoomScreen from "@/app/components/screens/RoomScreen"
import { getRoomData } from "@/app/lib/actions/room.actions"
import { Room } from "@/app/shared-types"

export default async function RoomPage({
    searchParams,
}: {
    searchParams: { [key: string]: string }
}) {
    const userId = searchParams["user"]
    const roomCode = searchParams["code"]

    // Fetch the room data on the server side
    let roomData: Room | null = null
    if (roomCode) {
        try {
            roomData = await getRoomData(roomCode)
        } catch (error) {
            console.error("Failed to fetch room data:", error)
        }
    }

    // Handle missing room data or userId
    if (!roomData || !userId) {
        return <div>Invalid room or user information.</div>
    }

    return <RoomScreen roomData={roomData} userId={userId} />
}
