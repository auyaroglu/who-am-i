import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Room } from "../shared-types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const extractCategoryIds = (categories: any[]) => {
    return categories.map((category) =>
        typeof category === "object" && category.id ? category.id : category
    )
}

export const generateRoomCode = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()

export const generateSlug = (nickname: string) =>
    nickname
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")

export const isRoom = (obj: any): obj is Room => {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "id" in obj &&
        "users" in obj &&
        "roomCode" in obj &&
        "slug" in obj &&
        "settings" in obj
    )
}

export const validateRoom = (obj: any): obj is Room => {
    return (
        obj &&
        typeof obj === "object" &&
        "users" in obj &&
        "roomCode" in obj &&
        "slug" in obj &&
        "settings" in obj &&
        Array.isArray(obj.users) &&
        typeof obj.roomCode === "string" &&
        typeof obj.slug === "string" &&
        typeof obj.settings === "object" &&
        typeof obj.settings.duration === "number" &&
        typeof obj.settings.playerCount === "string" &&
        typeof obj.settings.roundCount === "number"
    )
}
