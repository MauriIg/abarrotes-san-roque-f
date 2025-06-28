import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const esEmailValido = (email) => /\S+@\S+\.\S+/.test(email);
  const esPasswordValido = (password) => password.length >= 6;

  const manejarRegistro = async (e) => {
    e.preventDefault();

    if (!esEmailValido(email)) {
      setMensaje("❌ El correo electrónico no es válido.");
      return;
    }

    if (!esPasswordValido(password)) {
      setMensaje("❌ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const respuesta = await axios.post("http://localhost:5003/api/users/register", {
        nombre,
        email,
        password,
      });

      setMensaje(`✅ ${respuesta.data.mensaje}`);
      setNombre("");
      setPassword("");

      // Redirigir a la pantalla de verificación con el correo
      setTimeout(() => {
        navigate("/verify", { state: { email } });
      }, 1500);
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "❌ Error al registrar usuario");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
      <h2>Registro de Usuario</h2>

      {mensaje && (
        <p style={{ color: mensaje.includes("✅") ? "green" : "red" }}>{mensaje}</p>
      )}

      <form onSubmit={manejarRegistro}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Correo electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
