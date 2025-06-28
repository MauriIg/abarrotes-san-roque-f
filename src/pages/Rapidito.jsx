import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/userSlice";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { ESTADOS_ORDEN } from "../constants/orderEstados"; // importa la constante

const Rapidito = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const usuario = useSelector((state) => state.auth.user);
  const token = usuario?.token;

  const [ordenes, setOrdenes] = useState([]);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  useEffect(() => {
    if (!cerrandoSesion && (!usuario || usuario.rol !== "rapidito")) {
      alert("Acceso denegado");
      navigate("/");
      return;
    }

    const obtenerOrdenesAsignadas = async () => {
      try {
        const res = await axiosInstance.get("/api/orders/asignadas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrdenes(res.data);
      } catch (error) {
        console.error("Error al cargar órdenes asignadas:", error);
        alert("No se pudieron cargar las órdenes asignadas.");
      }
    };

    if (usuario?.rol === "rapidito") {
      obtenerOrdenesAsignadas();
    }
  }, [usuario, token, navigate, cerrandoSesion]);

  const marcarComoEntregada = async (ordenId) => {
    try {
      await axiosInstance.put(
        `/api/orders/${ordenId}/entregada`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Orden marcada como entregada");
      setOrdenes((prev) =>
        prev.map((o) =>
          o._id === ordenId ? { ...o, estado: ESTADOS_ORDEN.COMPLETADA } : o
        )
      );
    } catch (error) {
      console.error("Error al marcar como entregada:", error);
      alert("Error al actualizar el estado de la orden.");
    }
  };

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
            <strong>Usuario Rapidito:</strong> {usuario.nombre || usuario.email}
          </div>
        </div>

        <button
          onClick={() => {
            setCerrandoSesion(true);
            dispatch(logout());
            navigate("/login");
          }}
          disabled={cerrandoSesion}
          style={{
            background: "#c0392b",
            color: "white",
            padding: "8px 12px",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            opacity: cerrandoSesion ? 0.6 : 1,
            cursor: cerrandoSesion ? "not-allowed" : "pointer",
          }}
        >
          {cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </div>

      <h2>Órdenes Asignadas</h2>

      {ordenes.length === 0 ? (
        <p>No tienes órdenes asignadas</p>
      ) : (
        ordenes.map((orden) => {
          const esCompletada = orden.estado === ESTADOS_ORDEN.COMPLETADA;

          return (
            <div
              key={orden._id}
              style={{
                border: "1px solid #ccc",
                margin: "10px 0",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: esCompletada ? "#dff0d8" : "#fffbe6",
              }}
            >
              <h4>Cliente: {orden.usuario?.nombre || "Sin nombre"}</h4>
              <p>Dirección: {orden.direccion || "N/A"}</p>
              <p>Referencias: {orden.referencias || "Sin referencias"}</p>
              <p>Teléfono: {orden.telefono || "Sin teléfono de contacto"}</p>
              <p>Total: ${orden.total?.toFixed(2)}</p>
              <p>
                Estado:{" "}
                <strong style={{ color: esCompletada ? "green" : "#e67e22" }}>
                  {orden.estado}
                </strong>
              </p>

              {esCompletada ? (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  ✅ Orden entregada
                </p>
              ) : (
                <button
                  onClick={() => marcarComoEntregada(orden._id)}
                  style={{
                    marginTop: "10px",
                    background: "green",
                    color: "white",
                    padding: "8px",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Marcar como entregada
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Rapidito;
