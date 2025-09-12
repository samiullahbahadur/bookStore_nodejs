import "./HomePage.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/headers/Header";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetchBooks, deleteBook } from "../books/booksSlice";
import { addToCart, fetchCarts } from "../../redux/cartSlice";

import "./HomePage.css";
import { setNotification } from "../../redux/notificationSlice";

export const HomePage = () => {
  const [errors, setErrors] = useState("");
  const [bookToDelete, setBookToDelete] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: books, status, error } = useSelector((state) => state.books);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBooks());
    }
  }, [status, dispatch]);

  const handleDelete = (item) => {
    setBookToDelete(item);
  };

  const confirmDeleteBook = () => {
    if (!bookToDelete) return;
    dispatch(deleteBook(bookToDelete.id));
    dispatch(
      setNotification({
        message: "Book Deletee successful!",
        type: "success",
      })
    );
    setBookToDelete(null);
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "failed") return <p style={{ color: "red" }}>{error}</p>;

  const handleAddToCart = async (bookId) => {
    try {
      await dispatch(addToCart({ bookId, quantity: 1 })).unwrap();
      // await dispatch(fetchCarts()).unwrap();
      navigate("/carts");
    } catch (err) {
      console.error("Add to cart failed:", err);
      setErrors(err);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo)
      return "https://bookstore-nodejs-y9i7.onrender.com/placeholder.png";
    // remove any leading "uploads/" from the db value
    const fileName = photo.replace(/^uploads[\\/]/, "");
    return `https://bookstore-nodejs-y9i7.onrender.com/uploads/${fileName}?t=${Date.now()}`;
  };
  return (
    <div>
      <Header />
      <div className="grid">
        {books.map((item, index) => (
          <article className="product-item" key={item.id || index}>
            <header className="card__header">
              {user?.isAdmin ? (
                <h1
                  className="product__title"
                  style={{
                    color:
                      item.stock === 1 || item.stock === 0 ? "red" : "inherit",
                  }}
                >
                  {item.title}
                </h1>
              ) : (
                <h1 className="product__title">{item.title}</h1>
              )}
            </header>

            <div className="card__image">
              <img src={getPhotoUrl(item.photo)} alt={item.title} />
            </div>

            <div className="card__content">
              <h2 className="product__price"> $ {item.price}</h2>

              {user?.isAdmin && (
                <h2
                  className="product__stock"
                  style={{
                    color:
                      item.stock === 1 || item.stock === 0 ? "red" : "inherit",
                  }}
                >
                  Qty: {item.stock}
                </h2>
              )}

              <p className="product__description">{item.description}</p>
            </div>

            <div className="card__actions">
              {user?.isAdmin ? (
                <Link to={`/books/edit/${item.id}`} className="btn">
                  Edit
                </Link>
              ) : (
                <Link to="/books" className="btn">
                  Details
                </Link>
              )}

              {user?.isAdmin ? (
                <button
                  className="btn danger"
                  onClick={() => handleDelete(item)}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={() => handleAddToCart(item.id)}
                  disabled={item.stock <= 0}
                >
                  {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              )}

              {/* Confirmation Modal (only shows when bookToDelete is set) */}
              {bookToDelete && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>
                      Are you sure you want to delete "{bookToDelete.title}"?
                    </h3>
                    <div className="modal-buttons">
                      <button
                        className="btn danger"
                        onClick={confirmDeleteBook}
                      >
                        Yes
                      </button>
                      <button
                        className="btn"
                        onClick={() => setBookToDelete(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
