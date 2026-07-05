import { deleteCollection } from "../../config/chroma";
import { AppError } from "../../middlewares/errorMiddleware";
import { IWorkspace } from "../../types";
import Workspace from "./workspaceModel";
import * as workspaceService from "./workspaceService";
import { Request, Response , NextFunction } from "express";

interface WorkspaceParams {
  workspaceId: string;
}

//create workspace 
export async function createWorkspace(
    req: Request,
  res: Response,
  next: NextFunction
) : Promise<void> {
    try {
        const userId= req.user!.userId ;
        const {name, description, color, icon} = req.body;

        const workspace = await workspaceService.createWorkspace(userId, {
            name, description, color, icon
        });

        res.status(201).json({
            success : true,
            message : "Workspace created successfully",
            data : {workspace}
        });

    }catch(error){
        next(error)
    }
}

//get all workspaces 
export async function getWorkspaces(
    req: Request,
  res: Response,
  next: NextFunction
): Promise<void>{
    try{
        const userId = req.user!.userId ;
const workspaces = await workspaceService.getUserWorkspaces(userId);

        res.status(200).json({
            success : true,
            message : 'Workspace fetched successfully',
            data : {
                workspaces
            }
        })
    }catch(error){
        next(error);
    }
}
interface WorkspaceParams {
  workspaceId: string;
}

//get one workspace
export async function getWorkspace(
  req: Request<WorkspaceParams>,
  res: Response,
  next: NextFunction
): Promise<void>{

    try {
        const userId= req.user!.userId ;
        const {workspaceId } = req.params;

        const workspace = await workspaceService.getWorkspaceById(
            workspaceId , userId
        );

        res.status(200).json({
            success : true,
            message : 'Workspace fetched successfully',
            data : {workspace},
        });



    } catch (error) {
        next(error)
    }

}

export async function updateWorkspace(
  req: Request<WorkspaceParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;
    const { name, description, color, icon } = req.body;

    const workspace = await workspaceService.updateWorkspace(
      workspaceId,
      userId,
      { name, description, color, icon }
    );

    res.status(200).json({
      success: true,
      message: 'Workspace updated successfully',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
}

//archive workspace 
export async function archiveWorkspace(
  req: Request<WorkspaceParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const workspace = await workspaceService.archiveWorkspace(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Workspace archived successfully',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
}



//delete workspace 
export async function deleteWorkspace(
  req: Request<WorkspaceParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    await workspaceService.deleteWorkspace(workspaceId, userId);

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
//Incremenet

export async function incrementDocumentCount(
  workspaceId: string
): Promise<void> {
  await Workspace.findByIdAndUpdate(workspaceId, {
    $inc: { documentCount: 1 },
  });
}

//decrement
export async function decrementDocumentCount(
  workspaceId: string
): Promise<void> {
  await Workspace.findByIdAndUpdate(workspaceId, {
    $inc: { documentCount: -1 },
  });
}

//get archived workspaces 
export async function getArchivedWorkspaces(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const workspaces = await workspaceService.getArchivedWorkspaces(userId);

    res.status(200).json({
      success: true,
      message: 'Archived workspaces fetched successfully',
      data: { workspaces },
    });
  } catch (error) {
    next(error);
  }
}


//restore archived workspace 
export async function restoreWorkspace(
  req: Request<WorkspaceParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const workspace = await workspaceService.restoreWorkspace(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Workspace restored successfully',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
}
