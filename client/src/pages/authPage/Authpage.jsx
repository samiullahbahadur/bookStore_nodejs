import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { loginUser, registerUser } from "./authSlice";
import useAuthForm from "../../hooks/useAuthForm";

import { useNavigate, Link } from "react-router-dom";
import "./authPage.css";
import { setNotification } from "../../redux/notificationSlice";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, errors } = useSelector((state) => state.auth);

  const { formData, Errors, handleChange, validate } = useAuthForm(
    {
      name: "",
      username: "",
      email: "",
      password: "",
    },
    isRegister ? "register" : "login"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const formData = new FormData(e.target);

    // const data = Object.fromEntries(formData);
    try {
      if (isRegister) {
        await dispatch(registerUser(formData)).unwrap();
        // .then(() => setIsRegister(false));
        dispatch(
          setNotification({
            message: "Registered successfully!",
            type: "success",
          })
        );
      } else {
        await dispatch(loginUser(formData))
          .unwrap()
          .then((data) => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch(
              setNotification({ message: "Login successful!", type: "success" })
            );
            navigate("/");
          }); // <-- wait for result
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="authPage">
      <h2> {isRegister ? "Create an Acount" : "Login to your Acount"}</h2>
      {/* {isRegister ? ( */}
      <form key="register" onSubmit={handleSubmit} className="authForm">
        {error && <span className="error">{error}</span>}
        {errors && <span className="error">{errors}</span>}
        {isRegister && (
          <>
            <div className="fromGroup">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
              />

              {Errors.name && <sapn className="error">{Errors.name}</sapn>}
            </div>
            <div className="fromGroup">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="name"
                value={formData.uername}
                onChange={handleChange}
              />
              {Errors.username && (
                <sapn className="error">{Errors.username}</sapn>
              )}
            </div>
          </>
        )}
        <div className="fromGroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            id="email"
            value={formData.email}
            onChange={handleChange}
          />
          {Errors.email && <span className="error">{Errors.email}</span>}
        </div>
        <div className="fromGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {Errors.password && <sapn className="error">{Errors.password}</sapn>}
        </div>

        {isRegister && (
          <div className="fromGroup">
            <label htmlFor="photo">Profile Picture</label>
            <input type="file" name="photo" />
          </div>
        )}

        <div className="profileActions_auth">
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
          <p onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? (
              <>
                Already have an account? <b>Login</b>
              </>
            ) : (
              <>
                Don't have an account? <b>Register</b>
              </>
            )}
          </p>
        </div>
        <div className="forgot-link">
          {!isRegister && <Link to="/forgot-password">Forgot Password?</Link>}
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
