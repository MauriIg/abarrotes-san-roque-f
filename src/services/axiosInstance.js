// src/services/axiosInstance.js
import axios from 'axios'; // Importa la librería Axios para realizar peticiones HTTP

const API_URL = import.meta.env.VITE_API_URL; // Obtiene la URL base de la API desde las variables de entorno

// Crea una instancia personalizada de Axios con la URL base y los headers por defecto
const axiosInstance = axios.create({
  baseURL: API_URL, // Define la URL base para las peticiones
  headers: {
    "Content-Type": "application/json", // Establece el tipo de contenido como JSON para todas las peticiones
  },
});

// Interceptor para añadir el token en todas las solicitudes antes de enviarlas
axiosInstance.interceptors.request.use((config) => {
 const user = JSON.parse(localStorage.getItem("user"));
const token = user?.token;
  if (token) {
    // Si el token está presente, lo añade a los headers de la solicitud
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config; // Devuelve la configuración modificada de la solicitud
}, (error) => {
  return Promise.reject(error); // Si ocurre un error, lo rechaza
});

export default axiosInstance; // Exporta la instancia de Axios para usarla en otros archivos