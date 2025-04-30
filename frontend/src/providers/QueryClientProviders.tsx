"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useMemo } from "react";

export default function ReactQueryProvider({children}:{children:React.ReactNode}){
    const queryClient = useMemo(()=>new QueryClient({}),[]);
    return <QueryClientProvider client={queryClient}>
        {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>;
}