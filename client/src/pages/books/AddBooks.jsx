import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBook } from "./booksSlice";
import useBookForm from "../../hooks/useBookForm";
import { useNavigate } from "react-router-dom";
import Header from "../../components/headers/Header";
import "./Addbook.css";

const AddBooks = () => {
  const [backendError, setBackendError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);
  const { formData, errors, handleChange, validate } = useBookForm({
    title: "",
    description: "",
    price: "",
    stock: "",
    author: "",
    photo: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    if (!validate()) return;

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("description", formData.description.trim());
    payload.append("price", parseFloat(formData.price));
    payload.append("author", formData.author.trim());
    payload.append("stock", Number(formData.stock));
    // const photo = e.target.photo.files[0];

    if (formData.photo) {
      payload.append("photo", formData.photo);
    }

    try {
      await dispatch(addBook({ formData: payload, token })).unwrap();
      navigate("/");
    } catch (err) {
      if (err.errors) {
        setBackendError(err.errors.map((e) => e.message).join(", "));
      } else if (err.message) {
        setBackendError(err.message);
      } else {
        setBackendError("Unknown error");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="pookPage">
        <div className="bookContainer">
          <h3>Add New Book</h3>
          {backendError && <p className="error">{backendError}</p>}
          {/* {error && <p className="error">{error}</p>} */}
          <form onSubmit={handleSubmit}>
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
                placeholder="stock"
                value={formData.stock}
                onChange={handleChange}
              />
              {errors.stock && <span className="error">{errors.stock}</span>}
            </div>

            <div className="fromGroup">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                name="author"
                id="author"
                placeholder="Author"
                value={formData.author}
                onChange={handleChange}
              />
              {errors.author && <span className="error">{errors.author}</span>}
            </div>

            <div className="fromGroup">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={formData.description || ""}
                onChange={handleChange}
              />
              {errors.description && (
                <span className="error">{errors.description}</span>
              )}
            </div>

            <button type="submit">Add Book</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddBooks;
