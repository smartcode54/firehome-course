"use client";

import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { LayoutDashboard, Users, Package, Truck, BarChart3, Home, ChevronRight, UserCog } from "lucide-react";

import { useLanguage } from "@/context/language";
import { getTrucksClient } from "../trucks/actions.client";


export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [truckCount, setTruckCount] = useState<number>(0);
  const [isTrucksExpanded, setIsTrucksExpanded] = useState(false);

  // Fetch truck count on mount
  useEffect(() => {
    const fetchTruckCount = async () => {
      try {
        const trucks = await getTrucksClient();
        setTruckCount(trucks.length);
      } catch (error) {
        console.error("Error fetching truck count:", error);
      }
    };
    fetchTruckCount();
  }, []);

  // Mock data - replace with real data from Firestore
  const stats = {
    totalUsers: 0,
    totalDrivers: 0,
    totalPackages: 0,
    totalTrucks: truckCount,
    activeDeliveries: 0,
  };

  // Navigation items configuration
  const navItems = [
    {
      icon: Truck,
      title: t("dashboard.manageTrucks"),
      description: t("dashboard.manageTrucksDesc"),
      isExpandable: true,
      href: "/admin/trucks",
      stat: stats.totalTrucks,
      statLabel: "Trucks",
    },
    {
      icon: UserCog,
      title: t("dashboard.manageDrivers"),
      description: t("dashboard.manageDriversDesc"),
      href: "/admin/drivers",
      stat: stats.totalDrivers,
      statLabel: "drivers",
    },
    {
      icon: Users,
      title: t("dashboard.manageUsers"),
      description: t("dashboard.manageUsersDesc"),
      href: "/admin/users",
      stat: stats.totalUsers,
      statLabel: "users",
    },
    {
      icon: Package,
      title: t("dashboard.managePackages"),
      description: t("dashboard.managePackagesDesc"),
      href: "/admin/packages",
      stat: stats.totalPackages,
      statLabel: "packages",
    },
    {
      icon: BarChart3,
      title: t("dashboard.analytics"),
      description: t("dashboard.analyticsDesc"),
      href: "/admin/analytics",
      stat: stats.activeDeliveries,
      statLabel: "active",
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
                  {t("nav.home")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4 hover:text-green-600 transition-colors" />
                {t("nav.dashboard")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* Navigation List */}
        <div className="space-y-2">
          {navItems.map((item, i) => {
            const Icon = item.icon;

            // Render expandable item for Truck
            if (item.isExpandable) {
              return (
                <div key={i} className="space-y-2">
                  <div className="w-full group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 text-left">
                    <Link href={item.href || "#"} className="flex-1 flex items-center gap-4">
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
                    </Link>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-2xl font-bold text-foreground">
                          {item.stat}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {item.statLabel}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsTrucksExpanded(!isTrucksExpanded);
                        }}
                        className="p-1 rounded-md hover:bg-background/80 transition-colors z-20"
                      >
                        <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${isTrucksExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isTrucksExpanded && (
                    <div className="grid grid-cols-1 gap-4 pl-0 md:pl-14 animate-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/admin/trucks?view=own"
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                      >
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Own Fleet</h3>
                          <p className="text-xs text-muted-foreground">Manage company trucks</p>
                        </div>
                      </Link>

                      <Link
                        href="/admin/subcontractors"
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                      >
                        <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Subcontractors</h3>
                          <p className="text-xs text-muted-foreground">Manage partners</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={i}
                href={item.href!}
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



