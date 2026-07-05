import { deleteCollection } from "../../config/chroma";
import { AppError } from "../../middlewares/errorMiddleware";
import { IWorkspace } from "../../types";
import Workspace from "./workspaceModel";

export async function createWorkspace(
    userId: string,
  input: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;}
): Promise<IWorkspace>{
    
    const workspace = await Workspace.create({
        ...input, 
        owner : userId
    });

    return workspace;
}

//get all workspaces for user
export async function getUserWorkspaces(userId : string): Promise<IWorkspace[]>{
    const workspaces = await Workspace.find({
        owner : userId,
        isArchived : false,
    }
    ).sort({createdAt : -1});

    return workspaces;
}

export async function getWorkspaceById(workspaceId : string, userId: string ) : Promise<IWorkspace>{
const workspace = await Workspace.findOne({
    _id : workspaceId,
    owner : userId 
})

if(!workspace){
    throw new AppError("Workspace not found", 404);


}

return workspace;
}

//update 
export async function updateWorkspace(
    workspaceId : string,
    userId : string,
    updates : {
        name? : string;
        description? : string;
        color? : string ;
        icon? : string ;
    } 
) : Promise<IWorkspace> {
    const workspace = await Workspace.findOneAndUpdate(
        {_id : workspaceId, owner: userId},
        {$set : updates},
        {new : true, runValidators : true}
    );

    if(!workspace){
    throw new AppError("Workspace not found", 404);

    }

    return workspace;
}

//archive 
export async function archiveWorkspace(
    workspaceId : string , 
    userId : string
): Promise<IWorkspace>{
    const workspace = await Workspace.findOneAndUpdate(
        { _id: workspaceId, owner: userId },
    { $set: { isArchived: true } },
    { new: true }
    )

    if(!workspace){
        throw new AppError('Workspace not found', 404);
    }

    return workspace;
}

//delete workspace 
export async function deleteWorkspace(
    workspaceId : string,
    userId : string 
) : Promise<void> {
    const workspace = await Workspace.findOne({
        _id : workspaceId,
        owner : userId
    });

    if(!workspace){
        throw new AppError('Workspace not found', 404);
    }

    await deleteCollection(workspaceId);

    await workspace.deleteOne();
}

//increase doc count 
export async function incrementDocCount(
    workspaceId : string 
): Promise<void> {
    await Workspace.findByIdAndUpdate(workspaceId, {
        $inc: { documentCount: 1 },
    })
}


//decrease doc count 
export async function decrementDocCount(
    workspaceId : string 
): Promise<void> {
    await Workspace.findByIdAndUpdate(workspaceId, {
        $inc: { documentCount: -1 },
    })
}

//get archived workspaces 
export async function getArchivedWorkspaces(
    userId : string
): Promise<IWorkspace[]>{
   const workspaces = await Workspace.find({
    isArchived : true,
    owner : userId
   }).sort({updatedAt : -1});

   return workspaces;
}

//restore archived 
export async function restoreWorkspace(
  workspaceId: string,
  userId: string
): Promise<IWorkspace> {
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, owner: userId, isArchived: true },
    { $set: { isArchived: false } },
    { new: true }
  );

  if (!workspace) {
    throw new AppError('Archived workspace not found', 404);
  }

  return workspace;
}
