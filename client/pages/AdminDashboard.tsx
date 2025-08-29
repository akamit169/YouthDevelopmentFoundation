import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "../hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RoleBasedNavigation from "../components/RoleBasedNavigation";
import OnboardingTour from "../components/OnboardingTour";
import {
  Users,
  FileText,
  BarChart3,
  Plus,
  Search,
  Filter,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Copy,
  MoreVertical,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  Trash,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appStats, setAppStats] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(
    null,
  );
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [applications, setApplications] = useState<any[]>([]);
  const [appPage, setAppPage] = useState(1);
  const [appTotal, setAppTotal] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("ydf_onboarding_admin");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const allowed = [
      "overview",
      "schemes",
      "applications",
      "analytics",
      "users",
      "settings",
    ];
    if (tab && allowed.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab) {
      params.set("tab", "overview");
      navigate({
        pathname: "/admin-dashboard",
        search: `?${params.toString()}`,
      });
    }
  }, [location.search]);

  const setTab = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    navigate({ pathname: "/admin-dashboard", search: `?${params.toString()}` });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("ydf_onboarding_admin", "true");
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("ydf_onboarding_admin", "skipped");
    setShowOnboarding(false);
  };

  const stats = [
    {
      title: "Total Applications",
      value: "1,247",
      change: "+12%",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "Approved",
      value: "523",
      change: "+8%",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "In Progress",
      value: "401",
      change: "+15%",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Rejected",
      value: "323",
      change: "-5%",
      icon: XCircle,
      color: "bg-red-500",
    },
  ];

  const [schemes, setSchemes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    amount: "",
    currency: "INR",
    eligibilityCriteria: [],
    requiredDocuments: [],
    applicationDeadline: "",
    selectionDeadline: "",
    maxApplications: "",
    status: "active",
  });

  useEffect(() => {
    fetchSchemes();
    fetchOverviewData();
  }, []);

  const fetchSchemes = async () => {
    try {
      const api = (await import("../services/api")).default;
      const res = await api.listScholarships({ status: "all", limit: 100 });
      if (res.success) setSchemes(res.data);
    } catch (e) {}
  };

  const fetchOverviewData = async () => {
    try {
      const api = (await import("../services/api")).default;
      const [statsRes, recentRes, annRes] = await Promise.all([
        api.getApplicationStats(),
        api.getRecentApplications(5),
        api.listAnnouncements(5),
      ]);
      if (statsRes.success) setAppStats(statsRes.data);
      if (recentRes.success) setRecentApps(recentRes.data || []);
      if (annRes.success) setAnnouncements(annRes.data || []);
    } catch (e) {}
  };

  const fetchApplications = async (page = 1, status = appStatusFilter) => {
    try {
      const api = (await import("../services/api")).default;
      const params: any = { page, limit: 10 };
      if (status && status !== "all") params.status = status;
      const res = await api.listApplications(params);
      if (res.success) {
        setApplications(res.data);
        setAppPage(page);
        setAppTotal(res.pagination?.total || 0);
      }
    } catch (e) {}
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      amount: "",
      currency: "INR",
      eligibilityCriteria: [],
      requiredDocuments: [],
      applicationDeadline: "",
      selectionDeadline: "",
      maxApplications: "",
      status: "active",
    });
    setShowForm(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      ...s,
      applicationDeadline: s.applicationDeadline
        ? new Date(s.applicationDeadline).toISOString().slice(0, 16)
        : "",
      selectionDeadline: s.selectionDeadline
        ? new Date(s.selectionDeadline).toISOString().slice(0, 16)
        : "",
      eligibilityCriteria: Array.isArray(s.eligibilityCriteria)
        ? s.eligibilityCriteria
        : [],
      requiredDocuments: Array.isArray(s.requiredDocuments)
        ? s.requiredDocuments
        : [],
    });
    setShowForm(true);
  };

  const submitForm = async () => {
    const api = (await import("../services/api")).default;
    const payload = {
      ...form,
      amount: String(form.amount),
      eligibilityCriteria:
        typeof form.eligibilityCriteria === "string"
          ? form.eligibilityCriteria
              .split(",")
              .map((x: string) => x.trim())
              .filter(Boolean)
          : form.eligibilityCriteria,
      requiredDocuments:
        typeof form.requiredDocuments === "string"
          ? form.requiredDocuments
              .split(",")
              .map((x: string) => x.trim())
              .filter(Boolean)
          : form.requiredDocuments,
      applicationDeadline: form.applicationDeadline
        ? new Date(form.applicationDeadline).toISOString()
        : undefined,
      selectionDeadline: form.selectionDeadline
        ? new Date(form.selectionDeadline).toISOString()
        : undefined,
      maxApplications: form.maxApplications
        ? Number(form.maxApplications)
        : undefined,
      status: form.status || "active",
    };
    if (editing) await api.updateScholarship(editing.id, payload);
    else await api.createScholarship(payload);
    setShowForm(false);
    await fetchSchemes();
  };

  const deleteScheme = async (id: number) => {
    if (!window.confirm("Delete this scheme? This action cannot be undone."))
      return;
    const api = (await import("../services/api")).default;
    await api.deleteScholarship(id);
    await fetchSchemes();
  };

  const copyScheme = async (s: any) => {
    const api = (await import("../services/api")).default;
    const payload = {
      title: `Copy of ${s.title || s.name}`,
      description: s.description || "",
      amount: String(s.amount || "0"),
      currency: s.currency || "INR",
      eligibilityCriteria: Array.isArray(s.eligibilityCriteria)
        ? s.eligibilityCriteria
        : [],
      requiredDocuments: Array.isArray(s.requiredDocuments)
        ? s.requiredDocuments
        : [],
      applicationDeadline: s.applicationDeadline
        ? new Date(s.applicationDeadline).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      selectionDeadline: s.selectionDeadline
        ? new Date(s.selectionDeadline).toISOString()
        : undefined,
      maxApplications: s.maxApplications ?? null,
      tags: Array.isArray(s.tags) ? s.tags : undefined,
      status: s.status || "active",
    };
    await api.createScholarship(payload);
    await fetchSchemes();
  };

  const recentApplications = recentApps.length
    ? recentApps.map((a: any) => ({
        id: a.id,
        applicant: a.studentName || `Student #${a.studentId}`,
        scheme: a.scholarshipTitle || `Scheme #${a.scholarshipId}`,
        status: a.status,
        submittedDate: a.submittedAt
          ? new Date(a.submittedAt).toLocaleDateString()
          : "",
        score: a.score ?? "-",
        scholarshipId: a.scholarshipId,
      }))
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "active":
        return "bg-green-100 text-green-800";
      case "Draft":
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "Closed":
      case "closed":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending Documents":
        return "bg-orange-100 text-orange-800";
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            title: "Total Applications",
            value: appStats?.total ?? 0,
            change: "",
            icon: FileText,
            color: "bg-blue-500",
            filter: "all",
          },
          {
            title: "Approved",
            value: appStats?.approved ?? 0,
            change: "",
            icon: CheckCircle,
            color: "bg-green-500",
            filter: "approved",
          },
          {
            title: "In Progress",
            value: appStats?.under_review ?? 0,
            change: "",
            icon: Clock,
            color: "bg-yellow-500",
            filter: "under_review",
          },
          {
            title: "Rejected",
            value: appStats?.rejected ?? 0,
            change: "",
            icon: XCircle,
            color: "bg-red-500",
            filter: "rejected",
          },
          {
            title: "Total Applied Amount",
            value: appStats?.total_applied_amount
              ? `₹${Number(appStats.total_applied_amount).toLocaleString("en-IN")}`
              : "₹0",
            change: "",
            icon: DollarSign,
            color: "bg-purple-500",
            filter: "all",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-ydf-light-gray cursor-pointer"
            onClick={() => {
              setTab("applications");
              setAppStatusFilter(stat.filter as any);
              fetchApplications(1, stat.filter as any);
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Plus, label: "Create Scheme", color: "bg-ydf-deep-blue" },
            {
              icon: FileText,
              label: "Review Apps",
              color: "bg-ydf-teal-green",
            },
            { icon: Download, label: "Export Data", color: "bg-purple-500" },
            { icon: Settings, label: "Settings", color: "bg-gray-500" },
          ].map((action, index) => (
            <button
              key={action.label}
              onClick={async () => {
                if (action.label === "Create Scheme") {
                  setTab("schemes");
                  openCreate();
                } else if (action.label === "Review Apps") {
                  setTab("applications");
                  await fetchApplications(1, "all");
                } else if (action.label === "Export Data") {
                  const api = (await import("../services/api")).default;
                  const blob = await api.exportApplicationsCSV(
                    appStatusFilter !== "all"
                      ? { status: appStatusFilter }
                      : undefined,
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "applications.csv";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } else if (action.label === "Settings") {
                  setTab("settings");
                }
              }}
              className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:opacity-90 transition-opacity`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-ydf-light-gray">
          <div className="p-6 border-b border-ydf-light-gray">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h3>
          </div>
          <div className="divide-y divide-ydf-light-gray">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-ydf-deep-blue rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {app.applicant
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {app.applicant}
                        </p>
                        <p className="text-sm text-gray-600">{app.scheme}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Score: {app.score}
                      </p>
                      <p className="text-xs text-gray-600">
                        {app.submittedDate}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                    >
                      {app.status}
                    </span>
                    <button
                      onClick={() => openViewScholarship(app.scholarshipId)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="bg-white rounded-lg shadow-sm border border-ydf-light-gray">
          <div className="p-6 border-b border-ydf-light-gray">
            <h3 className="text-lg font-semibold text-gray-900">
              Latest Announcements
            </h3>
          </div>
          <div className="divide-y divide-ydf-light-gray">
            {announcements.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAnnouncement(a)}
                className="w-full text-left p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {a.content}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${a.priority === "urgent" ? "bg-red-100 text-red-800" : a.priority === "high" ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {a.type}
                  </span>
                </div>
              </button>
            ))}
            {!announcements.length && (
              <div className="p-4 text-sm text-gray-600">No announcements</div>
            )}
          </div>
        </div>
      </div>

      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedAnnouncement.title}
              </h3>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {selectedAnnouncement.content}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Type: {selectedAnnouncement.type}</span>
              <span>Priority: {selectedAnnouncement.priority}</span>
            </div>
            <div className="text-right">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded bg-ydf-deep-blue text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSchemes = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Scholarship Schemes
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const api = (await import("../services/api")).default;
              const blob = await api.exportScholarshipsCSV();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "scholarships.csv";
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
          >
            <Download className="h-4 w-4" />
            <span>Export Schemes</span>
          </button>
          <button
            onClick={openCreate}
            className="bg-ydf-deep-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90"
          >
            <Plus className="h-4 w-4" />
            <span>Create Scheme</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search schemes..."
            className="w-full pl-10 pr-4 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="p-2 border border-ydf-light-gray rounded-lg hover:bg-gray-50">
          <Filter className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-ydf-light-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-ydf-light-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheme Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ydf-light-gray">
              {schemes
                .filter((s) =>
                  (s.title || s.name || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {scheme.title || scheme.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(scheme.tags && Array.isArray(scheme.tags)
                            ? scheme.tags.join(", ")
                            : scheme.category) || "General"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(scheme.status)}`}
                      >
                        {scheme.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {scheme.currentApplications ?? scheme.applications ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {scheme.amount
                        ? `₹${scheme.amount}`
                        : scheme.budget || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {scheme.applicationDeadline
                        ? new Date(scheme.applicationDeadline).toLocaleString()
                        : scheme.deadline || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openViewScholarship(scheme.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => openEdit(scheme)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => copyScheme(scheme)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Copy className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteScheme(scheme.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </button>
                        <button
                          onClick={async () => {
                            const api = (await import("../services/api"))
                              .default;
                            const blob = await api.exportApplicationsCSV({
                              scholarshipId: scheme.id,
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            const name = (
                              scheme.title ||
                              scheme.name ||
                              `scheme-${scheme.id}`
                            )
                              .toString()
                              .replace(/[^a-z0-9-_]+/gi, "-");
                            a.download = `applications_${name}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(url);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Download className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Applications Trend
            </h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">+18%</div>
          <p className="text-sm text-gray-600">Compared to last month</p>
          <div className="mt-4 h-20 bg-gradient-to-r from-ydf-deep-blue to-ydf-teal-green rounded opacity-20"></div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Total Disbursed
            </h3>
            <DollarSign className="h-5 w-5 text-ydf-golden-yellow" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">₹2.3Cr</div>
          <p className="text-sm text-gray-600">This financial year</p>
          <div className="mt-4 h-20 bg-gradient-to-r from-ydf-golden-yellow to-ydf-teal-green rounded opacity-20"></div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">68%</div>
          <p className="text-sm text-gray-600">Application approval rate</p>
          <div className="mt-4 h-20 bg-gradient-to-r from-green-400 to-ydf-teal-green rounded opacity-20"></div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Application Distribution
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Bar Chart Placeholder</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Disbursement Breakdown
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full border-4 border-gray-400 mx-auto mb-2"></div>
              <p className="text-gray-500">Donut Chart Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const [viewScholarship, setViewScholarship] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const openViewScholarship = async (id: number) => {
    try {
      setViewLoading(true);
      const api = (await import("../services/api")).default;
      const res = await api.getScholarship(id);
      if (res.success) setViewScholarship(res.data);
    } catch (e) {
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingTour
          userType="admin"
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNavigation />

        {/* Header */}
        <div className="bg-white shadow-sm border-b border-ydf-light-gray">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.firstName}! Manage scholarships and
                  applications
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Settings className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white shadow-sm border-r border-ydf-light-gray min-h-screen">
            <nav className="p-4 space-y-2">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "schemes", label: "Manage Schemes", icon: FileText },
                { id: "applications", label: "View Applications", icon: Users },
                { id: "analytics", label: "Analytics", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-ydf-deep-blue text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === "overview" && renderOverview()}
            {activeTab === "schemes" && renderSchemes()}
            {activeTab === "applications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Applications
                  </h2>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={appStatusFilter}
                      onChange={(e) => {
                        setAppStatusFilter(e.target.value);
                        fetchApplications(1, e.target.value);
                      }}
                    >
                      <option value="all">All</option>
                      <option value="submitted">submitted</option>
                      <option value="under_review">under_review</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                      <option value="waitlisted">waitlisted</option>
                    </select>
                    <button
                      onClick={() => fetchApplications(1, appStatusFilter)}
                      className="px-3 py-2 bg-ydf-deep-blue text-white rounded"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-ydf-light-gray overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-ydf-light-gray">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Scholarship
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ydf-light-gray">
                        {applications.map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm text-gray-900">
                              {a.id}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900">
                              {a.scholarshipTitle || `#${a.scholarshipId}`}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900">
                              {a.studentName || `#${a.studentId}`}
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900">
                              {a.submittedAt
                                ? new Date(a.submittedAt).toLocaleString()
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Page {appPage} • Total {appTotal}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={appPage <= 1}
                      onClick={() => fetchApplications(appPage - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      disabled={applications.length < 10}
                      onClick={() => fetchApplications(appPage + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "analytics" && renderAnalytics()}
          </div>
        </div>
      </div>

      {viewScholarship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{viewScholarship.title}</h3>
              <button
                onClick={() => setViewScholarship(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {viewScholarship.description}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Amount</div>
                <div className="font-medium">₹{viewScholarship.amount}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(viewScholarship.status)}`}
                  >
                    {viewScholarship.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Application Deadline</div>
                <div className="font-medium">
                  {viewScholarship.applicationDeadline
                    ? new Date(
                        viewScholarship.applicationDeadline,
                      ).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Selection Deadline</div>
                <div className="font-medium">
                  {viewScholarship.selectionDeadline
                    ? new Date(
                        viewScholarship.selectionDeadline,
                      ).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">Eligibility</div>
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                {(Array.isArray(viewScholarship.eligibilityCriteria)
                  ? viewScholarship.eligibilityCriteria
                  : []
                ).map((e: any, i: number) => (
                  <li key={i}>{String(e)}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">
                Required Documents
              </div>
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                {(Array.isArray(viewScholarship.requiredDocuments)
                  ? viewScholarship.requiredDocuments
                  : []
                ).map((d: any, i: number) => (
                  <li key={i}>{String(d)}</li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <button
                onClick={() => setViewScholarship(null)}
                className="px-4 py-2 rounded bg-ydf-deep-blue text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">
              {editing ? "Edit Scholarship" : "Create Scholarship"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Title</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Amount (INR)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Max Applications
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.maxApplications}
                  onChange={(e) =>
                    setForm({ ...form, maxApplications: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Application Deadline
                </label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2"
                  value={form.applicationDeadline}
                  onChange={(e) =>
                    setForm({ ...form, applicationDeadline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Selection Deadline
                </label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2"
                  value={form.selectionDeadline}
                  onChange={(e) =>
                    setForm({ ...form, selectionDeadline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">
                  Eligibility (comma separated)
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={
                    Array.isArray(form.eligibilityCriteria)
                      ? form.eligibilityCriteria.join(", ")
                      : form.eligibilityCriteria
                  }
                  onChange={(e) =>
                    setForm({ ...form, eligibilityCriteria: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">
                  Required Documents (comma separated)
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={
                    Array.isArray(form.requiredDocuments)
                      ? form.requiredDocuments.join(", ")
                      : form.requiredDocuments
                  }
                  onChange={(e) =>
                    setForm({ ...form, requiredDocuments: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                className="px-4 py-2 rounded bg-ydf-deep-blue text-white"
              >
                {editing ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
