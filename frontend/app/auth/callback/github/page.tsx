"use client"
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const GithubCallbackPage = () => {

    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated") {
            signIn("github-custom", { redirect: false })
        } else if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

  return (
   <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing authentication...</h1>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  )
}

export default GithubCallbackPage;