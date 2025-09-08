import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "./authSlice";
import { setNotification } from "../../redux/notificationSlice";
import Header from "../../components/headers/Header";
import useAuthForm from "../../hooks/useAuthForm";
import "./authPage.css";
import { Link, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Use custom hook for form & validation (update mode)
  const { formData, handleChange, validate, Errors } = useAuthForm(
    {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      photo: null,
    },
    "update"
  );

  const [previewPhoto, setPreviewPhoto] = useState(
    user?.photo ? getPhotoUrl(user.photo) : null
  );

  function getPhotoUrl(photo) {
    if (!photo) return "/placeholder.png";
    const fileName = photo.replace(/^uploads[\\/]/, "");
    return `http://localhost:5000/uploads/${fileName}?t=${Date.now()}`;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleChange({ target: { name: "photo", value: file, files: [file] } });
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return; // stop if validation fails

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    dispatch(updateProfile({ id: user.id, formData: data }))
      .unwrap()
      .then((res) => {
        dispatch(
          setNotification({ message: "Profile updated!", type: "success" })
        );
        navigate("/auth");
      })
      .catch((err) => {
        console.error("Update failed:", err);
        dispatch(setNotification({ message: err, type: "error" }));
      });
  };

  return (
    <>
      <Header />
      <div className="profilePage">
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit} className="profileForm">
          {/* Name */}
          <div className="formGroup">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {Errors.name && <span className="error">{Errors.name}</span>}
          </div>

          {/* Username */}
          <div className="formGroup">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {Errors.username && (
              <span className="error">{Errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div className="formGroup">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {Errors.email && <span className="error">{Errors.email}</span>}
          </div>

          {/* Password */}
          {/* <div className="formGroup">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {Errors.password && (
              <span className="error">{Errors.password}</span>
            )}
          </div> */}

          {/* Profile Photo */}
          <div className="formGroup">
            <label>Profile Picture</label>
            <input type="file" name="photo" onChange={handlePhotoChange} />
            {previewPhoto ? (
              <img
                src={previewPhoto}
                alt={user?.name}
                style={{ width: "30px", borderRadius: "50%" }}
              />
            ) : (
              "No photo"
            )}
          </div>

          {/* Buttons */}
          <div className="profileActions">
            <button type="submit">Update </button>
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
