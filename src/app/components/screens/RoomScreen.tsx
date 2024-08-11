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
import { getRoomData } from "@/app/lib/actions/room.actions" // Import the function to fetch room data

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

            // Join the room
            console.log(`Emitting joinRoom event for user ${userId}`)
            socket.emit("joinRoom", roomData.roomCode, userId, user)

            // Listen for updates to the player list
            socket.on("playerListUpdated", (updatedUsers: User[]) => {
                console.log("Received playerListUpdated event:", updatedUsers)
                setUsers(updatedUsers)
            })

            // Listen for ready status changes
            socket.on(
                "readyStatusChanged",
                async ({ userId }: { userId: string }) => {
                    console.log(
                        `User ${userId} changed ready status, fetching updated room data`
                    )

                    try {
                        const updatedRoom = await getRoomData(roomData.roomCode) // Fetch latest room data
                        if (updatedRoom) {
                            setUsers(updatedRoom.users) // Update users state with latest data
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
                console.log(`Socket connected: ${socket.connected}`)
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
    }, [socket, userId, roomData.roomCode])

    if (!currentUser) {
        return <div>User not found in this room.</div>
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-blue-cyan-gradient p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
                <SocialInvite roomCode={roomData.roomCode} />
                <div className="mb-4 flex justify-between">
                    <h2 className="text-lg font-bold">Player Names</h2>
                    <h2 className="text-lg font-bold">Ready?</h2>
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
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
                        onClick={() =>
                            socket &&
                            handleLeaveRoom(
                                roomData,
                                userId,
                                () => router.push("/"),
                                socket
                            )
                        }
                    >
                        Leave
                    </button>
                    {currentUser.isAdmin ? (
                        <button
                            className={`rounded px-4 py-2 text-white ${
                                users.every((user) => user.isReady)
                                    ? "bg-red-500 hover:bg-red-700"
                                    : "bg-gray-500"
                            }`}
                            onClick={() => handleStartGame(users)}
                            disabled={!users.every((user) => user.isReady)}
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
                            {currentUser.isReady ? "Not Ready" : "Ready"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RoomScreen
