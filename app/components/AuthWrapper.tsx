'use client'

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

interface AuthWrapperProps{
    children: ReactNode;
}

// Client component to handle auth state
export function AuthWrapper({children}: AuthWrapperProps){
    const {isSignedIn}= useAuth()
    const router = useRouter()

    useEffect(()=>{
        if (!isSignedIn){
            localStorage.clear()
            console.log("Clearing localStorage:", localStorage)
            sessionStorage.clear()
            console.log("Clearing sessionStorage:", sessionStorage)
            router.refresh()
            console.log("Refreshing router:", router)
        }
    }, [isSignedIn, router]);

    return <>{children}</>
}