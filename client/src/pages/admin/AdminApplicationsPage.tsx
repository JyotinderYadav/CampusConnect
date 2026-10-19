import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Application, PlacementDrive } from "../../types";
import {
  Layers,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  User,
  ArrowRight,
  Video,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { formatDate, formatDateTime } from "../../lib/utils";

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Schedule Interview modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [mode, setMode] = useState("ONLINE");
  const [savingInterview, setSavingInterview] = useState(false);

  const fetchApplications = async () => {
    try {
      // Fetch drives first to aggregate applications or use admin route
      const res = await api.get("/drives?limit=50");
      if (res.success && res.data?.drives) {
        const allDrives: PlacementDrive[] = res.data.drives;
        const appsPromises = allDrives.map((d) =>
          api.get(`/drives/${d.id}/applications`).catch(() => ({ success: false, data: { applications: [] } }))
        );
        const results = await Promise.all(appsPromises);
        const collected: Application[] = [];
        results.forEach((r, idx) => {
          if (r.success && r.data?.applications) {
            r.data.applications.forEach((a: any) => {
              collected.push({ ...a, drive: allDrives[idx] });
            });
          }
        });
        setApplications(collected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await api.patch(`/applications/${appId}/status`, {
        status: newStatus,
        note: `Candidate transitioned to ${newStatus} by TPO`,
      });
      fetchApplications();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSavingInterview(true);
    try {
      await api.post(`/applications/${selectedApp.id}/interviews`, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        mode,
        meetingLink,
      });
      setIsScheduleOpen(false);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || "Failed to schedule interview");
    } finally {
      setSavingInterview(false);
    }
  };

  const filteredApps = applications.filter((a) => {
    if (statusFilter === "ALL") return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" /> Candidate Pipeline & Interview Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review student applications across all drives, advance recruitment stages, and coordinate schedules.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Application Stages</option>
          <option value="APPLIED">Applied</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="ASSESSMENT">Assessment</option>
          <option value="TECHNICAL_INTERVIEW">Technical Interview</option>
          <option value="HR_INTERVIEW">HR Interview</option>
          <option value="SELECTED">Selected / Placed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading candidate applications...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No applications match the current filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Company & Role</th>
                  <th className="px-5 py-3">Academic Stats</th>
                  <th className="px-5 py-3">Current Stage</th>
                  <th className="px-5 py-3">Resume</th>
                  <th className="px-5 py-3 text-right">Stage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((a) => {
                  const student = a.student;
                  const drive = a.drive;

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">
                          {student?.firstName} {student?.lastName}
                        </div>
                        <div className="text-slate-400 text-[11px]">{student?.user?.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{drive?.company?.name}</div>
                        <div className="text-slate-500 text-[11px]">{drive?.title}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">CGPA: {student?.cgpa ?? "N/A"}</div>
                        <div className="text-slate-400 text-[10px]">
                          {student?.branch} • {student?.activeBacklogs} backlogs
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={a.status.toLowerCase() as any}>
                          {a.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {a.resume ? (
                          <a
                            href={a.resume.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Resume v{a.resume.version}
                          </a>
                        ) : (
                          <span className="text-slate-400">None attached</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        {a.status === "APPLIED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(a.id, "SHORTLISTED")}
                          >
                            Shortlist
                          </Button>
                        )}
                        {a.status === "SHORTLISTED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(a.id, "TECHNICAL_INTERVIEW")}
                          >
                            Pass to Interview
                          </Button>
                        )}
                        {a.status === "TECHNICAL_INTERVIEW" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(a);
                                setIsScheduleOpen(true);
                              }}
                            >
                              <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Schedule
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleUpdateStatus(a.id, "SELECTED")}
                            >
                              Extend Offer
                            </Button>
                          </>
                        )}
                        {!["SELECTED", "REJECTED", "WITHDRAWN"].includes(a.status) && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdateStatus(a.id, "REJECTED")}
                          >
                            Reject
                          </Button>
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

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Interview Round"
        description={selectedApp ? `Candidate: ${selectedApp.student?.firstName} ${selectedApp.student?.lastName} • Drive: ${selectedApp.drive?.company?.name}` : ""}
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <Input
            label="Date & Time"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Interview Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ONLINE">Online (Video Call)</option>
              <option value="IN_PERSON">In-Person (On-Campus)</option>
            </select>
          </div>
          <Input
            label="Meeting Link / Venue"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/... or Room 402"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingInterview}>
              Confirm Schedule & Notify Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
