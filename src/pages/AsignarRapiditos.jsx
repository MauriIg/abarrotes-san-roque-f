import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AsignarRapiditos = () => {
  const [infoRapiditos, setInfoRapiditos] = useState([]);
  const usuario = useSelector((state) => state.auth.user);

  // Función para cargar la info
  const fetchRapiditosInfo = async () => {
    try {
      const usuariosRes = await axiosInstance.get("/api/users", {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
        },
      });

      const rapiditos = usuariosRes.data.filter((u) => u.rol === "rapidito");

      const resultados = await Promise.all(
        rapiditos.map(async (r) => {
          const ordenesRes = await axiosInstance.get(`/api/orders/rapidito/${r._id}`, {
            headers: {
              Authorization: `Bearer ${usuario.token}`,
            },
          });

          const ordenes = ordenesRes.data || [];
          const totalEfectivo = ordenes
            .filter((o) => o.metodoPago === "efectivo")
            .reduce((sum, o) => sum + o.total, 0);

          return {
            id: r._id,
            nombre: r.nombre,
            pedidos: ordenes.length,
            totalEfectivo,
          };
        })
      );

      setInfoRapiditos(resultados);
    } catch (err) {
      console.error("Error al cargar info de rapiditos:", err);
    }
  };

  // Cargar al montar
  useEffect(() => {
    fetchRapiditosInfo();
  }, [usuario.token]);

  // Función para realizar el corte
  const handleClearOrders = async (rapiditoId) => {
    if (confirm("¿Estás seguro de hacer el corte de este rapidito?")) {
      try {
        const res = await axiosInstance.delete(`/api/orders/rapidito/${rapiditoId}/clear`, {
          headers: {
            Authorization: `Bearer ${usuario.token}`,
          },
        });

        toast.success(res.data.mensaje || "Corte realizado correctamente");
        fetchRapiditosInfo(); // recargar resumen
      } catch (error) {
        console.error("❌ Error al hacer corte:", error);
        toast.error("Error al hacer el corte del rapidito");
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Resumen de Rapiditos</h2>
      {infoRapiditos.length === 0 ? (
        <p>No hay información disponible.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {infoRapiditos.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "6px", backgroundColor: "#f9f9f9" }}>
              <h4>{r.nombre}</h4>
              <p><strong>Órdenes asignadas:</strong> {r.pedidos}</p>
              <p><strong>Dinero en efectivo por entregar:</strong> ${r.totalEfectivo.toFixed(2)}</p>
              <button
                onClick={() => handleClearOrders(r.id)}
                style={{
                  marginTop: "8px",
                  backgroundColor: "#e53935",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Realizar corte
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AsignarRapiditos;
