import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProducts,
  fetchVisibleProducts,
  createProduct,
} from "../../services/productService";

// 🟢 ADMIN: Obtener todos los productos
export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchProducts();
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Error al obtener productos");
    }
  }
);

// 🟡 CAJERO / CLIENTE: Obtener solo productos visibles
export const getVisibleProducts = createAsyncThunk(
  "product/getVisibleProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchVisibleProducts();
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Error al obtener productos visibles");
    }
  }
);

// 🔵 Agregar nuevo producto (admin)
export const addNewProduct = createAsyncThunk(
  "product/addNewProduct",
  async (producto, { rejectWithValue }) => {
    try {
      const res = await createProduct(producto);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Error al agregar producto");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔄 ADMIN: Obtener todos los productos
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔄 CAJERO: Obtener productos visibles
      .addCase(getVisibleProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVisibleProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getVisibleProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ➕ Agregar producto
      .addCase(addNewProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;