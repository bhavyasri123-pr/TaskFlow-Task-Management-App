import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import "../styles/register.css";
import Loader from "../components/Loader";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const isStrongPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      toast.error("Password must be 8+ characters with letters, numbers, and a special character");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

      const res = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success(res.data.message || "Registration successful");

      navigate("/login");

    } catch (error) {

      toast.error(error.response?.data?.message || "Registration Failed");

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="register-page">

      <div className="register-left">

        <h1>TaskFlow</h1>

        <h2>Create Your Account</h2>

        <p>
          Organize your work, track your progress,
          and manage tasks effortlessly.
        </p>

        <ul>
          <li>Create Unlimited Tasks</li>
          <li>Track Task Progress</li>
          <li>Secure User Authentication</li>
          <li>Responsive Dashboard</li>
        </ul>

      </div>

      <div className="register-right">

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          <h2>Register</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password (letters, numbers, special character)"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader text="Creating..." compact /> : "Create Account"}
          </button>

          <p>

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </p>

        </form>

      </div>

    </div>

  );
}

export default Register;


