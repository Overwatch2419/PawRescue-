import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VolunteerRegister() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) {
            return setError("Passwords do not match");
        }
        if (form.password.length < 6) {
            return setError("Password must be at least 6 characters");
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            navigate("/volunteer");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-icon">🐾</div>
                <h2>Join as Volunteer</h2>
                <p className="auth-subtitle">Help rescue animals in your area</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="volunteer@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Min. 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirm"
                            placeholder="Repeat password"
                            value={form.confirm}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <div className="status-message error">{error}</div>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Register →"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/volunteer-login">Login here</Link>
                </p>
            </div>
        </div>
    );
}
