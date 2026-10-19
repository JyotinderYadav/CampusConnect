import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Notification } from "../types";
import {
  Bell,
  GraduationCap,
  LogOut,
  User as UserIcon,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "./ui/Badge";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications?limit=5");
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleLabel = {
    STUDENT: "Student",
    PLACEMENT_OFFICER: "Placement Officer (TPO)",
    RECRUITER: "Recruiter Partner",
  }[user?.role || "STUDENT"];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">PlaceHub</span>
                <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase block -mt-1">Campus Placement</span>
              </div>
            </Link>
            {user?.college && (
              <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 ml-3 border border-slate-200">
                {user.college.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* In-app Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No recent notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-left hover:bg-slate-50 transition-colors ${
                            !n.isRead ? "bg-indigo-50/40" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-slate-900">{n.title}</p>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Role Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-semibold text-slate-900 leading-tight">
                  {user?.studentProfile
                    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
                    : user?.recruiterProfile
                    ? user.recruiterProfile.name
                    : user?.email.split("@")[0]}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
