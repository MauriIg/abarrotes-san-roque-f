import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useSelector } from "react-redux";
import { ESTADOS_ORDEN } from "../constants/orderEstados";

const AdminOrdenes = () => {
  const usuario = useSelector((state) => state.auth.user);
  const token = usuario?.token;

  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const res = await axiosInstance.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordenadas = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrdenes(ordenadas);
      } catch (err) {
        console.error("Error al cargar órdenes", err);
      }
    };

    if (usuario?.rol === "admin") cargarOrdenes();
  }, [token, usuario]);

  const eliminarOrden = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta orden?")) return;

    try {
      await axiosInstance.delete(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdenes((prev) => prev.filter((orden) => orden._id !== id));
    } catch (err) {
      console.error("Error al eliminar orden", err);
    }
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case ESTADOS_ORDEN.PENDIENTE_PAGO:
        return "#d35400"; // naranja oscuro
      case ESTADOS_ORDEN.PARA_RECOGER:
        return "#f39c12"; // naranja
      case ESTADOS_ORDEN.PAGADO:
      case ESTADOS_ORDEN.EN_CAMINO:
        return "#2980b9"; // azul
      case ESTADOS_ORDEN.COMPLETADA:
        return "#27ae60"; // verde
      case ESTADOS_ORDEN.CANCELADA:
        return "#c0392b"; // rojo
      default:
        return "#7f8c8d"; // gris
    }
  };

  const estadoLegible = {
    [ESTADOS_ORDEN.PENDIENTE]: "Pendiente",
    [ESTADOS_ORDEN.PENDIENTE_PAGO]: "Pendiente de pago",
    [ESTADOS_ORDEN.PARA_RECOGER]: "Pendiente para recoger",
    [ESTADOS_ORDEN.PAGADO]: "Pagado",
    [ESTADOS_ORDEN.EN_CAMINO]: "En camino",
    [ESTADOS_ORDEN.COMPLETADA]: "Completada",
    [ESTADOS_ORDEN.CANCELADA]: "Cancelada",
  };

  const ordenesFiltradas = ordenes.filter((orden) => {
    if (filtro === "todos") return true;
    if (filtro === "cajero") return orden.estado === ESTADOS_ORDEN.PARA_RECOGER;
    if (filtro === "rapidito") return orden.estado === ESTADOS_ORDEN.PENDIENTE;
    if (filtro === ESTADOS_ORDEN.PENDIENTE_PAGO) return orden.estado === ESTADOS_ORDEN.PENDIENTE_PAGO;
    return orden.usuario?.rol === filtro;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Panel de Administración - Órdenes</h1>

      <label htmlFor="filtro">Filtrar por estado / rol del usuario:</label>
      <select
        id="filtro"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{ marginBottom: "15px", padding: "5px", marginLeft: "10px" }}
      >
        <option value="todos">Todos</option>
        <option value="rapidito">Rapidito</option>
        <option value="cajero">Cajero</option>
        <option value={ESTADOS_ORDEN.PENDIENTE_PAGO}>Pendiente de pago</option>
      </select>

      {ordenesFiltradas.length === 0 ? (
        <p>No hay órdenes para mostrar.</p>
      ) : (
        ordenesFiltradas.map((orden) => (
          <div
            key={orden._id}
            style={{
              border: "1px solid #ccc",
              margin: "15px 0",
              padding: "15px",
              borderLeft: `6px solid ${colorEstado(orden.estado)}`,
              borderRadius: "5px",
              backgroundColor: "#fdfdfd",
            }}
          >
            <p>
              <strong>👤 Usuario:</strong> {orden.usuario?.nombre || "Desconocido"} ({orden.usuario?.rol})
            </p>
            <p><strong>📅 Fecha:</strong> {new Date(orden.createdAt).toLocaleString()}</p>
            <p><strong>💰 Total:</strong> ${orden.total.toFixed(2)}</p>
            <p><strong>🚚 Tipo de entrega:</strong> {orden.tipoEntrega || "No especificado"}</p>
            <p><strong>💳 Método de pago:</strong> {orden.metodoPago || "Efectivo"}</p>
            <p>
              <strong>📌 Estado:</strong>{" "}
              <span style={{ color: colorEstado(orden.estado), fontWeight: "bold" }}>
                {estadoLegible[orden.estado] || orden.estado}
              </span>
            </p>
            <p><strong>🧾 Productos:</strong></p>
            <ul style={{ paddingLeft: "20px" }}>
              {orden.productos.map((p, i) => (
                <li key={i}>
                  {p.nombre} × {p.cantidad} – ${p.precio.toFixed(2)} c/u
                </li>
              ))}
            </ul>

            <button
              onClick={() => eliminarOrden(orden._id)}
              style={{
                background: "#e74c3c",
                color: "white",
                padding: "6px 12px",
                marginTop: "10px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🗑️ Eliminar orden
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrdenes;
