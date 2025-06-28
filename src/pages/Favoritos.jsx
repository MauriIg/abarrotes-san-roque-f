import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "./Catalogo.css"; // Reutilizamos estilos del catálogo

const Favoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerFavoritos = async () => {
      try {
        const res = await axiosInstance.get("/api/products");
        const soloFavoritos = res.data.filter((p) => p.favorito);
        setFavoritos(soloFavoritos);
      } catch (err) {
        console.error("Error al cargar favoritos:", err);
        setError("No se pudieron cargar los favoritos.");
      }
    };

    obtenerFavoritos();
  }, []);

  return (
    <div className="catalogo-container">
      <h1>⭐ Productos Favoritos</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {favoritos.length === 0 ? (
        <p>No tienes productos favoritos aún.</p>
      ) : (
        <div className="productos-grid">
          {favoritos.map((producto) => (
            <Link
              to={`/producto/${producto._id}`}
              key={producto._id}
              className="producto-card"
            >
              <span className="favorito">⭐</span>
              <img src={producto.imagen || "/placeholder.png"} alt={producto.nombre} />
              <h3>{producto.nombre}</h3>
              <p><strong>Precio:</strong> ${producto.precio}</p>
              <p><strong>Stock:</strong> {producto.stock}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
