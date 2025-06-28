// src/services/orderService.js
import axiosInstance from "./axiosInstance"; // Importa la instancia de Axios que ya incluye baseURL y manejo de token

// Función para crear una orden de compra
export const crearOrden = async (orden, token) => {
  // Realiza una solicitud POST a la API con los datos de la orden
  const res = await axiosInstance.post("/api/orders", orden, {
    headers: { Authorization: `Bearer ${token}` }, // Añade el token manualmente en caso de que no esté agregado por defecto
  });
  return res.data; // Devuelve la respuesta (probablemente la orden creada)
};