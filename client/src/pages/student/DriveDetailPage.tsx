import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";
import { PlacementDrive, Resume } from "../../types";
import {
  Briefcase,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Layers,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { formatCurrency, formatDate } from "../../lib/utils";

export const DriveDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driveRes, profileRes] = await Promise.all([
          api.get(`/drives/${id}`),
          api.get("/students/me"),
        ]);
        if (driveRes.success && driveRes.data) {
          setDrive(driveRes.data.drive);
        }
        if (profileRes.success && profileRes.data?.profile?.resumes) {
          const userResumes: Resume[] = profileRes.data.profile.resumes;
          setResumes(userResumes);
          const defaultResume = userResumes.find((r) => r.isDefault) || userResumes[0];
          if (defaultResume) setSelectedResumeId(defaultResume.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApply = async () => {
    setApplyError("");
    setApplying(true);
    try {
      const res = await api.post(`/drives/${id}/applications`, {
        resumeId: selectedResumeId || undefined,
      });
      if (res.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setIsApplyModalOpen(false);
          navigate("/student/applications");
        }, 1500);
      }
    } catch (err: any) {
      setApplyError(err.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading drive specifications...</div>;
  }

  if (!drive) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Drive not found</h3>
        <Link to="/student/drives" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
          ← Back to drives listing
        </Link>
      </div>
    );
  }

  const eligibility = drive.eligibilityDetails;
  const isEligible = drive.isEligible;
  const hasApplied = drive.hasApplied;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/student/drives"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Placement Drives
        </Link>
      </div>

      {/* Main Drive Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-2xl text-indigo-700 flex-shrink-0 shadow-inner">
            {drive.company?.name?.[0] || "C"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {drive.company?.name}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-600">{drive.jobType.replace(/_/g, " ")}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {drive.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> {formatCurrency(drive.ctc)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {drive.location} ({drive.workMode})
              </span>
              <span>•</span>
              <span className="text-rose-600 font-semibold">
                Deadline: {formatDate(drive.applicationCloseDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {hasApplied ? (
            <Button variant="secondary" size="lg" disabled className="w-full md:w-auto">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> Already Applied
            </Button>
          ) : isEligible ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full md:w-auto shadow-md shadow-indigo-200"
            >
              <Send className="w-4 h-4 mr-2" /> Apply Now
            </Button>
          ) : (
            <Button variant="outline" size="lg" disabled className="w-full md:w-auto opacity-75">
              <XCircle className="w-4 h-4 mr-2 text-rose-500" /> Ineligible for Drive
            </Button>
          )}
        </div>
      </div>

      {/* Two Column Layout: Details + Eligibility Engine Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Job Description & Recruitment Rounds */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description & Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="whitespace-pre-line">{drive.description || "No detailed description provided."}</p>

              {drive.packageBreakdown && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Compensation Breakdown
                  </h4>
                  <p className="text-xs text-slate-800 font-medium">{drive.packageBreakdown}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recruitment Stages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" /> Recruitment Rounds & Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {drive.stages && drive.stages.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {drive.stages.map((stage, idx) => (
                    <div key={stage.id} className="relative">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Round {stage.order || idx + 1}: {stage.name}
                      </h4>
                      {stage.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Rounds to be announced by recruiter.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Interactive Eligibility Engine Breakdown */}
        <div className="space-y-6">
          <Card className={isEligible ? "border-emerald-200 bg-emerald-50/10" : "border-rose-200 bg-rose-50/10"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${isEligible ? "text-emerald-600" : "text-rose-600"}`} />
                  Eligibility Engine
                </CardTitle>
                <Badge variant={isEligible ? "eligible" : "ineligible"}>
                  {isEligible ? "Verified Eligible" : "Requirements Unmet"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {/* Unmet reasons */}
              {eligibility?.reasons && eligibility.reasons.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Ineligibility Reasons:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-rose-700">
                    {eligibility.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Satisfied criteria */}
              {eligibility?.satisfied && eligibility.satisfied.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Criteria Satisfied:
                  </p>
                  <ul className="space-y-1.5">
                    {eligibility.satisfied.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Configured Criteria Rules summary */}
              <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1.5">
                <p className="font-semibold text-slate-700">Drive Requirements:</p>
                {drive.eligibilityCriteria?.minCgpa && (
                  <div>• Minimum CGPA: <span className="font-medium text-slate-800">{drive.eligibilityCriteria.minCgpa}</span></div>
                )}
                <div>• Allowed Active Backlogs: <span className="font-medium text-slate-800">{drive.eligibilityCriteria?.maxActiveBacklogs ?? 0}</span></div>
                <div>
                  • Eligible Branches:{" "}
                  <span className="font-medium text-slate-800">
                    {drive.eligibleBranches?.map((b) => b.branch).join(", ") || "All Branches"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply to ${drive.company?.name}`}
        description={`Position: ${drive.title}`}
      >
        <div className="space-y-4">
          {applyError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {applyError}
            </div>
          )}

          {applySuccess ? (
            <div className="p-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900">Application Submitted!</h4>
              <p className="text-xs text-slate-500">Redirecting to your application tracking portal...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Resume Version
                </label>
                {resumes.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                    You have no uploaded resumes. Please visit the{" "}
                    <Link to="/student/resumes" className="underline font-bold">
                      Resume Vault
                    </Link>{" "}
                    to upload your resume before applying.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {resumes.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedResumeId === r.id
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="resume"
                            checked={selectedResumeId === r.id}
                            onChange={() => setSelectedResumeId(r.id)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{r.originalName}</p>
                            <span className="text-[10px] text-slate-400">
                              Version {r.version} • {Math.round(r.fileSize / 1024)} KB
                            </span>
                          </div>
                        </div>
                        {r.isDefault && <Badge variant="default">Default</Badge>}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                By submitting this application, you confirm that your profile data, academic records, and resume are accurate.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsApplyModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  loading={applying}
                  disabled={resumes.length === 0}
                >
                  Confirm & Submit Application
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
