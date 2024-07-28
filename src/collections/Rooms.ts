import { CollectionConfig } from "payload"

const Rooms: CollectionConfig = {
    slug: "rooms",
    fields: [
        {
            label: "Oda Kodu",
            name: "roomCode",
            type: "text",
            required: true,
            unique: true,
        },
        {
            label: "Slug",
            name: "slug",
            type: "text",
            required: true,
            unique: true,
        },
        {
            label: "Oyuncular",
            name: "users",
            type: "array",
            fields: [
                {
                    label: "Takma Ad",
                    name: "nickname",
                    type: "text",
                    required: true,
                },
                {
                    label: "Kategoriler",
                    name: "categories",
                    type: "relationship",
                    relationTo: "categories",
                    hasMany: true,
                },
            ],
        },
        {
            label: "Oda Ayarları",
            name: "settings",
            type: "group",
            fields: [
                {
                    label: "Süre (saniye)",
                    name: "duration",
                    type: "number",
                    required: true,
                },
                {
                    label: "Oyuncu Sayısı",
                    name: "playerCount",
                    type: "select",
                    options: [
                        {
                            label: "2 Oyuncu",
                            value: "2", // value as string
                        },
                        {
                            label: "4 Oyuncu",
                            value: "4", // value as string
                        },
                        {
                            label: "6 Oyuncu",
                            value: "6", // value as string
                        },
                        {
                            label: "8 Oyuncu",
                            value: "8", // value as string
                        },
                    ],
                    required: true,
                },
                {
                    label: "Tur Sayısı",
                    name: "roundCount",
                    type: "select",
                    options: [
                        {
                            label: "10 Tur",
                            value: "10", // value as string
                        },
                        {
                            label: "15 Tur",
                            value: "15", // value as string
                        },
                        {
                            label: "20 Tur",
                            value: "20", // value as string
                        },
                    ],
                    required: true,
                },
            ],
        },
    ],
}

export default Rooms
