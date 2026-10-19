import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Settings, Bell, Save, CheckCircle, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    maxOffersPerStudent: 2,
    allowMultipleOffers: true,
    placementYear: 2025,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Announcement state
  const [announcement, setAnnouncement] = useState({
    title: "",
    content: "",
    targetRoles: "STUDENT",
  });
  const [postingAnnounce, setPostingAnnounce] = useState(false);
  const [announceSaved, setAnnounceSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin/settings");
        if (res.success && res.data?.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        // use defaults
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.patch("/admin/settings", {
        maxOffersPerStudent: Number(settings.maxOffersPerStudent),
        allowMultipleOffers: settings.allowMultipleOffers,
        placementYear: Number(settings.placementYear),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update placement policy");
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingAnnounce(true);
    try {
      await api.post("/admin/announcements", announcement);
      setAnnounceSaved(true);
      setAnnouncement({ title: "", content: "", targetRoles: "STUDENT" });
      setTimeout(() => setAnnounceSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to publish announcement");
    } finally {
      setPostingAnnounce(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" /> College Placement Policy & Announcements
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure offer capping rules, placement guidelines, and broadcast campus announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Policy Card */}
        <Card>
          <CardHeader>
            <CardTitle>Institutional Placement Policy Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Policy settings updated!
                </div>
              )}

              <Input
                label="Maximum Offers Permitted Per Student"
                type="number"
                min="1"
                max="5"
                value={settings.maxOffersPerStudent}
                onChange={(e) =>
                  setSettings({ ...settings, maxOffersPerStudent: Number(e.target.value) })
                }
                helperText="Students reaching this threshold will be barred from further applications."
              />

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="allowMulti"
                  checked={settings.allowMultipleOffers}
                  onChange={(e) =>
                    setSettings({ ...settings, allowMultipleOffers: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="allowMulti" className="text-sm font-medium text-slate-700">
                  Allow multiple concurrent offers (up to max limit)
                </label>
              </div>

              <Input
                label="Active Academic Placement Season Batch"
                type="number"
                value={settings.placementYear}
                onChange={(e) =>
                  setSettings({ ...settings, placementYear: Number(e.target.value) })
                }
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" loading={savingSettings}>
                  <Save className="w-4 h-4 mr-1.5" /> Save Institutional Policy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Announcements Broadcast Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Broadcast Campus Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              {announceSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Announcement broadcasted to students!
                </div>
              )}

              <Input
                label="Announcement Headline"
                required
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                placeholder="e.g. Google Coding Challenge Instructions"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Audience</label>
                <select
                  value={announcement.targetRoles}
                  onChange={(e) => setAnnouncement({ ...announcement, targetRoles: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="STUDENT">All Eligible Students</option>
                  <option value="ALL">Entire College (Students & Recruiters)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Announcement Details</label>
                <textarea
                  rows={4}
                  required
                  value={announcement.content}
                  onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                  placeholder="Detail dates, venue, prerequisites, or dress code..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <Button type="submit" variant="primary" loading={postingAnnounce}>
                Publish Announcement
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
