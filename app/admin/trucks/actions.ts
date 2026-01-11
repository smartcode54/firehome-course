"use server";

import { firestoreTrucks } from "@/firebase/server";
import { cookies } from "next/headers";
import { auth } from "@/firebase/server";

export interface TruckData {
    id: string;
    licensePlate: string;
    province: string;
    vin: string;
    engineNumber: string;
    truckStatus: string;
    brand: string;
    model: string;
    year: string;
    color: string;
    type: string;
    seats?: string;
    fuelType: string;
    engineCapacity?: number;
    fuelCapacity?: number;
    maxLoadWeight?: number;
    registrationDate: string;
    buyingDate: string;
    driver: string;
    notes?: string;
    images?: string[];
    createdBy: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getTrucks(): Promise<TruckData[]> {
    try {
        // Verify authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("firebase_token")?.value;

        if (!token) {
            throw new Error("Unauthorized: No authentication token found");
        }

        // Verify token
        const verifiedToken = await auth.verifyIdToken(token);

        // Check if user is admin
        if (verifiedToken.admin !== true) {
            throw new Error("Forbidden: Admin access required");
        }

        // Get trucks from Firestore
        const trucksRef = firestoreTrucks.collection("trucks");
        const snapshot = await trucksRef.get();

        const trucks: TruckData[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convert Firestore Timestamp to Date or keep as is
            const formatTimestamp = (timestamp: any) => {
                if (!timestamp) return null;
                if (timestamp.toDate) {
                    return timestamp.toDate();
                }
                if (timestamp.toMillis) {
                    return new Date(timestamp.toMillis());
                }
                return timestamp;
            };

            trucks.push({
                id: doc.id,
                licensePlate: data.licensePlate || "",
                province: data.province || "",
                vin: data.vin || "",
                engineNumber: data.engineNumber || "",
                truckStatus: data.truckStatus || "",
                brand: data.brand || "",
                model: data.model || "",
                year: data.year || "",
                color: data.color || "",
                type: data.type || "",
                seats: data.seats || "",
                fuelType: data.fuelType || "",
                engineCapacity: data.engineCapacity,
                fuelCapacity: data.fuelCapacity,
                maxLoadWeight: data.maxLoadWeight,
                registrationDate: data.registrationDate || "",
                buyingDate: data.buyingDate || "",
                driver: data.driver || "",
                notes: data.notes || "",
                images: data.images || [],
                createdBy: data.createdBy || "",
                createdAt: formatTimestamp(data.createdAt),
                updatedAt: formatTimestamp(data.updatedAt),
            });
        });

        // Sort by createdAt (newest first)
        trucks.sort((a, b) => {
            const aTime = a.createdAt instanceof Date 
                ? a.createdAt.getTime() 
                : a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt instanceof Date 
                ? b.createdAt.getTime() 
                : b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
        });

        return trucks;
    } catch (error) {
        console.error("Error fetching trucks:", error);
        throw error;
    }
}

export async function getTruckById(id: string): Promise<TruckData | null> {
    try {
        // Verify authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("firebase_token")?.value;

        if (!token) {
            throw new Error("Unauthorized: No authentication token found");
        }

        // Verify token
        const verifiedToken = await auth.verifyIdToken(token);

        // Check if user is admin
        if (verifiedToken.admin !== true) {
            throw new Error("Forbidden: Admin access required");
        }

        // Get truck from Firestore
        const truckRef = firestoreTrucks.collection("trucks").doc(id);
        const doc = await truckRef.get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data()!;

        // Convert Firestore Timestamp to Date or keep as is
        const formatTimestamp = (timestamp: any) => {
            if (!timestamp) return null;
            if (timestamp.toDate) {
                return timestamp.toDate();
            }
            if (timestamp.toMillis) {
                return new Date(timestamp.toMillis());
            }
            return timestamp;
        };

        return {
            id: doc.id,
            licensePlate: data.licensePlate || "",
            province: data.province || "",
            vin: data.vin || "",
            engineNumber: data.engineNumber || "",
            truckStatus: data.truckStatus || "",
            brand: data.brand || "",
            model: data.model || "",
            year: data.year || "",
            color: data.color || "",
            type: data.type || "",
            seats: data.seats || "",
            fuelType: data.fuelType || "",
            engineCapacity: data.engineCapacity,
            fuelCapacity: data.fuelCapacity,
            maxLoadWeight: data.maxLoadWeight,
            registrationDate: data.registrationDate || "",
            buyingDate: data.buyingDate || "",
            driver: data.driver || "",
            notes: data.notes || "",
            images: data.images || [],
            createdBy: data.createdBy || "",
            createdAt: formatTimestamp(data.createdAt),
            updatedAt: formatTimestamp(data.updatedAt),
        };
    } catch (error) {
        console.error("Error fetching truck:", error);
        throw error;
    }
}
