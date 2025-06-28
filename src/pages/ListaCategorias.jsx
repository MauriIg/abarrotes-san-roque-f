import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const ListaCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const res = await axiosInstance.get("/api/categorias");
      setCategorias(res.data);
    } catch (error) {
      console.error("Error al cargar categorías", error);
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await axiosInstance.delete(`/api/categorias/${id}`);
      cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría", error);
    }
  };

  const iniciarEdicion = (id, nombreActual) => {
    setEditandoId(id);
    setNuevoNombre(nombreActual);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoNombre("");
  };

  const guardarEdicion = async (id) => {
    try {
      await axiosInstance.put(`/api/categorias/${id}`, { nombre: nuevoNombre });
      setEditandoId(null);
      cargarCategorias();
    } catch (error) {
      console.error("Error al editar categoría", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Lista de Categorías</h2>
      <button
        onClick={() => navigate("/añadir-categoria")}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "10px 15px",
          marginBottom: "15px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        ➕ Agregar Categoría
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Categoría</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat._id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tdStyle}>
                {editandoId === cat._id ? (
                  <input
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    style={{ padding: "5px", width: "80%" }}
                  />
                ) : (
                  <strong>{cat.nombre}</strong>
                )}
              </td>
              <td style={tdStyle}>
                {editandoId === cat._id ? (
                  <>
                    <button onClick={() => guardarEdicion(cat._id)} style={btnGuardar}>Guardar</button>
                    <button onClick={cancelarEdicion} style={btnCancelar}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => iniciarEdicion(cat._id, cat.nombre)} style={btnEditar}>Editar</button>
                    <button onClick={() => eliminarCategoria(cat._id)} style={btnEliminar}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ccc",
};

const tdStyle = {
  padding: "10px",
};

const btnEditar = {
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  padding: "6px 12px",
  marginRight: "5px",
  borderRadius: "4px",
  cursor: "pointer",
};

const btnEliminar = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};

const btnGuardar = {
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "6px 12px",
  marginRight: "5px",
  borderRadius: "4px",
  cursor: "pointer",
};

const btnCancelar = {
  backgroundColor: "#9E9E9E",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};

export default ListaCategorias;
