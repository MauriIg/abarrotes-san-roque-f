// src/pages/PagoExitoso.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { vaciarCarrito } from "../redux/slices/carritoSlice";
import { useNavigate } from "react-router-dom";

const PagoExitoso = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar el carrito solo una vez
    dispatch(vaciarCarrito());

    // Redirigir a órdenes después de 3 segundos (opcional)
    const timer = setTimeout(() => {
      navigate("/ordenes");
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>✅ ¡Gracias por tu compra!</h2>
      <p>Tu pago fue exitoso y tu orden está siendo procesada.</p>
      <p>Redirigiendo a tus órdenes...</p>
    </div>
  );
};

export default PagoExitoso;
