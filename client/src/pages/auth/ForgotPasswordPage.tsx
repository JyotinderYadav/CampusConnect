import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { api } from "../../lib/api";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
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
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {submitted ? (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Password Reset Email Dispatched</h3>
              <p className="text-xs text-slate-500">
                If an account exists for {email}, a secure reset link has been dispatched or logged to server output.
              </p>
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-500 mt-2">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
              />
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Send Reset Link
              </Button>
              <div className="text-center mt-3">
                <Link to="/login" className="text-xs text-slate-500 hover:text-slate-700">
                  Cancel and return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
