"use client"

import React, { useState } from "react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import MultipleSelector, { Option } from "../extension/multi-select"
import { Button } from "../ui/button"
import { MainFormSchema } from "@/app/lib/validation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { saveRoomData } from "@/app/lib/actions/room.actions"
import { Category, searchParamsProps } from "@/app/shared-types"
import { useRouter } from "next/navigation"
import { useToast } from "@/app/components/ui/use-toast"
import ButtonLoading from "../ButtonLoading"
import ReCAPTCHA from "react-google-recaptcha"

const MainForm = ({
    categories,
    searchParams,
}: {
    categories: Category[]
    searchParams: searchParamsProps
}) => {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof MainFormSchema>>({
        resolver: zodResolver(MainFormSchema),
        defaultValues: {
            nickname: "",
            categories: [],
            roomCode: searchParams?.roomCode || "",
            captchaValue: "",
        },
    })

    async function onSubmit(values: z.infer<typeof MainFormSchema>) {
        setIsLoading(true)
        try {
            // `captchaValue`'nın dolu olup olmadığını kontrol et
            if (!values.captchaValue) {
                toast({
                    title: "Hata",
                    description: "Lütfen reCAPTCHA doğrulamasını tamamlayın.",
                    variant: "destructive",
                })
                return
            }

            const result = await saveRoomData(values)
            if (typeof result === "string") {
                toast({
                    title: "Hata",
                    description: result,
                    variant: "destructive",
                })
            } else {
                router.push(
                    `/room?user=${result.userId}&code=${result.roomCode}`
                )
            }
        } catch (error) {
            console.error("Oda verileri kaydedilirken hata oluştu:", error)
            toast({
                title: "Hata",
                description: "Oda verileri kaydedilirken bir hata oluştu.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    name="nickname"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                htmlFor="nickname"
                                className="text-white"
                            >
                                Kullanıcı Adı
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id="nickname"
                                    type="text"
                                    placeholder="Kullanıcı adınızı giriniz..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">
                                Kategoriler
                            </FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    className="bg-white"
                                    maxSelected={3}
                                    defaultOptions={categories.map(
                                        (category) => ({
                                            label: category.name,
                                            value: category.id,
                                        })
                                    )}
                                    placeholder="Tam olarak 3 kategori seçin..."
                                    emptyIndicator={
                                        <p className="text-lg leading-10 text-center text-gray-600 dark:text-gray-400">
                                            Sonuç bulunamadı.
                                        </p>
                                    }
                                    onChange={(selected: Option[]) => {
                                        const selectedValues = selected.map(
                                            (option) => option.value
                                        )
                                        field.onChange(selectedValues)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="roomCode"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                htmlFor="roomCode"
                                className="text-white"
                            >
                                Oda Kodu
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id="roomCode"
                                    type="text"
                                    placeholder="Oda kodunu giriniz..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="captchaValue"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <ReCAPTCHA
                                sitekey={
                                    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                                }
                                onChange={(value: string | null) => {
                                    field.onChange(value) // ReCAPTCHA değeri form değerine ekleniyor
                                }}
                                className="my-4"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-700"
                    disabled={isLoading}
                >
                    {isLoading ? <ButtonLoading /> : "Oda Oluştur veya Katıl"}
                </Button>
            </form>
        </Form>
    )
}

export default MainForm
