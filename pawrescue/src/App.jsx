import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Report from "./pages/Report";
import Volunteer from "./pages/Volunteer";
import VolunteerLogin from "./pages/VolunteerLogin";
import VolunteerRegister from "./pages/VolunteerRegister";
import RescueDetails from "./pages/RescueDetails";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<Report />} />
            <Route path="/rescue" element={<RescueDetails />} />
            <Route path="/volunteer-login" element={<VolunteerLogin />} />
            <Route path="/volunteer-register" element={<VolunteerRegister />} />
            <Route
              path="/volunteer"
              element={
                <ProtectedRoute>
                  <Volunteer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;