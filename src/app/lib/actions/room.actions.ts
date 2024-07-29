"use server"

import { getPayloadHMR } from "@payloadcms/next/utilities"
import configPromise from "@/payload.config"
import { z } from "zod"
import { MainFormSchema } from "@/app/lib/validation"
import {
    extractCategoryIds,
    generateRoomCode,
    generateSlug,
    isRoom,
} from "@/app/lib/utils"
import { generateUniqueSlug } from "@/app/lib/server-utils"
import { Room, User } from "@/app/shared-types"

const payload = await getPayloadHMR({ config: configPromise })

export const createRoom = async (
    nickname: string,
    categories: string[]
): Promise<{ slug: string; userId: string }> => {
    try {
        const roomCode = generateRoomCode()
        const baseSlug = `${generateSlug(nickname)}-${roomCode}`
        const uniqueSlug = await generateUniqueSlug(baseSlug)

        const newRoomData = {
            roomCode: roomCode,
            slug: uniqueSlug,
            users: [
                {
                    nickname,
                    categories: extractCategoryIds(categories), // Ensure this is an array of IDs
                    isAdmin: true, // Room creator is admin
                } as User,
            ],
            settings: {
                duration: 60,
                playerCount: "4",
                roundCount: "10",
            },
        }

        const newRoom = (await payload.create({
            collection: "rooms",
            data: newRoomData,
        })) as unknown as Room

        return { slug: uniqueSlug, userId: newRoom.users[0].id! }
    } catch (error) {
        console.error("Yeni oda oluşturulurken hata oluştu:", error)
        throw new Error(
            `Yeni oda oluşturulurken hata oluştu: ${(error as Error).message}`
        )
    }
}

export const joinRoom = async (
    roomCode: string,
    nickname: string,
    categories: string[]
): Promise<{ slug: string; userId: string } | string> => {
    try {
        const existingRoom = await payload.find({
            collection: "rooms",
            where: {
                roomCode: {
                    equals: roomCode,
                },
            },
        })

        if (existingRoom.docs.length > 0) {
            const room = existingRoom.docs[0] as unknown as Room

            if (!isRoom(room)) {
                throw new Error("Mevcut oda verisi beklenen yapıda değil.")
            }

            // Check if player with the same nickname already exists
            if (room.users.some((user) => user.nickname === nickname)) {
                return "Aynı oda içerisinde ad zaten mevcut. Lütfen başka bir takma ad seçin."
            }

            // Check if the room is full
            if (room.users.length >= parseInt(room.settings.playerCount, 10)) {
                return "Oda tamamen dolduğu için giriş yapamazsınız."
            }

            const roomId = room.id

            // Extract existing users and convert category objects to IDs
            const existingUsers = room.users.map((user) => ({
                ...user,
                categories: extractCategoryIds(user.categories),
            }))

            const newUser: User = {
                nickname,
                categories: extractCategoryIds(categories),
                isAdmin: false, // Participant is not admin
            }

            const updatedRoom = (await payload.update({
                collection: "rooms",
                id: roomId,
                data: {
                    users: [...existingUsers, newUser],
                },
            })) as unknown as Room

            return {
                slug: room.slug,
                userId: updatedRoom.users[updatedRoom.users.length - 1].id!,
            }
        } else {
            return "Bu kod ile oluşturulmuş oda bulunamadı."
        }
    } catch (error) {
        console.error("Odaya katılırken hata oluştu:", error)
        throw new Error(
            `Odaya katılırken hata oluştu: ${(error as Error).message}`
        )
    }
}

export const saveRoomData = async (
    formData: z.infer<typeof MainFormSchema>
): Promise<{ slug: string; userId: string } | string> => {
    const { nickname, categories, roomCode } = formData

    if (roomCode) {
        return joinRoom(roomCode, nickname, categories)
    } else {
        return createRoom(nickname, categories)
    }
}
