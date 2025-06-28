import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../redux/slices/productSlice";
import { logout } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import logo from "../assets/logo.jpeg";

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.product);
  const usuario = useSelector((state) => state.auth.user);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await axiosInstance.delete(`/api/products/${id}`);
        dispatch(getProducts());
      } catch (error) {
        console.error(error);
        alert("Error al eliminar producto");
      }
    }
  };

  const alternarVisible = async (id, visible) => {
    try {
      await axiosInstance.put(`/api/products/${id}`, { visible: !visible });
      dispatch(getProducts());
    } catch (error) {
      console.error(error);
      alert("Error al actualizar visibilidad");
    }
  };

  const alternarFavorito = async (id) => {
    try {
      await axiosInstance.put(`/api/products/${id}/favorito`);
      dispatch(getProducts());
    } catch (error) {
      console.error(error);
      alert("Error al actualizar favorito");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const productosFiltrados = products.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "20px",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ccc",
          padding: "12px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img src={logo} alt="Logo" style={{ height: "80px" }} />
          <div>
            <strong>Bienvenido Administrador:</strong>{" "}
            {usuario.nombre || usuario.email}
          </div>
        </div>
      </div>

      <h1>Lista de Productos</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/add-product")} style={{ marginRight: "10px" }}>
          ➕ Agregar Producto
        </button>
        <button onClick={() => navigate("/categorias")} style={{ marginRight: "10px" }}>
          Tus Categorías
        </button>
        <button onClick={() => navigate("/admin/ordenes")} style={{ marginRight: "10px" }}>
          Órdenes
        </button>
        <button onClick={() => navigate("/asignaciones")} style={{ marginRight: "10px" }}>
          Asignar Proveedores
        </button>
        <button onClick={() => navigate("/asignar-rapiditos")} style={{ marginRight: "10px" }}>
          Panel Rapiditos
        </button>
        <button onClick={() => navigate("/bajo-stock")} style={{ marginRight: "10px" }}>
          Bajo Stock
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "#c0392b",
            color: "white",
            padding: "8px 12px",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar producto por nombre o categoría..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Visible</th>
            <th>Favorito</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((p) => (
            <tr
              key={p._id}
              style={{
                borderBottom: "1px solid #ccc",
                backgroundColor: p.visible ? "white" : "#f8d7da",
              }}
            >
              <td>{p.nombre}</td>
              <td>{p.categoria?.nombre || "Sin categoría"}</td>
              <td>${p.precio}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => alternarVisible(p._id, p.visible)}>
                  {p.visible ? "✅" : "❌"}
                </button>
              </td>
              <td>
                <button onClick={() => alternarFavorito(p._id)}>
                  {p.favorito ? "⭐" : "☆"}
                </button>
              </td>
              <td>
                <button onClick={() => navigate(`/edit-product/${p._id}`)}>✏️</button>
                <button onClick={() => eliminarProducto(p._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
