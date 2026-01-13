"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, Home, LayoutDashboard, Save, ArrowLeft, Eye } from "lucide-react";

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
import { truckSchema, TruckFormValues, truckDefaultValues } from "@/validate/truckSchema";
import * as z from "zod";

import { IdentificationSection } from "./components/IdentificationSection";
import { VehicleDetailsSection } from "./components/VehicleDetailsSection";
import { RegistrationSection } from "./components/RegistrationSection";
import { EngineInformationSection } from "./components/EngineCapacitySection";
import { PhotosSection } from "./components/PhotosSection";
import { TruckPreview } from "./components/TruckPreview";
import { saveNewTruckToFirestoreClient } from "./action.client";

export default function CreateTruckPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<z.infer<typeof truckSchema> | null>(null);

    const { t } = useLanguage();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser ?? null;

    // Initialize React Hook Form with Zod resolver
    const form = useForm<TruckFormValues>({
        resolver: zodResolver(truckSchema) as any, // Type assertion needed due to transform in schema
        defaultValues: truckDefaultValues,
    });

    // Handle preview button click
    const handlePreview = (data: z.infer<typeof truckSchema>) => {
        setPreviewData(data);
        setShowPreview(true);
        setError(null);
    };

    // Handle edit button - go back to form
    const handleEdit = () => {
        setShowPreview(false);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle confirm and save
    const handleConfirmSave = async () => {
        if (!previewData) return;

        setIsSubmitting(true);
        setError(null);
        try {
            // Check if user is authenticated
            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            // Save truck to Firestore using client SDK
            await saveNewTruckToFirestoreClient(previewData, currentUser.uid);

            // Show success and redirect
            router.push("/admin/trucks");
        } catch (error) {
            console.error("Error saving truck:", error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to save truck. Please try again.";
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    // Form submission handler - show preview instead of saving directly
    const onSubmit = (data: z.infer<typeof truckSchema>) => {
        handlePreview(data);
    };

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
                            <BreadcrumbPage>{t("New Truck")}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {t("New Truck")}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t("Add a new truck")}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/trucks" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {t("back to Trucks")}
                        </Link>
                    </Button>
                </div>

                {/* Show Preview or Form */}
                {showPreview && previewData ? (
                    <div>
                        {error && (
                            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md border border-destructive/50 mb-6">
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        <TruckPreview
                            data={previewData}
                            onEdit={handleEdit}
                            onConfirm={handleConfirmSave}
                            onCancel={() => router.push("/admin/trucks")}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                ) : (
                    /* Form with React Hook Form */
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
                            <PhotosSection />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/trucks">{t("Cancel")}</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
}
