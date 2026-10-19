import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { PlacementDrive } from "../../types";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Archive,
  Eye,
  Edit,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { formatCurrency, formatDate } from "../../lib/utils";

export const AdminDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create form state
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    jobType: "FULL_TIME",
    ctc: 12.0,
    stipend: 0,
    packageBreakdown: "",
    location: "Bangalore",
    workMode: "HYBRID",
    vacancies: 10,
    description: "",
    minCgpa: 7.0,
    minClass10: 60.0,
    minClass12: 60.0,
    maxActiveBacklogs: 0,
    allowBacklogHistory: false,
    branches: "CSE, ECE, IT",
  });
  const [creating, setCreating] = useState(false);

  const fetchDrives = async () => {
    try {
      const res = await api.get("/drives?limit=50");
      if (res.success && res.data) {
        setDrives(res.data.drives || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/drives/${id}/status`, { status: newStatus });
      fetchDrives();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const branchesArr = form.branches.split(",").map((b) => b.trim()).filter(Boolean);
      await api.post("/drives", {
        title: form.title,
        companyName: form.companyName,
        jobType: form.jobType,
        ctc: Number(form.ctc),
        stipend: Number(form.stipend),
        packageBreakdown: form.packageBreakdown,
        location: form.location,
        workMode: form.workMode,
        vacancies: Number(form.vacancies),
        description: form.description,
        applicationOpenDate: new Date(),
        applicationCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        eligibilityCriteria: {
          minCgpa: Number(form.minCgpa),
          minClass10: Number(form.minClass10),
          minClass12: Number(form.minClass12),
          maxActiveBacklogs: Number(form.maxActiveBacklogs),
          allowBacklogHistory: form.allowBacklogHistory,
          graduationYears: "2025",
        },
        eligibleBranches: branchesArr,
      });
      setIsCreateOpen(false);
      fetchDrives();
    } catch (err: any) {
      alert(err.message || "Failed to create drive");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" /> Drive Lifecycle Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, publish, configure eligibility constraints, and control candidate submission windows.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Placement Drive
        </Button>
      </div>

      {/* Drives Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading drives...</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Company & Role</th>
                  <th className="px-5 py-3">Compensation</th>
                  <th className="px-5 py-3">Min CGPA / Backlogs</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Applicants</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{d.company?.name}</div>
                      <div className="text-slate-500 mt-0.5">{d.title}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {formatCurrency(d.ctc)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>CGPA ≥ {d.eligibilityCriteria?.minCgpa ?? "None"}</div>
                      <div className="text-slate-400 text-[10px]">
                        Max Backlogs: {d.eligibilityCriteria?.maxActiveBacklogs ?? 0}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          d.status === "PUBLISHED"
                            ? "selected"
                            : d.status === "CLOSED"
                            ? "rejected"
                            : "default"
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {d._count?.applications ?? 0} applied
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      {d.status === "DRAFT" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(d.id, "PUBLISHED")}
                        >
                          Publish
                        </Button>
                      )}
                      {d.status === "PUBLISHED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(d.id, "CLOSED")}
                        >
                          Close
                        </Button>
                      )}
                      <Link to={`/admin/applications`}>
                        <Button variant="ghost" size="sm">
                          Review Applicants
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create Drive Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Campus Placement Drive"
        description="Configure job details, compensation, and deterministic eligibility rules."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateDrive} className="space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Company Name"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g. Google, TechCorp"
            />
            <Input
              label="Job Role Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Software Development Engineer"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Type</label>
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="INTERNSHIP_TO_FULL_TIME">Internship to PPO</option>
              </select>
            </div>
            <Input
              label="CTC (in Lakhs Per Annum)"
              type="number"
              step="0.1"
              value={form.ctc}
              onChange={(e) => setForm({ ...form, ctc: Number(e.target.value) })}
            />
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Bangalore, India"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Mode</label>
              <select
                value={form.workMode}
                onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ON_SITE">On Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline role responsibilities, tech stacks, and team overview..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Deterministic Eligibility Rules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Minimum CGPA"
                type="number"
                step="0.1"
                value={form.minCgpa}
                onChange={(e) => setForm({ ...form, minCgpa: Number(e.target.value) })}
              />
              <Input
                label="Max Active Backlogs"
                type="number"
                value={form.maxActiveBacklogs}
                onChange={(e) => setForm({ ...form, maxActiveBacklogs: Number(e.target.value) })}
              />
              <Input
                label="Eligible Branches"
                value={form.branches}
                onChange={(e) => setForm({ ...form, branches: e.target.value })}
                placeholder="CSE, ECE, IT"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={creating}>
              Save & Create Drive
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
