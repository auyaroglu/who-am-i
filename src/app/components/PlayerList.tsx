import React from "react"
import { PlayerListProps } from "@/app/shared-types"

const PlayerList: React.FC<PlayerListProps> = ({
    players,
    currentUserId,
    playerCount,
}) => {
    return (
        <ul className="mb-6">
            {Array.from({ length: playerCount }).map((_, index) => {
                const player = players[index]
                return (
                    <li
                        key={index}
                        className="flex items-center justify-between border-b py-2"
                    >
                        <span
                            className={`${
                                currentUserId === player?.id
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
                            {player ? (player.isReady ? "✔️" : "❌") : ""}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}

export default PlayerList
