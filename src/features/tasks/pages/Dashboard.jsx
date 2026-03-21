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
import axiosInstance from "../../../core/config/axiosInstance";
import dayjs from "dayjs";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveCount, setLeaveCount] = useState(0);
  const [eodTaskCount, setEodTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        "/user-service/write/employeesRegistedCount",
      );
      setDashboardData(res.data);
      return true;
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError("Failed to load dashboard statistics");
      return false;
    }
  }, []);

  const fetchLeavesData = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/user-service/write/leaves/all");
      setLeaveCount(res.data?.count ?? 0);
      return true;
    } catch (err) {
      console.error("Leaves count error:", err);
      return false;
    }
  }, []);

  const fetchEodTasksToday = useCallback(async () => {
    const today = dayjs().format("YYYY-MM-DD");

    try {
      const res = await axiosInstance.post(
        "/user-service/write/get-task-by-date",
        {
          taskStatus: "COMPLETED",
          specificDate: today,
        },
      );

      const tasks = res.data || [];

      // Filter tasks completed & created/updated on the same day
      const sameDayCompleted = tasks.filter((task) => {
        const created = task.planCreatedAt
          ? dayjs(task.planCreatedAt).format("YYYY-MM-DD")
          : null;
        const updated = task.planUpdatedAt
          ? dayjs(task.planUpdatedAt).format("YYYY-MM-DD")
          : null;
        return created && updated && created === updated;
      });

      setEodTaskCount(sameDayCompleted.length);
      return true;
    } catch (err) {
      console.error("EOD tasks fetch error:", err);
      setEodTaskCount(0);
      return false;
    }
  }, []);

  const loadAllData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);
      setError(null);

      const [statsOk, leavesOk, eodOk] = await Promise.all([
        fetchDashboardData(),
        fetchLeavesData(),
        fetchEodTasksToday(),
      ]);

      if (!statsOk || !leavesOk || !eodOk) {
        setError("Some data failed to load. Please try refreshing.");
      }

      setLoading(false);
      if (isRefresh) setIsRefreshing(false);
    },
    [fetchDashboardData, fetchLeavesData, fetchEodTasksToday],
  );

  useEffect(() => {
    // Initialize lucide icons (if needed)
    if (window.lucide) {
      window.lucide.createIcons();
    }

    loadAllData();
  }, [loadAllData]);

  const refreshAllData = () => loadAllData(true);

  // ────────────────────────────────────────
  // Derived chart data with safe fallbacks
  // ────────────────────────────────────────

  const totalEmployees = dashboardData?.totalRegisteredEmployees ?? 0;
  const podPosted = dashboardData?.podPostedEmployeesCount ?? 0;
  const podRemaining = dashboardData?.reamingPODCount ?? 0; // note: typo in backend? → remainingPODCount

  const podCompletionData = [
    { name: "POD Posted", value: podPosted, color: "#10b981" },
    { name: "Remaining", value: podRemaining, color: "#ef4444" },
  ];

  const eodCompletionData = [
    { name: "EOD Posted", value: eodTaskCount, color: "#10b981" },
    {
      name: "Remaining",
      value: totalEmployees - eodTaskCount,
      color: "#ef4444",
    },
  ];

  const comparisonData = [
    { name: "POD", completed: podPosted, remaining: podRemaining },
    {
      name: "EOD",
      completed: eodTaskCount,
      remaining: totalEmployees - eodTaskCount,
    },
  ];

  const podPercentage =
    totalEmployees > 0 ? Math.round((podPosted / totalEmployees) * 100) : 0;
  const eodPercentage =
    totalEmployees > 0 ? Math.round((eodTaskCount / totalEmployees) * 100) : 0;

  const currentDate = dayjs().format("dddd, MMMM D, YYYY");

  if (loading) {
    return (
      <TaskAdminPanelLayout>
        <div className="p-6 max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </TaskAdminPanelLayout>
    );
  }

  if (error) {
    return (
      <TaskAdminPanelLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Retry"}
            </button>
          </div>
        </div>
      </TaskAdminPanelLayout>
    );
  }

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Employee Admin Dashboard
            </h1>
            <div className="flex items-center text-gray-600 mt-1">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">{currentDate}</span>
            </div>
          </div>

          <button
            onClick={refreshAllData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#008cba] text-white rounded-lg hover:bg-[#0077a0] disabled:opacity-60 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Registered Users */}
          <StatCard
            title="Registered Users"
            value={totalEmployees}
            icon={<UserCheck className="w-8 h-8 text-[#008cba]" />}
            color="blue"
            onClick={() =>
              navigate("/taskmanagement/employee_registered_users")
            }
            footer="View all users"
            footerIcon={<TrendingUp className="w-4 h-4" />}
          />

          {/* Leave Requests */}
          <StatCard
            title="Leave Requests"
            value={leaveCount}
            icon={<Home className="w-8 h-8 text-purple-600" />}
            color="purple"
            onClick={() => navigate("/taskmanagement/employeeleaves")}
            footer="Total leave requests"
            footerIcon={<Calendar className="w-4 h-4" />}
          />

          {/* POD Completion */}
          <StatCard
            title="Plan of the Day"
            value={podPosted}
            icon={<Calendar className="w-8 h-8 text-[#1ab394]" />}
            color="green"
            onClick={() => navigate("/taskmanagement/planoftheday")}
            footer={
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-medium">{podPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1ab394] transition-all duration-700"
                    style={{ width: `${podPercentage}%` }}
                  />
                </div>
              </div>
            }
          />

          {/* EOD Completion */}
          <StatCard
            title="End of the Day"
            value={eodTaskCount}
            icon={<Calendar className="w-8 h-8 text-orange-600" />}
            color="orange"
            onClick={() => navigate("/taskmanagement/endoftheday")}
            footer={
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-medium">{eodPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 transition-all duration-700"
                    style={{ width: `${eodPercentage}%` }}
                  />
                </div>
              </div>
            }
          />
        </div>

        {/* Bar Chart - POD vs EOD */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-[#008cba]" />
              POD vs EOD Completion Overview
            </h3>
          </div>
          <div className="p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  stackId="a"
                  fill="#1ab394"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="remaining"
                  name="Remaining"
                  stackId="a"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompletionPieCard
            title="POD Completion Status"
            data={podCompletionData}
            iconColor="green-600"
            postedCount={podPosted}
            remainingCount={podRemaining}
          />

          <CompletionPieCard
            title="EOD Completion Status"
            data={eodCompletionData}
            iconColor="orange-600"
            postedCount={eodTaskCount}
            remainingCount={totalEmployees - eodTaskCount}
          />
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
}

// ───────────────────────────────────────────────
// Reusable small components
// ───────────────────────────────────────────────

function StatCard({ title, value, icon, color, onClick, footer, footerIcon }) {
  const colorMap = {
    blue: {
      border: "border-[#008cba]",
      bg: "bg-blue-50",
      text: "text-[#008cba]",
    },
    purple: {
      border: "border-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    green: {
      border: "border-[#1ab394]",
      bg: "bg-green-50",
      text: "text-[#1ab394]",
    },
    orange: {
      border: "border-orange-600",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`group bg-white p-6 rounded-lg shadow-sm ${c.border} border-l-4 hover:shadow-md transition-all cursor-pointer`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div
          className={`${c.bg} p-3 rounded-full group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-600">
        {footerIcon && <span className="mr-1">{footerIcon}</span>}
        <span>{footer}</span>
      </div>
    </div>
  );
}

function CompletionPieCard({
  title,
  data,
  iconColor,
  postedCount,
  remainingCount,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <PieChartIcon className={`w-5 h-5 text-${iconColor}`} />
          {title}
        </h3>
      </div>
      <div className="p-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${Math.round(percent * 100)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => [`${val} users`, ""]} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="p-6 bg-gray-50 border-t grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-600 mr-2" />
          <div>
            <p className="text-gray-500">Posted</p>
            <p className="font-medium">{postedCount} users</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <div>
            <p className="text-gray-500">Remaining</p>
            <p className="font-medium">{remainingCount} users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
