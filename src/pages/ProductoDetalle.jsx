import "./ProductoDetalle.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductById } from "../services/productService";
import { useDispatch } from "react-redux";
import { agregarAlCarrito as agregarProductoAlCarrito } from "../redux/slices/carritoSlice";
import axiosInstance from "../services/axiosInstance";

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        const data = await fetchProductById(id);
        setProducto(data);
      } catch (err) {
        console.error("Error:", err);
        setError("No se pudo cargar el producto");
      }
    };

    obtenerProducto();
  }, [id]);

  const agregarAlCarrito = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (!userId) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    dispatch(agregarProductoAlCarrito({
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1,
    }));

    alert(`"${producto.nombre}" agregado al carrito 🛒`);
  };

  const volverAlCatalogo = () => {
    navigate("/catalogo");
  };

  const toggleFavorito = async () => {
    try {
      const res = await axiosInstance.put(`/api/products/${producto._id}/favorito`);
      setProducto({ ...producto, favorito: res.data.favorito });
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
      alert("No se pudo actualizar el estado de favorito.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!producto) return <p>Cargando...</p>;

  return (
    <div className="producto-detalle">
      <h2>{producto.nombre}</h2>
      <img src={producto.imagen} alt={producto.nombre} />
      <div className="info">
        <p><strong>Categoría:</strong> {producto.categoria?.nombre || "(Sin categoría)"}</p>
        <p><strong>Código:</strong> {producto.codigo || "N/A"}</p>
        <p><strong>Precio:</strong> ${producto.precio}</p>
        <p><strong>Stock:</strong> {producto.stock}</p>
        <p>
          <strong>Favorito:</strong>{" "}
          <button
            onClick={toggleFavorito}
            style={{ fontSize: "16px", cursor: "pointer", border: "none", background: "transparent" }}
          >
            {producto.favorito ? " Quitar de favoritos" : "☆ Marcar como favorito"}
          </button>
        </p>
        <p><strong>Visible:</strong> {producto.visible ? "Sí" : "No"}</p>
      </div>

      <div className="acciones">
        <button className="btn volver" onClick={volverAlCatalogo}>
          ⬅ Volver al catálogo
        </button>
        <button className="btn carrito" onClick={agregarAlCarrito}>
          🛒 Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductoDetalle;
