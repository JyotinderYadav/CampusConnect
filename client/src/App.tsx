import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";

// Common & Auth
import { LandingPage } from "./pages/common/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { NotificationPage } from "./pages/common/NotificationPage";
import { UnauthorizedPage, NotFoundPage } from "./pages/common/UnauthorizedPage";

// Student
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { DriveListingPage } from "./pages/student/DriveListingPage";
import { DriveDetailPage } from "./pages/student/DriveDetailPage";
import { StudentApplicationsPage } from "./pages/student/StudentApplicationsPage";
import { StudentProfilePage } from "./pages/student/StudentProfilePage";
import { ResumeVaultPage } from "./pages/student/ResumeVaultPage";

// Admin
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminDrivesPage } from "./pages/admin/AdminDrivesPage";
import { AdminApplicationsPage } from "./pages/admin/AdminApplicationsPage";
import { AdminStudentsPage } from "./pages/admin/AdminStudentsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";

// Recruiter
import { RecruiterDashboard } from "./pages/recruiter/RecruiterDashboard";
import { RecruiterCandidatesPage } from "./pages/recruiter/RecruiterCandidatesPage";
import { RecruiterProfilePage } from "./pages/recruiter/RecruiterProfilePage";

const queryClient = new QueryClient();

// Dynamic role-based redirect
const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === "PLACEMENT_OFFICER") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "RECRUITER") return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Student Protected */}
            <Route element={<Layout allowedRoles={["STUDENT"]} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/drives" element={<DriveListingPage />} />
              <Route path="/student/drives/:id" element={<DriveDetailPage />} />
              <Route path="/student/applications" element={<StudentApplicationsPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />
              <Route path="/student/resumes" element={<ResumeVaultPage />} />
            </Route>

            {/* Placement Officer Protected */}
            <Route element={<Layout allowedRoles={["PLACEMENT_OFFICER"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/drives" element={<AdminDrivesPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/students" element={<AdminStudentsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/announcements" element={<AdminSettingsPage />} />
            </Route>

            {/* Recruiter Protected */}
            <Route element={<Layout allowedRoles={["RECRUITER"]} />}>
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/drives" element={<AdminDrivesPage />} />
              <Route path="/recruiter/candidates" element={<RecruiterCandidatesPage />} />
              <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
            </Route>

            {/* Common Authenticated */}
            <Route element={<Layout />}>
              <Route path="/notifications" element={<NotificationPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
