import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  UserCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart,
} from "lucide-react";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
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

  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg shadow-md">
        <AlertCircle className="mr-2 text-red-500" size={28} />
        <div className="text-lg text-red-700">Error: {error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg shadow-md">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  // Prepare data for the POD/Remaining chart
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

  // Prepare data for the EOD/Remaining chart
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

  const COLORS = ["#4ade80", "#f87171"];

  // Calculate percentages
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

  return (
    <TaskAdminPanelLayout>
      <div className="p-6 bg-gray-50">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Overview of employee activities and statistics
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 transition-transform hover:scale-102 hover:shadow-lg">
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
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 transition-transform hover:scale-102 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Plan Of The Day
                </h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.podPostedEmployeesCount}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {podPercentage}% Completion Rate
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar size={28} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${podPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 transition-transform hover:scale-102 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  End Of The Day
                </h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData.eodPostedEmployeesCount}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {eodPercentage}% Completion Rate
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar size={28} className="text-orange-600" />
              </div>
            </div>
            <div className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full"
                style={{ width: `${eodPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Additional Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-md mr-3">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Remaining POD</h3>
              <div className="ml-auto bg-red-100 px-3 py-1 rounded-full">
                <span className="text-red-700 font-medium">
                  {dashboardData.reamingPODCount}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Completion Status</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 h-2 rounded-full mr-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${podPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {podPercentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-md mr-3">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Remaining EOD</h3>
              <div className="ml-auto bg-red-100 px-3 py-1 rounded-full">
                <span className="text-red-700 font-medium">
                  {dashboardData.reamingEODPostCount}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Completion Status</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 h-2 rounded-full mr-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${eodPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {eodPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center mb-4">
              <PieChartIcon size={20} className="text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                POD Completion Status
              </h3>
            </div>
            <div className="h-64">
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
            <div className="mt-2 text-center text-sm text-gray-600">
              <span className="font-semibold">
                {dashboardData.podPostedEmployeesCount}
              </span>{" "}
              out of{" "}
              <span className="font-semibold">
                {dashboardData.totalRegisteredEmployees}
              </span>{" "}
              employees posted POD
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center mb-4">
              <PieChartIcon size={20} className="text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                EOD Completion Status
              </h3>
            </div>
            <div className="h-64">
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
            <div className="mt-2 text-center text-sm text-gray-600">
              <span className="font-semibold">
                {dashboardData.eodPostedEmployeesCount}
              </span>{" "}
              out of{" "}
              <span className="font-semibold">
                {dashboardData.totalRegisteredEmployees}
              </span>{" "}
              employees posted EOD
            </div>
          </div>
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
}
