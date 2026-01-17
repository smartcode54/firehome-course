"use client";

import { useAuth } from "@/context/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Sun, Moon } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const authContext = useAuth();
    const router = useRouter();
    const currentUser = authContext?.currentUser;

    const [isDark, setIsDark] = useState(false);

    // Theme toggle logic
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setIsDark(shouldBeDark);
        if (shouldBeDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        window.dispatchEvent(new Event('themechange'));
    };

    if (!authContext || authContext.loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return null; // Will redirect in useEffect
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        {/* Add Breadcrumbs here later if needed */}
                    </div>
                    <div className="flex items-center gap-4 px-4">
                        <LanguageSwitcher />
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent transition-colors cursor-pointer"
                            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
