"use client"

import React from "react"
import { FaFacebook, FaTwitter, FaWhatsapp, FaLink } from "react-icons/fa"

const SocialInvite: React.FC<{ roomCode: string }> = ({ roomCode }) => {
    const roomUrl = `${window.location.origin}?roomCode=${roomCode}`

    const handleCopyLink = () => {
        navigator.clipboard.writeText(roomUrl)
        alert("Oda linki kopyalandı!")
    }

    return (
        <div className="mb-4 flex flex-col items-center space-y-2 border-b border-gray-400 pb-4">
            <h3 className="text-lg font-semibold">Arkadaşını davet et</h3>
            <div className="flex space-x-4">
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${roomUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900"
                >
                    <FaFacebook size={24} />
                </a>
                <a
                    href={`https://twitter.com/intent/tweet?text=Bu%20odaya%20kat%C4%B1l%3A%20${roomUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600"
                >
                    <FaTwitter size={24} />
                </a>
                <a
                    href={`https://wa.me/?text=${roomUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-700"
                >
                    <FaWhatsapp size={24} />
                </a>
                <button
                    onClick={handleCopyLink}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <FaLink size={24} />
                </button>
            </div>
        </div>
    )
}

export default SocialInvite
