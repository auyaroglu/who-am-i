"use client"
import React from "react"
import MainForm from "./forms/MainForm"

const CATEGORIES = [
    { label: "Futbol", value: "futbol" },
    { label: "Dizi-Film", value: "dizi-film" },
    { label: "Müzisyen", value: "muzsiyen" },
    { label: "Politika", value: "politika" },
    { label: "Yazar", value: "yazar" },
    { label: "Asker", value: "asker" },
    { label: "Çizgi Film - Anime", value: "cizgi-film-anime" },
    { label: "Fantastik", value: "fantastik" },
    { label: "Bilim Kurgu", value: "bilim-kurgu" },
    { label: "Bilgisayar Oyunu", value: "bilgisayar-oyunu" },
]

const MainScreen: React.FC = () => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="mx-auto w-full max-w-sm rounded-lg bg-orange-gradient p-4 shadow-lg">
                <MainForm categories={CATEGORIES} />
            </div>
        </div>
    )
}

export default MainScreen
