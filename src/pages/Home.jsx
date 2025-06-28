import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Importa los estilos CSS

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Bienvenido a tienda San Roque</h1>
      <p className="home-description">
        tienda que ofrece multiples productos
      </p>
      <Link to="/login" className="home-button">
        INICIO
      </Link>
    </div>
  );
};

export default Home;
