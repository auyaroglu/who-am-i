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
        // Fetch existing room data
        const existingRoom = await payload.find({
            collection: "rooms",
            where: { roomCode: { equals: roomCode } },
        })

        // Check if the room exists
        if (existingRoom.docs.length > 0) {
            const room = existingRoom.docs[0] as unknown as Room

            // Ensure the room data structure is correct
            if (!isRoom(room)) {
                throw new Error("Room data structure is not as expected.")
            }

            // Ensure room.users is an array
            if (!Array.isArray(room.users)) {
                throw new Error("The 'users' property is not an array.")
            }

            // Check for duplicate nickname
            if (room.users.some((user) => user.nickname === nickname)) {
                return "The nickname is already in use in this room. Please choose another."
            }

            // Check if the room has reached its player capacity
            if (room.users.length >= parseInt(room.settings.playerCount, 10)) {
                return "The room is full. You cannot join."
            }

            // Update the user list
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

            // Update the room with the new user
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
            return "No room found with the provided code."
        }
    } catch (error) {
        console.error("Error while joining the room:", error)
        throw new Error(
            `Error while joining the room: ${(error as Error).message}`
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
        // Fetch room data by room code
        const result = await payload.find({
            collection: "rooms",
            where: {
                roomCode: {
                    equals: roomCode,
                },
            },
        })

        if (result.docs.length > 0) {
            const room = result.docs[0] as unknown as Room

            // Ensure the users field is an array
            if (!Array.isArray(room.users)) {
                room.users = []
            }

            return room
        } else {
            console.error("Room not found.")
        }
    } catch (error) {
        console.error("Error fetching room data:", error)
    }

    // Return null if no room data is found or an error occurs
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
