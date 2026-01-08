"use client";

import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Building2, Home, LayoutDashboard, Save, ArrowLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreatePropertyPage() {
    const authContext = useAuth();
    const router = useRouter();
    const currentUser = authContext?.currentUser;

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        type: "",
        price: "",
        description: "",
    });
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    useEffect(() => {
        if (authContext && !currentUser) {
            router.push("/login");
        }
    }, [authContext, currentUser, router]);

    if (!authContext) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navigation />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">Loading...</div>
                </main>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navigation />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">Redirecting to login...</div>
                </main>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Save property to Firestore
        console.log("Form submitted:", formData);
        router.push("/admin/properties");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
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
                                <BreadcrumbLink asChild>
                                    <Link href="/admin/properties" className="flex items-center gap-1">
                                        <Building2 className="h-4 w-4 hover:text-green-600 transition-colors" />
                                        Properties
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>New Property</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Create New Property
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Add a new property to your listings
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/admin/properties" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-6 rounded-lg border border-border bg-card">
                            <h2 className="text-lg font-semibold mb-4">Property Details</h2>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Property Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Sunset Villa"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="e.g. 123 Beach Road, Miami, FL"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Property Type</Label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            required
                                        >
                                            <option value="">Select type...</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="House">House</option>
                                            <option value="Cabin">Cabin</option>
                                            <option value="Loft">Loft</option>
                                            <option value="Condo">Condo</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            placeholder="e.g. $500,000 or $2,000/mo"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe the property..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div className="grid gap-2">
                                    <Label>Property Photos</Label>
                                    <div className="space-y-4">
                                        {/* Image Preview Grid */}
                                        {images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-4">
                                                {images.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={image.preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border border-border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Area */}
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PNG, JPG or WEBP (max. 5MB)
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/properties">Cancel</Link>
                            </Button>
                            <Button type="submit" className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Save Property
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
