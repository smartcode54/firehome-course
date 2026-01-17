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

import { Plus, Search, Loader2, User, Building2, Phone, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { useLanguage } from "@/context/language";

export default function SubcontractorsListPage() {
    const { t } = useLanguage();
    const router = useRouter(); // Initialize router
    const [subcontractors, setSubcontractors] = useState<SubcontractorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedSubs = [...filteredSubs].sort((a, b) => {
        if (!sortConfig) return 0;

        let aValue: any = a[sortConfig.key as keyof SubcontractorData];
        let bValue: any = b[sortConfig.key as keyof SubcontractorData];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard">{t("nav.dashboard")}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{t("subcontractors.title")}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{t("subcontractors.title")}</h1>
                        <p className="text-muted-foreground mt-1">{t("subcontractors.subtitle")}</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/subcontractors/new">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("subcontractors.add")}
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("subcontractors.search")}
                            className="pl-10 w-full"
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
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">
                                            {t("subcontractors.table.name")} {getSortIcon('name')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                                        <div className="flex items-center">
                                            {t("subcontractors.table.type")} {getSortIcon('type')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('contactPerson')}>
                                        <div className="flex items-center">
                                            {t("subcontractors.table.contact")} {getSortIcon('contactPerson')}
                                        </div>
                                    </TableHead>
                                    <TableHead>{t("subcontractors.table.phone")}</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">
                                            {t("subcontractors.table.status")} {getSortIcon('status')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {t("subcontractors.noData")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedSubs.map((sub) => (
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

