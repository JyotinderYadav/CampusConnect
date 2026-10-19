import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";

export const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full text-center">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
      <p className="text-sm text-slate-500 mt-2">
        You do not have authorization to view this resource. Your role permissions prevent access.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full text-center">
      <h1 className="text-6xl font-extrabold text-indigo-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-2">
        The placement portal page you requested could not be located.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  </div>
);
