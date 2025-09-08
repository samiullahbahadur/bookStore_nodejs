import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "./authSlice";
import "./authPage.css";

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  return (
    <div className="authPage">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="authForm">
        {error && <span className="error">{error}</span>}
        <div className="fromGroup">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your account email"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
