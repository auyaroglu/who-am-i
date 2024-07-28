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
import MultipleSelector, { Option } from "../extension/multi-select" // Assuming Option type is exported from multi-select
import { Button } from "../ui/button"
import { MainFormSchema } from "@/app/lib/validation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface Category {
    label: string
    value: string
    [key: string]: string | boolean | undefined
}

const MainForm = ({ categories }: { categories: Category[] }) => {
    const [value, setValue] = useState<string[]>([])
    const form = useForm<z.infer<typeof MainFormSchema>>({
        resolver: zodResolver(MainFormSchema),
        defaultValues: {
            nickname: "",
            categories: [],
            roomCode: "",
        },
    })

    async function onSubmit(values: z.infer<typeof MainFormSchema>) {
        console.log(values)
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
                                    defaultOptions={categories}
                                    placeholder="Tam olarak 3 kategori seçin..."
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            Sonuç bulunamadı.
                                        </p>
                                    }
                                    onChange={(selected: Option[]) => {
                                        const selectedValues = selected.map(
                                            (option) => option.value
                                        ) // Mapping selected options to their values
                                        setValue(selectedValues) // Setting the value state with the array of strings
                                        field.onChange(selectedValues) // Updating the form field value
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
                                Oda Kodu (Katılmak istediğiniz oda kodunu girin)
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

                <Button
                    type="submit"
                    className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Oda Oluştur veya Katıl
                </Button>
            </form>
        </Form>
    )
}

export default MainForm
