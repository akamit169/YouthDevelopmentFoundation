import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import RoleBasedNavigation from "../components/RoleBasedNavigation";
import api from "../services/api";
import {
  FileText,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  MapPin,
  Star,
  Calendar,
  User,
  GraduationCap,
  Phone,
  Mail,
  Paperclip,
} from "lucide-react";

const ReviewerDashboard = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [actionScore, setActionScore] = useState<string>("");
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.listReviewerApplications({ page: 1, limit: 5 });
        if (res.success) {
          const mapped = (res.data || []).map((a: any) => ({
            id: a.id,
            applicant: {
              name: a.studentName || `Student #${a.studentId}`,
              age: a?.formData?.age || "",
              location: a?.formData?.location || "",
              email: a.studentEmail || a?.formData?.email || "",
              phone: a.studentPhone || a?.formData?.phone || "",
              course:
                a?.studentProfileData?.course || a?.formData?.course || "",
              year: a?.studentProfileData?.year || a?.formData?.year || "",
            },
            scheme: a.scholarshipTitle || `Scholarship #${a.scholarshipId}`,
            amount:
              a.amountAwarded != null && a.amountAwarded !== ""
                ? `${a.scholarshipCurrency === "INR" ? "₹" : ""}${a.amountAwarded}`
                : a.scholarshipAmount != null && a.scholarshipAmount !== ""
                  ? `${a.scholarshipCurrency === "INR" ? "₹" : ""}${a.scholarshipAmount}`
                  : "",
            submittedDate: a.submittedAt,
            score: a.score ?? "",
            status:
              a.status === "under_review"
                ? "Under Review"
                : a.status === "submitted"
                  ? "Submitted"
                  : a.status === "approved"
                    ? "Approved"
                    : a.status === "rejected"
                      ? "Rejected"
                      : a.status === "waitlisted"
                        ? "Waitlisted"
                        : a.status,
            documents: Array.isArray(a.documents) ? a.documents : [],
            priority: "medium",
            region: "",
            raw: a,
          }));
          setPendingApplications(mapped);
        }
      } catch {}
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Pending Documents":
        return "bg-orange-100 text-orange-800";
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const [stats, setStats] = useState([
    { title: "Submitted", value: "0", icon: Clock, color: "bg-yellow-500" },
    {
      title: "Under Review",
      value: "0",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    { title: "Approved", value: "0", icon: Star, color: "bg-red-500" },
    { title: "Rejected", value: "0", icon: Calendar, color: "bg-blue-500" },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.getReviewerStats();
        if (r.success && r.data) {
          const d = r.data as any;
          setStats([
            {
              title: "Submitted",
              value: String(d.submitted || 0),
              icon: Clock,
              color: "bg-yellow-500",
            },
            {
              title: "Under Review",
              value: String(d.under_review || 0),
              icon: CheckCircle,
              color: "bg-green-500",
            },
            {
              title: "Approved",
              value: String(d.approved || 0),
              icon: Star,
              color: "bg-red-500",
            },
            {
              title: "Rejected",
              value: String(d.rejected || 0),
              icon: Calendar,
              color: "bg-blue-500",
            },
          ]);
        }
      } catch {}
    })();
  }, []);

  const openDetails = (app: any) => {
    setSelectedApp(app);
    setActionNotes(String(app.raw?.reviewNotes || ""));
    setActionScore(app.raw?.score == null ? "" : String(app.raw?.score));
    setDetailsOpen(true);
  };

  const handleDecision = async (app: any, decision: "approved" | "rejected") => {
    setSavingAction(true);
    try {
      const payload: any = { status: decision, reviewNotes: actionNotes };
      if (actionScore !== "") payload.score = Number(actionScore);
      const r1 = await api.updateMyAssignedApplication(app.id, payload);
      if (r1.success) {
        await api.createReview({
          applicationId: app.id,
          overallScore: actionScore === "" ? null : Number(actionScore),
          comments: actionNotes || null,
          recommendation: decision === "approved" ? "approve" : "reject",
        });
        setPendingApplications((prev) =>
          prev.map((p) =>
            p.id === app.id
              ? {
                  ...p,
                  status: decision === "approved" ? "Approved" : "Rejected",
                  score: actionScore === "" ? p.score : Number(actionScore),
                  raw: { ...p.raw, status: decision, reviewNotes: actionNotes, score: actionScore === "" ? p.raw?.score : Number(actionScore) },
                }
              : p,
          ),
        );
      }
    } finally {
      setSavingAction(false);
      setDetailsOpen(false);
      setSelectedApp(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavigation />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-ydf-light-gray">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reviewer Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.firstName}! Review and evaluate scholarship
                applications
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-ydf-deep-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-ydf-light-gray"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-ydf-light-gray">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                className="w-full pl-10 pr-4 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="under-review">Under Review</option>
              <option value="pending-docs">Pending Documents</option>
              <option value="interview">Interview Scheduled</option>
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
            >
              <option value="all">All Regions</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
            </select>

            {/* Score Filter */}
            <button className="flex items-center space-x-2 px-4 py-2 border border-ydf-light-gray rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-600" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {pendingApplications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-ydf-light-gray overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {/* Priority Indicator */}
                    <div
                      className={`w-1 h-16 rounded ${getPriorityColor(application.priority)}`}
                    ></div>

                    {/* Applicant Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-ydf-deep-blue rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {application.applicant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.applicant.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.applicant.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{application.applicant.course}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score and Status */}
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getScoreColor(application.score)}`}
                    >
                      {application.score}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Score</div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Scheme:</span>
                      <span className="font-medium">{application.scheme}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-ydf-deep-blue">
                        {application.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium">
                        {application.submittedDate}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">
                        {application.applicant.age} years
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">
                        {application.applicant.year}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">{application.region}</span>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Attached Documents ({application.documents.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {application.documents.map((doc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        <Paperclip className="h-3 w-3" />
                        <span>{doc}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">
                      {application.applicant.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">
                      {application.applicant.phone}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => openDetails(application)}
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-600 transition-colors"
                      onClick={() => openDetails(application)}
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
                      onClick={() => openDetails(application)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <button className="bg-white border border-ydf-light-gray text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Load More Applications
          </button>
        </div>
      </div>
      {detailsOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Application Details</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setDetailsOpen(false);
                  setSelectedApp(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Applicant</div>
                  <div className="font-medium">{selectedApp.applicant.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Scholarship</div>
                  <div className="font-medium">{selectedApp.scheme}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-medium">{selectedApp.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Score</div>
                  <div className="font-medium">{selectedApp.score || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Submitted</div>
                  <div className="font-medium">{String(selectedApp.submittedDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Amount</div>
                  <div className="font-medium">{selectedApp.amount || "-"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{selectedApp.applicant.email || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium">{selectedApp.applicant.phone || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Course</div>
                  <div className="font-medium">{selectedApp.applicant.course || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Year</div>
                  <div className="font-medium">{selectedApp.applicant.year || "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Documents</div>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.documents?.length ? (
                    selectedApp.documents.map((d: any, i: number) => (
                      <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        <Paperclip className="h-3 w-3" />
                        <span>{String(d)}</span>
                      </span>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No documents uploaded</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Review Notes</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter comments for your decision"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Score</label>
                  <input
                    type="number"
                    className="w-40 border rounded px-3 py-2"
                    value={actionScore}
                    onChange={(e) => setActionScore(e.target.value)}
                    placeholder="e.g. 85"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => {
                  setDetailsOpen(false);
                  setSelectedApp(null);
                }}
                disabled={savingAction}
              >
                Close
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                onClick={() => selectedApp && handleDecision(selectedApp, "rejected")}
                disabled={savingAction}
              >
                Reject
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                onClick={() => selectedApp && handleDecision(selectedApp, "approved")}
                disabled={savingAction || !actionNotes.trim()}
                title={!actionNotes.trim() ? "Please add review notes to approve" : ""}
              >
                {savingAction ? "Saving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewerDashboard;
