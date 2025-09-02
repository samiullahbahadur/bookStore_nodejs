import { React, useEffect, useState } from "react";
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

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-menu") && dropdownOpen) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

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
        {/* <button id="side-menu-toggle">Menu</button> */}

        <nav className="main-header__nav">
          <ul className="main-header__item-list">
            <li className="main-header__item">
              <Link to="/">Product</Link>
            </li>
            {user?.isAdmin && (
              <li className="main-header__item">
                <Link to="/add-book">Add Product</Link>
              </li>
            )}
            <li className="main-header__item">
              <Link to="/carts">Carts</Link>
            </li>
            <li className="main-header__item">
              <Link to="/orders">Orders</Link>
            </li>
            {user?.isAdmin && (
              <li className="main-header__item">
                <Link to="/admin">Admin Dashboard</Link>
              </li>
            )}
          </ul>

          <ul className="main-header__item-list">
            {!token ? (
              <li className="main-header__item">
                <Link to="/auth">Login</Link>
              </li>
            ) : (
              <li className="main-header__item user-menu">
                <div
                  className="user-info"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="username">{user?.name}</span>
                  <span className="dropdown-icon">▼</span>
                  &nbsp; &nbsp;
                  <img
                    src={
                      user?.photo ? getPhotoUrl(user.photo) : "/placeholder.png"
                    }
                    alt={user?.name}
                    className="user-photo"
                  />
                </div>

                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        to="/profile"
                        className="dropdown-link"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-link" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;
