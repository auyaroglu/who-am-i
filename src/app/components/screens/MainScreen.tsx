import React from "react"
import MainForm from "../forms/MainForm"
import { getPayloadHMR } from "@payloadcms/next/utilities"
import configPromise from "@payload-config"
import { Category, searchParamsProps } from "@/app/shared-types"

const MainScreen = async ({
    searchParams,
}: {
    searchParams: searchParamsProps
}) => {
    const payload = await getPayloadHMR({ config: configPromise })
    const result = await payload.find({
        collection: "categories",
        sort: "-createdAt",
    })

    const categories: Category[] = result.docs.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    }))

    return (
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="bg-orange-gradient mx-auto w-full max-w-sm p-4 rounded-lg shadow-lg">
                <MainForm categories={categories} searchParams={searchParams} />
            </div>
        </div>
    )
}

export default MainScreen
