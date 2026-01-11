"use server";

import { truckSchema } from "@/validate/truckSchema";
import * as z from "zod";
import { firestoreTrucks, auth, storage } from "@/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

// Helper function to upload images to Firebase Storage
const uploadImagesToStorage = async (
    images: { file: File; preview: string }[],
    truckId: string
): Promise<string[]> => {
    if (!images || images.length === 0) {
        return [];
    }

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || "logi-track-wrt-dev"}.firebasestorage.app`;
    const bucket = storage.bucket(bucketName);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
            // Get file data from the preview (base64)
            const base64Data = image.preview.split(",")[1];
            if (!base64Data) {
                console.warn(`[uploadImagesToStorage] Image ${i} has no valid base64 data, skipping.`);
                continue;
            }

            const buffer = Buffer.from(base64Data, "base64");
            
            // Determine content type from base64 prefix
            const mimeMatch = image.preview.match(/data:([^;]+);/);
            const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";
            const extension = contentType.split("/")[1] || "jpg";

            // Create unique filename
            const fileName = `trucks/${truckId}/${Date.now()}_${i}.${extension}`;
            const file = bucket.file(fileName);

            // Upload the file
            await file.save(buffer, {
                metadata: {
                    contentType: contentType,
                },
            });

            // Make the file publicly accessible
            await file.makePublic();

            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            uploadedUrls.push(publicUrl);

            console.log(`[uploadImagesToStorage] Uploaded image ${i + 1}/${images.length}: ${fileName}`);
        } catch (uploadError) {
            console.error(`[uploadImagesToStorage] Failed to upload image ${i}:`, uploadError);
            // Continue with other images even if one fails
        }
    }

    return uploadedUrls;
};

export const saveNewTruckToFirestore = async (
    data: z.infer<typeof truckSchema>, 
    images: { file: File; preview: string }[], 
    token: string
) => {
    try {
        console.log("[saveNewTruckToFirestore] Starting save process...");
        
        // Validate token
        if (!token) {
            throw new Error("Unauthorized: No authentication token found");
        }

        // Verify token
        console.log("[saveNewTruckToFirestore] Verifying token...");
        const verifiedToken = await auth.verifyIdToken(token);
        console.log("[saveNewTruckToFirestore] Token verified, user ID:", verifiedToken.uid);
        console.log("[saveNewTruckToFirestore] Admin claim:", verifiedToken.admin);
        
        // Check if user is admin from token claims
        if (verifiedToken.admin !== true) {
            throw new Error("Forbidden: Admin access required");
        }

        // First, create the truck document to get an ID
        console.log("[saveNewTruckToFirestore] Creating truck document...");
        const trucksRef = firestoreTrucks.collection("trucks");
        const docRef = await trucksRef.add({
            ...data,
            images: [],
            createdBy: verifiedToken.uid,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        const truckId = docRef.id;
        console.log("[saveNewTruckToFirestore] Created truck with ID:", truckId);

        // Upload images to Storage
        let imageUrls: string[] = [];
        if (images && images.length > 0) {
            console.log(`[saveNewTruckToFirestore] Uploading ${images.length} images...`);
            imageUrls = await uploadImagesToStorage(images, truckId);
            console.log(`[saveNewTruckToFirestore] Uploaded ${imageUrls.length} images successfully.`);

            // Update the truck document with image URLs
            await docRef.update({
                images: imageUrls,
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        console.log("✅ Truck saved successfully:", {
            truckId: truckId,
            userId: verifiedToken.uid,
            imagesCount: imageUrls.length,
        });

        return { 
            success: true, 
            truckId: truckId 
        };
    } catch (error: any) {
        console.error("❌ Error saving truck:", error);
        
        // Provide helpful error message for NOT_FOUND error
        if (error?.code === 5 || error?.code === 'NOT_FOUND') {
            throw new Error(
                'Firestore database not found. Please ensure:\n' +
                '1. Firestore Database is created in Firebase Console\n' +
                '2. Firestore is enabled for your project\n' +
                '3. Service account has proper permissions\n' +
                '4. Project ID is correct: logi-track-wrt-dev'
            );
        }
        
        throw error;
    }
}

export const updateTruckInFirestore = async (
    truckId: string,
    data: z.infer<typeof truckSchema>, 
    images: { file: File; preview: string }[], 
    token: string
) => {
    try {
        console.log("[updateTruckInFirestore] Starting update process...");
        
        // Validate token
        if (!token) {
            throw new Error("Unauthorized: No authentication token found");
        }

        // Verify token
        console.log("[updateTruckInFirestore] Verifying token...");
        const verifiedToken = await auth.verifyIdToken(token);
        console.log("[updateTruckInFirestore] Token verified, user ID:", verifiedToken.uid);
        
        // Check if user is admin from token claims
        if (verifiedToken.admin !== true) {
            throw new Error("Forbidden: Admin access required");
        }

        // Upload new images to Storage if any
        let imageUrls: string[] = [];
        if (images && images.length > 0) {
            console.log(`[updateTruckInFirestore] Uploading ${images.length} images...`);
            imageUrls = await uploadImagesToStorage(images, truckId);
            console.log(`[updateTruckInFirestore] Uploaded ${imageUrls.length} images successfully.`);
        }

        // Prepare truck data for Firestore
        const truckData: Record<string, any> = {
            ...data,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: verifiedToken.uid,
        };

        // Only update images if new ones were uploaded
        if (imageUrls.length > 0) {
            truckData.images = imageUrls;
        }

        console.log("[updateTruckInFirestore] Updating truck in Firestore...");
        const trucksRef = firestoreTrucks.collection("trucks").doc(truckId);
        await trucksRef.update(truckData);
        
        console.log("✅ Truck updated successfully:", {
            truckId: truckId,
            userId: verifiedToken.uid,
            imagesCount: imageUrls.length,
        });

        return { 
            success: true, 
            truckId: truckId 
        };
    } catch (error) {
        console.error("❌ Error updating truck:", error);
        throw error;
    }
}
