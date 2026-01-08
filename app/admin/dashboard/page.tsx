"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { LayoutDashboard, Users, Package, Truck, BarChart3, Home, ChevronRight, Building2 } from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data - replace with real data from Firestore
  const stats = {
    totalUsers: 0,
    totalDrivers: 0,
    totalPackages: 0,
    activeDeliveries: 0,
  };

  // Navigation items configuration
  const navItems = [
    {
      icon: Users,
      title: "Manage Users",
      description: "View and manage user accounts",
      href: "/admin/users",
      stat: stats.totalUsers,
      statLabel: "users",
    },
    {
      icon: Truck,
      title: "Manage Drivers",
      description: "View and manage driver accounts",
      href: "/admin/drivers",
      stat: stats.totalDrivers,
      statLabel: "drivers",
    },
    {
      icon: Package,
      title: "Manage Packages",
      description: "View and manage package deliveries",
      href: "/admin/packages",
      stat: stats.totalPackages,
      statLabel: "packages",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View delivery statistics and reports",
      href: "/admin/analytics",
      stat: stats.activeDeliveries,
      statLabel: "active",
    },
    {
      icon: Building2,
      title: "Properties",
      description: "View and manage properties",
      href: "/admin/properties",
      stat: stats.totalPackages,
      statLabel: "properties",
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4 hover:text-green-600 transition-colors" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4 hover:text-green-600 transition-colors" />
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your logistics operations
          </p>
        </div>

        {/* Navigation List */}
        <div className="space-y-2">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-accent-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      {item.stat}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {item.statLabel}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}



