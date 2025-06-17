"use client";
import { Navbar } from "@/components/shared"
import { useAuth } from "@/lib/hooks"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function NavbarLayout  ({
    children
}: {
    children: React.ReactNode
  }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        console.log("Not authenticated");
        router.push("/");
      }
  }, [isAuthenticated, isLoading, router])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fire-gradient w-8 h-8 rounded-full animate-spin"></div>
      </div>
    );
  }

   if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Checking authentication...</h2>
          <div className="fire-gradient w-8 h-8 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <main>
        <Navbar />
        {children}  
    </main>
  )
}
