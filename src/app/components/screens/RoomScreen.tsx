"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSocket from "@/hooks/useSocket"
import { Room, User, RoomScreenProps } from "@/app/shared-types"
import {
    handleLeaveRoom,
    handlePlayerCountChange,
    handleReadyToggle,
    handleStartGame,
} from "@/app/utilities/roomHandlers"
import PlayerList from "@/app/components/PlayerList"
import RoomForm from "@/app/components/forms/RoomForm"
import SocialInvite from "@/app/components/SocialInvite"
import { useToast } from "@/app/components/ui/use-toast"
import {
    getRoomData,
    updateUserReadyStatus,
} from "@/app/lib/actions/room.actions"

const RoomScreen: React.FC<RoomScreenProps> = ({ roomData, userId }) => {
    const { toast } = useToast()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>(roomData.users)
    const [settings, setSettings] = useState(roomData.settings)
    const currentUser = users.find((u) => u.id === userId) || null

    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || ""
    const socket = useSocket(socketUrl)

    useEffect(() => {
        if (socket && currentUser) {
            const user = {
                id: currentUser.id,
                nickname: currentUser.nickname,
                isAdmin: currentUser.isAdmin,
                isReady: currentUser.isReady,
            }

            // Attach custom data to the socket instance
            socket.data = { roomCode: roomData.roomCode, userId }

            console.log(`Emitting joinRoom event for user ${userId}`)
            socket.emit("joinRoom", roomData.roomCode, userId, user)

            socket.on("playerListUpdated", (updatedUsers: User[]) => {
                console.log("Received playerListUpdated event:", updatedUsers)
                setUsers(updatedUsers)
            })

            socket.on(
                "readyStatusChanged",
                async ({ userId }: { userId: string }) => {
                    console.log(
                        `User ${userId} changed ready status, fetching updated room data`
                    )

                    try {
                        const updatedRoom = await getRoomData(roomData.roomCode)
                        if (updatedRoom) {
                            setUsers(updatedRoom.users)
                        }
                    } catch (error) {
                        console.error(
                            "Failed to fetch updated room data:",
                            error
                        )
                    }
                }
            )

            socket.on("roomSettingsUpdated", (updatedRoom: Room) => {
                console.log("Received roomSettingsUpdated event:", updatedRoom)
                setSettings(updatedRoom.settings)
                setUsers(updatedRoom.users)
            })

            socket.on("disconnect", () => {
                console.log("Socket disconnected")
            })

            return () => {
                if (socket) {
                    // Notify other clients that this user is leaving
                    socket.emit("leaveRoom", roomData.roomCode, userId)
                    handleLeaveRoom(
                        roomData,
                        userId,
                        () => router.push("/"),
                        socket
                    )
                    socket.off("playerListUpdated")
                    socket.off("readyStatusChanged")
                    socket.off("roomSettingsUpdated")
                }
            }
        }
    }, [socket, userId, roomData.roomCode])

    if (!currentUser) {
        return <div>Oyuncu, bu odada bulunamadı.</div>
    }

    // Check if the room is full
    const isRoomFull = users.length >= parseInt(settings.playerCount, 10)

    // Check if all players are ready
    const allPlayersReady = users.every((user) => user.isReady)

    return (
        <div className="bg-blue-cyan-gradient min-h-screen relative flex justify-center items-center p-4">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                <SocialInvite roomCode={roomData.roomCode} />
                <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-bold">Oyuncular</h2>
                    <h2 className="text-lg font-bold">Hazır?</h2>
                </div>

                <PlayerList
                    players={users}
                    currentUserId={userId}
                    playerCount={parseInt(settings.playerCount, 10)}
                />

                <RoomForm
                    room={{ ...roomData, settings }}
                    isAdmin={currentUser.isAdmin}
                    onPlayerCountChange={(newPlayerCount) =>
                        handlePlayerCountChange(newPlayerCount, users)
                    }
                />

                <div className="flex justify-between">
                    <button
                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
                        onClick={() => {
                            // Notify WebSocket server and update client state
                            socket?.emit("leaveRoom", roomData.roomCode, userId)
                            handleLeaveRoom(
                                roomData,
                                userId,
                                () => router.push("/"),
                                socket
                            )
                        }}
                    >
                        Ayrıl
                    </button>
                    {currentUser.isAdmin ? (
                        <button
                            className={`rounded px-4 py-2 text-white ${
                                isRoomFull && allPlayersReady
                                    ? "bg-red-500 hover:bg-red-700"
                                    : "bg-gray-500"
                            }`}
                            onClick={() => handleStartGame(users)}
                            disabled={!isRoomFull || !allPlayersReady} // Button disabled unless room is full and all players are ready
                        >
                            Start
                        </button>
                    ) : (
                        <button
                            className={`rounded px-4 py-2 text-white ${
                                currentUser.isReady
                                    ? "bg-green-700 hover:bg-green-500"
                                    : "bg-green-500 hover:bg-green-700"
                            }`}
                            onClick={() =>
                                socket &&
                                handleReadyToggle(
                                    roomData,
                                    userId,
                                    currentUser,
                                    setUsers,
                                    socket
                                )
                            }
                        >
                            {currentUser.isReady ? "Hazır Değil" : "Hazır"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RoomScreen
