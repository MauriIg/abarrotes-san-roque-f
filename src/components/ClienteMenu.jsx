import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const ClienteMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const usuario = useSelector((state) => state.auth.user);

  if (!usuario || usuario.rol !== "cliente") return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #ccc",
      }}
    >

<div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
      <img src={logo} alt="Logo" style={{ height: "100px", marginRight: "15px" }} />
      </div>

      <div>
        <strong>Bienvenido,</strong> {usuario.nombre || usuario.email}
      </div>


      <div style={{ display: "flex", gap: "15px" }}>
        <button onClick={() => navigate("/")} style={btnStyle}>🏠 Inicio</button>
        <button onClick={() => navigate("/catalogo")} style={btnStyle}>🛍️ Catálogo</button>
        <button onClick={() => navigate("/carrito")} style={btnStyle}>🛒 Carrito</button>
        <button onClick={() => navigate("/ordenes")} style={btnStyle}>📋 Órdenes</button>
        <button onClick={() => navigate("/favoritos")} style={btnStyle}>⭐ Favoritos</button>
        <button onClick={handleLogout} style={{ ...btnStyle, backgroundColor: "#dc3545", color: "white" }}>
          🚪 Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

const btnStyle = {
  background: "#ffffff",
  border: "1px solid #ccc",
  borderRadius: "5px",
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: "500",
};

export default ClienteMenu;
