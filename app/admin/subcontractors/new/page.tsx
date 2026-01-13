"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subcontractorSchema, SubcontractorFormValues } from "@/validate/subcontractorSchema";
import { createSubcontractor } from "../actions.client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import FileUploader from "../components/FileUploader";

export default function NewSubcontractorPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SubcontractorFormValues>({
        resolver: zodResolver(subcontractorSchema),
        defaultValues: {
            name: "",
            type: "individual",
            idCardNumber: "",
            taxId: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            status: "active",
            documents: [],
        },
    });

    const onSubmit = async (data: SubcontractorFormValues) => {
        try {
            setIsSubmitting(true);
            await createSubcontractor(data);
            toast.success("Subcontractor registered successfully");
            router.push("/admin/subcontractors");
        } catch (error) {
            console.error(error);
            toast.error("Failed to register subcontractor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" asChild className="mb-4 pl-0">
                    <Link href="/admin/subcontractors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Link>
                </Button>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Register Subcontractor</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="individual">Individual</SelectItem>
                                                        <SelectItem value="company">Company</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="pending">Pending Registration</SelectItem>
                                                        <SelectItem value="suspended">Suspended</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Conditional fields based on type */}
                                {form.watch("type") === "individual" && (
                                    <FormField
                                        control={form.control}
                                        name="idCardNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ID Card Number <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="National ID Number" maxLength={13} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {form.watch("type") === "company" && (
                                    <FormField
                                        control={form.control}
                                        name="taxId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tax ID / Commercial Registration <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tax ID" maxLength={13} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name / Company Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. John Doe Transport" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="contactPerson"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Person</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Primary contact" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="08x-xxx-xxxx" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Optional" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Full address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {form.watch("type") === "individual" ? (
                                    <FileUploader
                                        label="ID Card Copy"
                                        folder="id_cards"
                                        currentUrls={form.watch("documents")}
                                        onUploadComplete={(url) => {
                                            const current = form.getValues("documents") || [];
                                            form.setValue("documents", [...current, url]);
                                        }}
                                        onRemove={(url) => {
                                            const current = form.getValues("documents") || [];
                                            form.setValue("documents", current.filter(u => u !== url));
                                        }}
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-sm text-yellow-800 mb-4">
                                            <strong>Required Documents:</strong>
                                            <ul className="list-disc pl-5 mt-1">
                                                <li>Por Por 20 (ภพ.20)</li>
                                                <li>Company Registration (DBD/DIT)</li>
                                            </ul>
                                        </div>
                                        <FileUploader
                                            label="Company Documents (PP20, Registration)"
                                            folder="company_docs"
                                            currentUrls={form.watch("documents")}
                                            onUploadComplete={(url) => {
                                                const current = form.getValues("documents") || [];
                                                form.setValue("documents", [...current, url]);
                                            }}
                                            onRemove={(url) => {
                                                const current = form.getValues("documents") || [];
                                                form.setValue("documents", current.filter(u => u !== url));
                                            }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Register Subcontractor
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
