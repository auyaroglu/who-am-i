"use client"

import React, { useState, useRef } from "react"
import { RoomFormProps, RoomSettings } from "@/app/shared-types"
import { useToast } from "@/app/components/ui/use-toast"
import { updateRoomSettings } from "@/app/lib/actions/room.actions"

const RoomForm: React.FC<RoomFormProps> = ({
    room,
    isAdmin,
    onPlayerCountChange,
}) => {
    const [duration, setDuration] = useState(room.settings.duration.toString())
    const [roundCount, setRoundCount] = useState(
        room.settings.roundCount.toString()
    )
    const [playerCount, setPlayerCount] = useState(room.settings.playerCount)
    const previousPlayerCountRef = useRef(playerCount)
    const { toast } = useToast()

    const handlePlayerCountChangeInternal = async (newPlayerCount: string) => {
        if (!isAdmin) return

        previousPlayerCountRef.current = playerCount // Update previous value

        const updatedSettings: RoomSettings = {
            duration: Number(duration),
            roundCount: Number(roundCount),
            playerCount: newPlayerCount,
        }

        try {
            await updateRoomSettings(room.roomCode, updatedSettings)
            setPlayerCount(newPlayerCount)
            onPlayerCountChange(newPlayerCount)
            toast({
                title: "Başarılı",
                description: "Oda ayarları başarıyla güncellendi.",
                variant: "success",
            })
        } catch (error: any) {
            // If an error occurs, revert playerCount to the previous value
            setPlayerCount(previousPlayerCountRef.current)
            toast({
                title: "Hata",
                description:
                    error.message ||
                    "Oda ayarları güncellenirken bir hata oluştu.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="mb-6">
            <h3 className="mb-2 text-center text-lg font-semibold">
                Oda Ayarları
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="timer" className="text-sm font-medium">
                        Süre
                    </label>
                    {isAdmin ? (
                        <select
                            id="timer"
                            className="block w-2/3 rounded border bg-white p-2"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        >
                            <option value="30">30 saniye</option>
                            <option value="45">45 saniye</option>
                            <option value="60">60 saniye</option>
                        </select>
                    ) : (
                        <span>{duration} saniye</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="turns" className="text-sm font-medium">
                        Turlar
                    </label>
                    {isAdmin ? (
                        <select
                            id="turns"
                            className="block w-2/3 rounded border bg-white p-2"
                            value={roundCount}
                            onChange={(e) => setRoundCount(e.target.value)}
                        >
                            <option value="10">10 tur</option>
                            <option value="15">15 tur</option>
                            <option value="20">20 tur</option>
                        </select>
                    ) : (
                        <span>{roundCount} tur</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="playerCount"
                        className="text-sm font-medium"
                    >
                        Oyuncu Sayısı
                    </label>
                    {isAdmin ? (
                        <select
                            id="playerCount"
                            className="block w-2/3 rounded border bg-white p-2"
                            value={playerCount}
                            onChange={(e) =>
                                handlePlayerCountChangeInternal(e.target.value)
                            }
                        >
                            <option value="2">2 Oyuncu</option>
                            <option value="4">4 Oyuncu</option>
                            <option value="6">6 Oyuncu</option>
                            <option value="8">8 Oyuncu</option>
                        </select>
                    ) : (
                        <span>{playerCount} oyuncu</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RoomForm
