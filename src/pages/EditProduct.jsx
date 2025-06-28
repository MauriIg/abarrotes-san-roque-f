import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState([]);

  // Obtener producto existente
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/api/products/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el producto.");
      }
    };

    const fetchCategorias = async () => {
      try {
        const res = await axiosInstance.get("/api/categorias");
        setCategorias(res.data);
      } catch (err) {
        console.error("Error al cargar categorías", err);
      }
    };

    fetchProduct();
    fetchCategorias();
  }, [id]);

  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCodigoChange = (e, index) => {
    const nuevosCodigos = [...form.codigos];
    nuevosCodigos[index] = e.target.value;
    setForm((prev) => ({ ...prev, codigos: nuevosCodigos }));
  };

  const agregarCodigo = () => {
    setForm((prev) => ({ ...prev, codigos: [...(prev.codigos || []), ""] }));
  };

  // Enviar actualización
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/products/${id}`, {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
      });
      alert("Producto actualizado");
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar producto.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!form) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Editar Producto</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />

        <h4>Códigos de Barras</h4>
        {form.codigos?.map((c, i) => (
  <input
    key={i}
    value={c}
    onChange={(e) => handleCodigoChange(e, i)}
    placeholder={`Código ${i + 1}`}
  />
))}

<button type="button" onClick={agregarCodigo}>Agregar código</button>


        <select name="categoria" value={form.categoria} onChange={handleChange} required>
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.nombre}</option>
          ))}
        </select>

        <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" required />
        <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock" required />
        <input name="imagen" value={form.imagen} onChange={handleChange} placeholder="Imagen URL" />

        <label>
          <input type="checkbox" name="favorito" checked={form.favorito} onChange={handleChange} /> Favorito
        </label>
        <label>
          <input type="checkbox" name="visible" checked={form.visible} onChange={handleChange} /> Visible
        </label>

        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditProduct;
