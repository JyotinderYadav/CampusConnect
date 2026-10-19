import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Building,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency } from "../../lib/utils";

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const res = await api.get("/recruiter/drives");
        if (res.success && res.data) {
          setDrives(res.data.drives || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, []);

  const company = user?.recruiterProfile?.company;
  const totalApplicants = drives.reduce((acc, d) => acc + (d._count?.applications || 0), 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
            Recruiter Enterprise Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {company?.name || "Partner Company"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Campus Recruitment Partner • Authorized Access
          </p>
        </div>

        <Link to="/recruiter/candidates">
          <Button variant="primary" size="lg" className="shadow-md shadow-indigo-500/20">
            <Users className="w-4 h-4 mr-2" /> Review Candidates
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Drives</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{drives.length}</h3>
              <p className="text-[11px] text-slate-400">Campus roles opened</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Applicants</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalApplicants}</h3>
              <p className="text-[11px] text-blue-600 font-medium">Verified by eligibility rules</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">In Pipeline</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalApplicants}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">Ready for review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drives list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Active Campus Drives</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading drives...</div>
          ) : drives.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No active drives posted.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {drives.map((d) => (
                <div key={d.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{d.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {d.jobType.replace(/_/g, " ")} • {formatCurrency(d.ctc)} • {d.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                      {d._count?.applications || 0} applicants
                    </span>
                    <Link to="/recruiter/candidates">
                      <Button variant="outline" size="sm">
                        View Pipeline <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
