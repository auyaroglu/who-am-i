"use client"

import React, { useState, useEffect } from "react"
import { RoomFormProps } from "@/app/shared-types"
import { useToast } from "@/app/components/ui/use-toast"
import {
    handlePlayerCountChange,
    handleDurationChange,
    handleRoundCountChange,
} from "@/app/utilities/roomFormHandlers"
import useSocket from "@/hooks/useSocket"

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
    const { toast } = useToast()

    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || ""
    const socket = useSocket(socketUrl)

    useEffect(() => {
        setDuration(room.settings.duration.toString())
        setRoundCount(room.settings.roundCount.toString())
        setPlayerCount(room.settings.playerCount)
    }, [room.settings])

    const handleDurationChangeWithSocket = async (newDuration: string) => {
        await handleDurationChange(
            room.roomCode,
            newDuration,
            playerCount,
            roundCount,
            setDuration,
            socket
        )
    }

    const handleRoundCountChangeWithSocket = async (newRoundCount: string) => {
        await handleRoundCountChange(
            room.roomCode,
            newRoundCount,
            duration,
            playerCount,
            setRoundCount,
            socket
        )
    }

    const handlePlayerCountChangeWithSocket = async (
        newPlayerCount: string
    ) => {
        await handlePlayerCountChange(
            room.roomCode,
            newPlayerCount,
            duration,
            roundCount,
            setPlayerCount,
            onPlayerCountChange,
            socket
        )
    }

    return (
        <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-center">
                Oda Ayarları
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label htmlFor="timer" className="text-sm font-medium">
                        Süre
                    </label>
                    {isAdmin ? (
                        <select
                            id="timer"
                            className="w-2/3 block p-2 bg-white rounded border"
                            value={duration}
                            onChange={(e) =>
                                handleDurationChangeWithSocket(e.target.value)
                            }
                        >
                            <option value="30">30 saniye</option>
                            <option value="45">45 saniye</option>
                            <option value="60">60 saniye</option>
                        </select>
                    ) : (
                        <span>{duration} saniye</span>
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <label htmlFor="turns" className="text-sm font-medium">
                        Tur Sayısı
                    </label>
                    {isAdmin ? (
                        <select
                            id="turns"
                            className="w-2/3 block p-2 bg-white rounded border"
                            value={roundCount}
                            onChange={(e) =>
                                handleRoundCountChangeWithSocket(e.target.value)
                            }
                        >
                            <option value="10">10 tur</option>
                            <option value="15">15 tur</option>
                            <option value="20">20 tur</option>
                        </select>
                    ) : (
                        <span>{roundCount} tur</span>
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="playerCount"
                        className="text-sm font-medium"
                    >
                        Oyuncu Sayısı
                    </label>
                    {isAdmin ? (
                        <select
                            id="playerCount"
                            className="w-2/3 block p-2 bg-white rounded border"
                            value={playerCount}
                            onChange={(e) =>
                                handlePlayerCountChangeWithSocket(
                                    e.target.value
                                )
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
