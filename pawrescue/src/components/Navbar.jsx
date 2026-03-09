import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { volunteer, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/volunteer-login");
    };

    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">🐾 PawRescue</Link>
            </div>

            <ul className="navbar-links">
                <li><Link to="/" className={isActive("/")}>Home</Link></li>
                <li><Link to="/report" className={isActive("/report")}>Report</Link></li>

                {volunteer ? (
                    <>
                        <li>
                            <Link to="/volunteer" className={isActive("/volunteer")}>Dashboard</Link>
                        </li>
                        <li>
                            <span style={{
                                color: "var(--accent)",
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                padding: "8px 14px"
                            }}>
                                👤 {volunteer.name}
                            </span>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: "rgba(198,40,40,0.15)",
                                    color: "#ef5350",
                                    border: "1px solid rgba(198,40,40,0.35)",
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link
                            to="/volunteer-login"
                            style={{
                                background: "var(--accent)",
                                color: "#fff",
                                padding: "8px 18px",
                                borderRadius: "6px",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                boxShadow: "0 2px 10px var(--accent-glow)"
                            }}
                        >
                            Volunteer Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;