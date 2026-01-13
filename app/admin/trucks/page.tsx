"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/client";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Truck, Home, LayoutDashboard, Plus, Search, MoreHorizontal, Loader2, Eye, Edit, Wrench } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/language";
import { TruckData } from "./actions.client";
import { formatLicensePlate } from "@/lib/utils";

import { useRouter, useSearchParams } from "next/navigation";

export default function TrucksListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [trucks, setTrucks] = useState<TruckData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch trucks from Firestore with real-time listener
    useEffect(() => {
        setLoading(true);
        const trucksRef = collection(db, "trucks");
        const q = query(trucksRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const trucksData: TruckData[] = [];
            console.log("Fetched trucks snapshot size:", snapshot.size);
            snapshot.forEach((doc) => {
                const data = doc.data();
                // console.log("Truck Doc Data:", data); // Validating raw data
                // Helper to format timestamp
                const formatTimestamp = (timestamp: any): Date | null => {
                    if (!timestamp) return null;
                    if (timestamp.toDate) return timestamp.toDate();
                    if (timestamp.toMillis) return new Date(timestamp.toMillis());
                    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
                    return timestamp;
                };

                trucksData.push({
                    id: doc.id,
                    ownershipType: (data.ownershipType as "own" | "subcontractor") || "own",
                    subcontractorId: data.subcontractorId || undefined,
                    licensePlate: data.licensePlate || "",
                    province: data.province || "",
                    vin: data.vin || "",
                    engineNumber: data.engineNumber || "",
                    truckStatus: data.truckStatus || "",
                    brand: data.brand || "",
                    model: data.model || "",
                    year: data.year || "",
                    color: data.color || "",
                    type: data.type || "",
                    seats: data.seats || "",
                    fuelType: data.fuelType || "",
                    engineCapacity: data.engineCapacity,
                    fuelCapacity: data.fuelCapacity,
                    maxLoadWeight: data.maxLoadWeight,
                    registrationDate: data.registrationDate || "",
                    buyingDate: data.buyingDate || "",
                    driver: data.driver || "",
                    notes: data.notes || "",
                    images: data.images || [],
                    createdBy: data.createdBy || "",
                    createdAt: formatTimestamp(data.createdAt),
                    updatedAt: formatTimestamp(data.updatedAt),
                });
            });
            setTrucks(trucksData);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Error fetching trucks:", err);
            setError(err instanceof Error ? err.message : "Failed to load trucks");
            setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Filter trucks based on search query AND ownership view
    const view = searchParams.get("view") || "own";

    const filteredTrucks = trucks.filter((truck) => {
        // 1. Filter by View (Ownership)
        if (view === "own" && truck.ownershipType === "subcontractor") return false;
        if (view === "subcontractor" && truck.ownershipType !== "subcontractor") return false;

        // 2. Filter by Search Query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            truck.licensePlate.toLowerCase().includes(query) ||
            truck.model.toLowerCase().includes(query) ||
            truck.brand.toLowerCase().includes(query) ||
            truck.driver.toLowerCase().includes(query) ||
            truck.province.toLowerCase().includes(query)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
            case "maintenance":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "insurance-claim":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            case "sold":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active":
                return t("trucks.status.available") || "Active";
            case "inactive":
                return "Inactive";
            case "maintenance":
                return t("trucks.status.maintenance") || "Maintenance";
            case "insurance-claim":
                return "Insurance Claim";
            case "sold":
                return "Sold";
            default:
                return status;
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
                                    {t("nav.home")}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard" className="flex items-center gap-1">
                                    <LayoutDashboard className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    {t("nav.dashboard")}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="flex items-center gap-1">
                                <Truck className="h-4 w-4 hover:text-green-600 transition-colors" />
                                {t("trucks.title")}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {t("trucks.title")}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t("trucks.subtitle")}
                        </p>
                    </div>
                    <Button asChild className="flex items-center gap-2">
                        <Link href="/admin/trucks/new">
                            <Plus className="h-4 w-4" />
                            {t("trucks.addTruck")}
                        </Link>
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("trucks.searchPlaceholder") || "Search trucks..."}
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md border border-destructive/50 mb-6">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Tabs for Separation */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("view", "own");
                            router.push(`?${params.toString()}`);
                        }}
                        className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${view === "own"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Own Fleet
                    </button>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("view", "subcontractor");
                            router.push(`?${params.toString()}`);
                        }}
                        className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${view === "subcontractor"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Subcontractor Trucks
                    </button>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("view", "all");
                            router.push(`?${params.toString()}`);
                        }}
                        className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${view === "all"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        All Trucks
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading trucks...</span>
                    </div>
                )}

                {/* Trucks List */}
                {!loading && !error && (
                    <div className="space-y-2">
                        {filteredTrucks.map((truck) => (
                            <div
                                key={truck.id}
                                onClick={() => router.push(`/admin/trucks/${truck.id}`)}
                                className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground">
                                            {formatLicensePlate(truck.licensePlate)} ({truck.province})
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {truck.brand} {truck.model} • {truck.driver}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-sm text-muted-foreground">
                                        {truck.type}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(truck.truckStatus)}`}>
                                        {getStatusLabel(truck.truckStatus)}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/trucks/${truck.id}`} className="flex items-center cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Preview
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/trucks/${truck.id}/edit`} className="flex items-center cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Update
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Wrench className="mr-2 h-4 w-4" />
                                                Maintenance
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredTrucks.length === 0 && (
                    <div className="text-center py-12">
                        <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchQuery ? "No trucks found" : t("trucks.noTrucks") || "No trucks yet"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery
                                ? "Try adjusting your search query"
                                : t("trucks.getStarted") || "Get started by adding your first truck"
                            }
                        </p>
                        {!searchQuery && (
                            <Button asChild>
                                <Link href="/admin/trucks/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t("trucks.addTruck") || "Add Truck"}
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
