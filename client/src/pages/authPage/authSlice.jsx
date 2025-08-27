import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import ApiClient, { apiClient } from "../../api/apiClient";

// Login Thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.post("users/auth/login", credentials);
      // Save token to localStorage so user stays logged in
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Register Thunk
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formDat, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.post("users/auth/register", formDat, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await ApiClient.post("/users/auth/logout"); // token sent via headers
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/users");
      return data.users;
    } catch (error) {
      console.error("API error:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem("user")) || null;
      } catch {
        return null;
      }
    })(),

    loading: false,
    error: null,
  },
  // initialState,
  reducers: {
    // loginUserSuccess: (state, action) => {
    //   const user = action.payload.user;
    //   // normalize admin flag
    //   user.isAdmin =
    //     user.isAdmin === true ||
    //     user.isAdmin === "true" ||
    //     user.role === "admin";
    //   state.user = user;
    //   state.token = action.payload.token;
    //   localStorage.setItem("user", JSON.stringify(state.user));
    //   localStorage.setItem("token", state.token);
    // },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.user = "succeeded";
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
