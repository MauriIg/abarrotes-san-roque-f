import axiosInstance from './axiosInstance';

// 🔒 Obtener token del localStorage para incluir en headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// ✅ ADMIN: obtener todos los productos (requiere token de admin)
export const fetchProducts = async () => {
  const res = await axiosInstance.get('/api/products/admin/all', getAuthHeaders());
  return res.data;
};

// ✅ CLIENTE o CAJERO: obtener solo productos visibles (público)
export const fetchVisibleProducts = async () => {
  const res = await axiosInstance.get('/api/products');
  return res.data;
};

// ✅ Obtener un solo producto por ID (público)
export const fetchProductById = async (id) => {
  const res = await axiosInstance.get(`/api/products/${id}`);
  return res.data;
};

// ✅ Crear un nuevo producto (requiere token de admin)
export const createProduct = async (producto) => {
  const res = await axiosInstance.post('/api/products', producto, getAuthHeaders());
  return res.data.producto || res.data;
};

// (Opcional) Actualizar o eliminar producto también puede ir aquí si los usas en el panel