import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "./authSlice";
import Header from "../../components/headers/Header";
import { setNotification } from "../../redux/notificationSlice";
import "./authPage.css";
import { useNavigate } from "react-router-dom";
import validateChangePassword from "../../hooks/changePasswordForm"; // ✅ import your validator

const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // clear error as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateChangePassword(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    dispatch(changePassword(formData))
      .unwrap()
      .then(() => {
        dispatch(
          setNotification({ message: "Password updated!", type: "success" })
        );
        navigate("/auth");
      })
      .catch((err) => {
        dispatch(setNotification({ message: err, type: "error" }));
      });
  };

  return (
    <>
      <Header />
      <div className="authPage">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit} className="authForm">
          {error && <span className="error">{error}</span>}

          <div className="formGroup">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
            />
            {errors.oldPassword && (
              <span className="error">{errors.oldPassword}</span>
            )}
          </div>

          <div className="formGroup">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
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
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;
