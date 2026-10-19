import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  UserCheck,
  Building2,
  Users,
  Settings,
  Bell,
  Award,
  Layers,
  Send,
} from "lucide-react";
import { cn } from "../lib/utils";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/drives", label: "Placement Drives", icon: Briefcase },
    { to: "/student/applications", label: "My Applications", icon: Send },
    { to: "/student/profile", label: "My Profile", icon: UserCheck },
    { to: "/student/resumes", label: "Resume Vault", icon: FileText },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Overview & Analytics", icon: LayoutDashboard },
    { to: "/admin/drives", label: "Placement Drives", icon: Briefcase },
    { to: "/admin/applications", label: "Candidate Applications", icon: Layers },
    { to: "/admin/students", label: "Student Registry", icon: Users },
    { to: "/admin/announcements", label: "Announcements", icon: Bell },
    { to: "/admin/settings", label: "College Policy", icon: Settings },
  ];

  const recruiterLinks = [
    { to: "/recruiter/dashboard", label: "Recruiter Dashboard", icon: LayoutDashboard },
    { to: "/recruiter/drives", label: "Our Job Drives", icon: Briefcase },
    { to: "/recruiter/candidates", label: "Candidate Review", icon: Users },
    { to: "/recruiter/profile", label: "Company Profile", icon: Building2 },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ];

  const links =
    role === "PLACEMENT_OFFICER"
      ? adminLinks
      : role === "RECRUITER"
      ? recruiterLinks
      : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1 flex-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Demo Credentials Helper Pill in Sidebar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="rounded-lg bg-indigo-50/60 p-3 border border-indigo-100/60 text-xs text-slate-600">
          <p className="font-semibold text-indigo-900 flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5 text-indigo-600" /> Demo Accounts
          </p>
          <div className="space-y-1 text-[11px] text-slate-500 font-mono">
            <div><span className="text-slate-800 font-sans font-medium">TPO:</span> admin@placehub.dev</div>
            <div><span className="text-slate-800 font-sans font-medium">Student:</span> student1@example.com</div>
            <div><span className="text-slate-800 font-sans font-medium">Recruiter:</span> recruiter@techcorp.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
