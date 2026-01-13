"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSubcontractorById, SubcontractorData } from "../actions.client";
import { getTrucksClient, TruckData } from "../../trucks/actions.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Building2, User, Phone, Mail, MapPin, Truck, Plus, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatLicensePlate } from "@/lib/utils";

export default function SubcontractorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [subcontractor, setSubcontractor] = useState<SubcontractorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [trucks, setTrucks] = useState<TruckData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch Subcontractor
                const subData = await getSubcontractorById(id);
                setSubcontractor(subData);

                // Fetch Trucks for this Subcontractor
                // Note: Ideally we should use a query with where clause, but for now we filter client side 
                // as per current architecture pattern observed in trucks page
                const allTrucks = await getTrucksClient();
                const subTrucks = allTrucks.filter(t => t.ownershipType === "subcontractor" && t.subcontractorId === id);
                setTrucks(subTrucks);

            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!subcontractor) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Subcontractor not found</h2>
                <Button asChild>
                    <Link href="/admin/subcontractors">Back to List</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" asChild className="mb-4 pl-0">
                    <Link href="/admin/subcontractors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Link>
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{subcontractor.name}</h1>
                            <Badge variant={subcontractor.status === "active" ? "default" : "secondary"}>
                                {subcontractor.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            {subcontractor.type === "company" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            {subcontractor.type === "company" ? "Company" : "Individual"}
                        </p>
                    </div>
                    <div>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/subcontractors/${subcontractor.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="info" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="trucks">Trucks ({trucks.length})</TabsTrigger>
                </TabsList>

                {/* Information Tab */}
                <TabsContent value="info">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact & Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {subcontractor.type === "individual" ? "ID Card Number" : "Tax ID / PP20"}
                                        </span>
                                        <p className="font-medium">
                                            {subcontractor.type === "individual"
                                                ? (subcontractor.idCardNumber || "-")
                                                : (subcontractor.taxId || "-")}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Contact Person</span>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{subcontractor.contactPerson}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Created At</span>
                                        <p className="font-medium text-sm">
                                            {subcontractor.createdAt ? new Date(subcontractor.createdAt).toLocaleString("th-TH") : "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Phone</span>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a href={`tel:${subcontractor.phone}`} className="font-medium hover:text-primary">{subcontractor.phone}</a>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a href={`mailto:${subcontractor.email}`} className="font-medium hover:text-primary">{subcontractor.email || "-"}</a>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Address</span>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                            <p className="font-medium">{subcontractor.address || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>
                                    {subcontractor.type === "individual" ? "ID Card Copy" : "Company Registration & PP20"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {subcontractor.documents && subcontractor.documents.length > 0 ? (
                                    <div className="grid grid-cols-2 bg-muted/20 p-4 rounded-lg gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                        {subcontractor.documents.map((url, index) => {
                                            const isImage = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url);
                                            return (
                                                <div key={index} className="relative group border rounded-md overflow-hidden bg-background">
                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square w-full">
                                                        {isImage ? (
                                                            <div className="relative w-full h-full">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={url}
                                                                    alt={`Document ${index + 1}`}
                                                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                                                <Eye className="h-8 w-8" />
                                                                <span className="text-xs text-center truncate w-full px-2">View Document</span>
                                                            </div>
                                                        )}
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No documents uploaded.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Trucks Tab */}
                <TabsContent value="trucks">
                    <div className="flex justify-end mb-4">
                        <Button asChild>
                            <Link href={`/admin/trucks/new?ownershipType=subcontractor&subcontractorId=${subcontractor.id}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Truck for {subcontractor.name}
                            </Link>
                        </Button>
                    </div>

                    {trucks.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/20">
                            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No trucks found</h3>
                            <p className="text-muted-foreground mb-4">
                                This subcontractor has no trucks assigned yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {trucks.map(truck => (
                                <div
                                    key={truck.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{formatLicensePlate(truck.licensePlate)} ({truck.province})</h4>
                                            <p className="text-sm text-muted-foreground">{truck.brand} {truck.model} • {truck.driver}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{truck.truckStatus}</Badge>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/trucks/${truck.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
