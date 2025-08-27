import "./Cartpage.css";
import Header from "../../components/headers/Header";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCarts,
  deleteCartItem,
  updateCartQuantity,
  updateCartQuantityLocal,
} from "../../redux/cartSlice";
import { createOrder, fetchOrders } from "../../redux/orderSlice";
import { useNavigate } from "react-router-dom";

export const Cartpage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const carts = useSelector((state) => state.cart.carts || []);
  const user = useSelector((state) => state.auth.user);
  const {
    loading: orderLoading,
    error: orderError,
    order,
  } = useSelector((state) => state.orders);

  const [shippingAddress, setShippingAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  useEffect(() => {
    if (user) {
      dispatch(fetchCarts());
    }
  }, [dispatch, user]);

  // const handleClearCart = (cartItemId) => {
  //   if (!cartItemId) return;
  //   dispatch(deleteCartItem(cartItemId));
  // };
  const handleClearCart = (cartItemId) => {
    setConfirmDelete({ show: true, id: cartItemId });
  };

  const handleCreateOrder = async () => {
    if (!shippingAddress) {
      alert("Please enter a shipping address before confirming");
    }
    try {
      await dispatch(
        createOrder({ shippingAddress: String(shippingAddress) })
      ).unwrap(); // create order in backend
      dispatch(fetchOrders()); // refresh orders so OrdersPage updates automatically
      navigate("/orders");
    } catch (err) {
      console.error("Order creation failed:", err);
    }
  };
  const handleDecrease = (item) => {
    const newQty = item.quantity - 1;
    if (newQty >= 1) {
      dispatch(
        updateCartQuantityLocal({
          cartItemId: item.cartItemId,
          quantity: newQty,
        })
      );
      dispatch(
        updateCartQuantity({ cartItemId: item.cartItemId, quantity: newQty })
      );
    } else {
      dispatch(deleteCartItem(item.cartItemId));
    }
  };

  const handleIncrease = (item) => {
    const newQty = item.quantity + 1;
    dispatch(
      updateCartQuantityLocal({ cartItemId: item.cartItemId, quantity: newQty })
    );
    dispatch(
      updateCartQuantity({ cartItemId: item.cartItemId, quantity: newQty })
    );
  };

  if (!user) return <p>Loading user...</p>;
  if (!carts || carts.length === 0) return <p>No carts items</p>;

  return (
    <div>
      <Header />
      <div className="cart_top">
        {carts.map((cart) => (
          <div key={cart.cartId}>
            <ul className="cart__item-list">
              <h3> {cart.userName || "Unknown"}'s Cart</h3>

              {cart.items && cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <li className="cart__item" key={item.cartItemId}>
                    <h1> Title: {item.title} </h1>
                    <h2>Quantity: {item.quantity}</h2>

                    <button
                      className="btn_in_de"
                      onClick={() => handleDecrease(item)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <button
                      className="btn_in_de"
                      onClick={() => handleIncrease(item)}
                    >
                      +
                    </button>
                    <h2>Price: ${item.price}</h2>
                    <h2>Total: ${item.quantity * item.price}</h2>
                    <button
                      className="btn danger"
                      onClick={() => handleClearCart(item.cartItemId)}
                    >
                      Remove
                    </button>
                    {confirmDelete.show && (
                      <div className="modal-overlay">
                        <div className="modal">
                          <h3>
                            Are you sure you want to delete {item.title} item?
                          </h3>
                          <div className="modal-buttons">
                            <button
                              className="btn danger"
                              onClick={() => {
                                dispatch(deleteCartItem(confirmDelete.id));
                                setConfirmDelete({ show: false, id: null });
                              }}
                            >
                              Delete
                            </button>
                            <button
                              className="btn"
                              onClick={() =>
                                setConfirmDelete({ show: false, id: null })
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <p>No cart items </p>
              )}
            </ul>

            {/* 🔹 Shipping Address Form */}
            {showAddressForm ? (
              <div className="address-form">
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your shipping address"
                  rows="3"
                  style={{ width: "100%" }}
                />
                <button
                  type="submit"
                  className="btn"
                  onClick={handleCreateOrder}
                  disabled={orderLoading}
                >
                  {orderLoading ? "Creating Order..." : "Confirm Order"}
                </button>
                <button
                  className="btn danger"
                  onClick={() => setShowAddressForm(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="centered">
                <button
                  type="submit"
                  className="btn"
                  onClick={() => setShowAddressForm(true)}
                >
                  Order Now!
                </button>
                {orderError && <p style={{ color: "red" }}>{orderError}</p>}
              </div>
            )}
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cartpage;
