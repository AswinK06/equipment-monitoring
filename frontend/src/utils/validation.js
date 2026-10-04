export function validateRegistration(values = {}) {
  const errors = {};
  const name = (values.name || "").trim();
  const email = (values.email || "").trim();
  const password = values.password || "";
  const confirmPassword = values.confirmPassword || "";

  if (!name || name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    errors.password = "Password must be at least 8 characters and contain a letter and a number.";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
