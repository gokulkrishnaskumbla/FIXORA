import { createSlice } from '@reduxjs/toolkit'

const getInitialRole = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role") || null;
};

const getInitialUser = () => {
  if (typeof window === "undefined") return {};
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Failed to parse user from storage", error);
    return {};
  }
};

const getInitialProvider = () => {
  if (typeof window === "undefined") return null;
  try {
    const storedProvider = localStorage.getItem("provider");
    return storedProvider ? JSON.parse(storedProvider) : null;
  } catch (error) {
    console.error("Failed to parse provider from storage", error);
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  role: getInitialRole(), // 'user', 'admin', or 'provider'
  providerProfile: getInitialProvider(),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    saveUser: (state,action) => {
      const { user, role, provider } = action.payload;
      state.user = user || {};
      state.role = role || localStorage.getItem("role") || null;
      state.providerProfile = provider || null;
    },
   clearUser: (state) => {
      state.user={}
      state.role = null
      state.providerProfile = null
    }
  },
})

export const {saveUser,clearUser } = userSlice.actions

export default userSlice.reducer