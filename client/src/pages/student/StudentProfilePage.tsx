import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { StudentProfile, Project, Experience, StudentSkill } from "../../types";
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Briefcase,
  Award,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export const StudentProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "skills" | "projects">("personal");

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    rollNumber: "",
    degree: "",
    branch: "",
    graduationYear: 2025,
    cgpa: 0,
    class10Percent: 0,
    class12Percent: 0,
    activeBacklogs: 0,
    backlogHistory: 0,
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    bio: "",
  });

  // Project modal state
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
  });
  const [addingProject, setAddingProject] = useState(false);

  // Skill state
  const [skillInput, setSkillInput] = useState("");
  const [proficiency, setProficiency] = useState("INTERMEDIATE");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/students/me");
      if (res.success && res.data?.profile) {
        const p: StudentProfile = res.data.profile;
        setProfile(p);
        setFormData({
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          phone: p.phone || "",
          rollNumber: p.rollNumber || "",
          degree: p.degree || "B.Tech",
          branch: p.branch || "",
          graduationYear: p.graduationYear || 2025,
          cgpa: p.cgpa || 0,
          class10Percent: p.class10Percent || 0,
          class12Percent: p.class12Percent || 0,
          activeBacklogs: p.activeBacklogs || 0,
          backlogHistory: p.backlogHistory || 0,
          linkedinUrl: p.linkedinUrl || "",
          githubUrl: p.githubUrl || "",
          portfolioUrl: p.portfolioUrl || "",
          bio: p.bio || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.patch("/students/me", {
        ...formData,
        graduationYear: Number(formData.graduationYear),
        cgpa: Number(formData.cgpa),
        class10Percent: Number(formData.class10Percent),
        class12Percent: Number(formData.class12Percent),
        activeBacklogs: Number(formData.activeBacklogs),
        backlogHistory: Number(formData.backlogHistory),
      });
      setSaveSuccess(true);
      await refreshUser();
      fetchProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/students/me/projects", newProject);
      setNewProject({ title: "", description: "", technologies: "", githubUrl: "", liveUrl: "" });
      setAddingProject(false);
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Failed to add project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/students/me/projects/${id}`);
      fetchProfile();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    try {
      await api.post("/students/me/skills", {
        skillName: skillInput.trim(),
        proficiency,
      });
      setSkillInput("");
      fetchProfile();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await api.delete(`/students/me/skills/${skillId}`);
      fetchProfile();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading student profile...</div>;
  }

  const completion = profile?.profileComplete || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Profile Completion */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile & Portfolio</h1>
            <Badge variant="default">Verified Student</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Keep your academic scores and technical portfolio up to date for maximum drive eligibility.
          </p>
        </div>

        {/* Completion Bar */}
        <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Profile Completion</span>
            <span className="text-indigo-600">{completion}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            {completion >= 80 ? "✨ Excellent profile strength!" : "Add projects and skills to hit 100%"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "personal"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-4 h-4" /> Personal & Links
        </button>
        <button
          onClick={() => setActiveTab("academic")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "academic"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Academic Records
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "skills"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Code2 className="w-4 h-4" /> Technical Skills
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "projects"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FolderGit2 className="w-4 h-4" /> Projects & Portfolio
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Profile information successfully saved!
          </div>
        )}

        {activeTab === "personal" && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-9876543210"
                />
                <Input
                  label="LinkedIn Profile URL"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
                <Input
                  label="GitHub Profile URL"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                />
                <Input
                  label="Portfolio Website URL"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://myportfolio.dev"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Bio / Objective</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write a brief professional summary..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "academic" && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Records & Eligibility Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="College Roll / Reg No."
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="CS21B001"
                />
                <Input
                  label="Degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="B.Tech"
                />
                <Input
                  label="Branch (e.g. CSE, ECE, ME, IT)"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value.toUpperCase() })}
                  placeholder="CSE"
                />
                <Input
                  label="Graduation Year"
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                />
                <Input
                  label="Current CGPA (out of 10)"
                  type="number"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                />
                <Input
                  label="Class 10th Percentage"
                  type="number"
                  step="0.1"
                  value={formData.class10Percent}
                  onChange={(e) => setFormData({ ...formData, class10Percent: Number(e.target.value) })}
                />
                <Input
                  label="Class 12th Percentage"
                  type="number"
                  step="0.1"
                  value={formData.class12Percent}
                  onChange={(e) => setFormData({ ...formData, class12Percent: Number(e.target.value) })}
                />
                <Input
                  label="Active Backlogs Count"
                  type="number"
                  value={formData.activeBacklogs}
                  onChange={(e) => setFormData({ ...formData, activeBacklogs: Number(e.target.value) })}
                />
                <Input
                  label="Total Backlog History Count"
                  type="number"
                  value={formData.backlogHistory}
                  onChange={(e) => setFormData({ ...formData, backlogHistory: Number(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save button for personal & academic */}
        {(activeTab === "personal" || activeTab === "academic") && (
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              <Save className="w-4 h-4 mr-1.5" /> Save Changes
            </Button>
          </div>
        )}
      </form>

      {/* Skills Tab */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Technical Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <Input
                    label="Skill Name"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. React, Docker, Python, System Design"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Proficiency</label>
                  <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <Button type="submit" variant="primary">
                  <Plus className="w-4 h-4 mr-1" /> Add Skill
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Added Skills ({profile?.skills?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <div
                      key={s.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      <span className="font-semibold">{s.skill.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">({s.proficiency.toLowerCase()})</span>
                      <button
                        onClick={() => handleDeleteSkill(s.skillId)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills added yet. Add relevant technical competencies above.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Projects & Case Studies</h3>
            <Button variant="outline" size="sm" onClick={() => setAddingProject(!addingProject)}>
              <Plus className="w-4 h-4 mr-1" /> Add New Project
            </Button>
          </div>

          {addingProject && (
            <Card>
              <CardHeader>
                <CardTitle>New Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <Input
                    label="Project Title"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Distributed Task Queue"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      required
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Explain the problem, technical challenges, and architecture..."
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <Input
                    label="Technologies Used"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    placeholder="Node.js, TypeScript, Docker, Redis"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="GitHub Repo URL"
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                    <Input
                      label="Live Demo URL"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      placeholder="https://app.demo.com"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" type="button" onClick={() => setAddingProject(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Save Project
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {profile?.projects && profile.projects.length > 0 ? (
              profile.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-base">{proj.title}</h4>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {proj.description}
                    </p>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.split(",").map((tech, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded flex-shrink-0"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 bg-white p-8 rounded-xl border border-slate-200 text-center">
                No projects listed. Add software projects to enhance recruiter screening scores.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
