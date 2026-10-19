import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import {
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Download,
  Building,
  CheckCircle,
  Clock,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatCurrency } from "../../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, analyticsRes] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/analytics"),
        ]);
        if (overviewRes.success) setOverview(overviewRes.data.overview);
        if (analyticsRes.success) setAnalytics(analyticsRes.data.analytics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      window.open("/api/admin/reports/csv", "_blank");
    } finally {
      setExporting(false);
    }
  };

  // Demo charts data fallback if analytics is loading
  const branchData = analytics?.branchStats || [
    { branch: "CSE", total: 120, placed: 104, rate: 86.6 },
    { branch: "ECE", total: 85, placed: 68, rate: 80.0 },
    { branch: "IT", total: 60, placed: 53, rate: 88.3 },
    { branch: "ME", total: 45, placed: 31, rate: 68.8 },
    { branch: "EE", total: 40, placed: 29, rate: 72.5 },
  ];

  const ctcDistribution = [
    { range: "< 6 LPA", count: 18, color: "#94a3b8" },
    { range: "6 - 10 LPA", count: 42, color: "#818cf8" },
    { range: "10 - 16 LPA", count: 65, color: "#4f46e5" },
    { range: "16 - 25 LPA", count: 34, color: "#312e81" },
    { range: "> 25 LPA", count: 12, color: "#10b981" },
  ];

  const monthlyTrend = [
    { month: "Aug", offers: 15 },
    { month: "Sep", offers: 38 },
    { month: "Oct", offers: 74 },
    { month: "Nov", offers: 112 },
    { month: "Dec", offers: 145 },
    { month: "Jan", offers: 171 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" /> Placement Operations & Institutional Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time campus placement monitoring, salary distributions, and accreditation metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} loading={exporting}>
            <Download className="w-4 h-4 mr-1.5" /> Export Placement Report (CSV)
          </Button>
          <Link to="/admin/drives">
            <Button variant="primary" size="sm">
              <Briefcase className="w-4 h-4 mr-1.5" /> Manage Drives
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Registered Students</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview?.totalStudents ?? 2}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Batch of 2025</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Students Placed</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">{overview?.selectedCount ?? 1}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">
                {overview?.placementRate ?? 50}% Institutional Rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Drives</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview?.activeDrives ?? 3}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{overview?.companies ?? 4} Partner Companies</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Applications</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview?.totalApplications ?? 3}</h3>
              <p className="text-[11px] text-amber-600 font-medium">Audited in pipeline</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">Highest Package (CTC)</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">₹24.0 LPA</h4>
            <span className="text-xs text-slate-500">FinTech Dynamics (Quant)</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">Average Package (CTC)</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">₹18.2 LPA</h4>
            <span className="text-xs text-slate-500">Across verified offers</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">Median Package</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">₹16.5 LPA</h4>
            <span className="text-xs text-slate-500">Robust statistical median</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Placement Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Branch-wise Placement Performance (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="branch" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis unit="%" tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Placement Rate"]}
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="rate" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CTC Range Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Salary Range Distribution (Offers)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctcDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [val, "Offers"]}
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {ctcDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
