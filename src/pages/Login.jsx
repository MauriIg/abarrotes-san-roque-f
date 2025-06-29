import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { cargarCarrito } from "../redux/slices/carritoSlice";
import { obtenerCarritoUsuario } from "../services/carritoService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      alert("Por favor ingresa un email válido.");
      return;
    }

    console.log("🔐 Enviando login con:", email, password);
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    const sincronizarCarrito = async () => {
      const carritoGuardado = JSON.parse(localStorage.getItem("carrito"));
      if (carritoGuardado && carritoGuardado.length > 0) {
        dispatch(cargarCarrito(carritoGuardado));
      } else {
        try {
          const token = localStorage.getItem("token");
          const carritoServidor = await obtenerCarritoUsuario(token);
          if (carritoServidor.productos && carritoServidor.productos.length > 0) {
            const productosFormateados = carritoServidor.productos.map((p) => ({
              _id: p.producto._id,
              nombre: p.producto.nombre,
              precio: p.precio,
              cantidad: p.cantidad,
            }));
            dispatch(cargarCarrito(productosFormateados));
          }
        } catch (error) {
          console.error("Error al sincronizar carrito:", error);
        }
      }
    };

    if (user && user._id) {
      console.log("🎯 Usuario cargado en Redux:", user); // 🔍 Este log fue agregado

      sincronizarCarrito();
      switch (user.rol) {
        case "admin":
          navigate("/Products");
          break;
        case "cliente":
          navigate("/Catalogo");
          break;
        case "cajero":
          navigate("/Dashboard");
          break;
        case "rapidito":
          navigate("/rapidito");
          break;
        case "proveedor":
          navigate("/proveedor");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, navigate, dispatch]);

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Iniciar Sesión</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          autoComplete="new-password"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <span>¿No tienes cuenta?</span>
        <button
          type="button"
          onClick={() => navigate("/register")}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#007BFF",
            cursor: "pointer",
            fontWeight: "bold",
            textDecoration: "underline",
            marginLeft: "5px",
          }}
        >
          Regístrate aquí
        </button>
        <p style={{ marginTop: "10px" }}>
          <button
            type="button"
            onClick={() => navigate("/recover")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#007BFF",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
