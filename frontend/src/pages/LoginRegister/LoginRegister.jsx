import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./LoginRegister.css";
import { setSecureItem } from "../../utils/secureStorage";
import { TOKEN_EXPIRY_SECONDS } from "../../config/constants";
const API_URL = process.env.REACT_APP_API_URL;

const LoginRegister = () => {
  const [tab, setTab] = useState("login"); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const url =
    tab === "register"
      ? `${API_URL}/auth/register`
      : `${API_URL}/auth/login`;

  const body =
    tab === "register"
      ? { name: formData.name, email: formData.email, password: formData.password }
      : { name: formData.name, password: formData.password };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");

    setMessage(`✅ ${tab === "register" ? "Registered" : "Logged in"} successfully!`);

    // Save token + role + name in localStorage (works for both login & register)
    if (data.token) {
      setSecureItem("token", data.token, TOKEN_EXPIRY_SECONDS);
      setSecureItem("role", data.role, TOKEN_EXPIRY_SECONDS);
      setSecureItem("userId", data.userId, TOKEN_EXPIRY_SECONDS);
      setSecureItem("userName", data.name, TOKEN_EXPIRY_SECONDS);
    }
  //console.log("Encrypted value in localStorage:", localStorage.getItem("token"));

    // Redirect
    setTimeout(() => {
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    }, 500);
  } catch (err) {
    setMessage(`❌ ${err.message}`);
  }
};


  return (
    <div className="login-register-container">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={tab === "login" ? "active" : ""}
          onClick={() => setTab("login")}
        >
          Login
        </button>
        <button
          className={tab === "register" ? "active" : ""}
          onClick={() => setTab("register")}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form className="form-container" onSubmit={handleSubmit}>
        {tab === "register" && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete={tab === "login" ? "username" : "name"}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </>
        )}

        {tab === "login" && (
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete={tab === "login" ? "username" : "name"}
          />
        )}

        <input
          type="password"
          name="password"
          placeholder="Your Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete={tab === "login" ? "current-password" : "new-password"} 
        />

        <button type="submit">
          {tab === "register" ? "Create Account" : "Login"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default LoginRegister;
