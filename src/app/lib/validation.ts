import { z } from "zod"

export const MainFormSchema = z.object({
    nickname: z
        .string()
        .min(3, { message: "Kullanıcı adı en az 3 karakter olmalıdır." })
        .max(50, { message: "Kullanıcı adı en fazla 50 karakter olmalıdır." }),
    categories: z.array(z.string()).length(3, {
        message: "Tam olarak 3 kategori seçmelisiniz.",
    }),
    roomCode: z.string().optional(), // Eğer roomCode isteğe bağlıysa böyle bırakın
    captchaValue: z
        .string()
        .min(1, { message: "Lütfen reCAPTCHA doğrulamasını tamamlayın." }), // captchaValue zorunlu
})
