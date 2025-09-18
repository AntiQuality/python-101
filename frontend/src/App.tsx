import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Progress from "./pages/Progress";
import QuestionBank from "./pages/QuestionBank";
import Tutorial from "./pages/Tutorial";
import Welcome from "./pages/Welcome";

const App: React.FC = () => (
  <ModalProvider>
    <AuthProvider>
      <Layout>
        <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/tutorial/:slug?" element={<Tutorial />} />
        <Route path="/questions" element={<QuestionBank />} />
        <Route path="/questions/:slug" element={<QuestionBank />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  </ModalProvider>
);

export default App;
