import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister/LoginRegister";
import Home from "./pages/home/Home";
import FeedbackDetail from "./pages/FeedbackDetails/FeedbackDetail";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ProtectedRoute from "./config/protectedRoutes";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/home" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
         <Route path="/feedback/:id" element={<ProtectedRoute> <FeedbackDetail /> </ProtectedRoute>} />
         <Route path="/admin" element={<ProtectedRoute> <AdminDashboard /> </ProtectedRoute>} />
        {/* redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
