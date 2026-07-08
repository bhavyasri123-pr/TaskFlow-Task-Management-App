import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validators/authValidator.js";

export const register = (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return next(err);

      if (result.length > 0) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query("INSERT INTO users(name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (insertErr) => {
          if (insertErr) return next(insertErr);
          return res.status(201).json({ success: true, message: "User Registered Successfully" });
        });
      } catch (hashErr) {
        return next(hashErr);
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const login = (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return next(err);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      try {
        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Invalid Password" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.status(200).json({
          success: true,
          message: "Login Successful",
          token,
          user: { id: user.id, name: user.name, email: user.email },
        });
      } catch (loginErr) {
        return next(loginErr);
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getProfile = (req, res, next) => {
  db.query("SELECT id,name,email FROM users WHERE id=?", [req.user.id], (err, result) => {
    if (err) return next(err);
    return res.json({ success: true, user: result[0] });
  });
};

export const updateProfile = (req, res, next) => {
  try {
    const { name } = updateProfileSchema.parse(req.body);

    db.query("UPDATE users SET name=? WHERE id=?", [name, req.user.id], (err) => {
      if (err) return next(err);

      return res.json({
        success: true,
        message: "Profile updated successfully",
        user: { id: req.user.id, name, email: req.user.email },
      });
    });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    db.query("SELECT password FROM users WHERE id=?", [req.user.id], async (err, result) => {
      if (err) return next(err);

      if (result.length === 0) {
        return res.status(500).json({ success: false, message: "Unable to verify current password" });
      }

      try {
        const isMatch = await bcrypt.compare(currentPassword, result[0].password);

        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query("UPDATE users SET password=? WHERE id=?", [hashedPassword, req.user.id], (updateErr) => {
          if (updateErr) return next(updateErr);
          return res.json({ success: true, message: "Password changed successfully" });
        });
      } catch (passwordErr) {
        return next(passwordErr);
      }
    });
  } catch (error) {
    return next(error);
  }
};
