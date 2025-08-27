import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />; // Redirect to home if not admin
  }

  return children;
};

export default AdminRoute;
