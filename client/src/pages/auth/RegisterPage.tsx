import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GraduationCap, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"STUDENT" | "RECRUITER">("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [collegeCode, setCollegeCode] = useState("AIT");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        email,
        password,
        role,
        firstName: role === "STUDENT" ? firstName : undefined,
        lastName: role === "STUDENT" ? lastName : undefined,
        collegeCode,
        companyName: role === "RECRUITER" ? companyName : undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check the inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 text-center sm:px-10">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Registration Complete</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your account has been created successfully. You can now log in to access your portal.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate("/login")} variant="primary" className="w-full">
                Proceed to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Create an Account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
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

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg mb-5">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                role === "STUDENT" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("RECRUITER")}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                role === "RECRUITER" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "STUDENT" ? (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aarav"
                />
                <Input
                  label="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                />
              </div>
            ) : (
              <Input
                label="Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Google / Microsoft / TechCorp"
              />
            )}

            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase & 1 number"
              helperText="Requires at least 8 chars, 1 uppercase and 1 number"
            />

            <Input
              label="College Code"
              required
              value={collegeCode}
              onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
              placeholder="AIT"
              helperText="Enter your college affiliation code (Default Demo: AIT)"
            />

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Register as {role === "STUDENT" ? "Student" : "Recruiter"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
