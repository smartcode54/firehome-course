"use client";

import { useState, useEffect } from "react";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { truckSchema, TruckFormValues, truckDefaultValues } from "@/validate/truckSchema";
import * as z from "zod";

import { IdentificationSection } from "./components/IdentificationSection";
import { InsuranceSection } from "./components/InsuranceSection";
import { VehicleDetailsSection } from "./components/VehicleDetailsSection";
import { RegistrationSection } from "./components/RegistrationSection";
import { EngineInformationSection } from "./components/EngineCapacitySection";
import { PhotosSection } from "./components/PhotosSection";
import { TruckPreview } from "./components/TruckPreview";
import { uploadTruckFile, saveNewTruckToFirestoreClient, checkLicensePlateExists } from "./action.client";
import { getSubcontractors } from "../../subcontractors/actions.client";

// Subcontractor Selector Component
function SubcontractorSelector({ value, onChange, subcontractors }: { value?: string, onChange: (val: string) => void, subcontractors: any[] }) {
    return (
        <Select onValueChange={onChange} value={value || ""}>
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Select a subcontractor" />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {subcontractors.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default function CreateTruckPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<z.infer<typeof truckSchema> | null>(null);
    const [subcontractors, setSubcontractors] = useState<any[]>([]);

    // Load subcontractors
    useEffect(() => {
        getSubcontractors().then(setSubcontractors);
    }, []);

    // Store files to be uploaded: Key = Blob URL, Value = File object
    const [filesToUpload] = useState<Map<string, File>>(() => new Map());

    const { t } = useLanguage();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser ?? null;

    // Initialize React Hook Form with Zod resolver
    const form = useForm<TruckFormValues>({
        resolver: zodResolver(truckSchema) as any, // Type assertion needed due to transform in schema
        defaultValues: truckDefaultValues,
    });

    const handleFileSelect = (fieldOrFile: string | File, fileOrBlob: File | string, blobUrl?: string) => {
        if (typeof fieldOrFile === 'string' && blobUrl) {
            // From PhotosSection
            filesToUpload.set(blobUrl, fileOrBlob as File);
        } else if (fieldOrFile instanceof File && typeof fileOrBlob === 'string') {
            // From InsuranceSection
            filesToUpload.set(fileOrBlob, fieldOrFile);
        }
    };

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
            if (!currentUser) throw new Error("User not authenticated");

            // Clone data to avoid mutating state directly
            const finalData = { ...previewData };

            // Helper to upload if blob exists
            const uploadIfNeeded = async (blobUrl: string | undefined | null, pathPrefix: string): Promise<string | undefined> => {
                if (!blobUrl || !blobUrl.startsWith("blob:")) return blobUrl || undefined;

                const file = filesToUpload.get(blobUrl);
                if (!file) {
                    console.warn(`File not found for blob URL: ${blobUrl}`);
                    return undefined;
                }

                return await uploadTruckFile(file, `trucks/${pathPrefix}/${Date.now()}_${file.name}`);
            };

            // 1. Upload Standard Images
            const imageFields = ['imageFrontRight', 'imageFrontLeft', 'imageBackRight', 'imageBackLeft'] as const;
            for (const field of imageFields) {
                const url = await uploadIfNeeded(finalData[field], `photos/${field.replace('image', '').toLowerCase()}`);
                if (url) (finalData as any)[field] = url;
            }

            // 2. Upload Standard Documents
            if (finalData.documentTax) {
                const url = await uploadIfNeeded(finalData.documentTax, "documents/tax");
                if (url) finalData.documentTax = url;
            }
            if (finalData.documentRegister) {
                const url = await uploadIfNeeded(finalData.documentRegister, "documents/register");
                if (url) finalData.documentRegister = url;
            }

            // 3. Upload Insurance Documents
            if (finalData.insuranceDocuments && finalData.insuranceDocuments.length > 0) {
                const newDocs: string[] = [];
                for (const doc of finalData.insuranceDocuments) {
                    const url = await uploadIfNeeded(doc, "insurance");
                    if (url) newDocs.push(url);
                }
                finalData.insuranceDocuments = newDocs;
            }

            // Save truck to Firestore
            await saveNewTruckToFirestoreClient(finalData, currentUser.uid);

            router.push("/admin/trucks");
        } catch (error) {
            console.error("Error saving truck:", error);
            setError(error instanceof Error ? error.message : "Failed to save truck.");
            setIsSubmitting(false);
        }
    };

    // Form submission handler - show preview instead of saving directly
    const onSubmit = async (data: z.infer<typeof truckSchema>) => {
        // Check for duplicate license plate (implied)
        handlePreview(data);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* ... Breadcrumbs & Header ... */}

            {/* Show Preview or Form */}
            {showPreview && previewData ? (
                // ... Preview Component ...
                <div>
                    {/* ... Error display ... */}
                    <TruckPreview
                        data={previewData}
                        subcontractorName={subcontractors.find(s => s.id === previewData.subcontractorId)?.name}
                        onEdit={handleEdit}
                        onConfirm={handleConfirmSave}
                        onCancel={() => router.push("/admin/trucks")}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ) : (
                /* Form with React Hook Form */
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any, (errors) => {
                        console.error("Form validation errors:", errors);
                        const errorMessages = Object.entries(errors).map(([field, error]) => `${field}: ${(error as any)?.message || 'Invalid'}`).join(', ');
                        setError(`Validation failed: ${errorMessages}`);
                    })} className="space-y-6">
                        {/* Error Display */}
                        {error && (
                            <div className="p-4 border border-destructive bg-destructive/10 rounded-lg text-destructive">
                                <p className="font-medium">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        {/* ... Ownership Section ... */}
                        <div className="bg-card border rounded-lg p-6">
                            <h3 className="text-lg font-medium mb-4">Ownership</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="ownershipType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Type</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-4">
                                                    <Button
                                                        type="button"
                                                        variant={field.value === "own" ? "default" : "outline"}
                                                        onClick={() => {
                                                            field.onChange("own");
                                                            form.setValue("subcontractorId", ""); // Clear sub ID
                                                        }}
                                                        className="flex-1"
                                                    >
                                                        Own Fleet
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={field.value === "subcontractor" ? "default" : "outline"}
                                                        onClick={() => field.onChange("subcontractor")}
                                                        className="flex-1"
                                                    >
                                                        Subcontractor
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.watch("ownershipType") === "subcontractor" && (
                                    <FormField
                                        control={form.control}
                                        name="subcontractorId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subcontractor (Required)</FormLabel>
                                                <SubcontractorSelector
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    subcontractors={subcontractors}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ... Other Sections ... */}
                        <IdentificationSection />
                        <VehicleDetailsSection />

                        {form.watch("ownershipType") === "own" && (
                            <EngineInformationSection />
                        )}

                        {form.watch("ownershipType") === "own" && (
                            <RegistrationSection />
                        )}

                        <InsuranceSection onFileSelect={handleFileSelect} />
                        <PhotosSection onFileSelect={handleFileSelect} />

                        {/* ... Buttons ... */}
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
    );
}
