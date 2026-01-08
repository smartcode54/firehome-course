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
import { Building2, Home, LayoutDashboard, Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PropertiesListPage() {
    // Mock properties data - replace with real data from Firestore
    const properties = [
        {
            id: "1",
            name: "Sunset Villa",
            address: "123 Beach Road, Miami, FL",
            type: "Villa",
            status: "Available",
            price: "$850,000",
        },
        {
            id: "2",
            name: "Downtown Apartment",
            address: "456 Main Street, New York, NY",
            type: "Apartment",
            status: "Rented",
            price: "$2,500/mo",
        },
        {
            id: "3",
            name: "Mountain Cabin",
            address: "789 Forest Lane, Aspen, CO",
            type: "Cabin",
            status: "Available",
            price: "$450,000",
        },
        {
            id: "4",
            name: "Urban Loft",
            address: "321 Industrial Ave, Chicago, IL",
            type: "Loft",
            status: "Pending",
            price: "$1,800/mo",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "Rented":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

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
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard" className="flex items-center gap-1">
                                    <LayoutDashboard className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    Dashboard
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="flex items-center gap-1">
                                <Building2 className="h-4 w-4 hover:text-green-600 transition-colors" />
                                Properties
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Properties
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your property listings
                        </p>
                    </div>
                    <Button asChild className="flex items-center gap-2">
                        <Link href="/admin/properties/new">
                            <Plus className="h-4 w-4" />
                            Add Property
                        </Link>
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search properties..."
                        className="pl-10"
                    />
                </div>

                {/* Properties List */}
                <div className="space-y-2">
                    {properties.map((property) => (
                        <div
                            key={property.id}
                            className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">
                                        {property.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {property.address}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-sm text-muted-foreground">
                                    {property.type}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                    {property.status}
                                </span>
                                <div className="text-right font-semibold text-foreground min-w-[100px]">
                                    {property.price}
                                </div>
                                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {properties.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No properties yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by adding your first property.
                        </p>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Property
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

