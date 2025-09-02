import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById, updateBooks } from "./booksSlice";
// import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/headers/Header";
import "./Addbook.css";
import useBookForm from "../../hooks/useBookForm";
import { setNotification } from "../../redux/notificationSlice";

export const updateBook = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useSelector((s) => s.auth);
  const { currentBook, status, error } = useSelector((state) => state.books);

  const { formData, setFormData, errors, handleChange, validate } = useBookForm(
    {
      title: "",
      description: "",
      price: "",
      stock: "",
      author: "",
      photo: null,
    }
  );
  // local state for form
  // const [formData1, setFormData] = useState({});

  // fetch single book on load
  useEffect(() => {
    dispatch(fetchBookById(id));
  }, [id, dispatch]);

  // once book is loaded, pre-fill form
  useEffect(() => {
    if (currentBook) {
      setFormData({
        title: currentBook.title || "",
        description: currentBook.description || "",
        price: currentBook.price || "",
        stock: currentBook.stock || "",
        author: currentBook.author || "",
        photo: null, // keep null unless new image is chosen
      });
    }
  }, [currentBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("stock", formData.stock);
    fd.append("author", formData.author);
    if (formData.photo) {
      fd.append("image", formData.photo);
    }

    try {
      await dispatch(updateBooks({ id, formData: fd })).unwrap();
      dispatch(
        setNotification({
          message: "Book Updated successful!",
          type: "success",
        })
      );
      navigate("/");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return "/placeholder.png"; // fallback image
    // remove any leading "uploads/" from the db value
    const fileName = photo.replace(/^uploads[\\/]/, "");
    return `http://localhost:5000/uploads/${fileName}?t=${Date.now()}`;
  };

  if (status === "loading") return <p>Loading book...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!currentBook) return <p>Book not found</p>;

  return (
    <>
      <Header />
      <div className="pookPage">
        <h2>Update Book</h2>
        {/* {backendError && <p className="error">{backendError}</p>} */}
        {/* {error && <p className="error">{error}</p>} */}
        <form onSubmit={handleSubmit} className="bookForm">
          <div className="fromGroup">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className="fromGroup">
            <label htmlFor="photo">Product Picture</label>
            <input type="file" name="photo" onChange={handleChange} />
            {errors.photo && <span className="error">{errors.photo}</span>}
            {currentBook.photo && (
              <img
                src={getPhotoUrl(currentBook.photo)}
                alt={currentBook.title}
                style={{ width: "25px", borderRadius: "50%" }}
              />
            )}
          </div>

          <div className="fromGroup">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              name="price"
              id="price"
              step="0.01"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
            />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>
          <div className="fromGroup">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              name="stock"
              id="stock"
              value={formData.stock}
              onChange={handleChange}
            />
          </div>

          <div className="fromGroup">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              name="author"
              id="author"
              value={formData.author}
              onChange={handleChange}
            />
          </div>

          <div className="fromGroup">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              id="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          {/* Buttons at bottom */}
          <div className="profileActions_book_update">
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

export default updateBook;
