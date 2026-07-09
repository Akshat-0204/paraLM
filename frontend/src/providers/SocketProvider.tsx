'use client'

import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAIStore } from "@/store/ai.store";
import { useAuthStore } from "@/store/auth.store";
import { AIResult } from "@/types";
import { createContext, useContext, useEffect } from "react";
import { Socket } from "socket.io-client"

interface SocketContextType {
    socket : Socket | null;
}

const SocketContext = createContext<SocketContextType>({socket : null});

export function SocketProvider({children} : {children : React.ReactNode}){
    const {user, isAuthenticated} = useAuthStore();
    const {addStep , setResult, setError} = useAIStore();

    useEffect(()=>{
        if(!isAuthenticated || !user) return;

        //connect socket and join userRoom 
        connectSocket(user._id);
        const socket = getSocket();

        //ai progress
        socket.on('ai:step', (data : {
            step : string;
            status : 'started'  | 'completed' | 'failed'
        }) => {
            addStep(data.step, data.status);
        })

            socket.on('ai:result', (data: AIResult) => {
      setResult(data);
    });

    socket.on('ai:error', (data: { error: string }) => {
      setError(data.error);
    });

return () => {
      socket.off('ai:step');
      socket.off('ai:result');
      socket.off('ai:error');
      disconnectSocket();
    };
  }, [isAuthenticated, user, addStep, setResult, setError]);


  return (
    <SocketContext.Provider value={{ socket: getSocket() }}>
      {children}
    </SocketContext.Provider>
  );

    
}

export function useSocketContext(){
    return useContext(SocketContext)
}