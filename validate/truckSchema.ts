import * as z from "zod";

// Helper for optional numeric fields to handle empty strings
// Use union + transform instead of preprocess for better type safety
const optionalNumber = (min: number, max: number, label: string) =>
    z.union([z.string(), z.number(), z.undefined()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            if (typeof val === "string") {
                const num = parseFloat(val);
                return isNaN(num) ? undefined : num;
            }
            return typeof val === "number" ? val : undefined;
        })
        .pipe(
            z.number()
                .min(min, `${label} must be at least ${min}`)
                .max(max, `${label} cannot exceed ${max}`)
                .refine((val) => val >= 0, `${label} cannot be negative`)
                .optional()
        );

// Truck form validation schema
export const truckSchema = z.object({
    //validate truck identification
    //validate truck identification
    licensePlate: z.string()
        .min(1, "License plate is required")
        .regex(
            /^([ก-ฮ]{2}|[0-9][ก-ฮ]{2})-\d{1,4}$/,
            "License plate must be in format xx-xxxx or xxx-xxxx (e.g., กก-1234 or 1กก-1234)"
        ),
    province: z.string().min(1, "Province is required"),

    vin: z.string().length(17, "VIN must be exactly 17 characters"),
    engineNumber: z.string().length(10, "Engine number is required"),
    truckStatus: z.union([
        z.enum(["active", "inactive", "maintenance", "insurance-claim", "sold"]),
        z.literal(""),
    ]).refine((val) => val !== "", {
        message: "Truck status is required",
    }),
    //validate truck information
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number"),
    color: z.string().min(1, "Color is required"),
    type: z.string().min(1, "Type is required"),
    seats: z.string().refine(v => !v || (parseInt(v) >= 0 && parseInt(v) <= 10), "Seats must be 0-10 and cannot be negative"),
    //validate truck engines
    fuelType: z.string().min(1, "Fuel type is required"),
    engineCapacity: optionalNumber(0, 20000, "Engine capacity"),
    fuelCapacity: optionalNumber(0, 1000, "Fuel capacity"),
    maxLoadWeight: optionalNumber(0, 100000, "Max load weight"),
    //validate truck registration and driver assignment
    registrationDate: z.string().min(1, "Registration date is required"),
    buyingDate: z.string().min(1, "Buying date is required"),
    driver: z.string().min(1, "Driver is required"),
    notes: z.string().optional(),
    images: z.array(z.string()).optional(),
});

// Type inference from schema - use input type for form values
export type TruckFormValues = z.input<typeof truckSchema>;

// Type for validated data (after form submission passes validation)
export type TruckValidatedData = z.infer<typeof truckSchema>;

// Default values for the form
export const truckDefaultValues: TruckFormValues = {
    licensePlate: "",
    province: "",

    vin: "",
    engineNumber: "",
    truckStatus: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    type: "",
    seats: "",
    fuelType: "",
    engineCapacity: undefined,
    fuelCapacity: undefined,
    maxLoadWeight: undefined,
    registrationDate: "",
    buyingDate: "",
    driver: "",
    notes: "",
    images: [],
};
