import { CollectionConfig } from "payload"

const Categories: CollectionConfig = {
    slug: "categories",
    fields: [
        {
            label: "Kategori Adı",
            name: "name",
            type: "text",
            required: true,
        },
    ],
    admin: {
        useAsTitle: "name",
    },
}

export default Categories
