import { lazy } from "react";

// Task Management
const TaskCreation = lazy(
  () => import("../../features/tasks/pages/TaskCreation"),
);
const TaskManagementByDate = lazy(
  () => import("../../features/tasks/pages/TaskManagementByDate"),
);
const AdminTasks = lazy(() => import("../../features/tasks/pages/AdminTasks"));
const AdminInstructions = lazy(
  () => import("../../features/tasks/pages/AdminInstructions"),
);
const RadhaInstructionView = lazy(
  () => import("../../features/tasks/pages/RadhaInstructionView"),
);
const PlanOfTheDay = lazy(
  () => import("../../features/tasks/pages/PlanOfTheDay"),
);
const EndOfTheDay = lazy(
  () => import("../../features/tasks/pages/EndOfTheDay"),
);
const UserTaskDetailsPage = lazy(
  () => import("../../features/tasks/pages/UserTaskDetailsPage"),
);
const LeaveManagement = lazy(
  () => import("../../features/tasks/pages/TodayLeaves"),
);
const TeamAttendanceReport = lazy(
  () => import("../../features/tasks/pages/TeamAttendanceReport"),
);
const EmployeeRegisteredUsers = lazy(
  () => import("../../features/tasks/pages/EmployeeRegisteredUsers"),
);
const Dashboard = lazy(() => import("../../features/tasks/pages/Dashboard"));
const TodayPlans = lazy(
  () => import("../../features/tasks/pages/EmployeeDailyPlans"),
);
const AllEmployeesDailyPlans = lazy(
  () => import("../../features/tasks/pages/AllEmployeesDailyPlans"),
);

// AdminPages
const AllQueries = lazy(() => import("../../features/admin/pages/AllQueriesForAdmin"));
const Categories = lazy(() => import("../../features/admin/pages/CategoryList"));
const Coupons = lazy(() => import("../../features/admin/pages/CouponList"));
const Customers = lazy(() => import("../../features/admin/pages/CustomerList"));
const CustomerUpdation = lazy(
  () => import("../../features/admin/pages/CustomerUpdationDetails"),
);
const DashboardTest = lazy(() => import("../../features/admin/pages/Dashboard"));
const DeliveryBoys = lazy(() => import("../../features/admin/pages/DeliveryBoyList"));
const ExchangeOrders = lazy(() => import("../../features/admin/pages/ExchangeOrderList"));
const ItemList = lazy(() => import("../../features/admin/pages/ItemsLists"));
const ItemsLists = lazy(() => import("../../features/admin/pages/ItemRequiremnet"));
const Ordersdetails = lazy(() => import("../../features/admin/pages/OrdersList"));
const OrdersDetailsCustomerId = lazy(
  () => import("../../features/admin/pages/OrdersListbyCustomerId"),
);
const OrdersPending = lazy(() => import("../../features/admin/pages/PendingOrders"));
const SellerItems = lazy(() => import("../../features/admin/pages/SellerItemsList"));
const Sellers = lazy(() => import("../../features/admin/pages/SellersList"));
const Settings = lazy(() => import("../../features/admin/pages/SettingsForm"));
const SubscriptionPlanListustomerId = lazy(
  () => import("../../features/admin/pages/SubscriptionListByCustomerId"),
);
const SubscriberDetailslist = lazy(
  () => import("../../features/admin/pages/SubscriberDetails"),
);
const Subscribers = lazy(() => import("../../features/admin/pages/SubscribersList"));
const SubscriptionPlansList = lazy(
  () => import("../../features/admin/pages/SubscriptionPlanList"),
);
const AllInforMationOfBarCode = lazy(
  () => import("../../features/admin/pages/AllInformationOfBarcode"),
);
const CategoryInventory = lazy(
  () => import("../../features/admin/pages/CategoryInventary"),
);
const TimeSlots = lazy(() => import("../../features/admin/pages/TimeSlots"));
const AllReferralsData = lazy(
  () => import("../../features/admin/pages/AllReferrelsData"),
);
const ActiveOffersList = lazy(
  () => import("../../features/admin/pages/ActiveOffersList"),
);
const StudentApplications = lazy(
  () => import("../../features/admin/pages/StudentApplications"),
);
const Services = lazy(() => import("../../features/admin/pages/ServicesList"));
const ServiceList = lazy(() => import("../../features/admin/pages/ServiceList"));
const OrdersByCoupon = lazy(() => import("../../features/admin/pages/OrdersByCoupon"));
const NBFCDataList = lazy(() => import("../../features/admin/pages/NBFCDataList"));
const StudentRegistrations = lazy(
  () => import("../../features/admin/pages/StudentRegistrations"),
);
const InitiatedAmountList = lazy(
  () => import("../../features/admin/pages/InitiatedAmountList"),
);
const ApprovedAmountList = lazy(
  () => import("../../features/admin/pages/ApprovedAmountList"),
);
const WithdrawalRequests = lazy(
  () => import("../../features/admin/pages/WithdrawalUsersList"),
);
const FuelExpenses = lazy(() => import("../../features/admin/pages/FuelExpenses"));
const BulkInviteCampaign = lazy(
  () => import("../../features/admin/pages/BulkInviteCampaign"),
);
const CampaignUpload = lazy(() => import("../../features/admin/pages/CampaignUpload"));
const CampaignForm = lazy(() => import("../../features/admin/pages/CampaignForm"));
const PincodesData = lazy(() => import("../../features/admin/pages/PincodesData"));

