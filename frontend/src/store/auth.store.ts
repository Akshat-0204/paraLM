import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import { User } from '@/types';

interface AuthStore{
    user : User | null;
    token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user : null,
            token : null,
            isAuthenticated : false,

            setAuth:(user, token) =>{
                localStorage.setItem('paraLM_token', token);
                set({user , token, isAuthenticated: true});
            },

            clearAuth : () => {
                localStorage.removeItem('paraLM_token');
        set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (user) => {
                set({user});
            },
        }),{
            name : 'paraLM_auth',
            partialize: (state) => ({
                user : state.user,
                token : state.token,
                isAuthenticated : state.isAuthenticated
            })
        }
    )
)