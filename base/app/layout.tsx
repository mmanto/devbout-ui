import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { EntityViewProvider } from "@mmanto/devbout-ui"
import { SidebarInset, SidebarProvider } from "@mmanto/devbout-ui"
import { ThemePresetProvider } from "@/components/theme-preset-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { THEME_PRESET_BOOTSTRAP_SCRIPT } from "@/lib/theme-presets/script"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <head>
        {/* Re-applies the stored design preset before the first paint, so a
            reload never flashes the base theme. The HTML is a constant from
            this repo, never user data. */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_PRESET_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ThemePresetProvider>
            <EntityViewProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>{children}</SidebarInset>
              </SidebarProvider>
            </EntityViewProvider>
          </ThemePresetProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
