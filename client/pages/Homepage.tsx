import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import DatabaseStatus from "../components/DatabaseStatus";
import {
  ArrowRight,
  Users,
  Award,
  GraduationCap,
  Heart,
  DollarSign,
  BookOpen,
  Target,
  CheckCircle,
  Star,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  Menu,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

const Homepage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const api = (await import("../services/api")).default;
        const res = await api.listScholarships({
          status: "active",
          limit: 4,
          sortBy: "deadline",
          sortOrder: "asc",
        });
        if (res.success) setFeatured(res.data || []);
      } catch {}
    })();
  }, []);

  const stats = [
    {
      number: "10,000+",
      label: "Students Supported",
      icon: Users,
    },
    {
      number: "₹5.2 Cr",
      label: "Scholarships Distributed",
      icon: DollarSign,
    },
    {
      number: "500+",
      label: "Partner Institutions",
      icon: GraduationCap,
    },
    {
      number: "95%",
      label: "Success Rate",
      icon: TrendingUp,
    },
  ];

  const features = [
    {
      icon: Target,
      title: "Merit-Based Selection",
      description:
        "Fair and transparent selection process based on academic excellence and financial need.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Your data is protected with industry-standard security measures and encryption.",
    },
    {
      icon: Globe,
      title: "Pan-India Coverage",
      description:
        "Supporting students across all states and territories of India with equal opportunities.",
    },
    {
      icon: Heart,
      title: "Holistic Support",
      description:
        "Beyond funding - mentorship, career guidance, and skill development programs.",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "B.Tech Student, IIT Mumbai",
      content:
        "Thanks to Youth Dreamers Foundation, I could pursue my engineering dreams without worrying about finances. The mentorship program was invaluable.",
      rating: 5,
    },
    {
      name: "Rahul Kumar",
      role: "M.Sc Agriculture, Delhi University",
      content:
        "The scholarship not only covered my education costs but also provided access to industry experts who guided my career path.",
      rating: 5,
    },
    {
      name: "Anjali Patel",
      role: "MBA Student, Ahmedabad",
      content:
        "The application process was seamless, and the support team was incredibly helpful throughout my journey.",
      rating: 5,
    },
  ];

  const userTypes = [
    {
      type: "Student",
      title: "Apply for Scholarships",
      description: "Browse and apply for scholarships that match your profile",
      features: [
        "Easy application process",
        "Track application status",
        "Access to mentorship",
        "Career guidance",
      ],
      link: "/student-dashboard",
      color: "bg-ydf-deep-blue",
    },
    {
      type: "Donor",
      title: "Fund Education",
      description: "Support deserving students and make a lasting impact",
      features: [
        "Create custom scholarships",
        "Track student progress",
        "Impact reporting",
        "Tax benefits",
      ],
      link: "/donor",
      color: "bg-ydf-teal-green",
    },
    {
      type: "Reviewer",
      title: "Evaluate Applications",
      description: "Help identify and support the most deserving candidates",
      features: [
        "Application review tools",
        "Scoring system",
        "Collaboration features",
        "Detailed reporting",
      ],
      link: "/reviewer",
      color: "bg-purple-600",
    },
    {
      type: "Admin",
      title: "Manage Programs",
      description: "Oversee scholarship programs and organizational operations",
      features: [
        "Program management",
        "Analytics dashboard",
        "User management",
        "Financial tracking",
      ],
      link: "/admin",
      color: "bg-ydf-golden-yellow text-ydf-deep-blue",
    },
  ];

  const navigation = [
    { name: t("navigation.about"), href: "#about" },
    { name: t("navigation.programs"), href: "#programs" },
    { name: t("navigation.impact"), href: "#impact" },
    { name: t("navigation.contact"), href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-ydf-deep-blue shadow-sm border-b border-ydf-light-gray sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F3b1b952ac06b422687ab6f8265e647a7%2F209099442e6c42e883b3d324b2f06354?format=webp&width=800"
                alt="Youth Dreamers Foundation Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-ydf-golden-yellow transition-colors font-medium"
                >
                  {item.name}
                </a>
              ))}
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <ThemeToggle />
                {isAuthenticated ? (
                  <>
                    <Link
                      to={
                        user?.userType === "student"
                          ? "/student-dashboard"
                          : user?.userType === "admin"
                            ? "/admin-dashboard"
                            : user?.userType === "reviewer"
                              ? "/reviewer-dashboard"
                              : user?.userType === "donor"
                                ? "/donor-dashboard"
                                : "/student-dashboard"
                      }
                      className="text-white hover:text-ydf-golden-yellow transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                    <span className="text-ydf-golden-yellow text-sm">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <button
                      onClick={() => logout()}
                      className="text-white hover:text-ydf-golden-yellow transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="flex items-center space-x-1 text-white hover:text-ydf-golden-yellow transition-colors font-medium"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/auth"
                      className="bg-ydf-golden-yellow text-ydf-deep-blue px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold flex items-center space-x-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-3">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-white hover:text-ydf-golden-yellow"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="px-3 py-2 flex items-center space-x-3">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                <div className="px-3 space-y-2">
                  <Link
                    to="/auth"
                    className="flex items-center space-x-2 text-white hover:text-ydf-golden-yellow py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/auth"
                    className="block bg-ydf-golden-yellow text-ydf-deep-blue px-4 py-2 rounded-lg text-center font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* DB Status Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <DatabaseStatus />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-ydf-deep-blue to-ydf-teal-green text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-ydf-golden-yellow rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-16 h-16 bg-ydf-golden-yellow rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-8 h-8 bg-white rounded-full animate-pulse delay-3000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {t("hero.title")}
                <span className="text-ydf-golden-yellow">
                  {" "}
                  {t("hero.titleHighlight")}
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/scholarships"
                  className="bg-ydf-golden-yellow text-ydf-deep-blue px-8 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-colors"
                >
                  <span>{t("hero.exploreScholarships")}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/donor"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-ydf-deep-blue transition-colors text-center"
                >
                  {t("hero.becomeADonor")}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="w-full h-96 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20">
                <div className="text-center">
                  <div className="w-32 h-32 bg-ydf-golden-yellow rounded-full mx-auto mb-6 flex items-center justify-center">
                    <GraduationCap className="h-16 w-16 text-ydf-deep-blue" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">10,000+</h3>
                  <p className="text-blue-100">Dreams Realized</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships (public) */}
      {featured && featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Explore Scholarships
              </h2>
              <Link
                to="/scholarships"
                className="text-ydf-deep-blue hover:underline font-semibold"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((s: any) => (
                <Link
                  key={s.id}
                  to={`/scholarships/${s.id}`}
                  className="bg-white rounded-2xl shadow-lg border border-ydf-light-gray p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mr-2">
                      {s.title}
                    </h3>
                    <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {s.status}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {s.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-ydf-deep-blue" />
                      <span>₹{s.amount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-ydf-teal-green" />
                      <span>
                        {s.applicationDeadline
                          ? new Date(s.applicationDeadline).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-ydf-deep-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="programs" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're seeking support or looking to make a difference, we
              have the right platform for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {userTypes.map((userType, index) => (
              <motion.div
                key={userType.type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-ydf-light-gray overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {userType.type}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {userType.title}
                      </h3>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${userType.color}`}
                    >
                      <ArrowRight className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">{userType.description}</p>
                  <ul className="space-y-3 mb-8">
                    {userType.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={userType.link}
                    className={`${userType.color} text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity`}
                  >
                    <span>Get Started</span>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Youth Dreamers Foundation?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing not just financial support, but a
              comprehensive ecosystem for educational success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-ydf-teal-green rounded-full mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="impact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read how our scholarship recipients have transformed their lives
              and communities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-ydf-light-gray p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-ydf-golden-yellow fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-ydf-deep-blue rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ydf-deep-blue to-ydf-teal-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Transform Lives Through Education?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our community of dreamers, achievers, and changemakers.
              Whether you're seeking support or looking to make an impact, your
              journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/scholarships"
                className="bg-ydf-golden-yellow text-ydf-deep-blue px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Apply for Scholarships
              </Link>
              <Link
                to="/donor"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-ydf-deep-blue transition-colors"
              >
                Become a Supporter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Organization Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3b1b952ac06b422687ab6f8265e647a7%2F209099442e6c42e883b3d324b2f06354?format=webp&width=800"
                  alt="Youth Dreamers Foundation Logo"
                  className="h-12 w-auto"
                />
                <div>
                  <p className="text-gray-400">Empowering Dreams Since 2010</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We are committed to breaking down financial barriers to
                education and creating opportunities for deserving students
                across India. Our comprehensive support system ensures that
                talent gets the recognition and resources it deserves.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-ydf-deep-blue transition-colors cursor-pointer">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-ydf-deep-blue transition-colors cursor-pointer">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-ydf-deep-blue transition-colors cursor-pointer">
                  <Phone className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/scholarships"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Scholarships
                  </Link>
                </li>
                <li>
                  <Link
                    to="/progress"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Track Application
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/donor"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Become a Donor
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-ydf-golden-yellow" />
                  <span className="text-gray-300">+91 80-1234-5678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-ydf-golden-yellow" />
                  <span className="text-gray-300">info@youthdreamers.org</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-ydf-golden-yellow mt-1" />
                  <span className="text-gray-300">
                    123 MG Road, Bangalore,
                    <br />
                    Karnataka 560001
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Youth Dreamers Foundation. All rights reserved. |{" "}
              <span className="text-ydf-golden-yellow">
                Empowering Dreams Through Education
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
