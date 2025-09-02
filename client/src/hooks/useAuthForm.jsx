import { useState } from "react";

export default function useAuthForm(initialValues, mode = "login") {
  const [formData, setFormData] = useState(initialValues);
  const [Errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};

    if (mode === "register") {
      if (!formData.name?.trim()) tempErrors.name = "Name is required";
      if (!formData.username?.trim())
        tempErrors.username = "Username is required";
      if (!formData.email?.trim()) tempErrors.email = "Valid email is required";

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(formData.password || "")) {
        tempErrors.password =
          "Password must be at least 8 characters, include a letter, number, and special symbol";
      }
      // photo optional
    }

    if (mode === "login") {
      if (!formData.email?.trim()) tempErrors.email = "Valid email is required";
      if (!formData.password) tempErrors.password = "Password is required";
    }

    if (mode === "update") {
      if (!formData.name?.trim()) tempErrors.name = "Name is required";
      if (!formData.username?.trim())
        tempErrors.username = "Username is required";

      // Email optional, but if provided must be valid
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = "Valid email is required";
      }

      // Password optional, but if provided must be strong
      if (formData.password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          tempErrors.password =
            "Password must be at least 8 characters, include a letter, number, and special symbol";
        }
      }
      // photo optional
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

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
