export const validateChangePassword = (formData) => {
  let errors = {};

  if (!formData.oldPassword) {
    errors.oldPassword = "Current password is required";
  }

  if (!formData.newPassword) {
    errors.newPassword = "New password is required";
  } else {
    // must match backend regex: at least 8 chars, 1 letter, 1 number, 1 special
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      errors.newPassword =
        "Password must be at least 8 characters, include a letter, number, and special symbol";
    }
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm your new password";
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export default validateChangePassword;
