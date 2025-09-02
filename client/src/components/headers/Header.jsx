import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../pages/authPage/authSlice";
import { Link } from "react-router-dom";
import { setNotification } from "../../redux/notificationSlice";
import "./Header.css";
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    dispatch(logoutUser());
    dispatch(
      setNotification({
        message: "Logged out successfully!",
        type: "success",
      })
    );
    navigate("/auth");
  };
  const getPhotoUrl = (photo) => {
    if (!photo) return "/placeholder.png"; // fallback image
    // remove any leading "uploads/" from the db value
    const fileName = photo.replace(/^uploads[\\/]/, "");
    return `http://localhost:5000/uploads/${fileName}?t=${Date.now()}`;
  };

  return (
    <div>
      <header className="main-header">
        <button id="side-menu-toggle">Menu</button>
        <nav className="main-header__nav">
          <ul className="main-header__item-list">
            <li className="main-header__item"></li>
            <li className="main-header__item">
              <Link to="/">Product</Link>
            </li>

            <li className="main-header__item">
              {user && user?.isAdmin && (
                <Link to="/add-book"> Add Product</Link>
              )}
            </li>

            <li className="main-header__item">
              <Link to="/carts">Carts</Link>
            </li>

            <li className="main-header__item">
              <Link to="/orders">Orders</Link>
            </li>
            <li className="main-header__item">
              {user && user?.isAdmin && (
                <Link to="/admin">Admin Dashboard</Link>
              )}
            </li>
          </ul>
          <ul className="main-header__item-list">
            {!token ? (
              <li className="main-header__item">
                <Link to="/auth">Login</Link>
              </li>
            ) : (
              <>
                <li className="main-header__item">
                  <span className="username">Welcome, {user?.name}</span>
                </li>
                <li className="main-header__item">
                  {user.photo ? (
                    <img
                      src={getPhotoUrl(user.photo)}
                      alt={user.name}
                      style={{ width: "20px", borderRadius: "50%" }}
                    />
                  ) : (
                    "Photo"
                  )}
                </li>
                {/* <select>
                  <option></option>
                  <option> */}
                <li className="main-header__item">
                  <Link to="/profile">Profile</Link>
                </li>
                {/* </option>
                  <option> */}
                <li className="main-header__item">
                  <button onClick={handleLogout}>Logout</button>
                </li>
                {/* </option>
                </select> */}
              </>
            )}
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;
