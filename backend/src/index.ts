import 'dotenv/config';
import http from 'http';
import app from './app';
import { connectToDatabase } from './config/database';
import { initializeCloudinary } from './config/cloudinary';
import { initializeSocket } from './config/socket';
import { pingChroma } from './config/chroma';

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void>{
    try {
        await connectToDatabase();
        console.log("MongoDB connected");

        initializeCloudinary();
        console.log("Cloudinary initiallized");

        //check chroma
        const chromaOk = await pingChroma();
        if(!chromaOk){
            console.log("Chroma db is not reachable ")
        }else{
            console.log("chroma connectedd");
        }

        //server 
        const server = http.createServer(app);

        //socket connection
        initializeSocket(server);
        console.log("Socket.io initialized");

        server.listen(PORT, ()=>{
            console.log("paraLM running on port", PORT);
        
        });

     process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down...');
      server.close(() => process.exit(0));
      });


    } catch (error) {
        console.log("Failed to start the server : ", error )
    }
}

startServer();