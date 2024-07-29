import React from "react"
import MainForm from "./forms/MainForm"
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
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="mx-auto w-full max-w-sm rounded-lg bg-orange-gradient p-4 shadow-lg">
                <MainForm categories={categories} searchParams={searchParams} />
            </div>
        </div>
    )
}

export default MainScreen
