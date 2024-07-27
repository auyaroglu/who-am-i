import React from "react"
import { ThemeSelector } from "../providers/Theme/ThemeSelector"

const Home = () => {
    return (
        <div className="rounded-md bg-blue-500 p-4 text-white hover:bg-blue-700">
            Home
            <ThemeSelector />
        </div>
    )
}

export default Home
