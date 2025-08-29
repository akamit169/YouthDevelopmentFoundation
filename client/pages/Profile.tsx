import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { toast } from "../hooks/use-toast";
import {
  ArrowLeft,
  User,
  Edit,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Shield,
  Bell,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  Upload,
  Download,
  Trash2,
} from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
    loading: false,
  });
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    city: "",
    state: "",
    pincode: "",
    course: "",
    college: "",
    year: "",
    rollNumber: "",
    cgpa: "",
    category: "General",
    familyIncome: "",
  });

  const [documents, setDocuments] = useState<any[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getProfile();
        if (res.success && res.data) {
          const u: any = res.data;
          const pd = u.profileData || {};
          setProfileData({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            phone: u.phone || "",
            dateOfBirth: pd.dateOfBirth || "",
            gender: pd.gender || "Male",
            address: pd.address || "",
            city: pd.city || "",
            state: pd.state || "",
            pincode: pd.pincode || "",
            course: pd.course || "",
            college: pd.college || "",
            year: pd.year || "",
            rollNumber: pd.rollNumber || "",
            cgpa: pd.cgpa || "",
            category: pd.category || "General",
            familyIncome: pd.familyIncome || "",
          });
        }
      } catch (e: any) {
        toast({
          title: "Failed to load profile",
          description: String(e?.message || e),
        });
      }
    })();
  }, []);

  const handleSave = async () => {
    // Validation
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter first and last name",
      });
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email);
    if (!emailOk) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    const phoneOk = /^\+?\d[\d\s-]{7,}$/.test(profileData.phone);
    if (!phoneOk) {
      toast({
        title: "Invalid phone",
        description: "Please enter a valid phone number",
      });
      return;
    }
    if (profileData.pincode && !/^\d{5,6}$/.test(profileData.pincode)) {
      toast({
        title: "Invalid pincode",
        description: "Pincode must be 5-6 digits",
      });
      return;
    }
    if (
      profileData.cgpa &&
      (isNaN(Number(profileData.cgpa)) ||
        Number(profileData.cgpa) < 0 ||
        Number(profileData.cgpa) > 10)
    ) {
      toast({
        title: "Invalid CGPA",
        description: "CGPA must be between 0 and 10",
      });
      return;
    }

    try {
      const payload: any = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phone: profileData.phone,
        profileData: {
          dateOfBirth: profileData.dateOfBirth,
          gender: profileData.gender,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode,
          course: profileData.course,
          college: profileData.college,
          year: profileData.year,
          rollNumber: profileData.rollNumber,
          cgpa: profileData.cgpa,
          category: profileData.category,
          familyIncome: profileData.familyIncome,
        },
      };
      const res = await api.updateProfile(payload);
      if (res.success) {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved",
        });
        setIsEditing(false);
      }
    } catch (e: any) {
      toast({ title: "Update failed", description: String(e?.message || e) });
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-ydf-deep-blue rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {profileData.firstName[0]}
                {profileData.lastName[0]}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 bg-ydf-golden-yellow p-2 rounded-full hover:bg-opacity-90 transition-colors">
              <Camera className="h-4 w-4 text-ydf-deep-blue" />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {profileData.firstName} {profileData.lastName}
            </h3>
            <p className="text-gray-600">{profileData.course}</p>
            <p className="text-sm text-gray-500">{profileData.college}</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h3>
          <button
            onClick={() =>
              isEditing ? handleSave() : setIsEditing(!isEditing)
            }
            className="flex items-center space-x-2 px-4 py-2 bg-ydf-deep-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={true}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={profileData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Address Information
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={profileData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={profileData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={profileData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={profileData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEducationInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Educational Information
          </h3>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center space-x-2 px-4 py-2 bg-ydf-deep-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <input
              type="text"
              value={profileData.course}
              onChange={(e) => handleInputChange("course", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College/University
            </label>
            <input
              type="text"
              value={profileData.college}
              onChange={(e) => handleInputChange("college", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Year
            </label>
            <select
              value={profileData.year}
              onChange={(e) => handleInputChange("year", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Final Year">Final Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number
            </label>
            <input
              type="text"
              value={profileData.rollNumber}
              onChange={(e) => handleInputChange("rollNumber", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CGPA/Percentage
            </label>
            <input
              type="text"
              value={profileData.cgpa}
              onChange={(e) => handleInputChange("cgpa", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={profileData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Family Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Family Income
            </label>
            <input
              type="text"
              value={profileData.familyIncome}
              onChange={(e) =>
                handleInputChange("familyIncome", e.target.value)
              }
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Uploaded Documents
          </h3>
          <div>
            <input
              id="doc-file"
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const reader = new FileReader();
                  reader.onload = async () => {
                    const base64 = String(reader.result || "");
                    const res = await api.uploadMyDocument({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      content: base64,
                    });
                    if (res.success) {
                      const list = await api.listMyDocuments();
                      if (list.success) setDocuments(list.data || []);
                      toast({ title: "Uploaded", description: file.name });
                    }
                  };
                  reader.readAsDataURL(file);
                } catch (err: any) {
                  toast({
                    title: "Upload failed",
                    description: String(err?.message || err),
                  });
                } finally {
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <label
              htmlFor="doc-file"
              className="cursor-pointer bg-ydf-deep-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Upload New</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-ydf-light-gray rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-ydf-teal-green rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Uploaded: {doc.uploadDate}</span>
                    <span>
                      Size:{" "}
                      {doc.size
                        ? `${Math.round((Number(doc.size) || 0) / 1024)} KB`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}
                >
                  {doc.status}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={async () => {
                      try {
                        const blob = await api.downloadMyDocument(
                          Number(doc.id),
                        );
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                      } catch (e: any) {
                        toast({
                          title: "Open failed",
                          description: String(e?.message || e),
                        });
                      }
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const blob = await api.downloadMyDocument(
                          Number(doc.id),
                        );
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = doc.name || "document";
                        a.click();
                      } catch (e: any) {
                        toast({
                          title: "Download failed",
                          description: String(e?.message || e),
                        });
                      }
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Download className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.deleteMyDocument(Number(doc.id));
                        if (res.success) {
                          setDocuments((prev) =>
                            prev.filter(
                              (d: any) => Number(d.id) !== Number(doc.id),
                            ),
                          );
                        }
                      } catch (e: any) {
                        toast({
                          title: "Delete failed",
                          description: String(e?.message || e),
                        });
                      }
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!documents || documents.length === 0) && (
            <div className="text-sm text-gray-600">
              No documents uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { id: "email", label: "Email Notifications", enabled: true },
            { id: "sms", label: "SMS Notifications", enabled: false },
            { id: "push", label: "Push Notifications", enabled: true },
            { id: "deadlines", label: "Deadline Reminders", enabled: true },
            { id: "updates", label: "Application Updates", enabled: true },
          ].map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {setting.label}
              </label>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  setting.enabled ? "bg-ydf-deep-blue" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    setting.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ydf-light-gray">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={pwd.current}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, current: e.target.value }))
                }
                className="w-full px-3 py-2 pr-10 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwd.confirm}
              onChange={(e) =>
                setPwd((p) => ({ ...p, confirm: e.target.value }))
              }
              className="w-full px-3 py-2 border border-ydf-light-gray rounded-lg focus:ring-2 focus:ring-ydf-deep-blue focus:border-transparent"
            />
          </div>
          <button
            onClick={async () => {
              if (!pwd.current || !pwd.next || !pwd.confirm) {
                toast({ title: "All fields required" });
                return;
              }
              if (pwd.next !== pwd.confirm) {
                toast({ title: "Passwords do not match" });
                return;
              }
              if (pwd.next.length < 8) {
                toast({
                  title: "Weak password",
                  description:
                    "Use at least 8 characters with upper, lower, number & symbol",
                });
              }
              try {
                setPwd((p) => ({ ...p, loading: true }));
                const res = await api.changePassword({
                  currentPassword: pwd.current,
                  newPassword: pwd.next,
                });
                if (res.success) {
                  toast({ title: "Password updated" });
                  setPwd({
                    current: "",
                    next: "",
                    confirm: "",
                    loading: false,
                  });
                }
              } catch (e: any) {
                toast({
                  title: "Update failed",
                  description: String(e?.message || e),
                });
                setPwd((p) => ({ ...p, loading: false }));
              }
            }}
            disabled={pwd.loading}
            className={`px-4 py-2 rounded-lg transition-colors text-white ${pwd.loading ? "bg-gray-400" : "bg-ydf-deep-blue hover:bg-opacity-90"}`}
          >
            {pwd.loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );

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
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-ydf-light-gray">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: "personal", label: "Personal Info", icon: User },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "settings", label: "Settings", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-ydf-deep-blue text-ydf-deep-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "personal" && renderPersonalInfo()}
          {activeTab === "education" && renderEducationInfo()}
          {activeTab === "documents" && renderDocuments()}
          {activeTab === "settings" && renderSettings()}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
