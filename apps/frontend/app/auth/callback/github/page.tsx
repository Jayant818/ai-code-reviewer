"use client"
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const GithubCallbackPage = () => {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (status === "loading") return;

            if (status === "unauthenticated" && !isSigningIn) {
                setIsSigningIn(true);
                console.log("Attempting to sign in with github-custom");
                
                try {
                    const result = await signIn("github-custom", { 
                        redirect: false,
                        callbackUrl: "/dashboard"
                    });
                    
                    console.log("SignIn result:", result);
                    
                    if (result?.ok) {
                        // Force session update
                        await update();
                        router.push("/dashboard");
                    } else {
                        console.error("Sign in failed:", result?.error);
                        // Redirect to home page or show error
                        router.push("/?error=auth_failed");
                    }
                } catch (error) {
                    console.error("Error during sign in:", error);
                    router.push("/?error=auth_error");
                } finally {
                    setIsSigningIn(false);
                }
            } else if (status === "authenticated") {
                console.log("Already authenticated, redirecting to dashboard");
                router.push("/dashboard");
            }
        };

        handleCallback();
    }, [status, router, isSigningIn]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Completing authentication...</h1>
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                {status === "loading" && <p className="mt-2 text-sm text-gray-600">Loading session...</p>}
                {isSigningIn && <p className="mt-2 text-sm text-gray-600">Signing you in...</p>}
            </div>
        </div>
    )
}

export default GithubCallbackPage;