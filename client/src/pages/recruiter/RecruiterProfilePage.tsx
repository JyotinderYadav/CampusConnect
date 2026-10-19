import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Building2, Save, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export const RecruiterProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prof = user?.recruiterProfile;
    if (prof) {
      setName(prof.name || "");
      setDesignation(prof.designation || "");
      setPhone(prof.phone || "");
      if (prof.company) {
        setWebsite(prof.company.website || "");
        setIndustry(prof.company.industry || "");
        setDescription(prof.company.description || "");
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/recruiter/profile", {
        name,
        designation,
        phone,
        website,
        industry,
        description,
      });
      setSaved(true);
      await refreshUser();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-600" /> Company Profile & Contact Details
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your corporate information displayed to eligible student applicants.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            {saved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Recruiter profile updated!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Recruiter Contact Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Designation / Title"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Lead Campus Recruiter"
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-019-2834"
              />
              <Input
                label="Company Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
              />
              <Input
                label="Industry Domain"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Enterprise Software, Cloud Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Overview</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your organization and culture..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button type="submit" variant="primary" loading={saving}>
              <Save className="w-4 h-4 mr-1.5" /> Save Company Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
