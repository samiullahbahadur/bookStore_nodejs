import { useState } from "react";

export default function useAuthForm(initialValues, mode = "login") {
  const [formData, setFormData] = useState(initialValues);
  const [Errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};

    if (mode === "register") {
      // Register validation
      if (!formData.name?.trim()) tempErrors.name = "Name is required";
      if (!formData.username?.trim())
        tempErrors.username = "Username is required";
      if (!formData.email?.trim()) tempErrors.email = "Valid email is required";

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(formData.password || "")) {
        tempErrors.password =
          "Password must be at least 8 characters, include a letter, number, and special symbol";
      }
    } else if (mode === "update") {
      // Update validation: name & username required, others optional
      if (!formData.name?.trim()) tempErrors.name = "Name is required";
      if (!formData.username?.trim())
        tempErrors.username = "Username is required";

      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = "Valid email is required";
      }

      if (formData.password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          tempErrors.password =
            "Password must be at least 8 characters, include a letter, number, and special symbol";
        }
      }
    } else {
      // Login validation
      if (!formData.email?.trim()) tempErrors.email = "Valid email is required";
      if (!formData.password) tempErrors.password = "Password is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Remove error for the changed field
    if (Errors[name]) {
      setErrors({ ...Errors, [name]: "" });
    }
  };

  return {
    formData,
    setFormData,
    Errors,
    setErrors,
    handleChange,
    validate,
  };
}
