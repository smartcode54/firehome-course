import {
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
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/context/language";
import { THAILAND_PROVINCES } from "@/lib/constants";
import { Combobox } from "@/components/ui/combobox";

export function IdentificationSection() {
    const { control, setValue } = useFormContext();
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b pb-2">{t("Identification")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={control}
                    name="licensePlate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("license Plate")} *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., กข-1234"
                                    maxLength={7}
                                    {...field}
                                    onChange={(e) => {
                                        // Remove English characters (a-z, A-Z) to enforce Thai characters
                                        const value = e.target.value.replace(/[a-zA-Z]/g, '');
                                        field.onChange(value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="province"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{t("province")} *</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={THAILAND_PROVINCES}
                                    value={field.value}
                                    onSelect={(value) => setValue("province", value, { shouldValidate: true })}
                                    placeholder="Select province"
                                    searchPlaceholder="Search province..."
                                    className={!field.value ? "text-muted-foreground" : ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="vin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("VIN")} *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., 1HGBH41JXMN109186"
                                    maxLength={17}
                                    {...field}
                                    onChange={(e) => {
                                        // Remove Thai characters
                                        const value = e.target.value.toUpperCase().replace(/[\u0E00-\u0E7F]/g, "");
                                        field.onChange(value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="engineNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("engineNumber")} *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., 4D56-ABC123"
                                    maxLength={9}
                                    {...field}
                                    onChange={(e) => {
                                        // Remove Thai characters
                                        const value = e.target.value.toUpperCase().replace(/[\u0E00-\u0E7F]/g, "");
                                        field.onChange(value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="truckStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("truck status")} *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select truck status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="insurance-claim">Insurance Claim</SelectItem>
                                    <SelectItem value="sold">Sold</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
