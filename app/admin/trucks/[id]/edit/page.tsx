"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, Home, LayoutDashboard, Save, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Form } from "@/components/ui/form";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { truckSchema, TruckFormValues } from "@/validate/truckSchema";

import { IdentificationSection } from "../../new/components/IdentificationSection";
import { VehicleDetailsSection } from "../../new/components/VehicleDetailsSection";
import { RegistrationSection } from "../../new/components/RegistrationSection";
import { PhotosSection } from "../../new/components/PhotosSection";
import { EngineInformationSection } from "../../new/components/EngineCapacitySection";
import { updateTruckInFirestore } from "../../new/action";
import { getTruckById } from "../../actions";

export default function EditTruckPage() {
    const router = useRouter();
    const params = useParams();
    const truckId = params.id as string;

    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { t } = useLanguage();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser ?? null;

    // Initialize React Hook Form
    const form = useForm<TruckFormValues>({
        resolver: zodResolver(truckSchema) as any,
        defaultValues: {
            licensePlate: "",
            province: "",
            vin: "",
            engineNumber: "",
            truckStatus: "active",
            brand: "",
            model: "",
            year: "",
            color: "",
            type: "",
            seats: "",
            fuelType: "",
            engineCapacity: "",
            fuelCapacity: "",
            maxLoadWeight: "",
            registrationDate: "",
            buyingDate: "",
            driver: "",
            notes: "",
        },
    });

    // Fetch existing truck data
    useEffect(() => {
        const fetchTruck = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const truck = await getTruckById(truckId);

                if (!truck) {
                    setError("Truck not found.");
                    return;
                }

                // Populate form with existing data
                form.reset({
                    licensePlate: truck.licensePlate || "",
                    province: truck.province || "",
                    vin: truck.vin || "",
                    engineNumber: truck.engineNumber || "",
                    truckStatus: truck.truckStatus || "active",
                    brand: truck.brand || "",
                    model: truck.model || "",
                    year: truck.year || "",
                    color: truck.color || "",
                    type: truck.type || "",
                    seats: truck.seats || "",
                    fuelType: truck.fuelType || "",
                    engineCapacity: truck.engineCapacity ? String(truck.engineCapacity) : "",
                    fuelCapacity: truck.fuelCapacity ? String(truck.fuelCapacity) : "",
                    maxLoadWeight: truck.maxLoadWeight ? String(truck.maxLoadWeight) : "",
                    registrationDate: truck.registrationDate || "",
                    buyingDate: truck.buyingDate || "",
                    driver: truck.driver || "",
                    notes: truck.notes || "",
                });

                // TODO: Handle existing images
            } catch (err) {
                console.error("Error fetching truck:", err);
                setError(err instanceof Error ? err.message : "Failed to load truck data.");
            } finally {
                setIsLoading(false);
            }
        };

        if (truckId) {
            fetchTruck();
        }
    }, [truckId, form]);

    // Form submission handler
    const onSubmit = async (data: TruckFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            const token = await currentUser.getIdToken();

            console.log("=== Updating Truck ===");
            console.log("Truck ID:", truckId);
            console.log("Form Data:", JSON.stringify(data, null, 2));

            await updateTruckInFirestore(truckId, data, images, token);

            router.push(`/admin/trucks/${truckId}`);
        } catch (error) {
            console.error("Error updating truck:", error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to update truck. Please try again.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading truck data...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
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
                            <BreadcrumbLink asChild>
                                <Link href="/admin/trucks" className="flex items-center gap-1">
                                    <Truck className="h-4 w-4 hover:text-green-600 transition-colors" />
                                    {t("trucks.title")}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit Truck</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Edit Truck
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Update truck information
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/admin/trucks/${truckId}`} className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Details
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md border border-destructive/50">
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        <IdentificationSection />
                        <VehicleDetailsSection />
                        <EngineInformationSection />
                        <RegistrationSection />
                        <PhotosSection images={images} setImages={setImages} />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/admin/trucks/${truckId}`}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                className="flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
