import { ReactNode } from "react"
import { cn } from "@/app/lib/utils"
import { Inter as FontSans } from "next/font/google"
import { Toaster } from "@/app/components/ui/toaster"
import type { Metadata } from "next"

type LayoutProps = {
    children: ReactNode
}

import "./globals.css"

export const metadata: Metadata = {
    icons: {
        icon: "/favicon.ico",
    },
}

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
})

const Layout = ({ children }: LayoutProps) => {
    return (
        <html>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    fontSans.variable
                )}
            >
                {children}
                <Toaster />
            </body>
        </html>
    )
}

export default Layout
