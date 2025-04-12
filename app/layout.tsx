
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "My Application",
  description: "A modern web application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container flex items-center justify-between h-16">
                <h1 className="text-xl font-bold">My App</h1>
                <ThemeToggle />
              </div>
            </header>
            <main className="container py-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
