import "./admindashboard.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBooks } from "../books/booksSlice";
import { fetchOrders } from "../../redux/orderSlice";
import Header from "../../components/headers/Header";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.items || []);
  const books = useSelector((state) => state.books.items || []);
  // const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchBooks());
  }, [dispatch]);

  if (!orders.length) return <div>Loading...</div>;

  // --- Filter orders ---
  const deliveredOrders = orders.filter(
    (o) => o.status === "delivered" || ("shipped" && o.paymentStatus === "paid")
  );

  const activeOrders = orders.filter((o) =>
    ["pending", "shipped"].includes(o.status)
  );

  // --- Stat cards ---
  const totalRevenue = deliveredOrders.reduce(
    (acc, o) => acc + o.totalPrice,
    0
  );
  const totalOrders = activeOrders.length;
  const totalProduct = books.length;
  const totalProductQuantity = books.reduce(
    (acc, produc) => acc + produc.stock,
    0
  );

  // Customers: unique users from all orders
  const totalCustomers = new Set(orders.map((o) => o.user.id)).size;

  // Products Sold: sum quantities from delivered orders
  const totalProductsSold = deliveredOrders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  // --- Revenue Trend (Line Chart) ---
  const revenuePerDay = {};
  deliveredOrders.forEach((o) => {
    const date = new Date(o.createdAt).toLocaleDateString();
    revenuePerDay[date] = (revenuePerDay[date] || 0) + o.totalPrice;
  });

  const sortedDates = Object.keys(revenuePerDay).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const revenueData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Revenue",
        data: sortedDates.map((d) => revenuePerDay[d]),
        borderColor: "#4f46e5",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // --- Top Products (Bar Chart) ---
  const productSales = {};
  deliveredOrders.forEach((order) => {
    order.items.forEach((item) => {
      productSales[item.title] =
        (productSales[item.title] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topProductsData = {
    labels: topProducts.map((p) => p[0]),
    datasets: [
      {
        label: "Quantity Sold",
        data: topProducts.map((p) => p[1]),
        backgroundColor: [
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#3b82f6",
          "#8b5cf6",
        ],
      },
    ],
  };

  // --- Orders by Status (Pie Chart) ---
  const statusCount = orders.reduce((acc, o) => {
    const status = o.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const ordersStatusData = {
    labels: Object.keys(statusCount),
    datasets: [
      {
        label: "Orders",
        data: Object.values(statusCount),
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  // --- Table grouped by user (all orders) ---
  const ordersByUser = orders.reduce((acc, o) => {
    const name = o.user.name;
    if (!acc[name]) acc[name] = { totalAmount: 0, status: [] };
    acc[name].totalAmount += o.totalPrice;
    acc[name].status.push(o.status);
    return acc;
  }, {});

  const tableData = Object.entries(ordersByUser).map(([user, info]) => ({
    user,
    totalAmount: info.totalAmount,
    status: [...new Set(info.status)].join(", "),
  }));
  console.log("Books from Redux:", books);

  return (
    <>
      <Header />
      <div className="dashboard">
        {/* Stat Cards */}
        <div className="stats-cards">
          <div className="card">
            <h3>Total Revenue</h3>
            <p>${totalRevenue}</p>
          </div>
          <div className="card">
            <h3>Active Orders</h3>
            <p>{totalOrders}</p>
          </div>
          <div className="card">
            <h3>Customers</h3>
            <p>{totalCustomers}</p>
          </div>
          <div className="card">
            <h3>Product</h3>
            <p>{totalProduct}</p>
          </div>
          <div className="card">
            <h3>Product Qty</h3>
            <p>{totalProductQuantity}</p>
          </div>
          <div className="card">
            <h3>Products Sold</h3>
            <p>{totalProductsSold}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts">
          <div className="chart">
            <h4>Revenue Trend</h4>
            <Line data={revenueData} />
          </div>
          <div className="chart">
            <h4>Top Products</h4>
            <Bar data={topProductsData} />
          </div>
          <div className="chart">
            <h4>Orders by Status</h4>
            <Pie data={ordersStatusData} />
          </div>
        </div>

        {/* Orders Table */}
        <div className="recent-orders">
          <h3>Orders by User</h3>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.user}>
                  <td>{row.user}</td>
                  <td>${row.totalAmount}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
