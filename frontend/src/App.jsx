// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UploadStudents from './pages/UploadStudents';
import GenerateSeating from './pages/GenerateSeating';
import RoomConfig from './pages/RoomConfig';
import AttendanceScanner from './pages/AttendanceScanner';
import StudentLookup from './pages/StudentLookup';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lookup" element={<StudentLookup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadStudents />} />
            <Route path="generate" element={<GenerateSeating />} />
            <Route path="rooms" element={<RoomConfig />} />
            <Route path="attendance" element={<AttendanceScanner />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}