import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";
import carritoReducer from "./slices/carritoSlice";
import carritoMiddleware from "./middlewares/carritoMiddleware";

// ✅ Cargar usuario y token desde localStorage si existen
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// ✅ Estado inicial para Redux persistido al refrescar
const preloadedState = {
  auth: {
    user: user || null,
    isAuthenticated: !!user && !!token,
    loading: false,
    error: null,
  },
};

const store = configureStore({
  reducer: {
    auth: userReducer,
    product: productReducer,
    carrito: carritoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(carritoMiddleware),
  preloadedState, // 👈 importante para evitar ciclos y errores
});

export default store;
