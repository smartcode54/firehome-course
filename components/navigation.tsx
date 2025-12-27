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
      // ใช้ logout function จาก Context
      await authContext?.logout();
      
      // Redirect ไปหน้า home
      router.push("/");
      
      // Navigation bar จะแสดง "Login | Register" แทน
      // (currentUser จะเป็น null อัตโนมัติจาก onAuthStateChanged)
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
              <p> | </p>
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
