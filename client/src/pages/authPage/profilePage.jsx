// src/pages/profile/ProfilePage.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "./authSlice";
import { setNotification } from "../../redux/notificationSlice";
import Header from "../../components/headers/Header";
import "./authPage.css";
import { Link, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "", // should work now
    email: user?.email || "",
    password: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    dispatch(updateProfile({ id: user.id, formData: data }))
      .unwrap()
      .then(() => {
        dispatch(
          setNotification({ message: "Profile updated!", type: "success" })
        );
        navigate("/");
      })
      .catch((err) => {
        dispatch(setNotification({ message: err, type: "error" }));
      });
  };

  console.log("User from Redux:", user);

  const getPhotoUrl = (photo) => {
    if (!photo) return "/placeholder.png"; // fallback image
    // remove any leading "uploads/" from the db value
    const fileName = photo.replace(/^uploads[\\/]/, "");
    return `http://localhost:5000/uploads/${fileName}?t=${Date.now()}`;
  };

  return (
    <>
      <Header />
      <div className="profilePage">
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit} className="profileForm">
          <div className="formGroup">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Profile Picture</label>
            <input type="file" name="photo" onChange={handleChange} />

            {user?.photo ? (
              <img
                src={getPhotoUrl(user.photo)}
                alt={user.title}
                style={{ width: "25px", borderRadius: "50%" }}
              />
            ) : (
              "no photo"
            )}
          </div>

          {/* Buttons at bottom */}
          <div className="profileActions">
            <button type="submit">Update Profile</button>
            <Link to="/" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfilePage;
