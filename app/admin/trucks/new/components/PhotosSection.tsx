"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/context/language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client";
import { TruckFormValues } from "@/validate/truckSchema";

export function PhotosSection() {
    const { t } = useLanguage();
    const { watch, setValue, formState: { errors } } = useFormContext<TruckFormValues>();
    const [isUploading, setIsUploading] = useState(false);

    // Watch images array
    const images = watch("images") || [];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Basic validation
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        // max 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        try {
            setIsUploading(true);

            // Create reference: trucks/{timestamp}_{filename}
            const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
            const storageRef = ref(storage, `trucks/${filename}`);

            // Upload
            const snapshot = await uploadBytes(storageRef, file);

            // Get URL
            const url = await getDownloadURL(snapshot.ref);

            // Add to form
            setValue("images", [...images, url], {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
            });

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const removeImage = (indexToRemove: number) => {
        const newImages = images.filter((_, index) => index !== indexToRemove);
        setValue("images", newImages, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Truck Photos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Existing Images */}
                    {images.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-md overflow-hidden border group">
                            <Image
                                src={url}
                                alt={`Truck photo ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeImage(index)}
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Upload Button */}
                    <div className="relative aspect-video flex flex-col items-center justify-center border-2 border-dashed rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="text-xs">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <ImagePlus className="h-8 w-8" />
                                <span className="text-xs font-medium">Add Photo</span>
                            </div>
                        )}
                    </div>
                </div>

                {errors.images && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.images.message}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
