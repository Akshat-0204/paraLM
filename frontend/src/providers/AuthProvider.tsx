' use client';

import { useAuthStore } from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const PUBLIC_ROUTES = ['/', '/login', '/register'];

export function AuthProvider({children} : {children : React.ReactNode}){

    const {isAuthenticated} = useAuthStore();
    const router = useRouter();
    const pathName = usePathname();

    useEffect(()=>{
        const isPublicRoute = PUBLIC_ROUTES.includes(pathName);

        if(!isAuthenticated && !isPublicRoute){
            router.push('/login');
        }

        if (isAuthenticated && (pathName === '/login' || pathName === '/register')) {
      router.push('/dashboard');
    }

    },[isAuthenticated, pathName, router])

    return (
<>
{children}
</>
    )
}