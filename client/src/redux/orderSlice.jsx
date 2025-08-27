import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import ApiClient, { apiClient } from "../api/apiClient";
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (shippingAddress, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.post("/orders", { shippingAddress });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const fetchOrders = createAsyncThunk(
  "order/fetchOrder",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.get("/orders");
      return data.orders;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status, paymentStatus }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/orders/${orderId}/status`, {
        status,
        paymentStatus,
      });
      const formattedOrder = data.order;

      return formattedOrder;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    // order: null,
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...state.items, action.payload];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Something went wrong";
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "Failed to fetch orders";
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload; // now formatted
        state.loading = false;

        const index = state.items.findIndex(
          (o) => o.orderId === updatedOrder.orderId
        );
        if (index !== -1) {
          state.items[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
