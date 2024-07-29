/* tslint:disable */
/* eslint-disable */

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
}

export interface Room {
    id: string
    users: User[]
    roomCode: string
    slug: string
    settings: {
        duration: number
        playerCount: string
        roundCount: string
    }
}

export interface searchParamsProps {
    [key: string]: string | undefined
}
