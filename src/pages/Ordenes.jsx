import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { ESTADOS_ORDEN } from "../constants/orderEstados";

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const res = await axiosInstance.get("/api/orders/mis-ordenes");
        const ordenesOrdenadas = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrdenes(ordenesOrdenadas);
      } catch (err) {
        setError("Error al cargar órdenes");
        console.error(err);
      }
    };

    cargarOrdenes();
  }, []);

  const colorEstado = (estado) => {
    switch (estado) {
      case ESTADOS_ORDEN.PENDIENTE:
      case ESTADOS_ORDEN.PENDIENTE_PAGO:
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 Mis Órdenes</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {ordenes.length === 0 ? (
        <p>No hay órdenes registradas aún.</p>
      ) : (
        ordenes.map((orden) => (
          <div
            key={orden._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              margin: "15px 0",
              borderLeft: `6px solid ${colorEstado(orden.estado)}`,
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <p><strong>📅 Fecha:</strong> {new Date(orden.createdAt).toLocaleString()}</p>
            <p><strong>💰 Total:</strong> ${orden.total.toFixed(2)}</p>
            <p><strong>🛍️ Tipo de entrega:</strong> {orden.tipoEntrega || "No especificado"}</p>
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
          </div>
        ))
      )}
    </div>
  );
};

export default Ordenes;
