import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Users, Search, GraduationCap, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/admin/students?limit=100");
        if (res.success && res.data?.students) {
          setStudents(res.data.students);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const nameMatch = `${s.firstName} ${s.lastName} ${s.user?.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const branchMatch = branchFilter === "ALL" || s.branch === branchFilter;
    return nameMatch && branchMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> Student Placement Registry
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete database of registered batch students, academic verified records, and placement statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
        >
          <option value="ALL">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="IT">IT</option>
          <option value="ME">ME</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading student registry...</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Roll Number</th>
                  <th className="px-5 py-3">Branch & Degree</th>
                  <th className="px-5 py-3">CGPA</th>
                  <th className="px-5 py-3">Backlogs</th>
                  <th className="px-5 py-3">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const isPlaced = s.applications?.some((a: any) => a.status === "SELECTED");
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="text-slate-400 text-[11px]">{s.user?.email}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">{s.rollNumber || "N/A"}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900">{s.branch || "General"}</span>
                        <div className="text-slate-400 text-[10px]">{s.degree || "B.Tech"}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{s.cgpa?.toFixed(2) ?? "N/A"}</td>
                      <td className="px-5 py-3.5">
                        <span className={s.activeBacklogs > 0 ? "text-rose-600 font-bold" : "text-slate-600"}>
                          {s.activeBacklogs} active
                        </span>
                        <div className="text-slate-400 text-[10px]">History: {s.backlogHistory}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        {isPlaced ? (
                          <Badge variant="selected">Placed</Badge>
                        ) : (
                          <Badge variant="default">In Progress</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
