import React, { useEffect, useMemo, useState } from "react";
import { Spin, Typography, Empty, Tag, Modal, Descriptions } from "antd";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import CompaniesLayout from "../components/CompaniesLayout";

const { Title, Text } = Typography;

const ITEMS_PER_PAGE = 20;

const lightColors = {
  All: "#eff6ff",
  GENPACT: "#f5f3ff",
  "People Prime Worldwide": "#ecfeff",
  "TECH MAHINDRA": "#fff7ed",
  ORACLE: "#fff1f2",
};

const borderColors = {
  All: "#bfdbfe",
  GENPACT: "#ddd6fe",
  "People Prime Worldwide": "#a5f3fc",
  "TECH MAHINDRA": "#fed7aa",
  ORACLE: "#fecdd3",
};

const fallbackLogo =
  "https://oxybricksv1.s3.ap-south-1.amazonaws.com/null/45880e62-acaf-4645-a83e-d1c8498e923e/aadhar_partnerlogo.png";

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const Aijobspage = () => {
  const [loading, setLoading] = useState(true);
  const [jobsData, setJobsData] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);

  // If you already have applied jobs from API/user profile, replace this state
  const [appliedJobIds] = useState(new Set());

  useEffect(() => {
    fetchAIJobs();
  }, []);

  const normalize = (value) =>
    (value || "").toString().toLowerCase().replace(/_/g, " ").trim();

  const fetchAIJobs = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `${BASE_URL}/marketing-service/campgin/ai-jobs-stats`,
      );

      const data = response?.data || {};

      setStats({
        totalJobs: data.aiTotaljobsSize || 0,
        companies: data.aijobsCompanyCount || {},
      });

      setJobsData(data.aijobsData || []);
    } catch (error) {
      console.error("Error fetching AI jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const companyCards = useMemo(() => {
    if (!stats?.companies) return [];

    const apiCompanies = Object.entries(stats.companies).map(
      ([company, count]) => ({
        company,
        count,
      }),
    );

    return [
      {
        company: "All",
        count: stats.totalJobs || jobsData.length,
      },
      ...apiCompanies,
    ];
  }, [stats, jobsData]);

  const filteredJobs = useMemo(() => {
    if (selectedCompany === "All") return jobsData;

    return jobsData.filter((job) => {
      const companyName = normalize(job.hideCompanyName || job.companyName);
      return companyName === normalize(selectedCompany);
    });
  }, [jobsData, selectedCompany]);

  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, visibleCount);
  }, [filteredJobs, visibleCount]);

  const remainingCount = Math.max(
    filteredJobs.length - displayedJobs.length,
    0,
  );

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setJobModalOpen(true);
  };

  const handleJobModalClose = () => {
    setJobModalOpen(false);
    setSelectedJob(null);
  };

  const JobCard = ({ job, isCompact = false }) => {
    const lightBackgroundColors = [
      "bg-gradient-to-br from-blue-50 to-indigo-100",
      "bg-gradient-to-br from-emerald-50 to-teal-100",
      "bg-gradient-to-br from-violet-50 to-purple-100",
      "bg-gradient-to-br from-rose-50 to-pink-100",
      "bg-gradient-to-br from-amber-50 to-orange-100",
      "bg-gradient-to-br from-cyan-50 to-sky-100",
      "bg-gradient-to-br from-lime-50 to-green-100",
      "bg-gradient-to-br from-fuchsia-50 to-pink-100",
    ];

    const index = filteredJobs.findIndex((j) => j.id === job.id);
    const bgColor =
      lightBackgroundColors[
        (index >= 0 ? index : 0) % lightBackgroundColors.length
      ];

    return (
      <motion.div
        variants={itemVariants}
        className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl
        transition-all duration-300 transform hover:-translate-y-1 cursor-pointer
        flex flex-col border border-gray-100 ${isCompact ? "m-1" : "m-2"}`}
        onClick={() => handleJobSelect(job)}
      >
        <div className="pt-6 pb-4 flex justify-center">
          <div className="w-32 h-20 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 bg-white p-2">
            <img
              src={job.companyLogo || fallbackLogo}
              alt={job.companyName || "Company Logo"}
              className="w-40 h-20 object-contain transition-transform duration-300"
              onError={(e) => {
                const target = e.target;
                target.onerror = null;
                target.src = fallbackLogo;
              }}
            />
          </div>
        </div>

        <div className="flex justify-center items-center px-4 pb-3">
          <div
            className={`${bgColor} py-2 px-4 rounded-xl flex justify-center items-center`}
          >
            <span className="text-base font-semibold text-gray-700 text-center">
              {job.hideCompanyName || job.companyName || "Company"}
            </span>
          </div>
        </div>

        <div className="px-4 pb-1">
          <h3 className="text-lg font-bold text-gray-800 text-center line-clamp-2 min-h-[56px]">
            {job.jobTitle || "Untitled Job"}
          </h3>
        </div>

        {/* <div className="px-2 pb-2">
          <div className="text-sm font-bold text-gray-700 text-center bg-gray-50 py-2 px-3 rounded-lg line-clamp-1">
            💼 {job.jobDesignation || "Designation N/A"}
          </div>
        </div> */}

        <div className="px-4 pb-3 space-y-1 text-center">
          <div className="text-sm text-gray-600 truncate whitespace-nowrap overflow-hidden">
            📍 Loc: {job.jobLocations || "N/A"}
          </div>
          <div className="text-sm text-gray-600 truncate whitespace-nowrap overflow-hidden">
            ⏰ Exp: {job.experience || "N/A"}
          </div>
        </div>

        <div className="px-4 pb-4">
          <p className="text-sm text-gray-500 text-center line-clamp-3 min-h-[60px]">
            {job.description
              ? job.description.replace(/[#*`>-]/g, "")
              : "No description available"}
          </p>
        </div>

        <div className="px-4 pb-5 mt-auto flex justify-center">
          {appliedJobIds.has(job.id) ? (
            <div className="flex items-center justify-center gap-2 bg-green-50 text-green-600 py-2.5 px-8 rounded-full font-bold text-sm shadow-sm border border-green-100">
              <CheckCircle2 className="w-5 h-5" /> Applied
            </div>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleJobSelect(job);
              }}
              className="bg-indigo-100 text-indigo-600 py-2.5 px-8 rounded-full font-bold text-sm transition-all duration-300 shadow-md"
            >
              View Job Details
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <CompaniesLayout>
      <div className="min-h-screen bg-white px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-4">
          <Title level={2} style={{ marginBottom: 4 }}>
            AI Jobs
          </Title>
          <Text type="secondary">
            Browse company-wise AI jobs and filter by clicking company cards
          </Text>
        </div>

        {loading ? (
          <div className="min-h-[420px] flex items-center justify-center">
            <Spin size="large" tip="Loading AI jobs..." />
          </div>
        ) : (
          <>
            {/* Top Company Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 mt-5 mb-6">
              {companyCards.map((item) => {
                const isActive =
                  normalize(selectedCompany) === normalize(item.company);

                const bgColor = lightColors[item.company] || "#fafafa";
                const borderColor = borderColors[item.company] || "#e5e7eb";

                return (
                  <div
                    key={item.company}
                    onClick={() => handleCompanyClick(item.company)}
                    className="flex-1 min-w-[150px] sm:min-w-[160px] cursor-pointer rounded-2xl border transition-all duration-300"
                    style={{
                      background: bgColor,
                      borderColor: isActive ? borderColor : "#f1f5f9",
                      boxShadow: isActive
                        ? "0 8px 20px rgba(0,0,0,0.08)"
                        : "0 3px 10px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="px-4 py-4 text-center">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 line-clamp-1">
                        {item.company === "All" ? "All Jobs" : item.company}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-none mb-1">
                        {item.count}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500">
                        Click to filter
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className=" px-4 py-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedCompany === "All"
                    ? "All Company Jobs"
                    : `${selectedCompany} Jobs`}
                </h2>
                <p className="text-sm text-gray-500">
                  Showing {displayedJobs.length} of {filteredJobs.length} jobs
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Tag color="blue">Displayed: {displayedJobs.length}</Tag>
                <Tag color="purple">Total: {filteredJobs.length}</Tag>
                <Tag color="orange">Remaining: {remainingCount}</Tag>
              </div>
            </div>

            {/* Job Cards */}
            {displayedJobs.length > 0 ? (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2"
                >
                  {displayedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </motion.div>

                {/* Load More */}
                <div className="mt-8 flex flex-col items-center gap-2">
                  {remainingCount > 0 ? (
                    <>
                      <button
                        onClick={handleLoadMore}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300"
                      >
                        Load More
                      </button>
                      <p className="text-sm text-gray-500">
                        {remainingCount} more jobs remaining
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">All jobs displayed</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <Empty description="No jobs found for selected company" />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={jobModalOpen}
        title={selectedJob?.jobTitle || "Job Details"}
        onCancel={handleJobModalClose}
        footer={null}
        width={760}
        
        bodyStyle={{ maxHeight: 500, overflowY: "auto" }}
      >
        <div className="space-y-4">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Job ID">
              {selectedJob?.id || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Company">
              {selectedJob?.hideCompanyName ||
                selectedJob?.companyName ||
                "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedJob?.jobLocations || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Experience">
              {selectedJob?.experience || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Designation">
              {selectedJob?.jobDesignation || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Job Type">
              {selectedJob?.jobType || selectedJob?.type || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedJob?.status || "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Description
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {selectedJob?.description
                ? String(selectedJob.description).replace(/[#*`>-]/g, "")
                : "No description available."}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-full transition-all duration-200"
              onClick={handleJobModalClose}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </CompaniesLayout>
  );
};

export default Aijobspage;
