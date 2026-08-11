import { useState, useEffect, useCallback } from "react";
import adminApi from "../../../core/config/axiosInstance";
import { Table, Button, Input, Skeleton, Tooltip, Empty, Tabs } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  DownloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import UserStatCard from "../components/UserStatCard";

/* ── Page Skeleton ─────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px]">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden shadow-sm border border-slate-200"
          >
            <div className="h-10 bg-gradient-to-br from-slate-200 to-slate-300" />
            <div className="h-16 bg-white border-l-[3px] border-l-slate-200 border border-slate-200 relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)",
                  animation: "shimmer 1.4s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
        <Skeleton active paragraph={{ rows: 7 }} />
      </div>
    </div>
  );
}

/* ── Stat Card Meta ────────────────────────────────────────── */
const STAT_META = {
  active: {
    label: "Active Users",
    accent: "#059669",
    grad: "linear-gradient(135deg,#059669,#10b981)",
    soft: "rgba(5,150,105,.08)",
    sub: "Currently active on OxyBricks",
    icon: <CheckCircleOutlined />,
    trend: "+12%",
    trendUp: true,
  },
  registered: {
    label: "Registered Users",
    accent: "#b45309",
    grad: "linear-gradient(135deg,#b45309,#d97706)",
    soft: "rgba(180,83,9,.08)",
    sub: "Total registered (live)",
    icon: <AppstoreOutlined />,
    trend: "+8%",
    trendUp: true,
  },
};

function StatCard({ id, value, loading }) {
  return <UserStatCard meta={STAT_META[id]} value={value} loading={loading} />;
}

