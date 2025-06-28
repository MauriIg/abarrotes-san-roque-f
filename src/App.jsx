import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ClienteMenu from "./components/ClienteMenu";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Catalogo from "./pages/Catalogo";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";
import Cancel from "./pages/Cancel";
import Ordenes from "./pages/Ordenes";
import PagoExitoso from "./pages/pagoExitoso";
import RegisterPage from "./pages/RegisterPage";
import Rapidito from "./pages/Rapidito";
import Favoritos from "./pages/Favoritos";
import EditProduct from "./pages/EditProduct";
import AddCategoria from "./pages/AddCategoria";
import Proveedor from "./pages/Proveedor";
import ListaCategorias from "./pages/ListaCategorias";
import Asignaciones from "./pages/Asignaciones";
import BajoStock from "./pages/BajoStock";
import AdminOrdenes from "./pages/AdminOrdenes";
import VerifyEmail from "./pages/VerifyEmail";
import RecoverPassword from "./pages/RecoverPassword";
import ResetPassword from "./pages/ResetPassword";
import AsignarRapiditos from "./pages/AsignarRapiditos";

// Redux - carrito
import { cargarCarrito, resetearCarrito } from "./redux/slices/carritoSlice";
import {
  obtenerCarritoUsuario,
  guardarCarritoUsuario,
} from "./services/carritoService";

// Componente para proteger rutas según rol
const PrivateRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.auth.user);
  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const usuario = useSelector((state) => state.auth?.user);
  const carrito = useSelector((state) => state.carrito);

  useEffect(() => {
    const cargarCarritoDesdeBackend = async () => {
      dispatch(resetearCarrito());
      if (usuario?.token) {
        try {
          const data = await obtenerCarritoUsuario();
          dispatch(cargarCarrito(data.productos || []));
        } catch (error) {
          console.error("Error cargando carrito desde backend:", error);
        }
      }
    };

    cargarCarritoDesdeBackend();
  }, [usuario?.token, dispatch]);

  useEffect(() => {
    const sincronizarCarrito = async () => {
      if (usuario?.token && carrito.length > 0) {
        try {
          await guardarCarritoUsuario(carrito);
        } catch (error) {
          console.error("Error guardando carrito en backend:", error);
        }
      }
    };

    sincronizarCarrito();
  }, [carrito, usuario?.token]);

  return (
    <>
      <ClienteMenu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/recover" element={<RecoverPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas públicas */}
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/favoritos" element={<Favoritos />} />

        {/* Rutas protegidas para admin */}
        <Route path="/dashboard" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Products />
          </PrivateRoute>
        } />
        <Route path="/add-product" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AddProduct />
          </PrivateRoute>
        } />
        <Route path="/edit-product/:id" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <EditProduct />
          </PrivateRoute>
        } />
        <Route path="/añadir-categoria" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AddCategoria />
          </PrivateRoute>
        } />
        <Route path="/categorias" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <ListaCategorias />
          </PrivateRoute>
        } />
        <Route path="/admin/ordenes" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminOrdenes />
          </PrivateRoute>
        } />
        <Route path="/asignaciones" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Asignaciones />
          </PrivateRoute>
        } />
        <Route path="/bajo-stock" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <BajoStock />
          </PrivateRoute>
        } />
        <Route path="/asignar-rapiditos" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AsignarRapiditos />
          </PrivateRoute>
        } />
        <Route path="/proveedor" element={
          <PrivateRoute allowedRoles={["admin","proveedor"]}>
            <Proveedor />
          </PrivateRoute>
        } />

        {/* Ruta del rapidito (también protegida si quieres) */}
        <Route path="/rapidito" element={
          <PrivateRoute allowedRoles={["rapidito"]}>
            <Rapidito />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
};

export default App;
