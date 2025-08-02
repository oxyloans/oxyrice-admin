import { useState, useEffect, useCallback } from "react";
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
import axios from "axios";
import dayjs from "dayjs";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveCount, setLeaveCount] = useState(0);
  const [eodTaskCount, setEodTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.lucide?.createIcons();
    fetchDashboardData();
    fetchLeavesData();
    fetchTasksByDate();
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

  const fetchTasksByDate = useCallback(async () => {
    const selectedDate = dayjs();
    const formattedDate = selectedDate.format("YYYY-MM-DD");

    try {
      const response = await axios.post(
        `${BASE_URL}/user-service/write/get-task-by-date`,
        {
          taskStatus: "COMPLETED",
          specificDate: formattedDate,
        },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const filteredSameDateTasks = response.data.filter((task) => {
        const createdDate = task.planCreatedAt
          ? dayjs(task.planCreatedAt).format("YYYY-MM-DD")
          : null;
        const updatedDate = task.planUpdatedAt
          ? dayjs(task.planUpdatedAt).format("YYYY-MM-DD")
          : null;
        return createdDate && updatedDate && createdDate === updatedDate;
      });

      setEodTaskCount(filteredSameDateTasks.length || 0);
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
    }
  }, []);

  const refreshAllData = () => {
    fetchDashboardData();
    fetchLeavesData();
    fetchTasksByDate();
  };

  // Define chart data with fallback values
  const podCompletionData = dashboardData
    ? [
        {
          name: "POD Posted",
          value: dashboardData.podPostedEmployeesCount || 0,
          color: "#10b981",
        },
        {
          name: "Remaining POD",
          value: dashboardData.reamingPODCount || 0,
          color: "#ef4444",
        },
      ]
    : [
        { name: "POD Posted", value: 0, color: "#10b981" },
        { name: "Remaining POD", value: 0, color: "#ef4444" },
      ];

  const eodCompletionData = dashboardData
    ? [
        { name: "EOD Posted", value: eodTaskCount, color: "#10b981" },
        {
          name: "Remaining EOD",
          value: (dashboardData.totalRegisteredEmployees || 0) - eodTaskCount,
          color: "#ef4444",
        },
      ]
    : [
        { name: "EOD Posted", value: 0, color: "#10b981" },
        { name: "Remaining EOD", value: 0, color: "#ef4444" },
      ];

  const comparisonData = dashboardData
    ? [
        {
          name: "POD",
          completed: dashboardData.podPostedEmployeesCount || 0,
          remaining: dashboardData.reamingPODCount || 0,
        },
        {
          name: "EOD",
          completed: eodTaskCount,
          remaining:
            (dashboardData.totalRegisteredEmployees || 0) - eodTaskCount,
        },
      ]
    : [
        { name: "POD", completed: 0, remaining: 0 },
        { name: "EOD", completed: 0, remaining: 0 },
      ];

  const podPercentage = dashboardData
    ? (
        ((dashboardData.podPostedEmployeesCount || 0) /
          (dashboardData.totalRegisteredEmployees || 1)) *
        100
      ).toFixed(0)
    : 0;

  const eodPercentage = dashboardData
    ? (
        (eodTaskCount / (dashboardData.totalRegisteredEmployees || 1)) *
        100
      ).toFixed(0)
    : 0;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Render loading or error states
  if (loading) {
    return (
      <TaskAdminPanelLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </TaskAdminPanelLayout>
    );
  }

  if (error) {
    return (
      <TaskAdminPanelLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={refreshAllData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </TaskAdminPanelLayout>
    );
  }

  return (
    <TaskAdminPanelLayout>
      <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Employee Admin Dashboard
            </h1>
            <div className="flex items-center text-gray-600 mt-2">
              <Clock className="w-5 h-5 mr-2" />
              <p className="text-sm">{currentDate}</p>
            </div>
          </div>
          <button
            onClick={refreshAllData}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
            aria-label={
              isRefreshing ? "Refreshing dashboard" : "Refresh dashboard"
            }
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Registered Users */}
          <div
            onClick={() =>
              navigate("/taskmanagement/employee_registered_users")
            }
            className="group bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-all duration-300 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              navigate("/taskmanagement/employee_registered_users")
            }
            aria-label="View registered users"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Registered Users
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData?.totalRegisteredEmployees || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
              <span>View all users</span>
            </div>
          </div>

          {/* Employees on Leave */}
          <div
            onClick={() => navigate("/taskmanagement/employeeleaves")}
            className="group bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-600 hover:shadow-md transition-all duration-300 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/taskmanagement/employeeleaves")
            }
            aria-label="View leave requests"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Leave Requests
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {leaveCount}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Home className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-purple-500 mr-1" />
              <span>Total leave requests</span>
            </div>
          </div>

          {/* POD Completion */}
          <div
            onClick={() => navigate("/taskmanagement/planoftheday")}
            className="group bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-600 hover:shadow-md transition-all duration-300 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/taskmanagement/planoftheday")
            }
            aria-label="View plan of the day"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Plan of the Day
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData?.podPostedEmployeesCount || 0}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Completion</span>
                <span className="font-medium text-gray-700">
                  {podPercentage}%
                </span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${podPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* EOD Completion */}
          <div
            onClick={() => navigate("/taskmanagement/endoftheday")}
            className="group bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-600 hover:shadow-md transition-all duration-300 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate("/taskmanagement/endoftheday")
            }
            aria-label="View end of the day"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  End of the Day
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {eodTaskCount}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Completion</span>
                <span className="font-medium text-gray-700">
                  {eodPercentage}%
                </span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${eodPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* POD vs EOD Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                <BarChartIcon className="w-5 h-5 text-blue-600 mr-2" />
                POD vs EOD Completion Overview
              </h3>
            </div>
            <div className="p-6 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                <PieChartIcon className="w-5 h-5 text-green-600 mr-2" />
                POD Completion Status
              </h3>
            </div>
            <div className="p-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={podCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
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
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">POD Posted</p>
                    <p className="text-sm font-medium">
                      {dashboardData?.podPostedEmployeesCount || 0} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-sm font-medium">
                      {dashboardData?.reamingPODCount || 0} users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EOD Completion Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                <PieChartIcon className="w-5 h-5 text-orange-600 mr-2" />
                EOD Completion Status
              </h3>
            </div>
            <div className="p-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eodCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
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
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">EOD Posted</p>
                    <p className="text-sm font-medium">{eodTaskCount} users</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-sm font-medium">
                      {(dashboardData?.totalRegisteredEmployees || 0) -
                        eodTaskCount}{" "}
                      users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
}
