"use client"

import React, { useState, useEffect } from "react"
import { Room, User, RoomScreenProps } from "@/app/shared-types"
import RoomForm from "@/app/components/forms/RoomForm"
import SocialInvite from "@/app/components/SocialInvite"
import { useToast } from "@/app/components/ui/use-toast"
import { useRouter } from "next/navigation"
import useSocket from "@/hooks/useSocket"
import {
    handlePlayerCountChange,
    handleReadyToggle,
    handleLeaveRoom,
    handleStartGame,
} from "@/app/utilities/roomHandlers"

const RoomScreen: React.FC<RoomScreenProps> = ({ roomData, userId }) => {
    const { toast } = useToast()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>(roomData.users)
    const currentUser = users.find((u) => u.id === userId) || null
    const playerCount = parseInt(roomData.settings.playerCount, 10)

    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || ""
    const socket = useSocket(socketUrl)

    useEffect(() => {
        console.log(`Socket URL: ${socketUrl}`)
        console.log(`Socket instance:`, socket)
        console.log(`Current User:`, currentUser)

        if (socket && currentUser) {
            const user = {
                id: currentUser.id,
                nickname: currentUser.nickname,
                isAdmin: currentUser.isAdmin,
                isReady: currentUser.isReady,
            }

            console.log(`Emitting joinRoom event for user ${userId}`)
            socket.emit("joinRoom", roomData.roomCode, userId, user)

            socket.on("playerListUpdated", (updatedUsers: User[]) => {
                console.log("Received playerListUpdated event:", updatedUsers)
                setUsers(updatedUsers)
            })

            socket.on(
                "readyStatusChanged",
                (changedUserId: string, isReady: boolean) => {
                    setUsers((prevUsers) =>
                        prevUsers.map((user) =>
                            user.id === changedUserId
                                ? { ...user, isReady }
                                : user
                        )
                    )
                }
            )

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
                <ul className="mb-6">
                    {Array.from({ length: playerCount }).map((_, index) => {
                        const player = users[index]
                        return (
                            <li
                                key={index}
                                className="flex items-center justify-between border-b py-2"
                            >
                                <span
                                    className={`${
                                        currentUser.id === player?.id
                                            ? "text-blue-500"
                                            : "text-gray-800"
                                    }`}
                                >
                                    {player
                                        ? player.nickname
                                        : `${index + 1}. Waiting for player...`}
                                </span>
                                <span
                                    className={`text-lg ${
                                        player?.isReady
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }`}
                                >
                                    {player
                                        ? player.isReady
                                            ? "✔️"
                                            : "❌"
                                        : ""}
                                </span>
                            </li>
                        )
                    })}
                </ul>

                <RoomForm
                    room={roomData}
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
