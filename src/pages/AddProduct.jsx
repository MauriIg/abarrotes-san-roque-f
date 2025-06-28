// src/pages/AddProduct.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct } from "../redux/slices/productSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

const AddProduct = () => {
  const [producto, setProducto] = useState({
    nombre: "",
    codigos: "",
    categoria: "",
    precio: "",
    stock: "",
    imagen: "",
    favorito: false,
    visible: true,
  });

  const [categorias, setCategorias] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axiosInstance.get("/api/categorias");
        setCategorias(res.data);
      } catch (err) {
        console.error("Error al obtener categorías:", err);
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Debes iniciar sesión para agregar un producto.");
      return;
    }

    try {
      await dispatch(
        addNewProduct({
          ...producto,
          codigos: producto.codigos.split(",").map(c => c.trim()), // ✅ convierte en array
          precio: parseFloat(producto.precio),
          stock: parseInt(producto.stock),
        })
      ).unwrap();

      navigate("/products");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Error al agregar el producto. Ver consola.");
    }
  };

  return (
    <div>
      <h2>Agregar Producto</h2>
      {!isAuthenticated ? (
        <p>Debes iniciar sesión para agregar productos.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={producto.nombre}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="codigos"
            placeholder="Códigos (separados por coma)"
            value={producto.codigos}
            onChange={handleChange}
            required
          />

          <select
            name="categoria"
            value={producto.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={producto.precio}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={producto.stock}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="imagen"
            placeholder="URL de imagen"
            value={producto.imagen}
            onChange={handleChange}
          />

          <label>
            Favorito:
            <input
              type="checkbox"
              name="favorito"
              checked={producto.favorito}
              onChange={(e) =>
                setProducto({ ...producto, favorito: e.target.checked })
              }
            />
          </label>

          <label>
            Visible:
            <input
              type="checkbox"
              name="visible"
              checked={producto.visible}
              onChange={(e) =>
                setProducto({ ...producto, visible: e.target.checked })
              }
            />
          </label>

          <button type="submit">Agregar</button>
        </form>
      )}
    </div>
  );
};

export default AddProduct;
