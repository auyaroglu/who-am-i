"use client"

import React from "react"
import { Room, User } from "@/app/shared-types"
import RoomForm from "@/app/components/forms/RoomForm"
import SocialInvite from "@/app/components/SocialInvite"
import { useToast } from "@/app/components/ui/use-toast"

const RoomScreen: React.FC<{ roomData: Room; userId: string }> = ({
    roomData,
    userId,
}) => {
    const { toast } = useToast()
    const currentUser = roomData.users.find((u) => u.id === userId) || null
    const playerCount = parseInt(roomData.settings.playerCount, 10)

    if (!currentUser) {
        return <div>Kullanıcı bu odada bulunamadı.</div>
    }

    const handlePlayerCountChange = (newPlayerCount: string) => {
        if (roomData.users.length > parseInt(newPlayerCount, 10)) {
            toast({
                title: "Hata",
                description:
                    "Mevcut oyuncu sayısı yeni ayarlanan değerden fazla.",
                variant: "destructive",
            })
            return
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-blue-cyan-gradient p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
                <SocialInvite roomCode={roomData.roomCode} />
                <div className="mb-4 flex justify-between">
                    <h2 className="text-lg font-bold">Oyuncu İsimleri</h2>
                    <h2 className="text-lg font-bold">Hazır mı?</h2>
                </div>
                <ul className="mb-6">
                    {Array.from({ length: playerCount }).map((_, index) => {
                        const player = roomData.users[index]
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
                                        : `${index + 1}. Oyuncu bekleniyor...`}
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
                    onPlayerCountChange={handlePlayerCountChange}
                />

                <div className="flex justify-between">
                    <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700">
                        Ayrıl
                    </button>
                    <button
                        className={`rounded px-4 py-2 text-white ${
                            currentUser.isAdmin
                                ? "bg-red-500 hover:bg-red-700"
                                : "bg-green-500 hover:bg-green-700"
                        }`}
                    >
                        {currentUser.isAdmin ? "Başlat" : "Hazırım"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RoomScreen
