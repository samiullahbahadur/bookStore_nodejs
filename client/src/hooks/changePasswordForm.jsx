import { useState } from "react";

export default function useChangePasswordForm(initialValues) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const validate = () => {
    let tempErrors = {};

    if (!formData.oldPassword)
      tempErrors.oldPassword = "Current password is required";

    if (!formData.newPassword) {
      tempErrors.newPassword = "New password is required";
    } else if (!passwordRegex.test(formData.newPassword)) {
      tempErrors.newPassword =
        "Password must be at least 8 characters, include a letter, number, and special symbol";
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // clear error on change
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  return { formData, errors, handleChange, validate };
}
