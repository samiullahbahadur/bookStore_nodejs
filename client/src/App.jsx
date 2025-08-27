import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import CartPage from "./pages/carts/Cartpage";
import Auth from "./pages/authPage/Authpage";
import ProtectedRoute from "./components/protectedRoute";
import AdminRoute from "./pages/admin/AdminRoute";
import OrdersPage from "./pages/ordersPage/OdersPage";
import AddBooks from "./pages/books/AddBooks";
import UpdateBooks from "./pages/books/updateBook";
import AdminDashboard from "./pages/admin/AdminDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carts"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-book"
          element={
            <AdminRoute>
              <AddBooks />
            </AdminRoute>
          }
        />
        <Route
          path="/books/edit/:id"
          element={
            <AdminRoute>
              <UpdateBooks />
            </AdminRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* <Route path="*" element={<Navigate to="/auth" />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
