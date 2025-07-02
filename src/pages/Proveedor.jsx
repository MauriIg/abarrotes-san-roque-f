import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const Proveedor = () => {
  const dispatch = useDispatch();
  const [pedidos, setPedidos] = useState([]);
  const [editando, setEditando] = useState({});
  const usuario = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // Para indicar cuál pedido se está confirmando

  const obtenerPedidos = async () => {
    try {
      setCargando(true);
      const response = await axiosInstance.get("/api/pedidos-proveedor/mis-pedidos");
      setPedidos(response.data);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!cerrandoSesion && (!usuario || usuario.rol !== "proveedor")) {
      alert("Acceso denegado");
      navigate("/");
      return;
    }

    obtenerPedidos();
  }, [usuario]);

  const handleCambioPrecio = (pedidoId, productoId, valor) => {
    setEditando((prev) => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        [productoId]: parseFloat(valor),
      },
    }));
  };

  const enviarPrecios = async (pedido) => {
    const productosActualizados = pedido.productos.map((p) => ({
      producto: p.producto._id,
      precioUnitario: editando[pedido._id]?.[p.producto._id] || p.precioUnitario || 0,
    }));

    try {
      await axiosInstance.put("/api/pedidos-proveedor/actualizar-precios", {
        pedidoId: pedido._id,
        productos: productosActualizados,
      });

      alert("Precios enviados");
      obtenerPedidos();
    } catch (error) {
      console.error("Error al enviar precios:", error);
    }
  };

  const confirmarEntrega = async (pedidoId) => {
    try {
      setConfirmando(pedidoId); // 🔄 Mostrar estado cargando solo en este pedido
      await axiosInstance.put(`/api/pedidos-proveedor/confirmar-pago/${pedidoId}`);
      alert("Mercancía entregada y stock actualizado");

      await obtenerPedidos(); // 🔄 Refrescar pedidos
    } catch (error) {
      console.error("Error al confirmar entrega:", error);
    } finally {
      setConfirmando(null);
    }
  };

  if (!usuario) return <p style={{ padding: "20px" }}>Cargando datos...</p>;

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
            <strong>Usuario Proveedor:</strong> {usuario.nombre || usuario.email}
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

      <h2>Pedidos de Reabastecimiento</h2>

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p>No tienes pedidos asignados.</p>
      ) : (
        pedidos.map((pedido) => (
          <div
            key={pedido._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "15px",
            }}
          >
            <p><strong>Método de Pago:</strong> {pedido.metodoPago}</p>
            <p><strong>Estado:</strong> {pedido.estadoPago === "pagado" ? "Completado" : pedido.estadoPago}</p>

            <table style={{ width: "100%", marginTop: 10 }}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                </tr>
              </thead>
              <tbody>
                {pedido.productos.map((p) => (
                  <tr key={p.producto._id}>
                    <td>{p.producto.nombre}</td>
                    <td>{p.cantidadSolicitada}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        disabled={pedido.confirmadoPorProveedor}
                        value={editando[pedido._id]?.[p.producto._id] ?? ""}
                        onChange={(e) =>
                          handleCambioPrecio(pedido._id, p.producto._id, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!pedido.confirmadoPorProveedor && (
              <button onClick={() => enviarPrecios(pedido)} style={{ marginTop: 10 }}>
                Enviar Precios
              </button>
            )}

            {pedido.confirmadoPorProveedor && (
              pedido.estadoPago === "pagado" ? (
                <button
                  disabled
                  style={{
                    marginLeft: 10,
                    backgroundColor: "#95a5a6",
                    color: "white",
                    padding: "6px 12px",
                    cursor: "not-allowed",
                  }}
                >
                  Completado
                </button>
              ) : (
                <button
                  onClick={() => confirmarEntrega(pedido._id)}
                  disabled={confirmando === pedido._id}
                  style={{
                    marginLeft: 10,
                    backgroundColor: confirmando === pedido._id ? "#f39c12" : "#4CAF50",
                    color: "white",
                    padding: "6px 12px",
                    cursor: confirmando === pedido._id ? "not-allowed" : "pointer",
                  }}
                >
                  {confirmando === pedido._id ? "Confirmando..." : "Confirmar Mercancía Entregada"}
                </button>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Proveedor;
