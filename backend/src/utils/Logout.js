export const Logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production, false in development
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Cross-origin for production
  });
  res.json({ message: "Logout successful" });
};
