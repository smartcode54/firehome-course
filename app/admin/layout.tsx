"use client";

import { useAuth } from "@/context/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, Users, Truck, Package, BarChart3, Settings, Menu, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useLanguage } from "@/context/language";

type MenuItem = {
    title: string;
    href?: string;
    icon: any;
    children?: MenuItem[];
};

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
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]); // Default collapsed
    const { t } = useLanguage();

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const sidebarItems: MenuItem[] = [
        {
            title: t("nav.dashboard"),
            href: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: t("Trucks"),
            icon: Truck,
            children: [
                {
                    title: t("Own Fleet"),
                    href: "/admin/trucks",
                    icon: Truck,
                },
                {
                    title: t("Subcontractors"),
                    href: "/admin/subcontractors",
                    icon: Users,
                },
            ]
        },
        {
            title: t("nav.users"),
            href: "/admin/users",
            icon: Users,
        },
        {
            title: t("nav.drivers"),
            href: "/admin/drivers",
            icon: Truck,
        },
        {
            title: t("nav.packages"),
            href: "/admin/packages",
            icon: Package,
        },
        {
            title: t("nav.analytics"),
            href: "/admin/analytics",
            icon: BarChart3,
        },
        {
            title: t("nav.settings"),
            href: "/admin/settings",
            icon: Settings,
        },
    ];

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

    const renderMenuItem = (item: MenuItem, isMobile = false) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.includes(item.title);
        const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + "/")) : false;

        // Check if any child is active
        const isChildActive = hasChildren && item.children?.some(child =>
            child.href && (pathname === child.href || pathname.startsWith(child.href + "/"))
        );

        if (hasChildren) {
            return (
                <div key={item.title} className="space-y-1">
                    <button
                        onClick={() => {
                            if (!sidebarOpen && !isMobile) setSidebarOpen(true);
                            toggleMenu(item.title);
                        }}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                            isChildActive
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            !sidebarOpen && !isMobile && "justify-center px-2"
                        )}
                        title={!sidebarOpen && !isMobile ? item.title : undefined}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {(sidebarOpen || isMobile) && <span>{item.title}</span>}
                        </div>
                        {(sidebarOpen || isMobile) && (
                            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {/* Render Children */}
                    {isExpanded && (sidebarOpen || isMobile) && (
                        <div className="pl-9 space-y-1">
                            {item.children!.map(child => {
                                const ChildIcon = child.icon;
                                const isChildActive = child.href ? (pathname === child.href || pathname.startsWith(child.href + "/")) : false;
                                return (
                                    <Link
                                        key={child.href}
                                        href={child.href!}
                                        onClick={() => isMobile && setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors block",
                                            isChildActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        {/* <ChildIcon className="h-3 w-3" /> */}
                                        <span>{child.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.href}
                href={item.href!}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    !sidebarOpen && !isMobile && "justify-center px-2"
                )}
                title={(!sidebarOpen && !isMobile) ? item.title : undefined}
            >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {(sidebarOpen || isMobile) && <span>{item.title}</span>}
            </Link>
        );
    };

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
                                <h2 className="text-lg font-semibold text-foreground">{t("admin.panel")}</h2>
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
                            {sidebarItems.map(item => renderMenuItem(item))}
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
                            <h2 className="text-lg font-semibold text-foreground">{t("admin.panel")}</h2>
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
                            {sidebarItems.map(item => renderMenuItem(item, true))}
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
