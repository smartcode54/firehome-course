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
    // Truck Ownership
    ownershipType: z.enum(["own", "subcontractor"]).default("own"),
    subcontractorId: z.string().optional(), // Required if ownershipType is 'subcontractor'

    //validate truck identification
    //validate truck identification
    licensePlate: z.string()
        .min(6, "License plate is required")
        .regex(
            /^([ก-ฮ]{2}|[0-9][ก-ฮ]{2})-?\d{1,4}$/,
            "License plate must be in format xx-xxxx or xxx-xxxx (e.g., กก-1234 or 1กก-1234)"
        ),
    province: z.string().min(1, "Province is required"),

    vin: z.string().length(17, "VIN must be exactly 17 characters").optional().or(z.literal("")), // Made optional for subcontractors
    engineNumber: z.string().length(9, "Engine number is required").optional().or(z.literal("")), // Made optional for subcontractors
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
    registrationDate: z.string().optional(), // Optional for Subcontractors
    buyingDate: z.string().optional(), // Optional for Subcontractors
    driver: z.string().min(1, "Driver is required").optional().or(z.literal("")), // Optional for Subcon setup (can be assigned later)
    notes: z.string().optional(),
    // Images (Required)
    imageFrontRight: z.string().min(1, "Front-Right image is required"),
    imageFrontLeft: z.string().min(1, "Front-Left image is required"),
    imageBackRight: z.string().min(1, "Back-Right image is required"),
    imageBackLeft: z.string().min(1, "Back-Left image is required"),

    // Documents (Required)
    documentTax: z.string().min(1, "Tax document is required"),
    documentRegister: z.string().min(1, "Registration document is required"),

    // Insurance Information (Optional)
    insurancePolicyId: z.string().optional(), // maps to policy_id
    insurancePolicyNumber: z.string().optional(), // maps to policy_number
    insuranceCompany: z.string().optional(), // maps to provider
    insuranceType: z.enum(["1", "2", "2+", "3", "3+"]).or(z.literal("")).optional(), // maps to coverage_type
    insuranceStartDate: z.string().optional(), // maps to start_date
    insuranceExpiryDate: z.string().optional(), // maps to end_date
    insurancePremium: optionalNumber(0, 1000000, "Premium"), // maps to premium
    insuranceDocuments: z.array(z.string()).optional(), // maps to documents
    insuranceNotes: z.string().optional(), // maps to notes
});

// Type inference from schema - use input type for form values
export type TruckFormValues = z.input<typeof truckSchema>;

// Type for validated data (after form submission passes validation)
export type TruckValidatedData = z.infer<typeof truckSchema>;

// Default values for the form
export const truckDefaultValues: TruckFormValues = {
    ownershipType: "own",
    subcontractorId: "",
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
    // Insurance
    insurancePolicyId: "",
    insurancePolicyNumber: "",
    insuranceCompany: "",
    insuranceType: "",
    insuranceStartDate: "",
    insuranceExpiryDate: "",
    insurancePremium: undefined,
    insuranceDocuments: [],
    insuranceNotes: "",

    // Images
    imageFrontRight: "",
    imageFrontLeft: "",
    imageBackRight: "",
    imageBackLeft: "",
    // Documents
    documentTax: "",
    documentRegister: "",
};
