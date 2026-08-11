import {
  BankOutlined,
  WalletOutlined,
  RobotOutlined,
  BuildOutlined,
  TrophyOutlined,
  TeamOutlined,
  StarOutlined,
  SettingOutlined,
  DashboardOutlined,
  CalendarOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

/* ── Sidebar nav ─────────────────────────────────────────── */
export const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ icon: "dashboard", label: "Dashboard", key: "dashboard" }],
  },
  {
    label: "Products",
    items: [
      { icon: "lender", label: "OxyLoans Lender", key: "lender" },
      { icon: "borrower", label: "OxyLoans Borrower", key: "borrower" },
      { icon: "askoxy", label: "AskOxy.AI", key: "askoxy" },
      { icon: "oxybricks", label: "OxyBricks", key: "oxybricks" },
      { icon: "oxygold", label: "OxyGold", key: "oxygold" },
      { icon: "partner", label: "Partner", key: "partner" },
      { icon: "interested", label: "Interested", key: "interested" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: "settings", label: "Settings", key: "settings" },
      { icon: "logout", label: "Logout", key: "logout", danger: true },
    ],
  },
];

/* ── Section config — columns + API endpoint placeholder ─── */
export const SECTIONS = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of all users",
    color: "#2563eb",
    icon: <DashboardOutlined />,
  },
  lender: {
    title: "OxyLoans Lender",
    subtitle: "All registered lender users",
    color: "#2563eb",
    icon: <BankOutlined />,
    endpoint: "/user-service/lenders", // replace with real endpoint
    columns: ["Name", "Email", "Mobile", "Amount", "Status", "Joined"],
    rowKeys: ["name", "email", "mobile", "amount", "status", "createdDate"],
  },
  borrower: {
    title: "OxyLoans Borrower",
    subtitle: "All registered borrower users",
    color: "#7c3aed",
    icon: <WalletOutlined />,
    endpoint: "/user-service/borrowers",
    columns: ["Name", "Email", "Mobile", "Loan Amt", "Status", "Joined"],
    rowKeys: ["name", "email", "mobile", "loanAmount", "status", "createdDate"],
  },
  askoxy: {
    title: "AskOxy.AI",
    subtitle: "Registered users on AskOxy.AI",
    color: "#0891b2",
    icon: <RobotOutlined />,
  },
  oxybricks: {
    title: "OxyBricks",
    subtitle: "OxyBricks property users",
    color: "#b45309",
    icon: <BuildOutlined />,
    endpoint: "/user-service/oxybricks-users",
    columns: ["Name", "Email", "Mobile", "Property", "Status", "Joined"],
    rowKeys: [
      "name",
      "email",
      "mobile",
      "propertyType",
      "status",
      "createdDate",
    ],
  },
  oxygold: {
    title: "OxyGold",
    subtitle: "OxyGold investment users",
    color: "#d97706",
    icon: <TrophyOutlined />,
  },
  partner: {
    title: "Partner",
    subtitle: "Registered partner accounts",
    color: "#059669",
    icon: <TeamOutlined />,
    endpoint: "/user-service/partners",
    columns: ["Name", "Email", "Mobile", "Type", "Status", "Joined"],
    rowKeys: [
      "name",
      "email",
      "mobile",
      "partnerType",
      "status",
      "createdDate",
    ],
  },
  interested: {
    title: "Interested",
    subtitle: "Users who expressed interest",
    color: "#e11d48",
    icon: <StarOutlined />,
  },
  settings: {
    title: "Settings",
    subtitle: "Admin panel settings",
    color: "#475569",
    icon: <SettingOutlined />,
  },
};

/* ── Dashboard Overview stats ────────────────────────────────
   `value` is a placeholder until these are wired to real counts
   (e.g. per-section record totals from the API).            ── */
export const OVERVIEW_STATS = [
  {
    label: "Total Users",
    key: "totalUsers",
    icon: <TeamOutlined />,
    color: "#2563eb",
  },
  {
    label: "Today",
    key: "todayUsers",
    icon: <CalendarOutlined />,
    color: "#0891b2",
  },
  {
    label: "Yesterday",
    key: "yesterdayUsers",
    icon: <HistoryOutlined />,
    color: "#7c3aed",
  },
  {
    label: "This Week",
    key: "thisWeekUsers",
    icon: <BarChartOutlined />,
    color: "#059669",
  },
  {
    label: "This Month",
    key: "thisMonthUsers",
    icon: <LineChartOutlined />,
    color: "#d97706",
  },
];
