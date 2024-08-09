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
            <h3 className="mb-2 text-center text-lg font-semibold">
                Room Settings
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="timer" className="text-sm font-medium">
                        Timer
                    </label>
                    {isAdmin ? (
                        <select
                            id="timer"
                            className="block w-2/3 rounded border bg-white p-2"
                            value={duration}
                            onChange={(e) =>
                                handleDurationChangeWithSocket(e.target.value)
                            }
                        >
                            <option value="30">30 seconds</option>
                            <option value="45">45 seconds</option>
                            <option value="60">60 seconds</option>
                        </select>
                    ) : (
                        <span>{duration} seconds</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="turns" className="text-sm font-medium">
                        Rounds
                    </label>
                    {isAdmin ? (
                        <select
                            id="turns"
                            className="block w-2/3 rounded border bg-white p-2"
                            value={roundCount}
                            onChange={(e) =>
                                handleRoundCountChangeWithSocket(e.target.value)
                            }
                        >
                            <option value="10">10 rounds</option>
                            <option value="15">15 rounds</option>
                            <option value="20">20 rounds</option>
                        </select>
                    ) : (
                        <span>{roundCount} rounds</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="playerCount"
                        className="text-sm font-medium"
                    >
                        Player Count
                    </label>
                    {isAdmin ? (
                        <select
                            id="playerCount"
                            className="block w-2/3 rounded border bg-white p-2"
                            value={playerCount}
                            onChange={(e) =>
                                handlePlayerCountChangeWithSocket(
                                    e.target.value
                                )
                            }
                        >
                            <option value="2">2 Players</option>
                            <option value="4">4 Players</option>
                            <option value="6">6 Players</option>
                            <option value="8">8 Players</option>
                        </select>
                    ) : (
                        <span>{playerCount} players</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RoomForm
