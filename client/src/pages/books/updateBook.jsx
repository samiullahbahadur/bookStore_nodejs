// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchBookById, updateBooks } from "./booksSlice";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import Header from "../../components/headers/Header";
// import "./Addbook.css";
// import useBookForm from "../../hooks/useBookForm";
// import { setNotification } from "../../redux/notificationSlice";

// const UpdateBook = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const { currentBook, status, error } = useSelector((state) => state.books);

//   const { formData, setFormData, errors, handleChange, validate } = useBookForm(
//     {
//       title: "",
//       description: "",
//       price: "",
//       stock: "",
//       author: "",
//       photo: null,
//     },
//     "update" // ✅ photo optional on update
//   );

//   // fetch single book on load
//   useEffect(() => {
//     dispatch(fetchBookById(id));
//   }, [id, dispatch]);

//   // once book is loaded, pre-fill form
//   useEffect(() => {
//     if (currentBook) {
//       setFormData({
//         title: currentBook.title || "",
//         description: currentBook.description || "",
//         price: currentBook.price || "",
//         stock: currentBook.stock || "",
//         author: currentBook.author || "",
//         photo: null, // keep null unless user uploads new
//       });
//     }
//   }, [currentBook, setFormData]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     const fd = new FormData();
//     fd.append("title", formData.title);
//     fd.append("description", formData.description);
//     fd.append("price", formData.price);
//     fd.append("stock", formData.stock);
//     fd.append("author", formData.author);
//     if (formData.photo) {
//       fd.append("image", formData.photo); // ✅ must match backend
//     }

//     try {
//       await dispatch(updateBooks({ id, formData: fd })).unwrap();
//       dispatch(
//         setNotification({
//           message: "Book updated successfully!",
//           type: "success",
//         })
//       );
//       navigate("/");
//     } catch (err) {
//       console.error("Update failed:", err);
//     }
//   };

//   const getPhotoUrl = (photo) => {
//     if (!photo) return "/placeholder.png"; // fallback image
//     const fileName = photo.replace(/^uploads[\\/]/, "");
//     return `http://localhost:5000/uploads/${fileName}`;
//   };

//   if (status === "loading") return <p>Loading book...</p>;
//   if (error) return <p className="error">{error}</p>;
//   if (!currentBook) return <p>Book not found</p>;

//   return (
//     <>
//       <Header />
//       <div className="pookPage">
//         <h2>Update Book</h2>
//         <form onSubmit={handleSubmit} className="bookForm">
//           <div className="fromGroup">
//             <label htmlFor="title">Title</label>
//             <input
//               type="text"
//               name="title"
//               id="title"
//               placeholder="Title"
//               value={formData.title}
//               onChange={handleChange}
//             />
//             {errors.title && <span className="error">{errors.title}</span>}
//           </div>

//           <div className="fromGroup">
//             <label htmlFor="photo">Product Picture</label>
//             <input type="file" name="photo" onChange={handleChange} />
//             {errors.photo && <span className="error">{errors.photo}</span>}
//             {currentBook.photo && !formData.photo && (
//               <img
//                 src={getPhotoUrl(currentBook.photo)}
//                 alt={currentBook.title}
//                 style={{ width: "50px", borderRadius: "5px", marginTop: "8px" }}
//               />
//             )}
//           </div>

//           <div className="fromGroup">
//             <label htmlFor="price">Price</label>
//             <input
//               type="number"
//               name="price"
//               id="price"
//               step="0.01"
//               placeholder="Price"
//               value={formData.price}
//               onChange={handleChange}
//             />
//             {errors.price && <span className="error">{errors.price}</span>}
//           </div>

//           <div className="fromGroup">
//             <label htmlFor="stock">Stock</label>
//             <input
//               type="number"
//               name="stock"
//               id="stock"
//               value={formData.stock}
//               onChange={handleChange}
//             />
//             {errors.stock && <span className="error">{errors.stock}</span>}
//           </div>

//           <div className="fromGroup">
//             <label htmlFor="author">Author</label>
//             <input
//               type="text"
//               name="author"
//               id="author"
//               value={formData.author}
//               onChange={handleChange}
//             />
//             {errors.author && <span className="error">{errors.author}</span>}
//           </div>

//           <div className="fromGroup">
//             <label htmlFor="description">Description</label>
//             <textarea
//               name="description"
//               id="description"
//               rows="3"
//               value={formData.description}
//               onChange={handleChange}
//             />
//             {errors.description && (
//               <span className="error">{errors.description}</span>
//             )}
//           </div>

//           <div className="profileActions_book_update">
//             <button type="submit">Update Book</button>
//             <Link to="/" className="btn-secondary">
//               Cancel
//             </Link>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// };

// export default UpdateBook;
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById, updateBooks } from "./booksSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/headers/Header";
import "./Addbook.css";
import useBookForm from "../../hooks/useBookForm";
import { setNotification } from "../../redux/notificationSlice";

const UpdateBook = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentBook, status, error } = useSelector((state) => state.books);

  const { formData, setFormData, errors, handleChange, validate } = useBookForm(
    {
      title: "",
      description: "",
      price: "",
      stock: "",
      author: "",
      photo: null,
    },
    "update" // ✅ photo optional on update
  );

  // ✅ state for previewing new photo
  const [preview, setPreview] = useState(null);

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
        photo: null,
      });
      setPreview(null); // reset preview
    }
  }, [currentBook, setFormData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file)); // ✅ live preview
    }
  };

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
      fd.append("photo", formData.photo); // ✅ must match backend
    }

    try {
      await dispatch(updateBooks({ id, formData: fd })).unwrap();
      dispatch(
        setNotification({
          message: "Book updated successfully!",
          type: "success",
        })
      );
      navigate("/");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return "/placeholder.png";
    const fileName = photo.replace(/^uploads[\\/]/, "");
    return `http://localhost:5000/uploads/${fileName}`;
  };

  if (status === "loading") return <p>Loading book...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!currentBook) return <p>Book not found</p>;

  return (
    <>
      <Header />
      <div className="pookPage">
        <h2>Update Book</h2>
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
            <input type="file" name="photo" onChange={handleFileChange} />
            {errors.photo && <span className="error">{errors.photo}</span>}

            {/* ✅ Preview selected new image */}
            {preview ? (
              <img
                src={preview}
                alt="New preview"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "15px",
                 
                }}
              />
            ) : (
              currentBook.photo && (
                <img
                  src={getPhotoUrl(currentBook.photo)}
                  alt={currentBook.title}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "15px",
                   
                   
                  }}
                />
              )
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
            {errors.stock && <span className="error">{errors.stock}</span>}
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
            {errors.author && <span className="error">{errors.author}</span>}
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
            {errors.description && (
              <span className="error">{errors.description}</span>
            )}
          </div>

          <div className="profileActions_book_update">
            <button type="submit">Update Book</button>
            <Link to="/" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateBook;
