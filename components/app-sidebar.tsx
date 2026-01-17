"use client"

import {
    LayoutDashboard,
    Truck,
    Users,
    Package,
    BarChart3,
    Settings,
    ChevronDown,
    Building2,
    LogOut,
    User
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useLanguage } from "@/context/language"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function AppSidebar() {
    const { t } = useLanguage()
    const pathname = usePathname()
    const auth = useAuth()
    const currentUser = auth?.currentUser
    const logout = auth?.logout
    const { state } = useSidebar()

    // Menu items structure
    const items = [
        {
            title: t("nav.dashboard"),
            url: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: t("nav.trucks"),
            icon: Truck,
            items: [
                {
                    title: t("nav.fleets"),
                    url: "/admin/trucks",
                },
                {
                    title: t("nav.subcontractors"),
                    url: "/admin/subcontractors",
                },
            ],
        },
        {
            title: t("nav.users"),
            url: "/admin/users",
            icon: Users,
        },
        {
            title: t("nav.waitlist"),
            url: "/admin/waitlist",
            icon: User,
        },
        {
            title: t("nav.drivers"),
            url: "/admin/drivers",
            icon: Truck,
        },
        {
            title: t("nav.packages"),
            url: "/admin/packages",
            icon: Package,
        },
        {
            title: t("nav.analytics"),
            url: "/admin/analytics",
            icon: BarChart3,
        },
        {
            title: t("nav.settings"),
            url: "/admin/settings",
            icon: Settings,
        },
    ]

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Truck className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">LogiTruck</span>
                                    <span className="truncate text-xs">Admin Panel</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t("nav.platform")}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <Collapsible defaultOpen className="group/collapsible">
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                                <Link href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                                            <Link href={item.url}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={currentUser?.photoURL || ""} alt={currentUser?.displayName || "User"} />
                                        <AvatarFallback className="rounded-lg">
                                            {currentUser?.displayName?.slice(0, 2).toUpperCase() || "CN"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{currentUser?.displayName || "User"}</span>
                                        <span className="truncate text-xs">{currentUser?.email}</span>
                                    </div>
                                    <ChevronDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem onClick={async () => {
                                    await logout?.()
                                    window.location.href = "/login"
                                }}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
