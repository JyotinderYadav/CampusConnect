import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">PlaceHub</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Or{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            register as a new student or recruiter
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Secure cookie session</span>
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Demo Credentials Quick Click */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Fill Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemo("admin@placehub.dev", "Admin@123456")}
                className="py-1.5 px-2 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded border border-slate-200 transition-colors"
              >
                TPO Admin
              </button>
              <button
                type="button"
                onClick={() => setDemo("student1@example.com", "Student@123")}
                className="py-1.5 px-2 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded border border-slate-200 transition-colors"
              >
                Student 1
              </button>
              <button
                type="button"
                onClick={() => setDemo("recruiter@techcorp.com", "Recruiter@123")}
                className="py-1.5 px-2 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded border border-slate-200 transition-colors"
              >
                Recruiter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
