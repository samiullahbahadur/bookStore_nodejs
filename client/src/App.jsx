import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clearNotification } from "./redux/notificationSlice";
import HomePage from "./pages/home/HomePage";
import CartPage from "./pages/carts/Cartpage";
import Auth from "./pages/authPage/Authpage";
import ProfilePage from "./pages/authPage/profilePage";
import ChangePassword from "./pages/authPage/changePassword";
import ForgotPassword from "./pages/authPage/forgotPassword";
import ResetPassword from "./pages/authPage/resetPassword";

import ProtectedRoute from "./components/protectedRoute";
import AdminRoute from "./pages/admin/AdminRoute";
import OrdersPage from "./pages/ordersPage/OdersPage";
import AddBooks from "./pages/books/AddBooks";
import UpdateBooks from "./pages/books/updateBook";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const App = () => {
  const dispatch = useDispatch();
  const { message, type } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (message) {
      if (type === "success") toast.success(message);
      if (type === "error") toast.error(message);
      dispatch(clearNotification()); // so it doesn't repeat
    }
  }, [message, type, dispatch]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

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
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/forgot-password"
            element={
              <ProtectedRoute>
                <ForgotPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute>
                <ResetPassword />
              </ProtectedRoute>
            }
          /> */}
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
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </>
  );
};

export default App;