/* ── Table Components ──────────────────────────────────────── */
const TABLE_COMPONENTS = {
  header: {
    cell: (props) => (
      <th
        {...props}
        style={{
          ...props.style,
          background: "#f8fafc",
          color: "#1e293b",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          borderBottom: "2px solid #e2e8f0",
          padding: "8px 12px",
          whiteSpace: "nowrap",
        }}
      />
    ),
  },
  body: {
    cell: (props) => (
      <td
        {...props}
        style={{
          ...props.style,
          padding: "8px 12px",
          borderBottom: "1px solid #f1f5f9",
          verticalAlign: "middle",
          color: "#0f172a",
          fontSize: 12,
        }}
      />
    ),
    row: (props) => (
      <tr
        {...props}
        style={{ ...props.style, transition: "background .15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbeb")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
      />
    ),
  },
};

/* ── Active Users Tab ──────────────────────────────────────── */
function ActiveUsersTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        "/oxybrick-service/getTotalActiveUserDetails",
      );
      const rows = res.data?.userDetails ?? [];
      setData(rows);
      setTotal(res.data?.userCount ?? rows.length);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = search
    ? data.filter(
        (r) =>
          r.mobileNumber?.includes(search) ||
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;
  const paged = filtered
    .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    .map((r, i) => ({ ...r, _sno: page * PAGE_SIZE + i + 1 }));

  const columns = [
    {
      title: "S.No",
      width: 68,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex items-center justify-center w-7 h-[22px] rounded-[6px] bg-slate-100 text-slate-800 text-[11px] font-black">
          {row._sno}
        </span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "center",
      render: (value) =>
        value?.trim() ? (
          <span className="font-bold text-slate-900 text-xs">{value}</span>
        ) : (
          <span className="text-slate-400 text-xs">No Name</span>
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      render: (value) => (
        <span className="text-xs text-slate-600 break-all">{value || "—"}</span>
      ),
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      align: "center",
      // render: (v) =>
      //   v ? (
      //     <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
      //       {v}
      //     </span>
      //   ) : (
      //     "—"
      //   ),
    },
    {
      title: "Participations",
      dataIndex: "participationCount",
      align: "center",
    },
    {
      title: "Total Amount (₹)",
      dataIndex: "totalParticipationAmount",
      align: "center",
      render: (v) =>
        v != null ? (
          <span className="font-bold text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            ₹{Number(v).toLocaleString("en-IN")}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col">
      {/* Search row */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900">Active Users</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            {total.toLocaleString()} total
          </span>
          {loading && (
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border-2 border-amber-200 border-t-amber-700 inline-block"
                style={{ animation: "spin .7s linear infinite" }}
              />
              Loading...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search by name, mobile, email..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearch(e.target.value);
              setPage(0);
            }}
            allowClear
            style={{
              width: 250,
              borderRadius: 8,
              height: 32,
              borderColor: "#e2e8f0",
            }}
          />
          <Button
            icon={<FilterOutlined />}
            type="primary"
            onClick={() => {
              setSearch(searchInput);
              setPage(0);
            }}
            style={{
              background: "linear-gradient(135deg,#b45309,#d97706)",
              border: "none",
              borderRadius: 8,
              height: 32,
              fontWeight: 600,
              fontSize: 11,
              boxShadow: "0 2px 8px rgba(180,83,9,.25)",
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-slate-400 text-xs">
                <div className="font-semibold text-slate-500 mb-1">
                  No active users found
                </div>
                {search
                  ? "Try adjusting your search criteria"
                  : "No active users available at the moment"}
              </div>
            }
          />
        </div>
      ) : (
        <Table
          className="oxyone-square-table"
          rowKey="_sno"
          columns={columns}
          dataSource={paged}
          loading={false}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: filtered.length,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} users`,
            onChange: (p) => setPage(p - 1),
            style: { padding: "8px 12px 10px", margin: 0 },
          }}
          scroll={{ x: true }}
          size="small"
          components={TABLE_COMPONENTS}
        />
      )}
    </div>
  );
}

/* ── Registered Users Tab ──────────────────────────────────── */
function RegisteredUsersTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchData = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        `/auth-service/user/registered-users1?pageIndex=${pg}&pageSize=${PAGE_SIZE}&sortBy=id&sortOrder=DESC&status=live`,
      );
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      const serverTotal = Number(res.data?.count);
      setData(rows);
      setTotal(Number.isFinite(serverTotal) ? serverTotal : rows.length);
      setPage(pg);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  const filtered = search
    ? data.filter(
        (r) =>
          r.mobileNumber?.includes(search) ||
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()) ||
          r.userId?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;
  // `data` is already one server-side page; do not paginate it a second time.
  const paged = filtered.map((r, i) => ({
    ...r,
    _sno: page * PAGE_SIZE + i + 1,
  }));

  const columns = [
    {
      title: "S.No",
      width: 68,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex items-center justify-center w-7 h-[22px] rounded-[6px] bg-slate-100 text-slate-800 text-[11px] font-black ml-2.5">
          {row._sno}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      align: " center",
      render: (v) =>
        v ? (
          <span className="font-mono text-[11px] font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[5px] text-amber-800 tracking-[.2px] whitespace-nowrap">
            #{v.slice(-4)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "User Details",

      render: (_, row) => {
        const name = row.name?.trim() || "";
        return (
          <div className="flex items-center gap-2.5">
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[170px]">
                {name || (
                  <span className="text-slate-400 font-normal">No Name</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium truncate max-w-[170px]">
                {row.email || "—"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            {v}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Registered Date",
      dataIndex: "registeredDate",

      align: "center",
      render: (v) =>
        v ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            <CalendarOutlined style={{ fontSize: 10, color: "#b45309" }} />
            {v}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col">
      {/* Search row */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900">
            Registered Users
          </span>
          {total > 0 && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {data.length} / {total.toLocaleString()}
            </span>
          )}
          {loading && (
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border-2 border-amber-200 border-t-amber-700 inline-block"
                style={{ animation: "spin .7s linear infinite" }}
              />
              Loading...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search by name, mobile, user ID..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearch(e.target.value);
            }}
            allowClear
            style={{
              width: 250,
              borderRadius: 8,
              height: 32,
              borderColor: "#e2e8f0",
            }}
          />
          <Button
            icon={<UserOutlined />}
            type="primary"
            onClick={() => {
              setSearch(searchInput);
            }}
            style={{
              background: "linear-gradient(135deg,#b45309,#d97706)",
              border: "none",
              borderRadius: 8,
              height: 32,
              fontWeight: 600,
              fontSize: 11,
              boxShadow: "0 2px 8px rgba(180,83,9,.25)",
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-slate-400 text-xs">
                <div className="font-semibold text-slate-500 mb-1">
                  No registered users found
                </div>
                {search
                  ? "Try adjusting your search criteria"
                  : "No registered users available at the moment"}
              </div>
            }
          />
        </div>
      ) : (
        <Table
          className="oxyone-square-table"
          rowKey="userId"
          columns={columns}
          dataSource={paged}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: search ? filtered.length : total,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} users`,
            onChange: (p) => {
              setSearch("");
              setSearchInput("");
              fetchData(p - 1);
            },
            style: { padding: "8px 12px 10px", margin: 0 },
          }}
          scroll={{ x: true }}
          size="small"
          components={TABLE_COMPONENTS}
        />
      )}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function OxyBricksUsers() {
  const [activeTab, setActiveTab] = useState("active");
  const [activeCount, setActiveCount] = useState(null);
  const [regCount, setRegCount] = useState(null);
  const [countLoad, setCountLoad] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.allSettled([
          adminApi.get("/oxybrick-service/getTotalActiveUserDetails"),
          adminApi.get(
            "/auth-service/user/registered-users1?pageIndex=0&pageSize=20&sortBy=id&sortOrder=DESC&status=live",
          ),
        ]);
        if (r1.status === "fulfilled") {
          const d = r1.value.data;
          setActiveCount(d?.userCount ?? d?.userDetails?.length ?? 0);
        }
        if (r2.status === "fulfilled") {
          const d = r2.value.data;
          setRegCount(d?.count ?? d?.data?.length ?? 0);
        }
      } finally {
        setCountLoad(false);
      }
    })();
  }, []);

  const handleExport = () => {
    // Placeholder for export functionality
    // In a real implementation, this would call an API to export data
  };

  return (
    <div
      className="flex flex-col gap-4"
      style={{ animation: "fadeUp .3s ease both" }}
    >
      {/* ── Header row: title+subtitle left | actions right ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[17px] font-black text-slate-900 tracking-tight leading-tight">
              OxyBricks — Users
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Active and registered OxyBricks users
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title="Export data (coming soon)">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              style={{
                borderRadius: 8,
                height: 32,
                fontWeight: 600,
                fontSize: 12,
                border: "1px solid #e2e8f0",
                flexShrink: 0,
              }}
            >
              Export
            </Button>
          </Tooltip>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
            style={{
              borderRadius: 8,
              height: 32,
              fontWeight: 600,
              fontSize: 12,
              border: "1px solid #e2e8f0",
              flexShrink: 0,
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px]">
        <StatCard id="active" value={activeCount} loading={countLoad} />
        <StatCard id="registered" value={regCount} loading={countLoad} />
      </div>

      {/* ── Tab Card ── */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0 overflow-hidden">
        {/* Ant Design tab bar */}
        <div className="px-4 pt-1 bg-slate-50 border-b border-slate-100">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            items={[
              {
                key: "active",
                label: `Active Users${activeCount == null ? "" : ` (${activeCount.toLocaleString()})`}`,
              },
              {
                key: "registered",
                label: `Registered Users${regCount == null ? "" : ` (${regCount.toLocaleString()})`}`,
              },
            ]}
            style={{ marginBottom: -1 }}
          />
        </div>

        {/* Tab content */}
        <div style={{ animation: "fadeIn .2s ease both" }}>
          {activeTab === "active" && <ActiveUsersTab />}
          {activeTab === "registered" && <RegisteredUsersTab />}
        </div>
      </div>
    </div>
  );
}
