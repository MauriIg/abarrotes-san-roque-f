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
        headers: { Authorization: `Bearer ${usuario.token}` },
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

  // 🔐 Validación principal al renderizar (evita bucle)
  if (!usuario) return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando Dashboard...</p>;
  if (usuario.rol !== "cajero") return <p style={{ textAlign: "center", marginTop: "50px" }}>Acceso denegado</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Bienvenido al panel del cajero</h2>
      {/* Aquí va el resto de tu interfaz */}
    </div>
  );
};

export default Dashboard;
