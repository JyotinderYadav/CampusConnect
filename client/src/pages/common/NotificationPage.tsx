import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Notification } from "../../types";
import { Bell, CheckCheck, Trash2, Calendar, Briefcase, Info } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatDate, formatDateTime } from "../../lib/utils";

export const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=50");
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await api.post("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markOneRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const deleteNotification = async (id: string) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" /> Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates regarding drives, interview schedules, and application status changes.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">You will receive alerts here when placement events occur.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? "bg-indigo-50/30" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !n.isRead ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{n.title}</h4>
                    {!n.isRead && <Badge variant="applied">New</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markOneRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
