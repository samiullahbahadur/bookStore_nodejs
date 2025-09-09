import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword, clearAuthMessages } from "./authSlice";
import useChangePasswordForm from "../../hooks/changePasswordForm";
import { setNotification } from "../../redux/notificationSlice";
import "./authPage.css";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const { formData, errors, handleChange, validate } = useChangePasswordForm(
    {
      newPassword: "",
      confirmPassword: "",
    },
    false
  );

  const { loading, error, resetSuccess } = useSelector((state) => state.auth);

  // Watch for success or backend error and show notification / redirect
  useEffect(() => {
    if (resetSuccess) {
      dispatch(setNotification({ message: resetSuccess, type: "success" }));
      // clean up and redirect after a short delay
      setTimeout(() => {
        dispatch(clearAuthMessages());
        // ensure this path exists in your routes: '/auth' or '/login'
        navigate("/auth");
      }, 1200);
    } else if (error) {
      dispatch(setNotification({ message: error, type: "error" }));
      // optionally clear after some time
      setTimeout(() => dispatch(clearAuthMessages()), 3000);
    }
  }, [resetSuccess, error, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔹 Submit clicked");

    if (!validate()) {
      console.log("❌ Validation failed:", errors);
      return;
    }

    try {
      console.log("🔹 Dispatching resetPassword with token:", token);
      const result = await dispatch(
        resetPassword({ token, newPassword: formData.newPassword })
      ).unwrap();

      console.log("✅ resetPassword result:", result);

      dispatch(
        setNotification({
          message: result?.message || "Password updated!",
          type: "success",
        })
      );

      navigate("/login"); // use your actual login route
    } catch (err) {
      console.error("❌ Reset failed:", err);
      dispatch(
        setNotification({ message: err || "Reset failed", type: "error" })
      );
    }
  };

  return (
    <div className="authPage">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className="authForm">
        <div className="formGroup">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter your new password"
          />
          {errors.newPassword && (
            <span className="error">{errors.newPassword}</span>
          )}
        </div>

        <div className="formGroup">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
