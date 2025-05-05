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
  AlertCircle,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Home,
  TrendingUp,
  XCircle,
  Clock,
  Activity,
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
      // Get today's date in format YYYY-MM-DD
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];

      const response = await fetch(
        `${BASE_URL}/user-service/write/leaves/today?specificDate=${formattedDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaves data");
      }

      const data = await response.json();

      // Simply use the length of the leaves array if available
      let todayLeaveCount = 0;
      if (Array.isArray(data.leaves)) {
        todayLeaveCount = data.leaves.length;
      }

      setLeaveCount(todayLeaveCount);
    } catch (err) {
      console.error("Error fetching leaves data:", err);
      // Don't set general error state to avoid blocking dashboard display
    }
  };

  const refreshAllData = () => {
    fetchDashboardData();
    fetchLeavesData();
  };

  if (loading || !dashboardData) {
    return (
      <TaskAdminPanelLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      color: "#4ade80",
    },
    {
      name: "Remaining POD",
      value: dashboardData.reamingPODCount,
      color: "#f87171",
    },
  ];

  const eodCompletionData = [
    {
      name: "EOD Posted",
      value: dashboardData.eodPostedEmployeesCount,
      color: "#4ade80",
    },
    {
      name: "Remaining EOD",
      value: dashboardData.reamingEODPostCount,
      color: "#f87171",
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
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-white p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Employee Dashboard
              </h1>
              <div className="flex items-center text-gray-500">
                <Clock size={16} className="mr-2" />
                <p>{currentDate}</p>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center">
              <button
                onClick={refreshAllData}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Registered Users */}
          <div
            onClick={() =>
              navigate("/taskmanagement/employee_registered_users")
            }
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 transition-all hover:shadow-lg hover:translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total Registered Users
                </h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.totalRegisteredEmployees}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserCheck size={28} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <TrendingUp size={14} className="text-green-500 mr-1" />
              <span>Click to view all users</span>
            </div>
          </div>

          {/* Employees on Leave */}
          <div
            onClick={() => navigate("/taskmanagement/employeeleaves")}
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 transition-all hover:shadow-lg hover:translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Employee Leave Request
                </h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {leaveCount}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Home size={28} className="text-purple-600" />
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
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 transition-all hover:shadow-lg hover:translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Plan Of The Day
                </h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.podPostedEmployeesCount}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar size={28} className="text-green-600" />
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
                  className="bg-green-500 h-full"
                  style={{ width: `${podPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* EOD Completion */}
          <div
            onClick={() => navigate("/taskmanagement/endoftheday")}
            className="cursor-pointer bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 transition-all hover:shadow-lg hover:translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  End Of The Day
                </h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.eodPostedEmployeesCount}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar size={28} className="text-orange-600" />
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
                  className="bg-orange-500 h-full"
                  style={{ width: `${eodPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Remaining Items Cards + Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <AlertCircle size={18} className="text-red-500 mr-2" />
                  Pending Task Summary
                </h3>
              </div>

              {/* Remaining POD Card */}
              <div className="p-4 border-b border-gray-50">
                <div className="flex items-center mb-3">
                  <div className="bg-red-50 p-2 rounded-md mr-3">
                    <XCircle size={18} className="text-red-500" />
                  </div>
                  <h4 className="font-medium text-gray-700">Remaining POD</h4>
                  <div className="ml-auto bg-red-50 px-3 py-1 rounded-full">
                    <span className="text-red-600 font-medium">
                      {dashboardData.reamingPODCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Completion</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 h-2 rounded-full mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${podPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {podPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Remaining EOD Card */}
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="bg-red-50 p-2 rounded-md mr-3">
                    <XCircle size={18} className="text-red-500" />
                  </div>
                  <h4 className="font-medium text-gray-700">Remaining EOD</h4>
                  <div className="ml-auto bg-red-50 px-3 py-1 rounded-full">
                    <span className="text-red-600 font-medium">
                      {dashboardData.reamingEODPostCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Completion</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 h-2 rounded-full mr-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${eodPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {eodPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* POD vs EOD Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <BarChartIcon size={18} className="text-blue-500 mr-2" />
                POD vs EOD Completion Overview
              </h3>
            </div>
            <div className="p-4 h-64">
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
                    fill="#4ade80"
                  />
                  <Bar
                    dataKey="remaining"
                    name="Remaining"
                    stackId="a"
                    fill="#f87171"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <PieChartIcon size={18} className="text-green-600 mr-2" />
                POD Completion Status
              </h3>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={podCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">POD Posted</p>
                    <p className="text-sm font-medium">
                      {dashboardData.podPostedEmployeesCount} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
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

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <PieChartIcon size={18} className="text-orange-600 mr-2" />
                EOD Completion Status
              </h3>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eodCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500">EOD Posted</p>
                    <p className="text-sm font-medium">
                      {dashboardData.eodPostedEmployeesCount} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
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
    </TaskAdminPanelLayout>
  );
}
