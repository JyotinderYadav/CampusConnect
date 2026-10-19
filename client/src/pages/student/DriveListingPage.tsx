import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { PlacementDrive } from "../../types";
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../lib/utils";

export const DriveListingPage: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
  const [eligibilityFilter, setEligibilityFilter] = useState("ALL");

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await api.get("/drives?limit=50");
        if (res.success && res.data) {
          setDrives(res.data.drives || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.title.toLowerCase().includes(search.toLowerCase()) ||
      drive.company.name.toLowerCase().includes(search.toLowerCase()) ||
      (drive.location || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = jobTypeFilter === "ALL" || drive.jobType === jobTypeFilter;
    const matchesEligibility =
      eligibilityFilter === "ALL" ||
      (eligibilityFilter === "ELIGIBLE" && drive.isEligible) ||
      (eligibilityFilter === "INELIGIBLE" && !drive.isEligible);

    return matchesSearch && matchesType && matchesEligibility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" /> Placement Drives
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore campus recruitment opportunities. Eligibility is dynamically verified against your academic profile.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search role, company or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="INTERNSHIP_TO_FULL_TIME">Internship to PPO</option>
          </select>

          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">All Eligibility</option>
            <option value="ELIGIBLE">Eligible Only</option>
            <option value="INELIGIBLE">Ineligible Only</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading placement drives...</div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No placement drives matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrives.map((drive) => {
            const isEligible = drive.isEligible;
            return (
              <div
                key={drive.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-lg">
                        {drive.company?.name?.[0] || "C"}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {drive.company?.name}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {drive.title}
                        </h3>
                      </div>
                    </div>
                    {isEligible ? (
                      <Badge variant="eligible" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Eligible
                      </Badge>
                    ) : (
                      <Badge variant="ineligible" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Ineligible
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    {drive.description || "Exciting engineering role at our partner company."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">CTC / Stipend</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(drive.ctc)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Work Mode</span>
                      <span className="font-medium text-slate-800">{drive.workMode} • {drive.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-rose-600 font-medium">
                    Closes: {formatDate(drive.applicationCloseDate)}
                  </span>
                  <Link to={`/student/drives/${drive.id}`}>
                    <Button variant={isEligible ? "primary" : "outline"} size="sm">
                      Details & Apply <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
