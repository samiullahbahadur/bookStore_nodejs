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
    } else {
      // Login validation
      if (!formData.email?.trim()) tempErrors.email = "Valid email is required";
      if (!formData.password) tempErrors.password = "Password is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Remove error for the changed field
    if (Errors[e.target.name]) {
      setErrors({ ...Errors, [e.target.name]: "" });
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
