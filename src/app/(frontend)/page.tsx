import React from "react"
import MainScreen from "../components/MainScreen"
import { searchParamsProps } from "@/app/shared-types"

const Home = async ({ searchParams }: { searchParams: searchParamsProps }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-cyan-gradient p-4">
            <MainScreen searchParams={searchParams} />
        </div>
    )
}

export default Home
