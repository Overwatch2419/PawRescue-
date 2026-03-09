import Navbar from "./Navbar";
import "../App.css";

function Layout({ children }) {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

export default Layout;