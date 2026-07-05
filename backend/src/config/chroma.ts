import {ChromaClient, Collection} from 'chromadb';
let client : ChromaClient;

export function getChromaClient() : ChromaClient{
    if(!client){
        client = new ChromaClient({
            path : process.env.CHROMA_URL || 'http://localhost:8000',
        })
    }
    return client;
}

export async function getOrCreateCollection(workspaceId : string) : Promise<Collection>{
    const chroma = getChromaClient();
    const collectionName = `${process.env.CHROMA_COLLECTION_PREFIX || 'paraLM' } ${workspaceId}`;

    const collection = await chroma.getOrCreateCollection({
        name : collectionName,
        metadata : {
            workspaceId,
            createdAt : new Date().toISOString()
        }
    })

    return collection ;
}

export async  function deleteCollection(workspaceId : string): Promise<void>{
    const chroma = getChromaClient();
     const collectionName = `${process.env.CHROMA_COLLECTION_PREFIX || 'paraLM' } ${workspaceId}`;

     try{
        await chroma.deleteCollection({name : collectionName});
     }catch{
        console.log("Collection not found ");
     }

}

export async function pingChroma(): Promise<boolean>{
    try {
        const chroma = getChromaClient();
        await chroma.heartbeat();
        return true;
    }
    catch{
        return false;
    }
}