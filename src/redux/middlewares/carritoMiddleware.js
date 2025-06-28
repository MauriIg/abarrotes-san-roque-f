// src/redux/middlewares/carritoMiddleware.js
import { guardarCarritoUsuario, vaciarCarritoUsuario } from "../../services/carritoService";

const carritoMiddleware = (store) => (next) => async (action) => {
  const result = next(action); // Ejecuta la acción normalmente

  const accionesQueModificanCarrito = [
    "carrito/agregarAlCarrito",
    "carrito/quitarDelCarrito",
    "carrito/vaciarCarrito",
    "carrito/cambiarCantidad",
    "carrito/cargarCarrito",
  ];

  if (accionesQueModificanCarrito.includes(action.type)) {
    const state = store.getState();
    const carritoActual = state.carrito;
    const token = localStorage.getItem("token");

    try {
      if (token && carritoActual.length > 0) {
        // Guardar carrito solo si tiene productos
        await guardarCarritoUsuario(carritoActual, token);
        console.log("✅ Carrito sincronizado en servidor.");
      } else if (token && carritoActual.length === 0) {
        // Si el carrito está vacío, también puedes limpiar en el backend si deseas
        await vaciarCarritoUsuario(token);
        console.log("🧹 Carrito vacío, limpiado en backend.");
      }
    } catch (error) {
      console.error("❌ Error al sincronizar carrito:", error);
    }
  }

  return result;
};

export default carritoMiddleware;
