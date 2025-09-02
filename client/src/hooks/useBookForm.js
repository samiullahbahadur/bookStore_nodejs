import { useState } from "react";

const useBookForm = (initialValues, mode = "register") => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Frontend validation
  const validate = () => {
    const temp = {};
    const stockValue = Number(formData.stock);

    if (!formData.title?.trim()) temp.title = "Title is required!";
    if (!formData.description?.trim())
      temp.description = "Description is required!";
    if (!formData.price || parseFloat(formData.price) <= 0)
      temp.price = "Price must be positive!";
    if (!formData.author?.trim()) temp.author = "Author is required!";
    if (formData.stock === "" || isNaN(stockValue) || stockValue < 1) {
      temp.stock = "Stock must be greater than 0!";
    }

    // ✅ Photo validation
    if (!formData.photo) {
      temp.photo = "Photo is required!";
    } else if (typeof formData.photo === "object") {
      // if it's a File object (when uploading new)
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(formData.photo.type)) {
        temp.photo = "Only JPG or PNG images are allowed!";
      }
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] }); // store File object
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return { formData, errors, setFormData, setErrors, handleChange, validate };
};

export default useBookForm;
