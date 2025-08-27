import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import ApiClient from "../../api/apiClient";

export const fetchBooks = createAsyncThunk("books/fetchBooks", async () => {
  const { data } = await ApiClient.get(`/books`);

  return Array.isArray(data) ? data : data.books || [];
});

export const addBook = createAsyncThunk(
  "books/addBook",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.post("/books/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("AddBook response:", data);
      return data;
    } catch (err) {
      // Return backend errors or message
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ message: err.message || "Unknown error" });
    }
  }
);
export const updateBooks = createAsyncThunk(
  "books/updateBooks",
  async ({ id, formData, token }, { rejectWithValue }) => {
    try {
      const { data } = await ApiClient.put(`/books/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return data.book;
    } catch (err) {
      // Return backend errors or message
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ message: err.message || "Unknown error" });
    }
  }
);

export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await ApiClient.get(`/books/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch book");
    }
  }
);
export const deleteBook = createAsyncThunk(
  "books/deletebook",
  async (id, { rejectWithValue }) => {
    try {
      await ApiClient.delete(`/books/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const booksSlice = createSlice({
  name: "books",
  initialState: {
    items: [],
    currentBook: null,
    status: "idle",
    // loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = false;
        state.items = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = true;
        state.error = action.error.message;
      })
      .addCase(addBook.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.status = false;
        if (action.payload.book) {
          state.items.push(action.payload.book); // <-- use only the book
        }// else {
        //   state.items.push(action.payload); // fallback if backend changes
        // } // state.items = action.payload.items;
      })
      .addCase(addBook.rejected, (state, action) => {
        state.status = false;
        if (action.payload?.errors) {
          state.error = action.payload.errors.map((e) => e.message).join(", ");
        } else {
          state.error = action.payload?.message || "Unknown error";
        }
      })
      // updateBook
      .addCase(updateBooks.fulfilled, (state, action) => {
        state.currentBook = action.payload;
        // also update in list
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateBooks.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchBookById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentBook = action.payload;
      }) // delete book
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default booksSlice.reducer;
