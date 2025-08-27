import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderStatus } from "../../redux/orderSlice";
import Header from "../../components/headers/Header";
import "./orderPage.css";
import apiClient from "../../api/apiClient";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.orders.items);
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);
  const user = useSelector((state) => state.auth.user);

  const [openUser, setOpenUser] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user]);

  const toggleUser = (name) => {
    setOpenUser((prev) => (prev === name ? null : name));
  };

  // invoice start

  const downloadInvoice = async (orderId) => {
    try {
      const response = await apiClient.get(`/invoice/${orderId}/pdf`, {
        responseType: "blob", // ✅ ensure it's binary
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Invoice download failed:", err);
      alert("Failed to download invoice");
    }
  };

  // invoice end

  if (!user) return <p>Loading user...</p>;
  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // 🔹 Split orders into Active & Canceled
  const activeOrders = items.filter(
    (o) => o.status === "pending" || o.status === "shipped"
  );
  const deliveredOrders = items.filter((o) => o.status === "delivered");
  const canceledOrders = items.filter((o) => o.status.includes("canceled"));

  // 🔹 Helper function to render grouped orders
  const renderOrders = (orders) => {
    const groupedOrders = {};
    orders.forEach((order) => {
      const userName = order.user?.name || "Unknown";
      if (!groupedOrders[userName]) groupedOrders[userName] = [];
      groupedOrders[userName].push(order);
    });

    return Object.entries(groupedOrders).map(([userName, userOrders]) => {
      const userTotal = userOrders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );

      return (
        <div key={userName}>
          <button id="btng" onClick={() => toggleUser(userName)}>
            <strong>{userName}</strong> — Total Spent: ${userTotal}
            <span>{openUser === userName ? "▲" : "▼"}</span>
          </button>

          {openUser === userName && (
            <ul className="cart__item-list">
              {userOrders.map((order) =>
                Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <li
                      className="cart__item_order"
                      key={`${order.orderId}-${item.orderItemId}`}
                    >
                      <p>Order No: {order.orderId}</p>

                      {/* STATUS */}
                      <p
                        style={{
                          color: order.status.includes("canceled")
                            ? "red"
                            : order.status === "delivered"
                            ? "green"
                            : "black",
                          fontWeight:
                            order.status.includes("canceled") ||
                            order.status === "delivered"
                              ? "bold"
                              : "normal",
                        }}
                      >
                        Status:
                        {user?.isAdmin ? (
                          <select
                            value={order.status}
                            disabled={order.status.includes("canceled")}
                            onChange={(e) =>
                              dispatch(
                                updateOrderStatus({
                                  orderId: order.orderId,
                                  status: e.target.value,
                                  paymentStatus: order.paymentStatus, // ✅ keep existing paymentStatus
                                })
                              )
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="canceled">Canceled</option>
                          </select>
                        ) : (
                          <span> {order.status}</span>
                        )}
                      </p>

                      {/* ADDRESS */}
                      {user?.isAdmin && (
                        <p>
                          Address:{" "}
                          {typeof order.shippingAddress === "string"
                            ? JSON.parse(order.shippingAddress).shippingAddress
                            : order.shippingAddress.shippingAddress ||
                              order.shippingAddress}
                        </p>
                      )}

                      {/* PAYMENT STATUS */}
                      {user?.isAdmin && (
                        <p>
                          Payment Status:{" "}
                          <select
                            value={order.paymentStatus}
                            onChange={(e) =>
                              dispatch(
                                updateOrderStatus({
                                  orderId: order.orderId,
                                  status: order.status, // ✅ keep existing status
                                  paymentStatus: e.target.value,
                                })
                              )
                            }
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        </p>
                      )}
                      {user?.isAdmin && (
                        <button onClick={() => downloadInvoice(order.orderId)}>
                          Download Invoice
                        </button>
                      )}

                      {/* ORDER ITEMS */}
                      <p>Title: {item.title}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price}</p>
                      <p>Total: ${item.totalPrice}</p>
                    </li>
                  ))
                ) : (
                  <p key={order.orderId}>No OrderItems Found</p>
                )
              )}
            </ul>
          )}
        </div>
      );
    });
  };

  return (
    <div>
      <Header />
      <h2>Your Orders</h2>
      <div className="cart_top">
        <h3>Active Orders</h3>
        {activeOrders.length > 0 ? (
          renderOrders(activeOrders)
        ) : (
          <p>No active orders</p>
        )}
        <h3>Delivered Orders</h3>
        {deliveredOrders.length > 0 ? (
          renderOrders(deliveredOrders)
        ) : (
          <p>No delivered orders</p>
        )}

        <h3>Canceled Orders</h3>
        {canceledOrders.length > 0 ? (
          renderOrders(canceledOrders)
        ) : (
          <p>No canceled orders</p>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
