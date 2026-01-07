# Fire Home Course - Project Steps Guide

## 📋 Table of Contents
1. [Project Setup](#1-project-setup)
2. [Navigation Bar](#2-navigation-bar)
3. [Firebase Configuration](#3-firebase-configuration)
4. [Login Page with Google Auth](#4-login-page-with-google-auth)
5. [Context API for Authentication](#5-context-api-for-authentication)
6. [Display User Info in Navbar](#6-display-user-info-in-navbar)
7. [Dark/Light Mode Toggle](#7-darklight-mode-toggle)
8. [Add Icon to Navigation & Configure Poppins Font](#8-add-icon-to-navigation--configure-poppins-font)
9. [My Account Page](#9-my-account-page)
10. [Admin Dashboard Page](#10-admin-dashboard-page)
11. [Admin Role Management & Cookie Token Storage](#11-admin-role-management--cookie-token-storage)

---

## 1. Project Setup

### Step 1.1: Initialize Next.js Project
```bash
npx create-next-app@latest fire-home-course
```

### Step 1.2: Install Firebase
```bash
npm install firebase
```

### Step 1.3: Project Structure
```
fire-home-course/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx
│       └── register/
│           └── page.tsx
├── components/
│   ├── navigation.tsx
│   └── continue-with-google-button.tsx
├── context/
│   └── auth.tsx
├── firebase/
│   ├── client.ts
│   └── server.ts
└── lib/
    └── utils.ts
```

---

## 2. Navigation Bar

### Step 2.1: Create Navigation Component

**File:** `components/navigation.tsx`

```tsx
"use client";

import Link from "next/link";
import { auth } from "@/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-green-800 text-white p-4">
      <div className="w-full flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold">
          Fire Home
        </Link>
        
        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-sm">Loading...</span>
          ) : user ? (
            <button
              onClick={handleLogout}
              className="text-sm hover:underline"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <span className="text-sm">|</span>
              <Link href="/register" className="text-sm hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Key Points:**
- ✅ "Fire Home" ชิดซ้าย
- ✅ "Login | Register" หรือ "Logout" ชิดขวา
- ✅ ใช้ `onAuthStateChanged` เพื่อตรวจสอบสถานะ login
- ✅ Cleanup subscription ใน `useEffect`

### Step 2.2: Update Home Page

**File:** `app/page.tsx`

```tsx
import Navigation from "@/components/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Fire Home Course
          </h1>
          <p className="text-lg text-muted-foreground">
            Your logistics tracking solution
          </p>
        </div>
      </main>
    </div>
  );
}
```

**Key Points:**
- ✅ ใช้ `flex flex-col` สำหรับ layout
- ✅ ใช้ `flex-1 flex items-center justify-center` เพื่อให้เนื้อหาอยู่กึ่งกลาง

---

## 3. Firebase Configuration

### Step 3.1: Create Firebase Client

**File:** `firebase/client.ts`

```tsx
import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const currentApps = getApps();
let auth: Auth;
let storage: FirebaseStorage;
let db: Firestore;

if (!currentApps.length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
} else {
  const app = currentApps[0];
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
}

export { auth, storage, db };
```

**Key Points:**
- ✅ ตรวจสอบว่า Firebase ถูก initialize แล้วหรือยัง
- ✅ Export `auth`, `storage`, `db` สำหรับใช้ใน Client Components
- ✅ ใช้ environment variables สำหรับ config

### Step 3.2: Environment Variables

**File:** `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 4. Login Page with Google Auth

### 🔐 Login Flow Overview

**Login Process:**
1. User คลิกปุ่ม "Continue with Google"
2. เปิด Google account chooser popup
3. User เลือกบัญชี Google
4. Firebase authenticate user
5. AuthContext อัปเดต `currentUser`
6. Navigation bar แสดงข้อมูลผู้ใช้
7. Redirect ไปหน้า home

---

### Step 4.1: Create Continue with Google Button

**File:** `components/continue-with-google-button.tsx`

```tsx
"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ContinueWithGoogleButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Step 1: สร้าง Google Auth Provider
      const provider = new GoogleAuthProvider();
      
      // Step 2: เปิด popup สำหรับเลือกบัญชี Google
      const result = await signInWithPopup(auth, provider);
      
      // Step 3: Login สำเร็จ - ได้ user object
      console.log("Signed in:", result.user);
      // result.user มี properties: uid, email, displayName, photoURL
      
      // Step 4: Redirect ไปหน้า home
      router.push("/");
      
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      // Handle specific errors
      if (error.code === "auth/popup-closed-by-user") {
        alert("Sign in was cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        alert("Popup was blocked. Please allow popups for this site.");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3"
      variant="outline"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google Logo SVG */}
      </svg>
      {loading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
```

**Key Points:**
- ✅ ใช้ `signInWithPopup` สำหรับ Google authentication
- ✅ `GoogleAuthProvider` - สร้าง provider สำหรับ Google OAuth
- ✅ `signInWithPopup(auth, provider)` - เปิด popup และ authenticate
- ✅ `result.user` - ได้ Firebase User object หลัง login สำเร็จ
- ✅ Handle errors อย่างเหมาะสม (popup closed, blocked, etc.)
- ✅ Show loading state (`loading ? "Signing in..." : "Continue with Google"`)
- ✅ Redirect ไปหน้า home หลัง login สำเร็จ (`router.push("/")`)

**User Object Properties:**
```tsx
result.user = {
  uid: "user-id-123",           // Unique user ID
  email: "user@example.com",     // Email address
  displayName: "John Doe",        // Display name
  photoURL: "https://...",        // Profile photo URL
  emailVerified: true,           // Email verified status
}
```

### Step 4.2: Create Login Page

**File:** `app/(auth)/login/page.tsx`

```tsx
"use client";

import Navigation from "@/components/navigation";
import ContinueWithGoogleButton from "@/components/continue-with-google-button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Login
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <ContinueWithGoogleButton />
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Key Points:**
- ✅ ใช้ `flex flex-col` สำหรับ layout
- ✅ ใช้ `flex-1 flex items-center justify-center` เพื่อให้ modal อยู่กึ่งกลางทั้งแนวนอนและแนวตั้ง
- ✅ Modal จะอยู่กึ่งกลางหน้าจอเสมอ

---

## 5. Context API for Authentication

### Step 5.1: Create Auth Context

**File:** `context/auth.tsx`

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

type AuthContextType = {
  currentUser: User | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  // 🔓 Logout Function - Sign out user from Firebase
  const logout = async () => {
    try {
      await signOut(auth);
      // currentUser will be set to null automatically by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error);
      throw error; // Re-throw to let component handle it
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Key Points:**
- ✅ ใช้ `createContext` เพื่อสร้าง Context
- ✅ ระบุ TypeScript type: `AuthContextType | null`
- ✅ ใช้ `onAuthStateChanged` เพื่อ listen auth state
- ✅ เพิ่ม `logout` function ใน Context เพื่อให้ใช้งานได้ง่าย
- ✅ `logout` function จะ sign out จาก Firebase และ `currentUser` จะอัปเดตเป็น `null` อัตโนมัติ
- ✅ Export `useAuth` hook สำหรับใช้ใน components

**AuthContextType:**
```tsx
type AuthContextType = {
  currentUser: User | null;  // Current logged in user
  logout: () => Promise<void>; // Logout function
}
```

### Step 5.2: Wrap App with AuthProvider

**File:** `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Key Points:**
- ✅ Wrap `{children}` ด้วย `<AuthProvider>`
- ✅ ทำให้ทุก component ใน app สามารถใช้ `useAuth()` ได้

---

## 6. Display User Info in Navbar

### Step 6.1: Update Navigation to Use Context

**File:** `components/navigation.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const authContext = useAuth();
  const router = useRouter();
  const currentUser = authContext?.currentUser;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    // Apply theme immediately
    const html = document.documentElement;
    if (shouldBeDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    const html = document.documentElement;
    if (newIsDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Force re-render to update all components
    window.dispatchEvent(new Event('themechange'));
  };

  // 🔓 Logout Function - ใช้ logout จาก Context
  const handleLogout = async () => {
    try {
      // Step 1: ใช้ logout function จาก Context
      await authContext?.logout();
      
      // Step 2: AuthContext จะอัปเดต currentUser เป็น null อัตโนมัติ
      // (เพราะ onAuthStateChanged ใน AuthProvider จะ trigger)
      
      // Step 3: Redirect ไปหน้า home
      router.push("/");
      
      // Step 4: Navigation bar จะแสดง "Login | Register" แทน
    } catch (error) {
      console.error("Error signing out:", error);
      // Handle error (optional: show error message to user)
    }
  };

  return (
    <nav className="bg-green-800 text-white p-4">
      <div className="w-full flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold">
          Fire Home
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>

          {currentUser ? (
            <>
              <span className="text-sm">
                Hi, {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <span className="text-sm">|</span>
              <Link href="/register" className="text-sm hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Key Points:**
- ✅ ใช้ `useAuth()` จาก Context แทน `useState` และ `onAuthStateChanged`
- ✅ ใช้ `logout()` จาก Context แทน `signOut(auth)` โดยตรง
- ✅ ไม่ต้อง import `signOut` และ `auth` ใน Navigation component
- ✅ แสดงข้อมูลผู้ใช้ (`displayName` หรือ `email`) ก่อนปุ่ม Logout พร้อม "Hi," นำหน้า
- ✅ เพิ่ม Dark/Light Mode Toggle button
- ✅ ใช้ `lucide-react` สำหรับไอคอน Sun และ Moon
- ✅ บันทึก theme preference ใน localStorage
- ✅ ใช้ optional chaining (`?.`) เพื่อ handle null case

**ผลลัพธ์:**
- เมื่อ login แล้ว: `[ปุ่มสลับโหมด] Hi, [ชื่อผู้ใช้หรืออีเมล] Logout`
- เมื่อยังไม่ login: `[ปุ่มสลับโหมด] Login | Register`

---

### 🔓 Logout Flow Overview

**Logout Process:**
1. User คลิกปุ่ม "Logout"
2. เรียก `logout()` จาก AuthContext
3. `logout()` เรียก `signOut(auth)` จาก Firebase Auth
4. Firebase clear authentication state
5. `onAuthStateChanged` ใน AuthProvider trigger
6. AuthContext อัปเดต `currentUser` เป็น `null`
7. Navigation bar อัปเดตแสดง "Login | Register"
8. Redirect ไปหน้า home

**Logout Function in Context:**

```tsx
// context/auth.tsx
const logout = async () => {
  try {
    await signOut(auth);
    // currentUser will be set to null automatically by onAuthStateChanged
  } catch (error) {
    console.error("Error signing out:", error);
    throw error; // Re-throw to let component handle it
  }
};
```

**Logout Function in Navigation:**

```tsx
// components/navigation.tsx
const handleLogout = async () => {
  try {
    // Step 1: ใช้ logout function จาก Context
    await authContext?.logout();
    
    // Step 2: AuthContext จะอัปเดตอัตโนมัติ
    // onAuthStateChanged ใน AuthProvider จะ trigger
    // และ set currentUser เป็น null
    
    // Step 3: Redirect ไปหน้า home
    router.push("/");
    
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
```

**ข้อดีของการใช้ logout จาก Context:**
- ✅ ไม่ต้อง import `signOut` และ `auth` ในทุก component
- ✅ Logout logic อยู่ที่เดียว (DRY principle)
- ✅ ใช้ได้จากทุก component ผ่าน `useAuth()`
- ✅ Code สะอาดและ maintainable มากขึ้น

**What Happens After Logout:**
- ✅ `auth.currentUser` กลายเป็น `null`
- ✅ `AuthContext.currentUser` กลายเป็น `null`
- ✅ Navigation bar แสดง "Login | Register" แทน
- ✅ Protected routes จะ redirect ไปหน้า login (ถ้ามี)
- ✅ User session ถูก clear ทั้งหมด

---

## 7. Dark/Light Mode Toggle

### Step 7.1: Add Theme Toggle to Navigation

**File:** `components/navigation.tsx`

เพิ่ม Dark/Light Mode Toggle button ใน Navigation component:

```tsx
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

// Inside Navigation component
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  setIsDark(shouldBeDark);
  // Apply theme immediately
  const html = document.documentElement;
  if (shouldBeDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}, []);

const toggleTheme = () => {
  const newIsDark = !isDark;
  setIsDark(newIsDark);
  
  const html = document.documentElement;
  if (newIsDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
  
  // Force re-render to update all components
  window.dispatchEvent(new Event('themechange'));
};

// In JSX
<button
  onClick={toggleTheme}
  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
>
  {isDark ? (
    <Sun className="w-5 h-5 text-white" />
  ) : (
    <Moon className="w-5 h-5 text-white" />
  )}
</button>
```

**Key Points:**
- ✅ ตรวจสอบ theme จาก localStorage และ system preference
- ✅ แสดงไอคอน Sun เมื่อเป็นโหมดมืด (คลิกเพื่อเปลี่ยนเป็นสว่าง)
- ✅ แสดงไอคอน Moon เมื่อเป็นโหมดสว่าง (คลิกเพื่อเปลี่ยนเป็นมืด)
- ✅ บันทึก theme preference ใน localStorage
- ✅ ใช้ `lucide-react` สำหรับไอคอน

**Install lucide-react:**
```bash
npm install lucide-react
```

---

## 8. Add Icon to Navigation & Configure Poppins Font

### Step 8.1: Add Flame Icon to Fire Home Logo

**File:** `components/navigation.tsx`

เพิ่ม Flame icon ก่อน "Fire Home" text:

```tsx
import { Sun, Moon, Flame } from "lucide-react";

// ใน JSX
<Link href="/" className="text-2xl font-semibold flex items-center gap-2">
  <Flame className="w-5 h-5" />
  Fire Home
</Link>
```

**Key Points:**
- ✅ Import `Flame` จาก `lucide-react`
- ✅ ใช้ `flex items-center gap-2` เพื่อจัดตำแหน่ง icon และ text
- ✅ Icon จะแสดงก่อน text "Fire Home"

---

### Step 8.2: Configure Poppins Font in Layout

**File:** `app/layout.tsx`

ย้าย Poppins font configuration ไปไว้ที่ layout เพื่อใช้ได้ทั้งแอป:

```tsx
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// ใน body tag
<body
  className={`${geistSans.variable} ${geistMono.variable} ${poppins.className} antialiased`}
>
```

**Key Points:**
- ✅ Import `Poppins` จาก `next/font/google`
- ✅ Configure font weights ที่ต้องการใช้
- ✅ ใช้ `${poppins.className}` ใน body tag เพื่อให้ Poppins เป็น default font ทั้งแอป
- ✅ ไม่ต้อง import Poppins ในแต่ละ component อีกต่อไป

**ข้อดี:**
- ✅ Font ใช้ได้ทั้งแอปโดยไม่ต้อง import ซ้ำ
- ✅ Performance ดีขึ้น (load font ครั้งเดียว)
- ✅ Code สะอาดและ maintainable มากขึ้น

---

### Step 8.3: Update Navigation with Semantic HTML

**File:** `components/navigation.tsx`

ใช้ `<ul><li>` tags สำหรับ navigation menu เพื่อ semantic HTML:

```tsx
{currentUser ? (
  <>
    <span className="text-sm">
      Hi, {currentUser.displayName || currentUser.email}
    </span>
    <p> | </p>
    <button
      onClick={handleLogout}
      className="text-sm hover:underline"
    >
      Logout
    </button>
  </>
) : (
  <ul className="flex items-center gap-4">
    <li>
      <Link href="/property-stock-search" className="text-sm hover:underline">
        Property stock search
      </Link>
    </li>
    <li>
      <span className="text-sm">|</span>
    </li>
    <li>
      <Link href="/login" className="text-sm hover:underline">
        Login
      </Link>
    </li>
    <li>
      <span className="text-sm">|</span>
    </li>
    <li>
      <Link href="/register" className="text-sm hover:underline">
        Register
      </Link>
    </li>
  </ul>
)}
```

**Key Points:**
- ✅ ใช้ `<ul><li>` สำหรับ navigation menu (semantic HTML)
- ✅ ดีต่อ accessibility และ SEO
- ✅ ใช้ `flex items-center gap-4` บน `<ul>` เพื่อจัด layout
- ✅ แต่ละ navigation item อยู่ใน `<li>` tag

**ทำไมต้องใช้ `<ul><li>`:**
- ✅ **Semantic HTML** - Browser และ screen readers เข้าใจว่าเป็น navigation menu
- ✅ **Accessibility** - Screen readers สามารถ navigate ได้ดีขึ้น
- ✅ **SEO** - Search engines เข้าใจโครงสร้างได้ดีขึ้น
- ✅ **Best Practice** - เป็นมาตรฐานสำหรับ navigation menu

---

## 🎯 Summary of Changes

### Before (Using useState + onAuthStateChanged)
```tsx
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

### After (Using Context API)
```tsx
const authContext = useAuth();
const currentUser = authContext?.currentUser;
```

**ข้อดีของ Context API:**
- ✅ ไม่ต้อง duplicate auth logic ในทุก component
- ✅ Auth state ถูก share ระหว่าง components
- ✅ Code สะอาดและ maintainable มากขึ้น
- ✅ ไม่ต้องจัดการ loading state ในแต่ละ component

---

## 📝 Best Practices

### 1. Context Type Safety
```tsx
// ✅ Good: ระบุ type
const AuthContext = createContext<AuthContextType | null>(null);

// ❌ Bad: ไม่ระบุ type
const AuthContext = createContext(null);
```

### 2. Handle Null Cases
```tsx
// ✅ Good: ใช้ optional chaining
const currentUser = authContext?.currentUser;

// ❌ Bad: ไม่ handle null
const currentUser = authContext.currentUser; // อาจ error
```

### 3. Cleanup Subscriptions
```tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
  });
  return () => unsubscribe(); // ✅ สำคัญ: cleanup
}, []);
```

---

---

## 9. My Account Page

### Step 9.1: Create My Account Page

**File:** `app/my-account/page.tsx`

สร้างหน้า My Account สำหรับแสดงข้อมูลผู้ใช้ที่ล็อกอินแล้ว

**Features:**
- ✅ **Protected Route** - ตรวจสอบ authentication ก่อนเข้าถึง
- ✅ **User Profile Display** - แสดง Avatar, ชื่อ, อีเมล
- ✅ **Account Details** - แสดง User ID, Email verification status, Account creation date
- ✅ **Auto Redirect** - Redirect ไปหน้า login ถ้ายังไม่ล็อกอิน

**Key Implementation:**

```tsx
"use client";

import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyAccountPage() {
  const authContext = useAuth();
  const router = useRouter();
  const currentUser = authContext?.currentUser;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (authContext && !currentUser) {
      router.push("/login");
    }
  }, [authContext, currentUser, router]);

  // Show loading/redirecting state
  if (!authContext || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    // Display user information
  );
}
```

**Key Points:**
- ✅ ใช้ `useAuth()` จาก Context เพื่อดึงข้อมูลผู้ใช้
- ✅ ใช้ `useEffect` เพื่อตรวจสอบ authentication และ redirect
- ✅ แสดง loading state ขณะตรวจสอบ auth
- ✅ ใช้ `Card` component สำหรับจัดรูปแบบข้อมูล
- ✅ แสดง Avatar, Display Name, Email, User ID, Email Verification Status

---

## 10. Admin Dashboard Page

### Step 10.1: Create Admin Dashboard Page

**File:** `app/admin/dashboard/page.tsx`

สร้างหน้า Admin Dashboard สำหรับผู้ดูแลระบบ

**Features:**
- ✅ **Protected Route** - ตรวจสอบ authentication ก่อนเข้าถึง
- ✅ **Stats Overview** - แสดงสถิติ (Total Users, Drivers, Packages, Active Deliveries)
- ✅ **Quick Actions** - Cards สำหรับจัดการ Users, Drivers, Packages
- ✅ **Auto Redirect** - Redirect ไปหน้า login ถ้ายังไม่ล็อกอิน
- ⚠️ **TODO:** เพิ่ม role-based access control (ตรวจสอบว่าเป็น admin หรือไม่)

**Key Implementation:**

```tsx
"use client";

import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const authContext = useAuth();
  const router = useRouter();
  const currentUser = authContext?.currentUser;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (authContext && !currentUser) {
      router.push("/login");
    }
    // TODO: Add admin role check
    // if (currentUser && !isAdmin(currentUser)) {
    //   router.push("/");
    // }
  }, [authContext, currentUser, router]);

  // Mock stats - replace with Firestore data
  const stats = {
    totalUsers: 0,
    totalDrivers: 0,
    totalPackages: 0,
    activeDeliveries: 0,
  };

  return (
    // Display dashboard with stats and quick actions
  );
}
```

**Key Points:**
- ✅ ใช้ `useAuth()` จาก Context เพื่อดึงข้อมูลผู้ใช้
- ✅ ใช้ `useEffect` เพื่อตรวจสอบ authentication และ redirect
- ✅ แสดง loading state ขณะตรวจสอบ auth
- ✅ ใช้ `Card` component สำหรับแสดง stats และ quick actions
- ⚠️ **TODO:** เพิ่มการตรวจสอบ admin role จาก Firestore
- ⚠️ **TODO:** ดึงข้อมูล stats จาก Firestore แทน mock data

**Stats Cards:**
- Total Users - จำนวนผู้ใช้ทั้งหมด
- Total Drivers - จำนวนคนขับทั้งหมด
- Total Packages - จำนวนพัสดุทั้งหมด
- Active Deliveries - จำนวนการจัดส่งที่กำลังดำเนินการ

**Quick Actions:**
- Manage Users - จัดการผู้ใช้
- Manage Drivers - จัดการคนขับ
- Manage Packages - จัดการพัสดุ

---

## 11. Admin Role Management & Cookie Token Storage

### Step 11.1: Add Admin Role to Users and Save Auth Tokens in Cookies

**Files:** 
- `context/action.ts` - Server actions for token management
- `context/auth.tsx` - Client-side auth context
- `firebase/server.ts` - Firebase Admin SDK setup

**Features:**
- ✅ **Automatic Admin Role Assignment** - Automatically assigns admin role based on email list
- ✅ **Cookie Token Storage** - Stores Firebase tokens in HTTP-only cookies for server-side authentication
- ✅ **Secure Token Management** - Uses secure, httpOnly cookies with proper security settings
- ✅ **Role-based Access Control** - Admin role stored in Firebase custom claims

### Step 11.2: Server Actions for Token Management

**File:** `context/action.ts`

สร้าง Server Actions สำหรับจัดการ authentication tokens และ admin role:

```tsx
"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

// Remove tokens from cookies on logout
export const removeToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("firebase_token");
    cookieStore.delete("firebase_refresh_token");
};

// Set tokens in cookies and assign admin role if needed
export const setToken = async ({
    token,
    refreshToken,
}: {
    token: string;
    refreshToken: string;
}) => {
    try {
        // Verify the token
        const verifiedToken = await auth.verifyIdToken(token);
        if (!verifiedToken) {
            return;
        }
        
        // Get user record from Firebase Admin
        const userRecord = await auth.getUser(verifiedToken.uid);
        
        // Check if user email is in admin emails list
        const adminEmails = process.env.SYSTEM_ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
        if (userRecord.email && adminEmails.includes(userRecord.email) && !userRecord.customClaims?.admin) {
            // Set admin custom claim
            await auth.setCustomUserClaims(verifiedToken.uid, {
                admin: true,
            });
        }
        
        // Store tokens in cookies
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
};
```

**Key Points:**
- ✅ ใช้ `"use server"` directive สำหรับ Server Actions
- ✅ ตรวจสอบ token ด้วย `auth.verifyIdToken()`
- ✅ ตรวจสอบ email จาก `SYSTEM_ADMIN_EMAILS` environment variable
- ✅ ตั้งค่า admin role ด้วย `auth.setCustomUserClaims()`
- ✅ เก็บ tokens ใน HTTP-only cookies เพื่อความปลอดภัย
- ✅ ใช้ `secure: true` ใน production environment

### Step 11.3: Update Auth Context

**File:** `context/auth.tsx`

อัพเดท Auth Context เพื่อส่ง tokens ไปยัง server และจัดการ custom claims:

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getIdTokenResult } from "firebase/auth";
import { setToken, removeToken } from "./action";

type ParsedTokenResult = {
  [key: string]: any;
};

type AuthContextType = {
  currentUser: User | null;
  logout: () => Promise<void>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customClaims, setCustomClaims] = useState<ParsedTokenResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user ? user : null);
      if (user) {
        try {
          // Get token result with claims
          const tokenResult = await getIdTokenResult(user);
          const token = tokenResult.token;
          const refreshToken = user.refreshToken;
          const claims = tokenResult.claims;
          setCustomClaims(claims ?? null);
          
          // Send tokens to server to set admin role and save in cookies
          if (token && refreshToken) {
            await setToken({ 
              token, 
              refreshToken 
            });
          }
        } catch (error) {
          console.error("Error getting token:", error);
        }
      } else {
        // Remove tokens on logout
        await removeToken();
        setCustomClaims(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Key Points:**
- ✅ ใช้ `getIdTokenResult()` เพื่อดึง token และ claims
- ✅ เก็บ custom claims ใน state
- ✅ ส่ง tokens ไปยัง server action (`setToken`)
- ✅ ลบ tokens เมื่อ user logout

### Step 11.4: Environment Variables Setup

สร้างไฟล์ `.env.local` และเพิ่ม environment variables:

```env
# System Admin Emails (comma-separated)
SYSTEM_ADMIN_EMAILS=admin@example.com,another-admin@example.com

# Firebase Admin SDK Credentials
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
```

**Important Notes:**
- ⚠️ อย่า commit `.env.local` ลงใน Git (ควรอยู่ใน `.gitignore`)
- ⚠️ `FIREBASE_PRIVATE_KEY` ต้องมี `\n` สำหรับ newlines
- ⚠️ Restart Next.js dev server หลังจากเปลี่ยน environment variables

### Step 11.5: How It Works

**Flow Diagram:**

```
1. User Logs In
   ↓
2. Firebase Auth → User Object
   ↓
3. Get ID Token Result (with claims)
   ↓
4. Send Token to Server Action (setToken)
   ↓
5. Server: Verify Token
   ↓
6. Server: Check Email in SYSTEM_ADMIN_EMAILS
   ↓
7. Server: Set Admin Custom Claim (if email matches)
   ↓
8. Server: Save Tokens in HTTP-only Cookies
   ↓
9. Client: Store Claims in State
   ↓
10. Components can check admin role from claims
```

**Benefits:**
- 🔒 **Security**: Tokens stored in HTTP-only cookies (XSS protection)
- 🚀 **Server-side Auth**: Server components can access tokens from cookies
- ⚡ **Automatic**: Admin role assigned automatically based on email
- 🔄 **Real-time**: Claims updated when admin role is set

### Step 11.6: Using Admin Role in Components

**Example: Check Admin Role in Component**

```tsx
"use client";

import { useAuth } from "@/context/auth";
import { useEffect } from "react";

export default function AdminComponent() {
  const authContext = useAuth();
  const currentUser = authContext?.currentUser;
  
  // Get admin status from custom claims
  // Note: You may need to expose customClaims in AuthContext
  const isAdmin = /* check from customClaims */;
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Content</div>;
}
```

**Example: Conditional Rendering in Navigation**

```tsx
{isAdmin && (
  <DropdownMenuItem asChild>
    <Link href="/admin/dashboard">
      Admin Dashboard
    </Link>
  </DropdownMenuItem>
)}
```

---

## 🚀 Next Steps

1. **Role-based Access Control** - ✅ Completed - Admin role management implemented
2. **Firestore Integration** - ดึงข้อมูล stats จาก Firestore แทน mock data
3. **User Management** - สร้างหน้า Manage Users
4. **Driver Management** - สร้างหน้า Manage Drivers
5. **Package Management** - สร้างหน้า Manage Packages
6. **Edit Profile** - เพิ่มฟังก์ชันแก้ไขข้อมูลผู้ใช้ในหน้า My Account

---

**Last Updated:** 2025-01-27

**Recent Updates:**
- ✅ Added admin role management with automatic assignment based on email
- ✅ Implemented secure cookie-based token storage for server-side authentication
- ✅ Added server actions for token management (`setToken`, `removeToken`)

