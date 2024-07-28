import { CollectionConfig } from "payload"

const Persons: CollectionConfig = {
    slug: "persons",
    fields: [
        {
            label: "Adı",
            name: "name",
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
        {
            label: "İpucu",
            name: "hint",
            type: "text",
        },
    ],
}

export default Persons
