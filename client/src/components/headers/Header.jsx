import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../pages/authPage/authSlice";
import { Link } from "react-router-dom";
import "./Header.css";
const Header = () => {
  const dispatch = useDispatch();
  const navicate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    dispatch(logoutUser());
    navicate("/auth");
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
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;
