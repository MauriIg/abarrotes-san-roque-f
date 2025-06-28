import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { obtenerProveedores } from "../services/userService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Asignaciones = () => {
  const [products, setProducts] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const usuario = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔒 Verificar rol
    if (!usuario || usuario.rol !== "admin") {
      alert("Acceso denegado: solo administradores.");
      navigate("/"); // Redirige al inicio u otra ruta
      return;
    }

    const cargarDatos = async () => {
      try {
        const resProd = await axiosInstance.get("/api/products");
        setProducts(resProd.data);
        setProveedores(await obtenerProveedores());
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    cargarDatos();
  }, [usuario, navigate]);

  const actualizarProducto = async (id, campo, valor) => {
    try {
      await axiosInstance.put(`/api/products/${id}`, { [campo]: valor });
      const res = await axiosInstance.get("/api/products");
      setProducts(res.data);
    } catch (error) {
      alert("Error al actualizar producto");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Asignación de Proveedores</h2>
      <button onClick={() => navigate("/products")} style={{ marginBottom: 20 }}>
        ← Volver a productos
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Proveedor</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.nombre}</td>
              <td>
                <select
                  value={p.proveedor || ""}
                  onChange={(e) =>
                    actualizarProducto(p._id, "proveedor", e.target.value || null)
                  }
                >
                  <option value="">-- Sin proveedor --</option>
                  {proveedores.map((prov) => (
                    <option key={prov._id} value={prov._id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Asignaciones;
