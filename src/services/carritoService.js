// services/carritoService.js
import axiosInstance from "./axiosInstance"; // Importa la instancia de Axios personalizada

// Obtener el carrito del usuario autenticado
export const obtenerCarritoUsuario = async () => {
  // Realiza una solicitud GET a la API para obtener el carrito del usuario
  const response = await axiosInstance.get("/api/carrito");
  return response.data; // Devuelve los datos del carrito (productos: [...])
};

// Actualizar el carrito del usuario
export const guardarCarritoUsuario = async (carritoOriginal) => {
  // Clona el carrito para evitar mutar el objeto original debido al Proxy en Redux
  const carrito = JSON.parse(JSON.stringify(carritoOriginal));
  
  // Mapea los productos en el carrito a un formato que la API espera (con el producto, cantidad y precio)
  const productos = carrito.map(p => ({
    producto: p._id, // Usa el ID del producto
    cantidad: p.cantidad, // La cantidad de ese producto
    precio: p.precio // El precio del producto
  }));

  // Realiza una solicitud POST a la API para guardar el carrito actualizado
  const response = await axiosInstance.post("/api/carrito", { productos });
  return response.data; // Devuelve la respuesta de la API (normalmente el carrito actualizado)
};

// Vaciar el carrito del usuario
export const vaciarCarritoUsuario = async () => {
  // Realiza una solicitud DELETE a la API para vaciar el carrito del usuario
  await axiosInstance.delete("/api/carrito");
};