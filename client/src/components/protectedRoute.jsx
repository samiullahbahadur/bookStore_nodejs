// src/components/PrivateRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    // If not logged in, go to auth page
    return <Navigate to="/auth" replace />;
  }

  return children; // If logged in, show the page
};

export default ProtectedRoute;
