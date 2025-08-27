import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import ApiClient, { apiClient } from "../api/apiClient";

export const fetchCarts = createAsyncThunk(
  "carts/fetchCarts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.get("/carts");
      // console.log("API data:", data); // <--- check here
      return data.carts;
    } catch (error) {
      console.error("API error:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ bookId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.post("/carts", { bookId, quantity });
      return data;
      // return data.cartItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (cartItemId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.delete(`/carts/item/${cartItemId}`);
      return { cartItemId, message: data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/carts/item/${cartItemId}`, {
        quantity,
      });
      return { ...res.data, cartItemId: res.data.id };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update quantity"
      );
    }
  }
);
const cartsSlice = createSlice({
  name: "cart",
  initialState: {
    carts: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    updateCartQuantityLocal: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.carts.find((c) =>
        c.items.find((i) => i.cartItemId === cartItemId)
      );

      if (item) {
        const cartItem = item.items.find((i) => i.cartItemId === cartItemId);
        if (cartItem) cartItem.quantity = quantity;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCarts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.carts = action.payload;
      })
      .addCase(fetchCarts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "Succeded";
        const newItem = action.payload;
        const existingItemIndex = state.carts.findIndex(
          (i) => i.bookId === newItem.bookId
        );
        if (existingItemIndex !== -1) {
          state.carts[existingItemIndex] = {
            ...state.carts[existingItemIndex],
            quantity: newItem.quantity,
          };
        } else {
          state.carts.push(newItem);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "Loading";
        state.error = action.payload;
      })

      .addCase(deleteCartItem.pending, (state) => {
        state.status = "Loading";
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove the item from its cart
        state.carts = state.carts.map((cart) => ({
          ...cart,
          items: cart.items.filter(
            (item) => item.cartItemId !== action.payload.cartItemId
          ),
        }));
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.status = "Loading";
        state.error = action.payload;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const index = state.carts.findIndex(
          (c) => c.cartItemId === updatedItem.cartItemId
        );
        if (index !== -1) {
          state.carts[index].quantity = updatedItem.quantity;
        }
      });
  },
});

// export const { setCarts } = cartsSlice.actions;
export const { updateCartQuantityLocal } = cartsSlice.actions;

export default cartsSlice.reducer;
