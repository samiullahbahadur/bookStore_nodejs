import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "./authSlice";
import "./authPage.css";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(changePassword(formData));
  };

  return (
    <div className="authPage">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit} className="authForm">
        {error && <span className="error">{error}</span>}
        <div className="fromGroup">
          <label>Old Password</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
          />
        </div>
        <div className="fromGroup">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
