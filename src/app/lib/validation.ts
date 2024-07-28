import { z } from "zod"

export const MainFormSchema = z.object({
    nickname: z.string().min(3).max(50),
    categories: z.array(z.string()).length(3, {
        message: "3 kategori seçmelisiniz",
    }),
    roomCode: z.string().optional(),
})
