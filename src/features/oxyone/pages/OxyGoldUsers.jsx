import { useState, useEffect, useCallback } from "react";
import adminApi from "../../../core/config/axiosInstance";
import { Table, Button, Input, Skeleton } from "antd";
import {
  ReloadOutlined,
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  GoldOutlined,
} from "@ant-design/icons";
import UserStatCard from "../components/UserStatCard";

const API_BASE = "/oxygold-api/auth/viewAllUsers";
const PAGE_SIZE = 10;

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[420px]">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow-sm">
            <div className="h-9 bg-gradient-to-br from-slate-200 to-slate-300" />
            <div className="h-14 bg-white border-l-[3px] border-l-slate-200 border border-slate-200 relative overflow-hidden">
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
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    </div>
  );
}

const STAT_META = {
  total: {
    label: "Total Users",
    accent: "#d97706",
    grad: "linear-gradient(135deg,#d97706,#f59e0b)",
    sub: "All registered OxyGold users",
    icon: <TeamOutlined />,
  },
  pages: {
    label: "Total Pages",
    accent: "#b45309",
    grad: "linear-gradient(135deg,#b45309,#d97706)",
    sub: "Server-side pages",
    icon: <GoldOutlined />,
  },
};

function StatCard({ id, value, loading }) {
  return <UserStatCard meta={STAT_META[id]} value={value} loading={loading} />;
}

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
          padding: "7px 10px",
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
          padding: "7px 10px",
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

export default function OxyGoldUsers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchData = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const res = await adminApi.get(API_BASE, {
        params: { page: pg, size: PAGE_SIZE },
      });
      const pagination = res.data?.data ?? res.data ?? {};
      const rows = Array.isArray(pagination.content)
        ? pagination.content
        : Array.isArray(pagination.data)
          ? pagination.data
          : [];
      const serverTotal = Number(pagination.totalElements);
      const serverSize = Number(pagination.size) || PAGE_SIZE;
      const total = Number.isFinite(serverTotal) ? serverTotal : rows.length;
      const pagesFromResponse = Number(pagination.totalPages);
      const pages = Number.isFinite(pagesFromResponse)
        ? pagesFromResponse
        : Math.ceil(total / serverSize);
      const serverPage = Number(pagination.number ?? pagination.page);

      setData(rows);
      setTotalElements(total);
      setTotalPages(pages);
      setPage(Number.isFinite(serverPage) ? serverPage : pg);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  // client-side search within current page
  const filtered = search
    ? data.filter((r) =>
        [
          r.firstName,
          r.lastName,
          r.email,
          r.phoneNumber,
          r.whatsappNumber,
        ].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
      )
    : data;

  const columns = [
    {
      title: "S.No",
      width: 60,
      align: "center",
      render: (_, __, i) => (
        <span className="inline-flex items-center justify-center w-7 h-[22px] rounded-[6px] bg-slate-100 text-slate-800 text-[11px] font-black">
          {page * PAGE_SIZE + i + 1}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      width: 80,
      align: "center",
      render: (v) => (
        <span className="font-mono text-[11px] font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[5px] text-amber-800">
          #{v}
        </span>
      ),
    },
    {
      title: "User Details",
      width: 210,
      render: (_, row) => {
        const name = [row.firstName, row.lastName].filter(Boolean).join(" ");
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-[30px] h-[30px] rounded-lg flex-shrink-0 grid place-items-center text-white font-black text-xs"
              style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)" }}
            >
              {(name || row.phoneNumber || "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[160px]">
                {name || (
                  <span className="text-slate-400 font-normal">No Name</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium truncate max-w-[160px]">
                {row.email || "—"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-xs font-bold text-slate-900">
            {v}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsappNumber",
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-xs font-bold text-emerald-700">
            {v}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Alt. Number",
      dataIndex: "alternativeNumber",
      align: "center",
      render: (v) =>
        v ? <span className="font-mono text-xs text-slate-600">{v}</span> : "—",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      align: "center",
      render: (v) => {
        if (!v) return "—";
        const map = {
          male: "bg-blue-50 text-blue-600 border-blue-200",
          female: "bg-pink-50 text-pink-600 border-pink-200",
        };
        return (
          <span
            className={`border px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${map[v.toLowerCase()] || "bg-slate-50 text-slate-500 border-slate-200"}`}
          >
            {v}
          </span>
        );
      },
    },
    {
      title: "Registered On",
      dataIndex: "createdAt",
      align: "center",
      width: 140,
      render: (v) =>
        v ? (
          <div>
            <div className="text-xs font-bold text-slate-900">
              {v.slice(0, 10)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {v.slice(11, 16)}
            </div>
          </div>
        ) : (
          "—"
        ),
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Header: title+subtitle left | refresh right ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="text-[15px] font-black text-slate-900 tracking-tight leading-tight">
              OxyGold — Users
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              All registered OxyGold investment users
            </div>
          </div>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchData(page)}
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

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[420px]">
        <StatCard
          id="total"
          value={totalElements}
          loading={loading && page === 0}
        />
        <StatCard
          id="pages"
          value={totalPages}
          loading={loading && page === 0}
        />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0">
        {/* Toolbar: label+count left | search right */}
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900">
              User Records
            </span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {totalElements.toLocaleString()} total
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
              prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Search name, phone, email..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearch(e.target.value);
              }}
              allowClear
              style={{ width: 220, borderRadius: 7, height: 30 }}
            />
            <Button
              icon={<SearchOutlined />}
              type="primary"
              onClick={() => setSearch(searchInput)}
              style={{
                background: "linear-gradient(135deg,#d97706,#b45309)",
                border: "none",
                borderRadius: 7,
                height: 30,
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              Search
            </Button>
          </div>
        </div>

        <Table
          className="oxyone-square-table"
          rowKey="userId"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: totalElements,
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
          style={{ width: "100%" }}
          components={TABLE_COMPONENTS}
        />
      </div>
    </div>
  );
}
