// src/store.js
import { configureStore } from "@reduxjs/toolkit"; // Importa la función para configurar el store
import userReducer from "./slices/userSlice"; // Importa el reducer para manejar el estado de los usuarios
import productReducer from "./slices/productSlice"; // Importa el reducer para manejar el estado de los productos
import carritoReducer from "./slices/carritoSlice"; // Importa el reducer para manejar el estado del carrito de compras
import carritoMiddleware from "./middlewares/carritoMiddleware"; // 👈 Importamos el nuevo middleware personalizado

// Configuración del store de Redux
const store = configureStore({
  reducer: {
    auth: userReducer,     // Reducer para la autenticación de usuarios
    product: productReducer, // Reducer para la gestión de productos
    carrito: carritoReducer, // Reducer para la gestión del carrito de compras
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(carritoMiddleware), // 👈 Añadimos el middleware personalizado al store
});

export default store; // Exporta el store configurado