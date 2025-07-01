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

  useEffect(() => {
    if (usuario && usuario.rol === "cajero") {
      dispatch(getVisibleProducts());
      cargarOrdenesPendientes();
      cargarVentasDelCajero();
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
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      const ventasFiltradas = res.data.filter((venta) => !venta.corteCaja);
      setVentasCajero(ventasFiltradas);
    } catch (error) {
      console.error("Error al cargar ventas del cajero:", error);
    }
  };

  const cerrarSesion = () => {
    dispatch(logout());
    navigate("/login");
  };

  const marcarComoFinalizado = async (id) => {
    try {
      await axiosInstance.put(`/api/orders/${id}/estado`, {
        estado: ESTADOS_ORDEN.COMPLETADA,
      }, {
        headers: { Authorization: `Bearer ${usuario.token}` },
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

  if (!usuario) return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando Dashboard...</p>;
  if (usuario.rol !== "cajero") return <p style={{ textAlign: "center", marginTop: "50px" }}>Acceso denegado</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <h2>Bienvenido al panel del cajero</h2>
        <button onClick={cerrarSesion} style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "8px 12px", cursor: "pointer" }}>Cerrar sesión</button>
      </div>

      <h3>Órdenes pendientes para recoger</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Total</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden._id}>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>${orden.total.toFixed(2)}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <button
                  onClick={() => marcarComoFinalizado(orden._id)}
                  style={{ backgroundColor: "#27ae60", color: "white", padding: "6px 10px", border: "none", cursor: "pointer" }}
                >
                  Marcar como entregada
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Registro de venta</h3>
      <div>
        <select onChange={(e) => handleSelectProduct(e.target.value)} defaultValue="">
          <option value="" disabled>Seleccionar producto</option>
          {productosDisponibles.map(p => (
            <option key={p._id} value={p._id}>{p.nombre} - ${p.precio}</option>
          ))}
        </select>
        <input
          type="number"
          value={producto.cantidad}
          onChange={(e) => setProducto({ ...producto, cantidad: e.target.value })}
          style={{ margin: "0 5px" }}
        />
        <button onClick={agregarProducto} style={{ padding: "5px 10px", backgroundColor: "#2980b9", color: "white", border: "none", cursor: "pointer" }}>Agregar</button>
      </div>

      <ul>
        {carrito.map((item, index) => (
          <li key={index}>
            {item.nombre} x{item.cantidad} - ${item.precio}
            <button onClick={() => eliminarProducto(index)} style={{ marginLeft: "10px", backgroundColor: "#c0392b", color: "white", border: "none", padding: "3px 6px", cursor: "pointer" }}>Eliminar</button>
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
          <input type="number" value={efectivoRecibido} onChange={(e) => setEfectivoRecibido(e.target.value)} />
          <p>Cambio: ${cambio.toFixed(2)}</p>
        </div>
      )}

      <button onClick={finalizarVenta} style={{ marginTop: "10px", backgroundColor: "#2ecc71", color: "white", border: "none", padding: "8px 12px", cursor: "pointer" }}>Finalizar venta</button>

      <hr />
      <h3>Ventas registradas (sin corte de caja)</h3>
      <ul>
        {ventasCajero.map((venta) => (
          <li key={venta._id}>{venta.metodoPago} - ${venta.total.toFixed(2)}</li>
        ))}
      </ul>

      <button onClick={generarCorteCaja} style={{ marginTop: "10px", backgroundColor: "#8e44ad", color: "white", border: "none", padding: "8px 12px", cursor: "pointer" }}>Generar corte de caja</button>
    </div>
  );
};

export default Dashboard;
