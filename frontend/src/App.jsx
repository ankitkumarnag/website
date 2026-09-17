import "./App.css";
import { Routes, Route } from "react-router";

import Home from "./pages/Home";
import HomeV2 from "./pages/HomeV2";
import LiveMap from "./pages/LiveMap";
import ReportComplaint from "./pages/ReportComplaint";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeV2 />} />

      <Route path="/map" element={<LiveMap />} />

      <Route path="/old-home" element={<Home />} />

      <Route
        path="/report"
        element={<ReportComplaint />}
      />

      <Route
        path="/track"
        element={<MyComplaints />}
      />

      <Route
        path="/complaints/:complaintId"
        element={<ComplaintDetails />}
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin-login"
        element={<AdminLogin />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />
    </Routes>
  );
}

export default App;