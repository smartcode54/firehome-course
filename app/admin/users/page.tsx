"use client";

import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, User, Plus, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/language";

type UserData = {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    customClaims?: {
        admin?: boolean;
        role?: string;
        [key: string]: any;
    };
    metadata: {
        lastSignInTime: string;
        creationTime: string;
        lastRefreshTime?: string | null;
    };
    providerData: string[];
};

export default function AdminUsersPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Edit Role State
    const [editRoleUser, setEditRoleUser] = useState<UserData | null>(null);
    const [editRoleValue, setEditRoleValue] = useState("");
    const [isEditRoleLoading, setIsEditRoleLoading] = useState(false);

    // Form state
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserDisplayName, setNewUserDisplayName] = useState("");
    const [newUserRole, setNewUserRole] = useState("user");

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Sync State
    const [isSyncing, setIsSyncing] = useState(false);

    const auth = useAuth();
    const currentUser = auth?.currentUser;
    const functions = getFunctions(undefined, "asia-southeast1");

    const [limitCount, setLimitCount] = useState(50);

    // Fetch users from Firestore
    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const usersRef = collection(db, "users");
        // Order by lastLogin if available, otherwise uid
        const q = query(usersRef, orderBy("lastLogin", "desc"), limit(limitCount));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData: UserData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                usersData.push({
                    uid: doc.id,
                    email: data.email || "",
                    displayName: data.displayName || "",
                    photoURL: data.photoURL,
                    // Map Firestore 'role' to customClaims structure to match UI expectation
                    customClaims: {
                        role: data.role,
                        admin: data.role === 'admin'
                    },
                    metadata: {
                        lastSignInTime: data.lastLogin || null,
                        creationTime: data.authCreationTime || null,
                    },
                    providerData: data.providerData || [], // Fallback if not scheduled
                } as unknown as UserData);
            });
            setUsers(usersData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching users from Firestore:", err);
            // Fallback to Cloud Function if Firestore fails (or is empty?)
            // fetchUsers(); // Optional: Decide if we want fallback
            setLoading(false);
            toast.error("Failed to load users from live database.");
        });

        return () => unsubscribe();
    }, [currentUser, limitCount]);

    // Legacy Cloud Function fetch (kept for reference or full sync)
    const fetchUsers = async () => {
        // Only used for manual refresh if needed, but onSnapshot handles it.
        // We can keep the Cloud Function for "Sync" but not for display.
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUserEmail || !newUserPassword || !newUserDisplayName) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setIsCreating(true);
            const createUser = httpsCallable(functions, 'createUser');
            await createUser({
                email: newUserEmail,
                password: newUserPassword,
                displayName: newUserDisplayName,
                role: newUserRole
            });

            toast.success("User created successfully");
            setIsCreateOpen(false);

            // Reset form
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserDisplayName("");
            setNewUserRole("user");

            // Refresh list
            fetchUsers();
        } catch (error: any) {
            console.error("Error creating user:", error);
            toast.error(`Failed to create user: ${error.message || "Unknown error"}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditRole = async () => {
        if (!editRoleUser) return;

        try {
            setIsEditRoleLoading(true);
            const updateUserRole = httpsCallable(functions, 'updateUserRole');
            await updateUserRole({
                targetUid: editRoleUser.uid,
                role: editRoleValue
            });

            toast.success("User role updated successfully.");
            setEditRoleUser(null);

            // Refresh list
            fetchUsers();

        } catch (error) {
            console.error("Error updating user role:", error);
            toast.error("Failed to update user role.");
        } finally {
            setIsEditRoleLoading(false);
        }
    };

    const openEditRole = (user: UserData) => {
        setEditRoleUser(user);
        setEditRoleValue(user.customClaims?.role || (user.customClaims?.admin ? "admin" : "user"));
    };

    const getRoleBadge = (user: UserData) => {
        const role = user.customClaims?.role || (user.customClaims?.admin ? "admin" : "user");

        switch (role) {
            case 'admin':
                return <Badge className="bg-green-700 hover:bg-slate-600"><Shield className="w-3 h-3 mr-1" /> {t("users.role.admin")}</Badge>;
            case 'partner':
                return <Badge className="bg-purple-500 hover:bg-purple-600"><User className="w-3 h-3 mr-1" /> {t("users.role.partner")}</Badge>;
            case 'subcontractor':
                return <Badge className="bg-orange-500 hover:bg-orange-600"><User className="w-3 h-3 mr-1" /> {t("users.role.subcontractor")}</Badge>;
            case 'customer':
                return <Badge className="bg-blue-500 hover:bg-blue-600"><User className="w-3 h-3 mr-1" /> {t("users.role.customer")}</Badge>;
            default:
                return <Badge variant="outline"><User className="w-3 h-3 mr-1" /> {t("users.role.user")}</Badge>;
        }
    };

    const handleSyncUsers = async () => {
        try {
            setIsSyncing(true);
            const syncExistingUsers = httpsCallable(functions, 'syncExistingUsers');
            const result = await syncExistingUsers();
            const data = result.data as { message: string };
            toast.success(data.message);
            fetchUsers();
        } catch (error: any) {
            console.error("Error syncing users:", error);
            toast.error(`Failed to sync users: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (!sortConfig) return 0;

        let aValue: any = a[sortConfig.key as keyof UserData];
        let bValue: any = b[sortConfig.key as keyof UserData];

        // Custom handling for nested/special fields
        if (sortConfig.key === 'role') {
            aValue = a.customClaims?.role || (a.customClaims?.admin ? "admin" : "user");
            bValue = b.customClaims?.role || (b.customClaims?.admin ? "admin" : "user");
        } else if (sortConfig.key === 'lastSignInTime') {
            aValue = a.metadata.lastSignInTime ? new Date(a.metadata.lastSignInTime).getTime() : 0;
            bValue = b.metadata.lastSignInTime ? new Date(b.metadata.lastSignInTime).getTime() : 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("users.title")}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t("users.subtitle")}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSyncUsers} variant="secondary" disabled={isSyncing}>
                        {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Loader2 className="mr-2 h-4 w-4" />}
                        {t("users.sync")}
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {t("users.add")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("users.createTitle")}</DialogTitle>
                                <DialogDescription>
                                    {t("users.createDesc")}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">Display Name</Label>
                                    <Input
                                        id="displayName"
                                        value={newUserDisplayName}
                                        onChange={(e) => setNewUserDisplayName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="partner">Partner</SelectItem>
                                            <SelectItem value="subcontractor">Subcontractor</SelectItem>
                                            <SelectItem value="customer">Customer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isCreating}>
                                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create User
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={fetchUsers} variant="outline">
                        Refresh List
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("users.allUsers")} ({users.length})</CardTitle>
                    <CardDescription>
                        {t("users.allUsersDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('displayName')}>
                                        <div className="flex items-center">
                                            {t("users.table.user")} {getSortIcon('displayName')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                                        <div className="flex items-center">
                                            {t("users.table.role")} {getSortIcon('role')}
                                        </div>
                                    </TableHead>
                                    <TableHead>{t("users.table.providers")}</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('lastSignInTime')}>
                                        <div className="flex items-center">
                                            {t("users.table.lastSignIn")} {getSortIcon('lastSignInTime')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedUsers.map((user) => {
                                    const isCurrentUser = currentUser?.uid === user.uid;

                                    return (
                                        <TableRow key={user.uid}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.displayName || "No Name"}</span>
                                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                                    <span className="text-xs text-muted-foreground font-mono mt-1">{user.uid}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getRoleBadge(user)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {user.providerData.map(p => (
                                                        <Badge key={p} variant="secondary" className="text-xs">
                                                            {p}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : "Never"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Created: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isCurrentUser}
                                                    onClick={() => openEditRole(user)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" /> {t("users.editRole")}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Role Dialog */}
            <Dialog open={!!editRoleUser} onOpenChange={(open) => !open && setEditRoleUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogDescription>
                            Change the role for {editRoleUser?.displayName || editRoleUser?.email}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select value={editRoleValue} onValueChange={setEditRoleValue}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="partner">Partner</SelectItem>
                                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditRoleUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditRole} disabled={isEditRoleLoading}>
                            {isEditRoleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
