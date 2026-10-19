import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Resume } from "../../types";
import {
  FileText,
  Upload,
  CheckCircle,
  Download,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { formatDate } from "../../lib/utils";

export const ResumeVaultPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const fetchResumes = async () => {
    try {
      const res = await api.get("/students/me");
      if (res.success && res.data?.profile?.resumes) {
        setResumes(res.data.profile.resumes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await api.post("/students/me/resumes", formData);
      if (res.success) {
        setUploadSuccess("Resume uploaded successfully!");
        fetchResumes();
        setTimeout(() => setUploadSuccess(""), 3000);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload resume. PDF/DOC up to 5MB supported.");
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      await api.patch(`/students/me/resumes/${resumeId}/default`);
      fetchResumes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to remove this resume?")) return;
    try {
      await api.delete(`/students/me/resumes/${resumeId}`);
      fetchResumes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" /> Resume Vault & Version Control
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain tailored resume variants (e.g. SDE, Quant, DevOps). Version histories are automatically attached to submissions.
        </p>
      </div>

      {/* Upload Box */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors">
            <Upload className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Upload New Resume Variant</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supported formats: PDF, DOC, DOCX. Maximum file size: 5 MB.
            </p>

            <div className="mt-4">
              <label className="inline-flex cursor-pointer">
                <span className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-3 py-1.5 gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer">
                  {uploading ? "Uploading..." : "Choose Resume File"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 mt-3 font-medium flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}
            {uploadSuccess && (
              <p className="text-xs text-emerald-600 mt-3 font-medium flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {uploadSuccess}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumes List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Resume Versions ({resumes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading resumes...</div>
          ) : resumes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No resumes uploaded yet. Upload your first resume above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resumes.map((r) => (
                <div key={r.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{r.originalName}</h4>
                        {r.isDefault && <Badge variant="selected">Default Submission</Badge>}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          v{r.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {Math.round(r.fileSize / 1024)} KB • Uploaded {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!r.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(r.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="p-2 text-slate-500 hover:text-indigo-600 rounded"
                      title="Download resume"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
