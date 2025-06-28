import axiosInstance from "./axiosInstance";

// Función general para obtener usuarios por rol
const obtenerUsuariosPorRol = async (rol) => {
  try {
    const res = await axiosInstance.get(`/api/users?rol=${rol}`);
    return res.data;
  } catch (error) {
    console.error(`Error al obtener usuarios con rol "${rol}":`, error);
    return [];
  }
};

// Funciones específicas
export const obtenerProveedores = () => obtenerUsuariosPorRol("proveedor");
export const obtenerRapiditos = () => obtenerUsuariosPorRol("rapidito");
export const obtenerCajeros = () => obtenerUsuariosPorRol("cajero");
