import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true,
    // For cross-site (separate frontend/backend domains) cookies must be SameSite=None and Secure
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  return token;
};
