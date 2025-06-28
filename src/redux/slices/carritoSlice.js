// redux/slices/carritoSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { guardarCarritoUsuario } from '../../services/carritoService'; // Función para sincronizar carrito con backend

// Estado inicial vacío del carrito
const carritoInicial = [];

// Definición del slice del carrito
const carritoSlice = createSlice({
  name: 'carrito', // Nombre del slice
  initialState: carritoInicial, // Estado inicial
  reducers: {

    // Agrega un producto al carrito
    agregarAlCarrito: (state, action) => {
      const producto = action.payload; // Producto recibido en el payload
      const existe = state.find(item => item._id === producto._id); // Verifica si ya existe en el carrito

      if (existe) {
        // Si ya existe, incrementa la cantidad
        existe.cantidad += 1;
      } else {
        // Si no existe, lo agrega con cantidad 1
        state.push({ ...producto, cantidad: 1 });
      }
    },

    // Quita un producto del carrito por su _id
    quitarDelCarrito: (state, action) => {
      const nuevoCarrito = state.filter(item => item._id !== action.payload); // Filtra el producto a eliminar

      // Sincroniza el nuevo carrito con el backend de forma asíncrona
      setTimeout(() => guardarCarritoUsuario(nuevoCarrito), 0);

      // Retorna el nuevo estado del carrito
      return nuevoCarrito;
    },

    // Vacía completamente el carrito
    vaciarCarrito: () => {
      return []; // Retorna un arreglo vacío
    },

    // Cambia la cantidad de un producto en el carrito
    cambiarCantidad: (state, action) => {
      const { id, cantidad } = action.payload; // Extrae id y nueva cantidad del payload
      const item = state.find(p => p._id === id); // Busca el producto

      if (item) {
        item.cantidad = cantidad; // Actualiza la cantidad si el producto existe
      }
    },

    // Carga productos del backend al carrito
    cargarCarrito: (state, action) => {
      // Limpia el carrito actual y lo reemplaza con productos válidos del backend
      state.splice(
        0,
        state.length,
        ...action.payload
          .filter(p => p.producto) // Filtra entradas válidas (que tengan producto)
          .map(p => ({
            _id: p.producto._id,
            nombre: p.producto.nombre,
            precio: p.producto.precio,
            imagen: p.producto.imagen,
            cantidad: p.cantidad
          }))
      );
    },

    // Restaura el carrito al estado inicial (vacío)
    resetearCarrito: () => carritoInicial,
  },
});

// Exporta las acciones definidas
export const {
  agregarAlCarrito,
  quitarDelCarrito,
  vaciarCarrito,
  cambiarCantidad,
  cargarCarrito,
  resetearCarrito
} = carritoSlice.actions;

// Exporta el reducer para usarlo en el store
export default carritoSlice.reducer;