// Companies Admin
const CompanyList = lazy(() => import("../../features/companies/pages/CompanyList"));
const JobsManagement = lazy(() => import("../../features/companies/pages/JobsManage"));
const GetAllJobs = lazy(() => import("../../features/companies/pages/GetAllJobs"));
const WeHiringPage = lazy(() => import("../../features/companies/pages/WeHiringPage"));
const NewsPapers = lazy(() => import("../../features/companies/pages/NewsPapers"));
const DigitalInvestment = lazy(
  () => import("../../features/companies/pages/DigitalInvestment"),
);
const RotaryData = lazy(() => import("../../features/companies/pages/RotaryData"));
const CampaignsWithComments = lazy(
  () => import("../../features/companies/pages/CampaignsWithComments"),
);
const StudentSalesData = lazy(
  () => import("../../features/companies/pages/StudentSalesData"),
);

// Agents Admin
const AgentsAdminLayout = lazy(
  () => import("../../features/agents/components/AgentsAdminLayout"),
);
const AssistantsList = lazy(
  () => import("../../features/agents/pages/AssistantsList"),
);
const PlansList = lazy(() => import("../../features/agents/pages/PlansList"));
const AgentsList = lazy(
  () => import("../../features/agents/pages/AgentStatusList"),
);
const GeminiUsers = lazy(() => import("../../features/agents/pages/GeminiUsers"));
const ConversationsList = lazy(
  () => import("../../features/agents/pages/ConversationsList"),
);
const AgentManagement = lazy(
  () => import("../../features/agents/pages/AgentManagement"),
);
const AgentsRegisteredUsers = lazy(
  () => import("../../features/agents/pages/AgentsRegisteredUsers"),
);
const AgentUserProfile = lazy(
  () => import("../../features/agents/pages/AgentUserProfile"),
);
const GPTStore = lazy(() => import("../../features/agents/pages/GPTStore"));
const UserHistoryAdmin = lazy(
  () => import("../../features/agents/pages/UserHistoryAdmin"),
);
const AgentsCreatrionUsers = lazy(
  () => import("../../features/agents/pages/AgentsCreationData"),
);
const AgentsBmvCoinsUpdated = lazy(
  () => import("../../features/agents/pages/AgentsBmvCoinsUpdated"),
);
const AgentStoreManager = lazy(
  () => import("../../features/agents/pages/AgentStoreManager"),
);
const FreelancersList = lazy(
  () => import("../../features/agents/pages/Freelancer"),
);

const ADMIN_BASE = "/admin";
const TASK_BASE = "/taskmanagement";
const ADMIN_LOGIN = "/";
const COMPANIES_LOGIN = `${ADMIN_BASE}/comapanieslogin`;
const AGENTS_LOGIN = `${ADMIN_BASE}/agentslogin`;
const TASK_LOGIN = `${ADMIN_BASE}/taskmanagementlogin`;

