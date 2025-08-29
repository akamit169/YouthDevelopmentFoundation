import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "../hooks/use-toast";
import {
  ArrowLeft,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  Info,
  Heart,
  MapPin,
  GraduationCap,
  FileText,
  Star,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";

const Scholarships = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAmount, setSelectedAmount] = useState("all");
  const [selectedDeadline, setSelectedDeadline] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [remoteScholarships, setRemoteScholarships] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("deadline");
  const [appliedIds, setAppliedIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const api = (await import("../services/api")).default;
        const params: Record<string, any> = { status: "active", limit: 1000 };
        const q = searchQuery.trim();
        if (q) params.search = q;
        if (selectedCategory && selectedCategory !== "all")
          params.category = selectedCategory;
        // Amount range -> min/max
        if (selectedAmount && selectedAmount !== "all") {
          if (selectedAmount === "0-25000") {
            params.maxAmount = 25000;
          } else if (selectedAmount === "25001-50000") {
            params.minAmount = 25001;
            params.maxAmount = 50000;
          } else if (selectedAmount === "50001-75000") {
            params.minAmount = 50001;
            params.maxAmount = 75000;
          } else if (selectedAmount === "75001+") {
            params.minAmount = 75001;
          }
        }
        // Deadline -> after now and before target window
        const now = new Date();
        if (selectedDeadline && selectedDeadline !== "all") {
          const after = now.toISOString();
          let before: string | undefined;
          const d = new Date(now);
          if (selectedDeadline === "week") d.setDate(d.getDate() + 7);
          if (selectedDeadline === "month") d.setDate(d.getDate() + 30);
          if (selectedDeadline === "quarter") d.setDate(d.getDate() + 90);
          before = d.toISOString();
          params.deadlineAfter = after;
          params.deadlineBefore = before;
        }
        // Sort
        if (sortBy === "deadline") {
          params.sortBy = "deadline";
          params.sortOrder = "asc";
        } else if (sortBy === "amount") {
          params.sortBy = "amount";
          params.sortOrder = "desc";
        } else if (sortBy === "applicants") {
          params.sortBy = "applicants";
          params.sortOrder = "desc";
        }
        const res = await api.listScholarships(params);
        if (res.success) setRemoteScholarships(res.data || []);
      } catch {}
    })();
  }, [searchQuery, selectedCategory, selectedAmount, selectedDeadline, sortBy]);

  useEffect(() => {
    (async () => {
      try {
        const api = (await import("../services/api")).default;
        const res = await api.listMyApplications({ limit: 1000 });
        if (res.success) {
          setAppliedIds(
            (res.data || []).map((a: any) => Number(a.scholarshipId)),
          );
        }
      } catch {}
    })();
  }, []);

  const fallbackScholarships = [
    {
      id: 1,
      name: "Merit Excellence Scholarship",
      organization: "Youth Dreamers Foundation",
      amount: "₹50,000",
      category: "Academic Excellence",
      deadline: "2024-03-15",
      applicants: 156,
      eligibility: [
        "CGPA above 8.5",
        "Annual family income below ₹5 lakhs",
        "Currently enrolled in UG/PG program",
      ],
      description:
        "Supporting academically excellent students with financial assistance to pursue their educational goals.",
      benefits: [
        "One-time scholarship of ₹50,000",
        "Mentorship program access",
        "Career guidance sessions",
      ],
      documents: [
        "Academic transcripts",
        "Income certificate",
        "Aadhaar card",
        "Bank account details",
      ],
      status: "Open",
      difficulty: "Medium",
      rating: 4.8,
      tags: ["Academic", "Merit-based", "UG/PG"],
    },
    {
      id: 2,
      name: "Rural Girls Education Grant",
      organization: "Empowerment Foundation",
      amount: "₹35,000",
      category: "Gender Equity",
      deadline: "2024-04-20",
      applicants: 89,
      eligibility: [
        "Female candidates only",
        "From rural areas",
        "Family income below ��3 lakhs",
        "Age between 18-25 years",
      ],
      description:
        "Empowering rural girls through education by providing financial support for higher studies.",
      benefits: [
        "Annual scholarship of ₹35,000",
        "Free skill development courses",
        "Laptop/tablet assistance",
      ],
      documents: [
        "Income certificate",
        "Rural residence proof",
        "Academic records",
        "Aadhaar card",
      ],
      status: "Open",
      difficulty: "Easy",
      rating: 4.9,
      tags: ["Gender", "Rural", "Empowerment"],
    },
    {
      id: 3,
      name: "Technical Innovation Fund",
      organization: "Tech for Good Foundation",
      amount: "₹75,000",
      category: "Technology",
      deadline: "2024-05-30",
      applicants: 234,
      eligibility: [
        "Engineering/Technology students",
        "Innovative project proposal required",
        "CGPA above 7.5",
        "Team project (2-4 members)",
      ],
      description:
        "Supporting innovative technology projects that solve real-world problems.",
      benefits: [
        "Project funding up to ₹75,000",
        "Incubation support",
        "Industry mentorship",
        "Patent filing assistance",
      ],
      documents: [
        "Project proposal",
        "Technical documentation",
        "Team details",
        "Academic transcripts",
      ],
      status: "Open",
      difficulty: "Hard",
      rating: 4.7,
      tags: ["Technology", "Innovation", "Team"],
    },
    {
      id: 4,
      name: "Arts & Culture Scholarship",
      organization: "Cultural Heritage Foundation",
      amount: "₹30,000",
      category: "Arts & Culture",
      deadline: "2024-03-25",
      applicants: 67,
      eligibility: [
        "Arts/Fine Arts/Music students",
        "Portfolio submission required",
        "Family income below ₹4 lakhs",
      ],
      description:
        "Preserving and promoting Indian arts and culture through educational support.",
      benefits: [
        "Annual scholarship of ₹30,000",
        "Exhibition opportunities",
        "Master class access",
      ],
      documents: [
        "Portfolio/Performance videos",
        "Academic records",
        "Income certificate",
        "Recommendation letters",
      ],
      status: "Open",
      difficulty: "Medium",
      rating: 4.6,
      tags: ["Arts", "Culture", "Creative"],
    },
    {
      id: 5,
      name: "Disability Support Scholarship",
      organization: "Inclusive Education Trust",
      amount: "₹40,000",
      category: "Disability Support",
      deadline: "2024-04-15",
      applicants: 45,
      eligibility: [
        "Students with disabilities",
        "Valid disability certificate",
        "Minimum 60% in previous qualification",
      ],
      description:
        "Supporting students with disabilities to access quality education without financial barriers.",
      benefits: [
        "Annual scholarship of ₹40,000",
        "Accessibility support",
        "Assistive technology",
        "Career counseling",
      ],
      documents: [
        "Disability certificate",
        "Medical reports",
        "Academic transcripts",
        "Income certificate",
      ],
      status: "Open",
      difficulty: "Easy",
      rating: 4.9,
      tags: ["Disability", "Inclusive", "Support"],
    },
    {
      id: 6,
      name: "Sports Excellence Scholarship",
      organization: "Athletic Development Foundation",
      amount: "₹45,000",
      category: "Sports",
      deadline: "2024-02-28",
      applicants: 123,
      eligibility: [
        "Sports achievements at state/national level",
        "Currently training/competing",
        "Student-athlete status",
      ],
      description:
        "Supporting talented athletes to balance sports and education excellence.",
      benefits: [
        "Annual scholarship of ₹45,000",
        "Sports equipment support",
        "Nutrition guidance",
        "Training facility access",
      ],
      documents: [
        "Sports achievement certificates",
        "Coach recommendation",
        "Academic records",
        "Medical fitness certificate",
      ],
      status: "Closing Soon",
      difficulty: "Medium",
      rating: 4.5,
      tags: ["Sports", "Athletic", "Performance"],
    },
  ];

  const categories = useMemo(() => {
    const set = new Set<string>();
    (remoteScholarships || []).forEach((s: any) => {
      if (Array.isArray(s?.tags))
        s.tags.forEach((t: any) => set.add(String(t)));
    });
    return ["all", ...Array.from(set)];
  }, [remoteScholarships]);

  const amountRanges = [
    { value: "all", label: "All Amounts" },
    { value: "0-25000", label: "Up to ₹25,000" },
    { value: "25001-50000", label: "₹25,001 - ₹50,000" },
    { value: "50001-75000", label: "₹50,001 - ₹75,000" },
    { value: "75001+", label: "Above ₹75,000" },
  ];

  const deadlineOptions = [
    { value: "all", label: "All Deadlines" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "Next 3 Months" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800";
      case "Closing Soon":
        return "bg-orange-100 text-orange-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const scholarships =
    remoteScholarships && remoteScholarships.length
      ? remoteScholarships.map((s: any) => ({
          id: s.id,
          name: s.title,
          organization: "Youth Dreamers Foundation",
          amount: `₹${s.amount}`,
          category:
            Array.isArray(s.tags) && s.tags.length ? s.tags[0] : "General",
          deadline: s.applicationDeadline
            ? new Date(s.applicationDeadline).toISOString().slice(0, 10)
            : "",
          applicants: s.currentApplications || 0,
          eligibility: Array.isArray(s.eligibilityCriteria)
            ? s.eligibilityCriteria
            : [],
          description: s.description,
          benefits: [],
          documents: Array.isArray(s.requiredDocuments)
            ? s.requiredDocuments
            : [],
          status:
            s.status === "active"
              ? "Open"
              : s.status === "closed"
                ? "Closed"
                : "Open",
          difficulty: "Medium",
          rating: 4.6,
          tags: Array.isArray(s.tags) ? s.tags : [],
        }))
      : fallbackScholarships;

  const filteredScholarships = scholarships.filter((scholarship) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      scholarship.name.toLowerCase().includes(q) ||
      (String(scholarship.amount) || "").toLowerCase().includes(q) ||
      (String(scholarship.category) || "").toLowerCase().includes(q);

    // Client-side fallbacks (server already filters when possible)
    const matchesCategory = (() => {
      if (selectedCategory === "all") return true;
      const tags = (scholarship.tags || []) as any[];
      return Array.isArray(tags)
        ? tags.some((t) => String(t) === String(selectedCategory))
        : false;
    })();

    const matchesDeadline = () => {
      if (selectedDeadline === "all") return true;
      if (!scholarship.deadline) return false;
      const now = new Date();
      const d = new Date(scholarship.deadline);
      const diffDays = Math.ceil(
        (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays < 0) return false;
      if (selectedDeadline === "week") return diffDays <= 7;
      if (selectedDeadline === "month") return diffDays <= 30;
      if (selectedDeadline === "quarter") return diffDays <= 90;
      return true;
    };

    const matchesAmount = () => {
      if (selectedAmount === "all") return true;
      const amount = parseInt(String(scholarship.amount).replace(/[^0-9]/g, ""));
      switch (selectedAmount) {
        case "0-25000":
          return amount <= 25000;
        case "25001-50000":
          return amount > 25000 && amount <= 50000;
        case "50001-75000":
          return amount > 50000 && amount <= 75000;
        case "75001+":
          return amount > 75000;
        default:
          return true;
      }
    };

    return (
      matchesSearch && matchesCategory && matchesAmount() && matchesDeadline()
    );
  });

  const ApplicationModal = ({ scholarship, onClose }: any) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const startApplication = async () => {
      try {
        setIsSubmitting(true);
        const api = (await import("../services/api")).default;
        const res = await api.createApplication({
          scholarshipId: Number(scholarship.id),
        });
        if (res.success) {
          toast({
            title: "Application submitted",
            description: "Track it in Progress",
          });
          onClose();
          navigate("/progress");
        }
      } catch (e: any) {
        toast({ title: "Apply failed", description: String(e?.message || e) });
      } finally {
        setIsSubmitting(false);
      }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Apply for {scholarship.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Scholarship Details */}
            <div className="bg-ydf-deep-blue text-white p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{scholarship.name}</h3>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>Amount: {scholarship.amount}</div>
                <div>Deadline: {scholarship.deadline}</div>
              </div>
            </div>

            {/* Eligibility Check */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Eligibility Criteria
              </h4>
              <div className="space-y-2">
                {scholarship.eligibility.map(
                  (criteria: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{criteria}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Required Documents
              </h4>
              <div className="space-y-2">
                {scholarship.documents.map((doc: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Application Steps
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-ydf-deep-blue text-white rounded-full flex items-center justify-center text-xs">
                    1
                  </div>
                  <span>Personal Information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs">
                    2
                  </div>
                  <span>Educational Details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs">
                    3
                  </div>
                  <span>Document Upload</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs">
                    4
                  </div>
                  <span>Review & Submit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startApplication}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors text-white ${isSubmitting ? "bg-gray-400" : "bg-ydf-deep-blue hover:bg-opacity-90"}`}
              >
                Start Application
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-ydf-light-gray">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/student-dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Available Scholarships
              </h1>
              <p className="text-sm text-gray-600">
                Discover funding opportunities for your education
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-ydf-light-gray">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search scholarships..."
                className="w-full pl-10 pr-4 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 border border-ydf-light-gray rounded-lg transition-colors ${
                  showFilters
                    ? "bg-ydf-deep-blue text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Range
                  </label>
                  <select
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
                  >
                    {amountRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <select
                    value={selectedDeadline}
                    onChange={(e) => setSelectedDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
                  >
                    {deadlineOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedAmount("all");
                      setSelectedDeadline("all");
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Found {filteredScholarships.length} scholarship
            {filteredScholarships.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Sort by:</span>
            <select
              className="border border-ydf-light-gray rounded px-2 py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deadline">Deadline</option>
              <option value="amount">Amount</option>
              <option value="applicants">Applicants</option>
            </select>
          </div>
        </div>

        {/* Scholarships Grid */}
        <div className="grid gap-6">
          {useMemo(() => {
            const arr = [...filteredScholarships];
            if (sortBy === "deadline") {
              arr.sort((a: any, b: any) => {
                const da = a.deadline
                  ? new Date(a.deadline).getTime()
                  : Infinity;
                const db = b.deadline
                  ? new Date(b.deadline).getTime()
                  : Infinity;
                return da - db;
              });
            } else if (sortBy === "amount") {
              arr.sort((a: any, b: any) => {
                const aa =
                  parseInt(String(a.amount).replace(/[^0-9]/g, "")) || 0;
                const bb =
                  parseInt(String(b.amount).replace(/[^0-9]/g, "")) || 0;
                return bb - aa;
              });
            } else if (sortBy === "applicants") {
              arr.sort(
                (a: any, b: any) => (b.applicants || 0) - (a.applicants || 0),
              );
            }
            return arr;
          }, [filteredScholarships, sortBy]).map((scholarship, index) => (
            <motion.div
              key={scholarship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-ydf-light-gray overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {scholarship.name}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}
                      >
                        {scholarship.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {scholarship.organization}
                    </p>
                    <p className="text-gray-700">{scholarship.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-ydf-deep-blue">
                      {scholarship.amount}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{scholarship.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {scholarship.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${getDifficultyColor(scholarship.difficulty)}`}
                  >
                    {scholarship.difficulty}
                  </span>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Deadline</span>
                      <div className="font-medium">{scholarship.deadline}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Applicants</span>
                      <div className="font-medium">
                        {scholarship.applicants}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Category</span>
                      <div className="font-medium">{scholarship.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Type</span>
                      <div className="font-medium">Merit-based</div>
                    </div>
                  </div>
                </div>

                {/* Eligibility Preview */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Key Eligibility
                  </h5>
                  <div className="space-y-1">
                    {scholarship.eligibility
                      .slice(0, 2)
                      .map((criteria, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-gray-600">
                            {criteria}
                          </span>
                        </div>
                      ))}
                    {scholarship.eligibility.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{scholarship.eligibility.length - 2} more criteria
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/scholarships/${scholarship.id}`}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Info className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                    {appliedIds.includes(Number(scholarship.id)) ? (
                      <span className="px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700">
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedScholarship(scholarship)}
                        className="bg-ydf-deep-blue text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
                      >
                        <span>Apply Now</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No scholarships found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedAmount("all");
                setSelectedDeadline("all");
                setSearchQuery("");
              }}
              className="text-ydf-deep-blue hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {selectedScholarship && (
        <ApplicationModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
        />
      )}
    </div>
  );
};

export default Scholarships;
