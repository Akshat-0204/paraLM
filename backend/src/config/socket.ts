import { timeStamp } from 'console';
import {Server as HTTPServer} from 'http';
import {Server as SocketServer, Socket} from 'socket.io'

let io : SocketServer;

export function initializeSocket(server : HTTPServer): SocketServer {
    io = new SocketServer(server, {
        cors : {
            origin : process.env.FRONTEND_URL || 'http://localhost:5173',
            methods : ['GET', 'POST'],
            credentials : true
        },
        transports : ['websocket', 'polling']
    });

    io.on('connection',  (socket : Socket) => {
        console.log('Socket connected : ', socket.id);

        //join a room scoped to the user 
        socket.on('join:user', (userId : string)=> {
            socket.join(`user:, ${userId}`);
            
        })

         //join a workspace scoped to the user 
        socket.on('join:workspace', (workspaceId : string)=> {
            socket.join(`workspace:, ${workspaceId}`);
            
        })

        socket.on("disconnect", ()=> {
            console.log(`Socket disconnected : ${socket.id} ` );
        })

    })

    return io;
}

//Helper functions 
export function emitAIProgress(
    userId : string, 
    event : string,
    data : Record<string, unknown>

): void {
    if(!io) return ;
    io.to(`user : ${userId}`).emit(event, data);
}

export function emitAIStep(userId : string, step : string, status: 'started' | 'completed' | 'failed') : void {
  emitAIProgress(userId, 'ai:step', {step, status, timeStamp : Date.now()});
}

export function emitAIResult(
    userId : string , 
    result : Record<string, unknown> 
): void {
    emitAIProgress(userId , 'ai:result ', result);
}

export function emitAiError(userId: string, error: string): void{
    emitAIProgress(userId, 'ai:error', {error, timeStamp : Date.now()});


}

export function getIO(): SocketServer {
    if(!io){
        throw new Error('Socket io is not initialized')
    }

    return io 
    
}