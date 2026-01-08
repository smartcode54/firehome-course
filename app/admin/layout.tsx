"use client";

import { useAuth } from "@/context/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, Users, Truck, Package, BarChart3, Settings, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Properties",
        href: "/admin/properties",
        icon: Building2,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Drivers",
        href: "/admin/drivers",
        icon: Truck,
    },
    {
        title: "Packages",
        href: "/admin/packages",
        icon: Package,
    },
    {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const authContext = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const currentUser = authContext?.currentUser;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (authContext && !currentUser) {
            router.push("/login");
        }
    }, [authContext, currentUser, router]);

    if (!authContext || !currentUser) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Navigation Bar */}
            <Navigation />

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "border-r border-border bg-card transition-all duration-300 hidden md:block",
                        sidebarOpen ? "w-64" : "w-16"
                    )}
                >
                    <div className="p-4">
                        {/* Sidebar Toggle */}
                        <div className="flex items-center justify-between mb-4">
                            {sidebarOpen && (
                                <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="h-8 w-8"
                            >
                                {sidebarOpen ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Navigation Items */}
                        <nav className="space-y-1">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                            !sidebarOpen && "justify-center px-2"
                                        )}
                                        title={!sidebarOpen ? item.title : undefined}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        {sidebarOpen && <span>{item.title}</span>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Mobile Menu Button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-4 right-4 md:hidden z-50 h-12 w-12 rounded-full shadow-lg"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <aside
                    className={cn(
                        "fixed left-0 top-0 h-full w-64 border-r border-border bg-card z-50 transform transition-transform duration-300 md:hidden",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <nav className="space-y-1">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
