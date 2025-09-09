import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "./authSlice";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      const result = await dispatch(
        resetPassword({ token, newPassword: formData.newPassword })
      ).unwrap();

      dispatch(
        setNotification({
          message: result?.message || "Password reseted!",
          type: "success",
        })
      );

      navigate("/auth"); // use your actual login route
    } catch (err) {
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
