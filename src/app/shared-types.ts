export interface Category {
    id: string
    name: string
    createdAt: string
    updatedAt: string
}

export interface User {
    id?: string
    nickname: string
    categories: string[]
    isAdmin: boolean
    isReady: boolean
}

export interface RoomSettings {
    duration: number
    playerCount: string
    roundCount: number
}

export interface Room {
    id: string
    users: User[]
    roomCode: string
    slug: string
    settings: RoomSettings
}

export interface searchParamsProps {
    [key: string]: string | undefined
}

export interface RoomFormProps {
    room: Room
    isAdmin: boolean
    onPlayerCountChange: (newPlayerCount: string) => void
}

export interface RoomScreenProps {
    roomData: Room
    userId: string
}
