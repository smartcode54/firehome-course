"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

export const removeToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("firebase_token");
    cookieStore.delete("firebase_refresh_token");
};
export const setToken = async ({
     token,
     refreshToken,
}: {
     token: string;
     refreshToken: string;
}) => {
    try {
        const verifiedToken = await auth.verifyIdToken(token);
        if (!verifiedToken) {
            return;
        }
        const userRecord = await auth.getUser(verifiedToken.uid);
        
        // Check if user email is in admin emails list
        const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
        if (userRecord.email && adminEmails.includes(userRecord.email) && !userRecord.customClaims?.admin) {
            await auth.setCustomUserClaims(verifiedToken.uid, {
                admin: true,
            });
        }
        const cookieStore = await cookies();
        cookieStore.set("firebase_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        cookieStore.set("firebase_refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}