const adminRoutes = [
  { path: "fuel-expenses", element: FuelExpenses },
  { path: "dashboard", element: DashboardTest },
  { path: "all-referrals", element: AllReferralsData },
  { path: "emailcampaign", element: CampaignForm },
  { path: "nbfcdatalist", element: NBFCDataList },
  { path: "timeslots", element: TimeSlots },
  { path: "bulkinvites", element: BulkInviteCampaign },
  { path: "categories", element: Categories },
  { path: "pincodesdata", element: PincodesData },
  { path: "initiatedamountlist", element: InitiatedAmountList },
  { path: "approvedamountlist", element: ApprovedAmountList },
  { path: "withdrawaluserlist", element: WithdrawalRequests },
  { path: "coupons", element: Coupons },
  { path: "ordersByCoupon", element: OrdersByCoupon },
  { path: "studentapplications", element: StudentApplications },
  { path: "student-registrations", element: StudentRegistrations },
  { path: "customers", element: Customers },
  { path: "customer-updation", element: CustomerUpdation },
  { path: "services", element: Services },
  { path: "serviceslist", element: ServiceList },
  { path: "category-inventory", element: CategoryInventory },
  { path: "campaign-inventory", element: CampaignUpload },
  { path: "delivery-boys", element: DeliveryBoys },
  { path: "exchange-orders", element: ExchangeOrders },
  { path: "items", element: ItemList },
  { path: "items-lists", element: ItemsLists },
  { path: "items-offerlists", element: ActiveOffersList },
  { path: "orders-details", element: Ordersdetails },
  { path: "orders-details/:id", element: OrdersDetailsCustomerId },
  { path: "orders-pending", element: OrdersPending },
  { path: "sellers-items/:sellerId", element: SellerItems },
  { path: "sellers", element: Sellers },
  { path: "settings", element: Settings },
  { path: "subscription-plans-list", element: SubscriptionPlansList },
  {
    path: "subscription-plans-list/:id",
    element: SubscriptionPlanListustomerId,
  },
  { path: "subscriber-details", element: SubscriberDetailslist },
  { path: "subscribers", element: Subscribers },
  { path: "user_queries", element: AllQueries },
  {
    path: "allinformationofbarcode/:itemId",
    element: AllInforMationOfBarCode,
  },
];

const companyAdminRoutes = [
  { path: "companylist", element: CompanyList },
  { path: "studentsalesdata", element: StudentSalesData },
  { path: "news-papers", element: NewsPapers },
  { path: "digitalinvestment", element: DigitalInvestment },
  { path: "rotarydata", element: RotaryData },
  { path: "jobsmanage", element: JobsManagement },
  { path: "wearehiring", element: WeHiringPage },
  { path: "getalljobs", element: GetAllJobs },
  { path: "campaignwithcomments", element: CampaignsWithComments },
].map((route) => ({
  loginPath: COMPANIES_LOGIN,
  ...route,
}));

const agentsAdminRoutes = [
  { path: "agentsdashboard", element: AgentsAdminLayout },
  { path: "assistantslist", element: AssistantsList },
  { path: "freelancer-list", element: FreelancersList },
  { path: "agents-aistore", element: AgentStoreManager },
  { path: "conversationlist", element: ConversationsList },
  { path: "agentsplanslist", element: PlansList },
  { path: "agentsstatuslist", element: AgentsList },
  { path: "agentsregisteredusers", element: AgentsRegisteredUsers },
  { path: "agent-user", element: AgentUserProfile },
  { path: "agents-creation-users", element: AgentsCreatrionUsers },
  { path: "agent-gptstore", element: GPTStore },
  { path: "userhistory", element: UserHistoryAdmin },
  { path: "agents-bmv-coins-updated", element: AgentsBmvCoinsUpdated },
  { path: "authorizedusers", element: AgentManagement },
  { path: "agents-registered-users", element: GeminiUsers },
].map((route) => ({
  ...route,
  loginPath: AGENTS_LOGIN,
}));

const taskManagementRoutes = [
  { path: "taskcreation", element: TaskCreation },
  { path: "taskmanagementbydate", element: TaskManagementByDate },
  { path: "work-logs/today", element: TodayPlans },
  { path: "tasks/assigned", element: AdminTasks },
  { path: "work-logs/history", element: AllEmployeesDailyPlans },
  { path: "tasks/assigned", element: AdminInstructions },
  { path: "chatview/:id", element: RadhaInstructionView },
  { path: "reports/daily-plan", element: PlanOfTheDay },
  { path: "reports/daily-summary", element: EndOfTheDay },
  { path: "user-task-details/:userId", element: UserTaskDetailsPage },
  { path: "leave-management", element: LeaveManagement },
  { path: "attendance", element: TeamAttendanceReport },
  { path: "employee_registered_users", element: EmployeeRegisteredUsers },
  { path: "overview", element: Dashboard },
].map((route) => ({
  ...route,
  loginPath: TASK_LOGIN,
}));

export {
  ADMIN_BASE,
  TASK_BASE,
  ADMIN_LOGIN,
  COMPANIES_LOGIN,
  AGENTS_LOGIN,
  TASK_LOGIN,
  adminRoutes,
  companyAdminRoutes,
  agentsAdminRoutes,
  taskManagementRoutes,
};
