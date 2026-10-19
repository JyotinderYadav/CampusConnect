import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { Application } from "../../types";
import {
  Send,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Video,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate, formatDateTime } from "../../lib/utils";

export const StudentApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/students/me/applications");
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
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

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application? This action cannot be reversed.")) {
      return;
    }
    setWithdrawingId(applicationId);
    try {
      await api.delete(`/applications/${applicationId}`);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
    }
  };

  const stages = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "ASSESSMENT",
    "TECHNICAL_INTERVIEW",
    "HR_INTERVIEW",
    "SELECTED",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Send className="w-6 h-6 text-indigo-600" /> My Applications Tracker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your recruitment progress, interview schedules, and stage transitions in real-time.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No applications yet</h3>
          <p className="text-xs text-slate-500 mt-1">Browse eligible placement drives to submit applications.</p>
          <Link to="/student/drives" className="mt-4 inline-block">
            <Button variant="primary" size="sm">Browse Drives</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const drive = app.drive;
            const currentIdx = stages.indexOf(app.status);
            const isRejected = app.status === "REJECTED";
            const isWithdrawn = app.status === "WITHDRAWN";
            const canWithdraw = app.status === "APPLIED";

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-lg flex-shrink-0">
                      {drive?.company?.name?.[0] || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          {drive?.company?.name}
                        </span>
                        <Badge variant={app.status.toLowerCase() as any}>
                          {app.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{drive?.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {canWithdraw && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWithdraw(app.id)}
                        loading={withdrawingId === app.id}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Withdraw
                      </Button>
                    )}
                    <Link to={`/student/drives/${drive?.id}`}>
                      <Button variant="outline" size="sm">
                        Drive Details <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Visual Pipeline Progress */}
                {!isRejected && !isWithdrawn && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Recruitment Pipeline Progress
                    </p>
                    <div className="flex items-center justify-between w-full overflow-x-auto pb-2">
                      {stages.map((st, i) => {
                        const isDone = currentIdx >= i;
                        const isCurrent = currentIdx === i;
                        return (
                          <div key={st} className="flex items-center flex-1 min-w-[90px] text-center flex-col">
                            <div className="flex items-center w-full">
                              <div
                                className={`h-1 flex-1 ${
                                  i === 0 ? "invisible" : isDone ? "bg-indigo-600" : "bg-slate-200"
                                }`}
                              />
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-1 ${
                                  isCurrent
                                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                                    : isDone
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {i + 1}
                              </div>
                              <div
                                className={`h-1 flex-1 ${
                                  i === stages.length - 1 ? "invisible" : currentIdx > i ? "bg-indigo-600" : "bg-slate-200"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-[10px] mt-1.5 font-medium ${
                                isCurrent
                                  ? "text-indigo-700 font-bold"
                                  : isDone
                                  ? "text-slate-800"
                                  : "text-slate-400"
                              }`}
                            >
                              {st.replace(/_/g, " ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scheduled Interviews Box if any */}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                    <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600" /> Scheduled Interview
                    </p>
                    {app.interviews.map((interview) => (
                      <div key={interview.id} className="text-xs text-indigo-950 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="font-semibold">{formatDateTime(interview.scheduledAt)}</span>
                          <span className="text-indigo-700 ml-2">Mode: {interview.mode}</span>
                          {interview.location && <span className="ml-2">({interview.location})</span>}
                        </div>
                        {interview.meetingLink && (
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 text-xs shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Meeting
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Timeline History */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Recent Audit History
                    </span>
                    <div className="space-y-1.5">
                      {app.statusHistory.map((hist) => (
                        <div key={hist.id} className="text-xs flex items-center justify-between text-slate-600">
                          <span className="font-medium text-slate-800">
                            Status updated to <span className="font-bold">{hist.status}</span>
                            {hist.note && <span className="text-slate-500 font-normal"> — {hist.note}</span>}
                          </span>
                          <span className="text-[11px] text-slate-400">{formatDate(hist.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
