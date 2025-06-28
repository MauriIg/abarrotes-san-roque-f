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
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [ventasCajero, setVentasCajero] = useState([]);

  useEffect(() => {
    if (!usuario || usuario.rol !== "cajero") {
      alert("Acceso denegado");
      navigate("/");
    } else {
      dispatch(getVisibleProducts());
      cargarOrdenesPendientes();
      cargarVentasDelCajero();
    }
  }, [usuario, navigate, dispatch]);

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

  const generarCorteCaja = async () => {
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

    try {
      await axiosInstance.put("/api/orders/corte-caja", {}, {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
        },
      });
      await cargarVentasDelCajero();
      await cargarOrdenesPendientes();
      alert("Corte de caja realizado correctamente.");
    } catch (error) {
      console.error("Error al realizar corte de caja:", error);
      alert("Error al realizar el corte de caja.");
    }
  };

  const marcarComoFinalizado = async (id) => {
    try {
      await axiosInstance.put(`/api/orders/${id}/estado`, {
        estado: ESTADOS_ORDEN.COMPLETADA
      }, {
        headers: {
          Authorization: `Bearer ${usuario.token}`
        }
      });
      cargarOrdenesPendientes();
    } catch (error) {
      console.error("Error al finalizar la orden:", error);
    }
  };

  const handleSelectProduct = (id) => {
    const productoSeleccionado = productosDisponibles.find(p => p._id === id);
    if (productoSeleccionado) {
      setProducto({ nombre: productoSeleccionado.nombre, precio: productoSeleccionado.precio, cantidad: 1 });
    }
  };

  const agregarProducto = () => {
    if (!producto.nombre || !producto.precio || !producto.cantidad) {
      return alert("Completa todos los campos");
    }
    setCarrito([...carrito, {
      ...producto,
      precio: parseFloat(producto.precio),
      cantidad: parseInt(producto.cantidad),
    }]);
    setProducto({ nombre: "", precio: "", cantidad: 1 });
  };

  const eliminarProducto = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const cambio = efectivoRecibido ? parseFloat(efectivoRecibido) - total : 0;

  const finalizarVenta = async () => {
    if (carrito.length === 0) return alert("No hay productos en la venta");
    if (metodoPago === "efectivo" && cambio < 0) return alert("El efectivo recibido no cubre el total");

    const productosFormateados = carrito.map((item) => {
      const productoEncontrado = productosDisponibles.find((p) => p.nombre === item.nombre);
      if (!productoEncontrado) throw new Error(`Producto ${item.nombre} no encontrado`);
      return { producto: productoEncontrado._id, cantidad: item.cantidad, precio: item.precio };
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
      setCarrito([]);
      setEfectivoRecibido("");
      cargarVentasDelCajero();
    } catch (error) {
      console.error("Error al guardar la orden:", error);
      alert("Error al registrar la venta");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Punto de Venta</h2>
        <button onClick={() => { setCerrandoSesion(true); dispatch(logout()); navigate("/login"); }}>
          {cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </div>

      <div style={{ margin: "20px 0" }}>
        <button onClick={generarCorteCaja} style={{ background: "darkblue", color: "white", padding: "10px", borderRadius: "5px" }}>
          Generar corte de caja
        </button>
      </div>

      <h2>Órdenes pendientes para recoger</h2>
      {ordenes.length === 0 ? (
        <p>No hay órdenes pendientes.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Método</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden._id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{orden.usuario?.nombre || "Anónimo"}</td>
                <td>{orden.telefono || "Sin teléfono"}</td>
                <td>{orden.metodoPago}</td>
                <td>${orden.total.toFixed(2)}</td>
                <td>
                  <button onClick={() => marcarComoFinalizado(orden._id)} style={{ background: "green", color: "white", padding: "5px 10px", borderRadius: "5px" }}>
                    Finalizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Ventas realizadas por ti</h2>
      {ventasCajero.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Método</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventasCajero.map((venta) => (
              <tr key={venta._id}>
                <td>{new Date(venta.createdAt).toLocaleString()}</td>
                <td>{venta.metodoPago}</td>
                <td>${venta.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginBottom: "10px", marginTop: "30px" }}>
        <label>Seleccionar producto: </label>
        <select onChange={(e) => handleSelectProduct(e.target.value)} defaultValue="">
          <option value="">-- Elegir --</option>
          {productosDisponibles.map((p) => (
            <option key={p._id} value={p._id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input type="number" placeholder="Cantidad" min="1" value={producto.cantidad} onChange={(e) => setProducto({ ...producto, cantidad: e.target.value })} />
        <button onClick={agregarProducto} style={{ marginLeft: "10px" }}>Agregar al carrito</button>
      </div>

      <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((p, i) => (
            <tr key={i}>
              <td>{p.nombre}</td>
              <td>${p.precio.toFixed(2)}</td>
              <td>{p.cantidad}</td>
              <td>${(p.precio * p.cantidad).toFixed(2)}</td>
              <td><button onClick={() => eliminarProducto(i)}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total: ${total.toFixed(2)}</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Método de pago: </label>
        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </div>

      {metodoPago === "efectivo" && (
        <div style={{ marginBottom: "10px" }}>
          <input type="number" placeholder="Efectivo recibido" value={efectivoRecibido} onChange={(e) => setEfectivoRecibido(e.target.value)} />
          <p><strong>Cambio:</strong> ${cambio >= 0 ? cambio.toFixed(2) : "0.00"}</p>
        </div>
      )}

      <button onClick={finalizarVenta} style={{ padding: "10px 20px", background: "green", color: "white", border: "none", borderRadius: "5px", marginBottom: "40px" }}>
        Finalizar venta
      </button>
    </div>
  );
};

export default Dashboard;
