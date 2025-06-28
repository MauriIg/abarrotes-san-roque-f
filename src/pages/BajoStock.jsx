import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const BajoStock = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleForms, setVisibleForms] = useState({});
  const [orders, setOrders] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const navigate = useNavigate();

  // Obtener productos con bajo stock y pedidos pendientes
  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await axiosInstance.get("/api/stock/bajo");
        const data = res.data;
        const formatted = Array.isArray(data) ? data : Object.values(data);
        setGroups(formatted);
      } catch (error) {
        console.error("Error fetching low stock products", error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingOrders = async () => {
      try {
        const res = await axiosInstance.get("/api/pedidos-proveedor/pendientes-revision");
        setPendingOrders(res.data);
      } catch (error) {
        console.error("Error fetching pending supplier orders", error);
        setPendingOrders([]);
      }
    };

    fetchLowStock();
    fetchPendingOrders();
  }, []);

  const toggleForm = (productId) => {
    setVisibleForms((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleOrderChange = (productId, field, value) => {
    setOrders((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSubmitOrder = async (productId, supplierId) => {
    const order = orders[productId];
    if (!order?.cantidad || !order?.metodoPago) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axiosInstance.post("/api/pedidos-proveedor", {
        proveedor: supplierId,
        productos: [{ producto: productId, cantidadSolicitada: Number(order.cantidad) }],
        metodoPago: order.metodoPago,
      });

      alert("Order submitted successfully.");
      setVisibleForms((prev) => ({ ...prev, [productId]: false }));
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Error submitting order.");
    }
  };

  const handleReviewOrder = async (orderId, action) => {
    try {
      await axiosInstance.put(`/api/pedidos-proveedor/revision/${orderId}`, {
        accion: action,
      });
      alert(`Order ${action}ed successfully.`);
      setPendingOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (error) {
      console.error("Error reviewing order:", error);
      alert("Error processing order.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Low Stock Products</h2>
      <button onClick={() => navigate("/products")} style={{ marginBottom: 20 }}>
        ← Back to products
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : groups.length === 0 ? (
        <p>No low stock products.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40 }}>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Product</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, i) =>
              Array.isArray(group.products) &&
              group.products.map((product, j) => (
                <tr key={`${i}-${j}`}>
                  <td>{group.supplier?.nombre || "No supplier"}</td>
                  <td>{product.nombre}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button onClick={() => toggleForm(product._id)}>
                      Create Order
                    </button>
                    {visibleForms[product._id] && (
                      <div style={{ marginTop: 10 }}>
                        <input
                          type="number"
                          placeholder="Quantity"
                          min="1"
                          value={orders[product._id]?.cantidad || ""}
                          onChange={(e) =>
                            handleOrderChange(product._id, "cantidad", e.target.value)
                          }
                        />
                        <select
                          value={orders[product._id]?.metodoPago || ""}
                          onChange={(e) =>
                            handleOrderChange(product._id, "metodoPago", e.target.value)
                          }
                          style={{ marginLeft: "10px" }}
                        >
                          <option value="">Select Payment</option>
                          <option value="efectivo">Cash</option>
                          <option value="transferencia">Bank Transfer</option>
                        </select>
                        <button
                          onClick={() =>
                            handleSubmitOrder(product._id, group.supplier?._id)
                          }
                          style={{ marginLeft: "10px" }}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <h2>Pending Supplier Orders for Review</h2>
      {pendingOrders.length === 0 ? (
        <p>No pending orders for review.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Products</th>
              <th>Method</th>
              <th>Prices</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.proveedor?.nombre}</td>
                <td>
                  <ul>
                    {order.productos.map((p) => (
                      <li key={p.producto._id}>
                        {p.producto.nombre} x {p.cantidadSolicitada}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{order.metodoPago}</td>
                <td>
                  <ul>
                    {order.productos.map((p) => (
                      <li key={p.producto._id}>
                        ${p.precioUnitario?.toFixed(2) || "N/A"} c/u
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button
                    onClick={() => handleReviewOrder(order._id, "aceptar")}
                    style={{ marginRight: 10 }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReviewOrder(order._id, "rechazar")}
                    style={{ backgroundColor: "#f44336", color: "white" }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BajoStock;
