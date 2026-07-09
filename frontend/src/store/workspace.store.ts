import {create } from 'zustand';
import { Workspace } from '@/types';

interface WorkspaceStore{
    activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setActiveWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
  clearWorkspaces: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()((set)=>({
    activeWorkspace : null,
    workspaces : [],

    setActiveWorkspace : (workspace) => {
        set({activeWorkspace : workspace});
    },

      setWorkspaces: (workspaces) => {
    set({ workspaces });
  },

  addWorkspace: (workspace) => {
    set((state) => ({
      workspaces: [workspace, ...state.workspaces],
    }));
  },

updateWorkspace: (workspace) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w._id === workspace._id ? workspace : w
      ),
      activeWorkspace:
        state.activeWorkspace?._id === workspace._id
          ? workspace
          : state.activeWorkspace,
    }));
  },
  removeWorkspace: (workspaceId) => {
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w._id !== workspaceId),
      activeWorkspace:
        state.activeWorkspace?._id === workspaceId
          ? null
          : state.activeWorkspace,
    }));
  },
clearWorkspaces: () => {
    set({ activeWorkspace: null, workspaces: [] });
  },


}))