function Button({ children, text, onClick, type = "button", variant = "primary", className = "", disabled = false }) {
    const combinedStyles = {
        ...styles.button,
        ...(variant === "primary" ? styles.primary : variant === "danger" ? styles.danger : styles.secondary),
        ...(disabled ? styles.disabled : {}),
    };

    return (
        <button 
            type={type} 
            style={combinedStyles} 
            onClick={onClick}
            className={`btn ${className}`}
            disabled={disabled}
        >
            {children || text}
        </button>
    );
}

const styles = {
    button: {
        border: "none",
        padding: "10px 18px",
        color: "white",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
    },
    primary: {
        background: "#ff9800",
    },
    secondary: {
        background: "#444",
    },
    danger: {
        background: "#c62828",
    },
    disabled: {
        opacity: 0.5,
        cursor: "not-allowed",
    }
};

export default Button;