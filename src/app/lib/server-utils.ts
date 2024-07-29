import { getPayloadHMR } from "@payloadcms/next/utilities"
import configPromise from "@/payload.config"

const payload = await getPayloadHMR({ config: configPromise })

export const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let slug = baseSlug
    let counter = 1

    while (true) {
        const existingRooms = await payload.find({
            collection: "rooms",
            where: {
                slug: {
                    equals: slug,
                },
            },
        })

        if (existingRooms.docs.length === 0) {
            break
        }

        slug = `${baseSlug}-${counter}`
        counter++
    }

    return slug
}
