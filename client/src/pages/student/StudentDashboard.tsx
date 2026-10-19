import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { PlacementDrive, Application } from "../../types";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Building,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../lib/utils";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [drivesRes, appsRes] = await Promise.all([
          api.get("/students/me/eligible-drives"),
          api.get("/students/me/applications"),
        ]);
        if (drivesRes.success) setDrives(drivesRes.data.drives || []);
        if (appsRes.success) setApplications(appsRes.data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const profile = user?.studentProfile;
  const activeApps = applications.filter((a) => !["REJECTED", "WITHDRAWN"].includes(a.status));
  const shortlistedApps = applications.filter((a) => ["SHORTLISTED", "ASSESSMENT", "TECHNICAL_INTERVIEW", "HR_INTERVIEW"].includes(a.status));
  const selectedApps = applications.filter((a) => a.status === "SELECTED");

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" /> Placement Season 2024-2025
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.firstName || "Student"}!
          </h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            {profile?.branch ? `${profile.branch} • Batch of ${profile.graduationYear}` : "Complete your profile to unlock customized job matches"}
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl flex items-center gap-4 min-w-[240px]">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="transparent" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#818cf8"
                strokeWidth="4"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * (profile?.profileComplete || 0)) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold">{profile?.profileComplete || 0}%</span>
          </div>
          <div>
            <p className="text-xs text-indigo-200 font-medium">Profile Strength</p>
            <Link
              to="/student/profile"
              className="text-xs font-semibold text-white underline hover:text-indigo-100 flex items-center gap-1 mt-0.5"
            >
              Update Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Eligible Drives</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{drives.length}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">Verified by criteria</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Applied</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{applications.length}</h3>
              <p className="text-[11px] text-slate-500">{activeApps.length} actively in progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">In Pipeline</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{shortlistedApps.length}</h3>
              <p className="text-[11px] text-amber-600 font-medium">Shortlisted or testing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Offers Extended</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{selectedApps.length}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">Accepted selections</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recommended Eligible Drives + Active Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Eligible Placement Drives */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Opportunities Open For You
            </h2>
            <Link to="/student/drives" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Browse all drives →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
              Loading drives...
            </div>
          ) : drives.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
              No eligible drives currently match your academic criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {drives.slice(0, 3).map((drive) => (
                <div
                  key={drive.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg flex-shrink-0">
                      {drive.company?.name?.[0] || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">{drive.company?.name}</span>
                        <Badge variant="eligible">Eligible</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base mt-0.5">{drive.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="font-medium text-slate-700">{formatCurrency(drive.ctc)}</span>
                        <span>•</span>
                        <span>{drive.location || "On-Campus"}</span>
                        <span>•</span>
                        <span className="text-rose-600 font-medium">Closes {formatDate(drive.applicationCloseDate)}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/student/drives/${drive.id}`} className="flex-shrink-0">
                    <Button variant="outline" size="sm">
                      View & Apply <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 span): Active Application Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Applications</h2>
            <Link to="/student/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View all ({applications.length})
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                You haven't applied to any drives yet.
              </div>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{app.drive?.company?.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{app.drive?.title}</p>
                    </div>
                    <Badge variant={app.status.toLowerCase() as any}>
                      {app.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Applied: {formatDate(app.appliedAt)}</span>
                    <Link to="/student/applications" className="text-indigo-600 hover:underline font-medium">
                      Track status
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
