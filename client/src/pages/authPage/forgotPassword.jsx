import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "./authSlice";
import { setNotification } from "../../redux/notificationSlice";
import { useNavigate } from "react-router-dom";
import "./authPage.css";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(forgotPassword(email)).unwrap();
      dispatch(
        setNotification({
          message: "Reset password email sent! Check your inbox.",
          type: "success",
        })
      );
      setEmail("");
      navigate("/"); // optional: redirect after email sent
    } catch (err) {
      dispatch(
        setNotification({
          message: err || "Failed to send reset email",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="authPage-forgot">
      <h2>Forgot Password</h2>
      <form className="authForm" onSubmit={handleSubmit}>
        <div className="fromGroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="forgot-password-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
