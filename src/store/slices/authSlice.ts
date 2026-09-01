import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  isOnline: boolean;
  sharingLocation: boolean;
  createdAt?: string | Date;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
