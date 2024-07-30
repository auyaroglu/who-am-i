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
import { Room, RoomSettings, User } from "@/app/shared-types"

const payload = await getPayloadHMR({ config: configPromise })

export const createRoom = async (
    nickname: string,
    categories: string[]
): Promise<{ roomCode: string; userId: string }> => {
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
                    categories: extractCategoryIds(categories),
                    isAdmin: true,
                    isReady: true, // Admin her zaman ready
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

        return { roomCode: roomCode, userId: newRoom.users[0].id! }
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
): Promise<{ roomCode: string; userId: string } | string> => {
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

            if (room.users.some((user) => user.nickname === nickname)) {
                return "Aynı oda içerisinde ad zaten mevcut. Lütfen başka bir takma ad seçin."
            }

            if (room.users.length >= parseInt(room.settings.playerCount, 10)) {
                return "Oda tamamen dolduğu için giriş yapamazsınız."
            }

            const roomId = room.id
            const existingUsers = room.users.map((user) => ({
                ...user,
                categories: extractCategoryIds(user.categories),
            }))

            const newUser: User = {
                nickname,
                categories: extractCategoryIds(categories),
                isAdmin: false,
                isReady: false,
            }

            const updatedRoom = (await payload.update({
                collection: "rooms",
                id: roomId,
                data: {
                    users: [...existingUsers, newUser],
                },
            })) as unknown as Room

            return {
                roomCode: room.roomCode,
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
): Promise<{ roomCode: string; userId: string } | string> => {
    const { nickname, categories, roomCode } = formData

    if (roomCode) {
        return joinRoom(roomCode, nickname, categories)
    } else {
        return createRoom(nickname, categories)
    }
}

export const getRoomData = async (roomCode: string): Promise<Room | null> => {
    try {
        // Oda koduna göre mevcut oda verilerini getir
        const result = await payload.find({
            collection: "rooms",
            where: {
                roomCode: {
                    equals: roomCode,
                },
            },
        })

        // Eğer oda verisi varsa ve uygun tipteyse geri döndür
        if (result.docs.length > 0) {
            const room = result.docs[0] as unknown

            if (isRoom(room)) {
                return room as Room
            } else {
                console.error("Veri beklenen Room yapısına uymuyor.")
            }
        } else {
            console.error("Oda bulunamadı.")
        }
    } catch (error) {
        console.error("Oda verisi alınırken hata oluştu:", error)
    }

    // Oda verisi bulunamadığında veya hata durumunda null döndür
    return null
}

export const updateRoomSettings = async (
    roomCode: string,
    newSettings: RoomSettings
): Promise<string> => {
    try {
        const room = await getRoomData(roomCode)
        if (!room) {
            return "Oda bilgileri alınamadı"
        }
        if (room.users.length > parseInt(newSettings.playerCount, 10)) {
            return "Odadaki oyuncu sayısından küçük bir değer seçilemez."
        }

        await payload.update({
            collection: "rooms",
            id: room.id,
            data: { settings: newSettings },
        })

        return "success"
    } catch (error) {
        console.error("Oda ayarları güncellenirken hata oluştu:", error)
        return "Oda ayarları güncellenirken bir hata oluştu."
    }
}

export const leaveRoom = async (
    roomCode: string,
    userId: string
): Promise<void> => {
    try {
        const room = await getRoomData(roomCode)
        if (!room) {
            throw new Error("Oda bilgileri alınamadı")
        }

        const remainingUsers = room.users.filter((user) => user.id !== userId)

        if (remainingUsers.length > 0) {
            let newUsers = remainingUsers
            if (room.users.find((user) => user.id === userId)?.isAdmin) {
                // Admin ayrılıyorsa yeni admin ataması yap
                let adminAssigned = false
                newUsers = remainingUsers.map((user, index) => {
                    if (!adminAssigned && index === 0) {
                        adminAssigned = true
                        return { ...user, isAdmin: true, isReady: true } // Yeni admin ve hazır
                    }
                    return user
                })
            }

            // Kullanıcıları güncelle ve kategori ID'lerini düzelt
            await payload.update({
                collection: "rooms",
                id: room.id,
                data: {
                    users: newUsers.map((user) => ({
                        ...user,
                        categories: extractCategoryIds(user.categories),
                    })),
                },
            })
        } else {
            // Eğer odada hiç kullanıcı kalmadıysa, odayı sil
            await payload.delete({
                collection: "rooms",
                id: room.id,
            })
        }
    } catch (error) {
        console.error("Odayı terk ederken hata oluştu:", error)
        throw new Error("Odayı terk ederken bir hata oluştu.")
    }
}

export const updateUserReadyStatus = async (
    roomCode: string,
    userId: string,
    isReady: boolean
): Promise<void> => {
    try {
        const room = await getRoomData(roomCode)
        if (!room) {
            throw new Error("Oda bilgileri alınamadı")
        }

        const updatedUsers = room.users.map((user) =>
            user.id === userId ? { ...user, isReady } : user
        )

        await payload.update({
            collection: "rooms",
            id: room.id,
            data: {
                users: updatedUsers.map((user) => ({
                    ...user,
                    categories: extractCategoryIds(user.categories),
                })),
            },
        })
    } catch (error) {
        console.error("Kullanıcı durumu güncellenirken hata oluştu:", error)
        throw error
    }
}
