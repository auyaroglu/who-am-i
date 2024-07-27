import { ReactNode } from "react"
import { cn } from "@/app/lib/utils"
import { Inter as FontSans } from "next/font/google"
import { Providers } from "../providers"
import { InitTheme } from "../providers/Theme/InitTheme"

type LayoutProps = {
    children: ReactNode
}

import "./globals.css"
import { ThemeProvider } from "../providers/Theme"

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
})

const Layout = ({ children }: LayoutProps) => {
    return (
        <html>
            <head>
                <InitTheme />
            </head>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    fontSans.variable
                )}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}

export default Layout
