import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  UserCheck,
  Calendar,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Home,
  TrendingUp,
  Clock,
} from "lucide-react";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveCount, setLeaveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchLeavesData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await fetch(
        `${BASE_URL}/user-service/write/employeesRegistedCount`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchLeavesData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user-service/write/leaves/all`);

      if (!response.ok) {
        throw new Error("Failed to fetch leaves data");
      }

      const data = await response.json();
      setLeaveCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching leaves data:", err);
    }
  };

  const refreshAllData = () => {
    fetchDashboardData();
    fetchLeavesData();
  };

  if (loading || !dashboardData) {
    return (
      <TaskAdminPanelLayout>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">
              Loading Dashboard...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please wait while we fetch the latest data
            </p>
          </div>
        </div>
      </TaskAdminPanelLayout>
    );
  }

  // Prepare data for charts
  const podCompletionData = [
    {
      name: "POD Posted",
      value: dashboardData.podPostedEmployeesCount,
      color: "#10b981",
    },
    {
      name: "Remaining POD",
      value: dashboardData.reamingPODCount,
      color: "#ef4444",
    },
  ];

  const eodCompletionData = [
    {
      name: "EOD Posted",
      value: dashboardData.eodPostedEmployeesCount,
      color: "#10b981",
    },
    {
      name: "Remaining EOD",
      value: dashboardData.reamingEODPostCount,
      color: "#ef4444",
    },
  ];

  const comparisonData = [
    {
      name: "POD",
      completed: dashboardData.podPostedEmployeesCount,
      remaining: dashboardData.reamingPODCount,
    },
    {
      name: "EOD",
      completed: dashboardData.eodPostedEmployeesCount,
      remaining: dashboardData.reamingEODPostCount,
    },
  ];

  const podPercentage = (
    (dashboardData.podPostedEmployeesCount /
      dashboardData.totalRegisteredEmployees) *
    100
  ).toFixed(0);

  const eodPercentage = (
    (dashboardData.eodPostedEmployeesCount /
      dashboardData.totalRegisteredEmployees) *
    100
  ).toFixed(0);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className=" p-2 mb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-1xl sm:text-2xl font-semibold text-gray-800 mb-1">
                Employee Admin Dashboard
              </h1>
              <div className="flex items-center text-gray-500">
                <Clock size={16} className="mr-2" />
                <p className="text-sm">{currentDate}</p>
              </div>
            </div>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
              aria-label={
                isRefreshing ? "Refreshing dashboard" : "Refresh dashboard"
              }
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Registered Users */}
          <div
            onClick={() =>
              navigate("/taskmanagement/employee_registered_users")
            }
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600 transition-all hover:shadow-lg hover:-translate-y-1"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              navigate("/taskmanagement/employee_registered_users")
            }
            aria-label="View registered users"
            title="Click to view all registered users"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Registered Users
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.totalRegisteredEmployees}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserCheck size={32} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <TrendingUp size={14} className="text-green-500 mr-1" />
              <span>View all users</span>
            </div>
          </div>

          {/* Employees on Leave */}
          <div
            onClick={() => navigate("/taskmanagement/employeeleaves")}
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600 transition-all hover:shadow-lg hover:-translate-y-1"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/taskmanagement/employeeleaves")
            }
            aria-label="View leave requests"
            title="Click to view all leave requests"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Leave Requests
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
                  {leaveCount}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Home size={32} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <Calendar size={14} className="text-purple-500 mr-1" />
              <span>Total leave requests</span>
            </div>
          </div>

          {/* POD Completion */}
          <div
            onClick={() => navigate("/taskmanagement/planoftheday")}
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-green-600 transition-all hover:shadow-lg hover:-translate-y-1"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/taskmanagement/planoftheday")
            }
            aria-label="View plan of the day"
            title="Click to view plan of the day details"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Plan of the Day
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.podPostedEmployeesCount}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar size={32} className="text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Completion</span>
                <span className="font-medium text-gray-700">
                  {podPercentage}%
                </span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-600 h-full"
                  style={{ width: `${podPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* EOD Completion */}
          <div
            onClick={() => navigate("/taskmanagement/endoftheday")}
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-600 transition-all hover:shadow-lg hover:-translate-y-1"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/taskmanagement/endoftheday")
            }
            aria-label="View end of the day"
            title="Click to view end of the day details"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  End of the Day
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.eodPostedEmployeesCount}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar size={32} className="text-orange-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Completion</span>
                <span className="font-medium text-gray-700">
                  {eodPercentage}%
                </span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-600 h-full"
                  style={{ width: `${eodPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* POD vs EOD Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 flex items-center text-lg">
                <BarChartIcon size={20} className="text-blue-600 mr-2" />
                POD vs EOD Completion Overview
              </h3>
            </div>
            <div className="p-4 h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    stackId="a"
                    fill="#10b981"
                  />
                  <Bar
                    dataKey="remaining"
                    name="Remaining"
                    stackId="a"
                    fill="#ef4444"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* POD Completion Pie Chart */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 flex items-center text-lg">
                <PieChartIcon size={20} className="text-green-600 mr-2" />
                POD Completion Status
              </h3>
            </div>
            <div className="p-4 h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={podCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {podCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} users`, ""]} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">POD Posted</p>
                    <p className="text-sm font-medium">
                      {dashboardData.podPostedEmployeesCount} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-sm font-medium">
                      {dashboardData.reamingPODCount} users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EOD Completion Pie Chart */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 flex items-center text-lg">
                <PieChartIcon size={20} className="text-orange-600 mr-2" />
                EOD Completion Status
              </h3>
            </div>
            <div className="p-4 h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eodCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {eodCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} users`, ""]} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">EOD Posted</p>
                    <p className="text-sm font-medium">
                      {dashboardData.eodPostedEmployeesCount} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-sm font-medium">
                      {dashboardData.reamingEODPostCount} users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shadow-md {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .hover\\:shadow-lg:hover {
          box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .rounded-xl {
          border-radius: 12px;
        }
        .border-l-4 {
          border-left-width: 4px;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .text-gray-800 {
          color: #1f2937;
        }
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        .bg-white {
          background-color: #ffffff;
        }
        @media (max-width: 640px) {
          .text-3xl {
            font-size: 1.5rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
          .p-6 {
            padding: 1rem;
          }
          .h-96 {
            height: 20rem;
          }
          .h-80 {
            height: 16rem;
          }
          .grid-cols-4 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </TaskAdminPanelLayout>
  );
}
