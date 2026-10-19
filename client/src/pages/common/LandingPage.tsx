import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Building,
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/Button";

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email: string, pass: string, targetPath: string) => {
    try {
      await login(email, pass);
      navigate(targetPath);
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">PlaceHub</span>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase block -mt-1">Smart Campus</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (user.role === "PLACEMENT_OFFICER") navigate("/admin/dashboard");
                  else if (user.role === "RECRUITER") navigate("/recruiter/dashboard");
                  else navigate("/student/dashboard");
                }}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mx-auto mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Campus Recruitment Management
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Centralize Campus Placements for <span className="text-indigo-600">Students</span>, <span className="text-slate-800">TPO</span> & <span className="text-indigo-600">Recruiters</span>
        </h1>

        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
          Automated eligibility verification, real-time interview pipeline tracking, multi-tier offer governance, and institutional placement analytics in one unified platform.
        </p>

        {/* Quick Demo Access Bar */}
        <div className="mt-10 p-6 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" /> 1-Click Demo Login Experience
            </span>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live Database Seeded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickLogin("admin@placehub.dev", "Admin@123456", "/admin/dashboard")}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group"
            >
              <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700 flex items-center justify-between">
                Placement Officer <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Full institutional dashboard, analytics & drive control</p>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">admin@placehub.dev</span>
            </button>

            <button
              onClick={() => handleQuickLogin("student1@example.com", "Student@123", "/student/dashboard")}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group"
            >
              <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700 flex items-center justify-between">
                Student (Aarav) <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Eligible drives, resume vault & application tracker</p>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">student1@example.com</span>
            </button>

            <button
              onClick={() => handleQuickLogin("recruiter@techcorp.com", "Recruiter@123", "/recruiter/dashboard")}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group"
            >
              <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700 flex items-center justify-between">
                Recruiter (TechCorp) <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Manage pipeline, review candidates & stage advances</p>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">recruiter@techcorp.com</span>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900">Deterministic Eligibility Engine</h3>
            <p className="text-sm text-slate-500 mt-2">
              Evaluates CGPA, Class 10/12, branch, active backlogs, backlog history, and required skill matching before permitting student application submissions.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900">Institutional Analytics & Reports</h3>
            <p className="text-sm text-slate-500 mt-2">
              Calculates placed percentage with explicit denominators, branch-wise distribution, median/highest CTC, and instant CSV exports for accreditation.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900">Multi-Stage Recruitment Pipeline</h3>
            <p className="text-sm text-slate-500 mt-2">
              Audited status transitions from Applied → Shortlisted → Assessment → Technical Rounds → Selected with schedule integration and student notifications.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 PlaceHub. Production-Ready Smart Campus Placement Portal.</p>
          <p className="font-mono text-slate-400">Database: Apex Institute of Technology (Code: AIT)</p>
        </div>
      </footer>
    </div>
  );
};
