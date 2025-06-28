// src/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; // Importa las funciones necesarias de Redux Toolkit
import axios from "axios"; // Importa axios para hacer peticiones HTTP

const API_URL = import.meta.env.VITE_API_URL; // Obtiene la URL base de la API desde las variables de entorno

// Acción para iniciar sesión
export const loginUser = createAsyncThunk("auth/loginUser", async (userData, { rejectWithValue }) => {
  try {
    // Realiza la petición POST a la API para iniciar sesión
    const response = await axios.post(`${API_URL}/api/users/login`, userData, { 
      withCredentials: true, // Enviar cookies si es necesario
      headers: { "Content-Type": "application/json" }, // Establece el tipo de contenido
    });
    
    const { token, ...user } = response.data; // Desestructuramos la respuesta para obtener el token y los datos del usuario
    if (!token) {
      throw new Error("El token no está presente en la respuesta"); // Si no hay token, lanzamos un error
    }
    return { ...user, token }; // Devuelve los datos del usuario junto con el token
  } catch (error) {
    // Si ocurre un error, lo rechazamos y devolvemos el mensaje de error
    return rejectWithValue(error.response?.data?.mensaje || "Error al iniciar sesión");
  }
});

// Acción para registrar usuario (cliente)
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    // Realiza la petición POST a la API para registrar el usuario
    const response = await axios.post(`${API_URL}/api/users/register`, userData);
    return response.data; // Devuelve los datos del usuario registrado
  } catch (error) {
    // Si ocurre un error, lo rechazamos y devolvemos el mensaje de error
    return rejectWithValue(error.response?.data?.mensaje || "Error al registrar usuario");
  }
});

// Creación del slice para manejar el estado de autenticación del usuario
const userSlice = createSlice({
  name: "auth", // Nombre del slice
  initialState: {
    user: null, // El usuario está inicialmente vacío
    isAuthenticated: false, // El estado de autenticación está inicialmente como falso
    loading: false, // El estado de carga está inicialmente en falso
    error: null, // El estado de error está inicialmente vacío
  },
  reducers: {
    // Acción para cerrar sesión
    logout: (state) => {
      state.user = null; // Resetea el usuario
      state.isAuthenticated = false; // Marca como no autenticado
      localStorage.removeItem("user"); // Elimina los datos del usuario del localStorage
      localStorage.removeItem("token"); // Elimina el token del localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      // Caso para cuando la petición de login está en curso (pending)
      .addCase(loginUser.pending, (state) => {
        state.loading = true; // Activa el estado de carga
        state.error = null; // Limpia el error
      })
      // Caso para cuando el login ha sido exitoso (fulfilled)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; // Desactiva el estado de carga
        state.user = action.payload; // Guarda los datos del usuario
        state.isAuthenticated = true; // Marca como autenticado
        localStorage.setItem("user", JSON.stringify(action.payload)); // Guarda los datos del usuario en el localStorage
        localStorage.setItem("token", action.payload.token); // Guarda el token en el localStorage
      })
      // Caso para cuando el login falla (rejected)
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false; // Desactiva el estado de carga
        state.error = action.payload; // Guarda el error
      })
      // Caso para cuando la petición de registro está en curso (pending)
      .addCase(registerUser.pending, (state) => {
        state.loading = true; // Activa el estado de carga
        state.error = null; // Limpia el error
      })
      // Caso para cuando el registro ha sido exitoso (fulfilled)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false; // Desactiva el estado de carga
      })
      // Caso para cuando el registro falla (rejected)
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false; // Desactiva el estado de carga
        state.error = action.payload; // Guarda el error
      });
  },
});

// Exporta la acción logout para usarla en otras partes del código
export const { logout } = userSlice.actions;

// Exporta el reducer para usarlo en el store
export default userSlice.reducer;