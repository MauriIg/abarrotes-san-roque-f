import { useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const AddCategoria = () => {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMensaje("El nombre de la categoría no puede estar vacío.");
      return;
    }

    try {
      await axiosInstance.post("/api/categorias", { nombre });
      setMensaje("Categoría creada exitosamente.");
      setNombre("");
      setTimeout(() => {
        navigate("/categorias"); // redirigir si lo deseas
      }, 1000);
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear categoría.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Agregar Nueva Categoría</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la categoría"
          required
        />
        <button type="submit">Guardar Categoría</button>
        {mensaje && <p>{mensaje}</p>}
      </form>
    </div>
  );
};

export default AddCategoria;
