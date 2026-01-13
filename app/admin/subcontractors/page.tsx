"use client";

import { useState, useEffect } from "react";
import { getSubcontractors, SubcontractorData } from "./actions.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Plus, Search, Loader2, User, Building2, Phone, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SubcontractorsListPage() {
    const router = useRouter(); // Initialize router
    const [subcontractors, setSubcontractors] = useState<SubcontractorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getSubcontractors();
            setSubcontractors(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubs = subcontractors.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.phone.includes(searchQuery)
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Subcontractors</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Subcontractors</h1>
                        <p className="text-muted-foreground mt-1">Manage external truck providers</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/subcontractors/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Register Subcontractor
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name, contact..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Phone / Mobile</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No subcontractors found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubs.map((sub) => (
                                        <TableRow
                                            key={sub.id}
                                            className="cursor-pointer hover:bg-accent/50"
                                            onClick={() => router.push(`/admin/subcontractors/${sub.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                {sub.name}
                                            </TableCell>
                                            <TableCell className="capitalize">{sub.type}</TableCell>
                                            <TableCell>
                                                {sub.contactPerson}
                                            </TableCell>
                                            <TableCell>
                                                {sub.phone}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/admin/subcontractors/${sub.id}`)
                                                }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}

