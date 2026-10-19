import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Application, PlacementDrive } from "../../types";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  Video,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { formatDate, formatDateTime } from "../../lib/utils";

export const RecruiterCandidatesPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Interview state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [savingInterview, setSavingInterview] = useState(false);

  const fetchCandidates = async () => {
    try {
      const res = await api.get("/recruiter/drives");
      if (res.success && res.data?.drives) {
        const drives: PlacementDrive[] = res.data.drives;
        const appsPromises = drives.map((d) =>
          api.get(`/recruiter/drives/${d.id}/applications`).catch(() => ({ success: false, data: { applications: [] } }))
        );
        const results = await Promise.all(appsPromises);
        const collected: Application[] = [];
        results.forEach((r, idx) => {
          if (r.success && r.data?.applications) {
            r.data.applications.forEach((a: any) => {
              collected.push({ ...a, drive: drives[idx] });
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
    fetchCandidates();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await api.patch(`/recruiter/applications/${appId}/status`, {
        status: newStatus,
        note: `Recruiter updated candidate to ${newStatus}`,
      });
      fetchCandidates();
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
        mode: "ONLINE",
        meetingLink,
      });
      setIsScheduleOpen(false);
      fetchCandidates();
    } catch (err: any) {
      alert(err.message || "Failed to schedule interview");
    } finally {
      setSavingInterview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> Candidate Applications Pipeline
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review candidate profiles, evaluate resumes, schedule technical interviews, and extend offers.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading candidates...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No student applications received yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Applied Drive</th>
                  <th className="px-5 py-3">Branch & CGPA</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Resume</th>
                  <th className="px-5 py-3 text-right">Recruiter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">
                        {a.student?.firstName} {a.student?.lastName}
                      </div>
                      <div className="text-slate-400 text-[11px]">{a.student?.user?.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {a.drive?.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">CGPA: {a.student?.cgpa ?? "N/A"}</div>
                      <div className="text-slate-400 text-[10px]">{a.student?.branch}</div>
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
                          <FileText className="w-3.5 h-3.5" /> View Resume
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
                          Invite to Interview
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
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Recruiter Interview"
        description={selectedApp ? `Candidate: ${selectedApp.student?.firstName} ${selectedApp.student?.lastName}` : ""}
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <Input
            label="Date & Time"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
          <Input
            label="Video Meeting Link (Google Meet / Zoom)"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingInterview}>
              Confirm & Dispatch Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
