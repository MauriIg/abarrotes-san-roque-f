import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/userSlice";
import { getVisibleProducts } from "../redux/slices/productSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { ESTADOS_ORDEN } from "../constants/orderEstados";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const usuario = useSelector((state) => state.auth.user);
  const productosDisponibles = useSelector((state) => state.product.products);

  const [producto, setProducto] = useState({ nombre: "", precio: "", cantidad: 1 });
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [efectivoRecibido, setEfectivoRecibido] = useState("");
  const [ordenes, setOrdenes] = useState([]);
  const [ventasCajero, setVentasCajero] = useState([]);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Modal seguridad
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(false);
  const [adminUsuario, setAdminUsuario] = useState("");
  const [adminClave, setAdminClave] = useState("");
  const [validandoCorte, setValidandoCorte] = useState(false);

  // Clave fija para validar corte (cámbiala a lo que necesites)
  const CLAVE_ADMIN = "admin123";

  useEffect(() => {
    if (!cerrandoSesion && (!usuario || usuario.rol !== "cajero")) {
      dispatch(getVisibleProducts());
      cargarOrdenesPendientes();
      cargarVentasDelCajero();
      alert("Acceso denegado");
      navigate("/");
      return;
    }
  }, [usuario, dispatch]);

  const cargarOrdenesPendientes = async () => {
    try {
      const res = await axiosInstance.get(`/api/orders?estado=${encodeURIComponent(ESTADOS_ORDEN.PARA_RECOGER)}`);
      const ordenesFiltradas = res.data.filter((orden) => !orden.corteCaja);
      setOrdenes(ordenesFiltradas);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  const cargarVentasDelCajero = async () => {
    try {
      const res = await axiosInstance.get("/api/orders/ventas/cajero", {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
        },
      });
      const ventasFiltradas = res.data.filter((venta) => !venta.corteCaja);
      setVentasCajero(ventasFiltradas);
    } catch (error) {
      console.error("Error al cargar ventas del cajero:", error);
    }
  };

  const generarCorteCaja = () => {
    setShowSecurityPrompt(true);
  };

  const validarAdminYCorte = async () => {
    if (!adminUsuario || !adminClave) {
      return alert("Por favor ingresa usuario y contraseña.");
    }
    setValidandoCorte(true);

    // Validación simple en frontend
    if (adminUsuario !== usuario.nombre && adminUsuario !== usuario.email) {
      alert("Usuario incorrecto.");
      setValidandoCorte(false);
      return;
    }
    if (adminClave !== CLAVE_ADMIN) {
      alert("Contraseña incorrecta.");
      setValidandoCorte(false);
      return;
    }

    try {
      const efectivoTotal = ventasCajero
        .filter((v) => v.metodoPago === "efectivo")
        .reduce((acc, v) => acc + v.total, 0);

      const fecha = new Date();
      const fechaStr = fecha.toLocaleString();
      const fechaArchivo = fecha.toISOString().replace(/[:.]/g, "-");

      let ticket = `CORTE DE CAJA - ${fechaStr}\n`;
      ticket += `========================================\n`;
      ticket += `Total en caja (efectivo): $${efectivoTotal.toFixed(2)}\n`;
      ticket += `Número de ventas: ${ventasCajero.length}\n`;

      const resumen = {};
      ventasCajero.forEach((v) => {
        resumen[v.metodoPago] = (resumen[v.metodoPago] || 0) + v.total;
      });

      ticket += `Ventas por método de pago:\n`;
      for (const metodo in resumen) {
        ticket += `  - ${metodo}: $${resumen[metodo].toFixed(2)}\n`;
      }
      ticket += `========================================\n`;

      const blob = new Blob([ticket], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `corte-caja-${fechaArchivo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await axiosInstance.put(
        "/api/orders/corte-caja",
        {},
        {
          headers: { Authorization: `Bearer ${usuario.token}` },
        }
      );
      await cargarVentasDelCajero();
      await cargarOrdenesPendientes();
      alert("Corte de caja realizado correctamente.");
    } catch (error) {
      console.error("Error al realizar corte de caja:", error);
      alert("Error al realizar el corte de caja.");
    } finally {
      setValidandoCorte(false);
      setShowSecurityPrompt(false);
      setAdminUsuario("");
      setAdminClave("");
    }
  };

  const marcarComoFinalizado = async (id) => {
    try {
      await axiosInstance.put(
        `/api/orders/${id}/estado`,
        {
          estado: ESTADOS_ORDEN.COMPLETADA,
        },
        {
          headers: {
            Authorization: `Bearer ${usuario.token}`,
          },
        }
      );
      cargarOrdenesPendientes();
    } catch (error) {
      console.error("Error al finalizar la orden:", error);
    }
  };

  const handleSelectProduct = (id) => {
    const productoSeleccionado = productosDisponibles.find((p) => p._id === id);
    if (productoSeleccionado) {
      setProducto({ nombre: productoSeleccionado.nombre, precio: productoSeleccionado.precio, cantidad: 1 });
    }
  };

  const agregarProducto = () => {
    if (!producto.nombre || !producto.precio || !producto.cantidad) {
      return alert("Completa todos los campos");
    }
    setCarrito([
      ...carrito,
      {
        ...producto,
        precio: parseFloat(producto.precio),
        cantidad: parseInt(producto.cantidad),
      },
    ]);
    setProducto({ nombre: "", precio: "", cantidad: 1 });
  };

  const eliminarProducto = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const cambio = efectivoRecibido ? parseFloat(efectivoRecibido) - total : 0;

  // Función para generar ticket de venta individual
  const generarTicketVenta = (venta) => {
    const fecha = new Date().toLocaleString();

    let ticket = `TICKET DE VENTA - ${fecha}\n`;
    ticket += `========================================\n`;
    ticket += `Productos:\n`;

    venta.productos.forEach((item) => {
      ticket += ` - ${item.nombre} x${item.cantidad} - $${item.precio}\n`;
    });

    ticket += `----------------------------------------\n`;
    ticket += `Total: $${venta.total.toFixed(2)}\n`;
    ticket += `Método de pago: ${venta.metodoPago}\n`;
    ticket += `========================================\n`;

    const blob = new Blob([ticket], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-venta-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) return alert("No hay productos en la venta");
    if (metodoPago === "efectivo" && cambio < 0) return alert("El efectivo recibido no cubre el total");

    const productosFormateados = carrito.map((item) => {
      const productoEncontrado = productosDisponibles.find((p) => p.nombre === item.nombre);
      if (!productoEncontrado) throw new Error(`Producto ${item.nombre} no encontrado`);
      return { producto: productoEncontrado._id, cantidad: item.cantidad, precio: item.precio, nombre: item.nombre };
    });

    const nuevaOrden = {
      productos: productosFormateados,
      total,
      tipoEntrega: "tienda",
      telefono: "",
      direccion: "",
      referencias: "",
      metodoPago,
    };

    try {
      await axiosInstance.post("/api/orders", nuevaOrden, {
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      alert("Venta registrada exitosamente");

      // Generar ticket de venta
      generarTicketVenta({
        productos: carrito,
        total,
        metodoPago,
      });

      setCarrito([]);
      setEfectivoRecibido("");
      cargarVentasDelCajero();
    } catch (error) {
      console.error("Error al guardar la orden:", error);
      alert("Error al registrar la venta");
    }
  };

  // 🔐 Validación principal al renderizar (evita bucle)
  if (!usuario) return <p style={{ textAlign: "center", marginTop: 50 }}>Cargando Dashboard...</p>;
  if (usuario.rol !== "cajero") return <p style={{ textAlign: "center", marginTop: 50 }}>Acceso denegado</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Bienvenido al panel del cajero</h2>
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

      {/* Registro de venta */}
      <h3>Registro de venta</h3>
      <select onChange={(e) => handleSelectProduct(e.target.value)} defaultValue="">
        <option value="" disabled>
          Seleccionar producto
        </option>
        {productosDisponibles.map((p) => (
          <option key={p._id} value={p._id}>
            {p.nombre} - ${p.precio}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Cantidad"
        value={producto.cantidad}
        onChange={(e) => setProducto({ ...producto, cantidad: e.target.value })}
        style={{ margin: "0 5px", width: "80px" }}
        min={1}
      />
      <button onClick={agregarProducto}>Agregar</button>

      <ul>
        {carrito.map((item, index) => (
          <li key={index}>
            {item.nombre} x{item.cantidad} - ${item.precio.toFixed(2)}{" "}
            <button onClick={() => eliminarProducto(index)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <h4>Total: ${total.toFixed(2)}</h4>

      <div>
        <label>Método de pago:</label>
        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      {metodoPago === "efectivo" && (
        <div>
          <label>Efectivo recibido:</label>
          <input
            type="number"
            value={efectivoRecibido}
            onChange={(e) => setEfectivoRecibido(e.target.value)}
            min={0}
          />
          <p>Cambio: ${cambio.toFixed(2)}</p>
        </div>
      )}

      <button onClick={finalizarVenta}>Finalizar venta</button>

      {/* Órdenes pendientes para recoger */}
      <h3 style={{ marginTop: 40 }}>Órdenes pendientes para recoger</h3>
      {ordenes.length === 0 ? (
        <p>No hay órdenes pendientes</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Cliente</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Total</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden._id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {orden.usuario?.nombre || "Cliente desconocido"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>${orden.total.toFixed(2)}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <button onClick={() => marcarComoFinalizado(orden._id)}>Marcar como entregada</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Ventas registradas */}
      <hr />
      <h3>Ventas registradas (sin corte de caja)</h3>
      <ul>
        {ventasCajero.map((venta) => (
          <li key={venta._id}>
            {venta.metodoPago} - ${venta.total.toFixed(2)}
          </li>
        ))}
      </ul>

      <button onClick={generarCorteCaja} disabled={validandoCorte}>
        {validandoCorte ? "Validando..." : "Generar corte de caja"}
      </button>

      {/* Modal simple para pedir credenciales admin */}
      {showSecurityPrompt && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => !validandoCorte && setShowSecurityPrompt(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              minWidth: 300,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <h3>Validar administrador</h3>
            <label>Usuario:</label>
            <input
              type="text"
              value={adminUsuario}
              onChange={(e) => setAdminUsuario(e.target.value)}
              disabled={validandoCorte}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <label>Contraseña / Código:</label>
            <input
              type="password"
              value={adminClave}
              onChange={(e) => setAdminClave(e.target.value)}
              disabled={validandoCorte}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <button onClick={validarAdminYCorte} disabled={validandoCorte} style={{ marginRight: 10 }}>
              Validar y generar corte
            </button>
            <button onClick={() => setShowSecurityPrompt(false)} disabled={validandoCorte}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
