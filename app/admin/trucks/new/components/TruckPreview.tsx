import { z } from "zod";
import { truckSchema } from "@/validate/truckSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Edit, Check, X, FileText, Camera } from "lucide-react";
import { useLanguage } from "@/context/language";
import { formatLicensePlate } from "@/lib/utils";

interface TruckPreviewProps {
    data: z.infer<typeof truckSchema>;
    onEdit: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export function TruckPreview({
    data,
    onEdit,
    onConfirm,
    onCancel,
    isSubmitting = false,
}: TruckPreviewProps) {
    const { t } = useLanguage();

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const formatNumber = (value: number | undefined) => {
        if (value === undefined || value === null) return "-";
        return new Intl.NumberFormat("th-TH").format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold">Preview Truck Information</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        กรุณาตรวจสอบข้อมูลก่อนบันทึก
                    </p>
                </div>
            </div>

            {/* Identification Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Identification</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">License Plate</p>
                        <p className="text-base font-semibold">{formatLicensePlate(data.licensePlate)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Province</p>
                        <p className="text-base font-semibold">{data.province}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">VIN</p>
                        <p className="text-base font-semibold">{data.vin}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Engine Number</p>
                        <p className="text-base font-semibold">{data.engineNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-base font-semibold capitalize">{data.truckStatus}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle Details Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Brand</p>
                        <p className="text-base font-semibold">{data.brand}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Model</p>
                        <p className="text-base font-semibold">{data.model}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Year</p>
                        <p className="text-base font-semibold">{data.year}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Color</p>
                        <p className="text-base font-semibold">{data.color}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="text-base font-semibold">{data.type}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Seats</p>
                        <p className="text-base font-semibold">{data.seats || "-"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Engine Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Engine Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Fuel Type</p>
                        <p className="text-base font-semibold">{data.fuelType}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Engine Capacity (cc)</p>
                        <p className="text-base font-semibold">{formatNumber(data.engineCapacity)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Fuel Capacity (L)</p>
                        <p className="text-base font-semibold">{formatNumber(data.fuelCapacity)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Max Load Weight (kg)</p>
                        <p className="text-base font-semibold">{formatNumber(data.maxLoadWeight)}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Registration Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Registration & Assignment</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                        <p className="text-base font-semibold">{formatDate(data.registrationDate)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Buying Date</p>
                        <p className="text-base font-semibold">{formatDate(data.buyingDate)}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Driver</p>
                        <p className="text-base font-semibold">{data.driver}</p>
                    </div>
                    {data.notes && (
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                            <p className="text-base">{data.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Action Buttons */}
            {data.images && data.images.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5 text-primary" />
                            Truck Photos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.images.map((img, index) => (
                            <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                                <Image
                                    src={img}
                                    alt={`Truck image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onEdit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                >
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                >
                    <Check className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Confirm & Save"}
                </Button>
            </div>
        </div>
    );
}
