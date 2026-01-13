import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Truck, Calendar, User, FileText, Info, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { getTruckByIdClient, TruckData } from "../actions.client";
import { FileViewer } from "@/components/ui/file-viewer";

export default function TruckPreviewClient() {
    const params = useParams();
    const router = useRouter();
    const truckId = params.id as string;

    const [truck, setTruck] = useState<TruckData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Viewer State
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    useEffect(() => {
        const fetchTruck = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getTruckByIdClient(truckId);
                if (!data) {
                    setError("Truck not found.");
                    return;
                }
                setTruck(data);
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
    }, [truckId]);

    const formatDate = (date: Date | string | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            active: "bg-green-100 text-green-800 hover:bg-green-100",
            inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
            maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
            "insurance-claim": "bg-red-100 text-red-800 hover:bg-red-100",
            sold: "bg-purple-100 text-purple-800 hover:bg-purple-100",
        };

        const labels = {
            active: "Available",
            inactive: "Inactive",
            maintenance: "Maintenance",
            "insurance-claim": "Insurance Claim",
            sold: "Sold",
            // Fallback
            [status]: status
        };

        const statusKey = status as keyof typeof styles;
        return (
            <Badge className={styles[statusKey] || styles.inactive} variant="outline">
                {labels[statusKey as any] || status}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading truck data...</span>
            </div>
        );
    }

    if (error || !truck) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-destructive mb-4">
                        {error || "Truck not found"}
                    </h2>
                    <Button asChild>
                        <Link href="/admin/trucks">Back to Trucks</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Construct viewable files list
    const viewableFiles = [
        ...(truck.imageFrontRight ? [{ url: truck.imageFrontRight, type: "image" as const, label: "Front-Right View" }] : []),
        ...(truck.imageFrontLeft ? [{ url: truck.imageFrontLeft, type: "image" as const, label: "Front-Left View" }] : []),
        ...(truck.imageBackRight ? [{ url: truck.imageBackRight, type: "image" as const, label: "Back-Right View" }] : []),
        ...(truck.imageBackLeft ? [{ url: truck.imageBackLeft, type: "image" as const, label: "Back-Left View" }] : []),
        ...(truck.documentTax ? [{ url: truck.documentTax, type: "pdf" as const, label: "Tax Document" }] : []),
        ...(truck.documentRegister ? [{ url: truck.documentRegister, type: "pdf" as const, label: "Registration Document" }] : []),
        // Include generic images if any exist (legacy support)
        ...(truck.images || []).map((img, i) => ({ url: img, type: "image" as const, label: `Legacy Image ${i + 1}` })),
        // Include insurance docs
        ...(truck.insuranceDocuments || []).map((doc, i) => ({ url: doc, type: "pdf" as const, label: `Insurance Document ${i + 1}` })),
    ];

    const handleFileClick = (url: string) => {
        const index = viewableFiles.findIndex(f => f.url === url);
        if (index !== -1) {
            setViewerIndex(index);
            setIsViewerOpen(true);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/trucks">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {truck.licensePlate}
                            <StatusBadge status={truck.truckStatus} />
                        </h1>
                        <p className="text-muted-foreground">
                            {truck.brand} {truck.model} • {truck.province}
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href={`/admin/trucks/${truck.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Truck
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" />
                                Vehicle Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">License Plate</p>
                                <p className="font-medium">{truck.licensePlate}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Province</p>
                                <p className="font-medium">{truck.province}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Brand</p>
                                <p className="font-medium">{truck.brand}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Model</p>
                                <p className="font-medium">{truck.model}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <p className="font-medium">{truck.type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Color</p>
                                <p className="font-medium">{truck.color}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Year</p>
                                <p className="font-medium">{truck.year}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Seats</p>
                                <p className="font-medium">{truck.seats || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                Technical Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">VIN / Chassis No.</p>
                                <p className="font-mono text-sm">{truck.vin}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Engine Number</p>
                                <p className="font-mono text-sm">{truck.engineNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Engine Capacity</p>
                                <p className="font-medium">{truck.engineCapacity ? `${truck.engineCapacity} cc` : "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fuel Capacity</p>
                                <p className="font-medium">{truck.fuelCapacity ? `${truck.fuelCapacity} L` : "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Max Load Weight</p>
                                <p className="font-medium">{truck.maxLoadWeight ? `${truck.maxLoadWeight} kg` : "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fuel Type</p>
                                <p className="font-medium">{truck.fuelType}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {truck.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm">{truck.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Truck Photos & Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5 text-primary" />
                                Photos & Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Specific Photos Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { src: truck.imageFrontRight, label: "Front-Right" },
                                    { src: truck.imageFrontLeft, label: "Front-Left" },
                                    { src: truck.imageBackRight, label: "Back-Right" },
                                    { src: truck.imageBackLeft, label: "Back-Left" },
                                ].map((photo, i) => (
                                    <div key={i} className="space-y-2 cursor-pointer group" onClick={() => photo.src && handleFileClick(photo.src)}>
                                        <div className="relative aspect-video rounded-md overflow-hidden border bg-muted/30 group-hover:ring-2 group-hover:ring-primary transition-all">
                                            {photo.src ? (
                                                <Image src={photo.src} alt={photo.label} fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                            )}
                                            {photo.src && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-center text-muted-foreground">{photo.label}</p>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Documents List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { url: truck.documentTax, label: "Tax Document" },
                                    { url: truck.documentRegister, label: "Registration Document" },
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium">{doc.label}</span>
                                        </div>
                                        {doc.url ? (
                                            <Button variant="ghost" size="sm" onClick={() => handleFileClick(doc.url!)}>
                                                View
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Missing</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legacy Images Fallback */}
                    {truck.images && truck.images.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Additional / Legacy Photos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {truck.images.map((img, index) => (
                                        <div key={index} className="relative aspect-video rounded-md overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary" onClick={() => handleFileClick(img)}>
                                            <Image src={img} alt={`Legacy ${index}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Assignment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Assigned Driver</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                            {truck.driver.charAt(0)}
                                        </div>
                                        <span className="font-medium">{truck.driver}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Key Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                                <p className="font-medium">{formatDate(truck.registrationDate)}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                                <p className="font-medium">{formatDate(truck.buyingDate)}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                <p className="text-sm text-muted-foreground">{formatDate(truck.updatedAt)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {(truck.insurancePolicyNumber || truck.insuranceCompany || truck.insuranceType || truck.insuranceStartDate || truck.insuranceExpiryDate) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Insurance Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {truck.insurancePolicyId && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Policy ID</p>
                                        <p className="font-medium">{truck.insurancePolicyId}</p>
                                    </div>
                                )}
                                {truck.insurancePolicyNumber && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                                            <p className="font-medium">{truck.insurancePolicyNumber}</p>
                                        </div>
                                    </>
                                )}
                                {truck.insuranceCompany && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Provider</p>
                                            <p className="font-medium">{truck.insuranceCompany}</p>
                                        </div>
                                    </>
                                )}
                                {truck.insuranceType && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Type</p>
                                            <p className="font-medium">Type {truck.insuranceType}</p>
                                        </div>
                                    </>
                                )}
                                {truck.insurancePremium && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Premium</p>
                                            <p className="font-medium">{truck.insurancePremium?.toLocaleString()} THB</p>
                                        </div>
                                    </>
                                )}
                                {truck.insuranceStartDate && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                            <p className="font-medium">{formatDate(truck.insuranceStartDate)}</p>
                                        </div>
                                    </>
                                )}
                                {truck.insuranceExpiryDate && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                                            <p className="font-medium">{formatDate(truck.insuranceExpiryDate)}</p>
                                        </div>
                                    </>
                                )}
                                {truck.insuranceNotes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                            <p className="font-medium text-sm">{truck.insuranceNotes}</p>
                                        </div>
                                    </>
                                )}
                                {truck.insuranceDocuments && truck.insuranceDocuments.length > 0 && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Documents</p>
                                            <div className="flex flex-wrap gap-2">
                                                {truck.insuranceDocuments.map((doc, idx) => (
                                                    <Button key={idx} variant="outline" size="sm" onClick={() => handleFileClick(doc)} className="text-xs h-7">
                                                        Doc {idx + 1}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <FileViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                files={viewableFiles}
                initialIndex={viewerIndex}
            />
        </div>
    );
}
