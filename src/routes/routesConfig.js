import { lazy } from "react";

// Task Management
const TaskCreation = lazy(() => import("../TaskManagement/Pages/TaskCreation"));
const TaskManagementByDate = lazy(
  () => import("../TaskManagement/Pages/TaskManagementByDate"),
);
const AdminTasks = lazy(() => import("../TaskManagement/Pages/AdminTasks"));
const AdminInstructions = lazy(
  () => import("../TaskManagement/Pages/AdminInstructions"),
);
const RadhaInstructionView = lazy(
  () => import("../TaskManagement/Pages/RadhaInstructionView"),
);
const PlanOfTheDay = lazy(() => import("../TaskManagement/Pages/PlanOfTheDay"));
const EndOfTheDay = lazy(() => import("../TaskManagement/Pages/EndOfTheDay"));
const UserTaskDetailsPage = lazy(
  () => import("../TaskManagement/Pages/UserTaskDetailsPage"),
);
const LeaveManagement = lazy(
  () => import("../TaskManagement/Pages/TodayLeaves .jsx"),
);
const TeamAttendanceReport = lazy(
  () => import("../TaskManagement/Pages/TeamAttendanceReport"),
);
const EmployeeRegisteredUsers = lazy(
  () => import("../TaskManagement/Pages/EmployeeRegisteredUsers"),
);
const Dashboard = lazy(() => import("../TaskManagement/Pages/Dashboard"));
const TodayPlans = lazy(
  () => import("../TaskManagement/Pages/EmployeeDailyPlans"),
);
const AllEmployeesDailyPlans = lazy(
  () => import("../TaskManagement/Pages/AllEmployeesDailyPlans"),
);

// AdminPages (New Structure)
const AllQueries = lazy(() => import("../AdminPages/AllQueriesForAdmin"));
const Categories = lazy(() => import("../AdminPages/CategoryList"));
const Coupons = lazy(() => import("../AdminPages/CouponList"));
const Customers = lazy(() => import("../AdminPages/CustomerList"));
const CustomerUpdation = lazy(
  () => import("../AdminPages/CustomerUpdationDetails"),
);
const DashboardTest = lazy(() => import("../AdminPages/Dashboard"));
const DeliveryBoys = lazy(() => import("../AdminPages/DeliveryBoyList"));
const ExchangeOrders = lazy(() => import("../AdminPages/ExchangeOrderList"));
const ItemList = lazy(() => import("../AdminPages/ItemsLists"));
const ItemsLists = lazy(() => import("../AdminPages/ItemRequiremnet"));
const Ordersdetails = lazy(() => import("../AdminPages/OrdersList"));
const OrdersDetailsCustomerId = lazy(
  () => import("../AdminPages/OrdersListbyCustomerId"),
);
const OrdersPending = lazy(() => import("../AdminPages/PendingOrders"));
const SellerItems = lazy(() => import("../AdminPages/SellerItemsList"));
const Sellers = lazy(() => import("../AdminPages/SellersList"));
const Settings = lazy(() => import("../AdminPages/SettingsForm"));
const SubscriptionPlanListustomerId = lazy(
  () => import("../AdminPages/SubscriptionListByCustomerId"),
);
const SubscriberDetailslist = lazy(
  () => import("../AdminPages/SubscriberDetails"),
);
const Subscribers = lazy(() => import("../AdminPages/SubscribersList"));
const SubscriptionPlansList = lazy(
  () => import("../AdminPages/SubscriptionPlanList"),
);
const AllInforMationOfBarCode = lazy(
  () => import("../AdminPages/AllInformationOfBarcode"),
);
const CategoryInventory = lazy(() => import("../AdminPages/CategoryInventary"));
const TimeSlots = lazy(() => import("../AdminPages/TimeSlots"));
const AllReferralsData = lazy(() => import("../AdminPages/AllReferrelsData"));
const ActiveOffersList = lazy(() => import("../AdminPages/ActiveOffersList"));
const StudentApplications = lazy(
  () => import("../AdminPages/StudentApplications"),
);
const Services = lazy(() => import("../AdminPages/ServicesList"));
const ServiceList = lazy(() => import("../AdminPages/ServiceList"));
const OrdersByCoupon = lazy(() => import("../AdminPages/OrdersByCoupon"));
const NBFCDataList = lazy(() => import("../AdminPages/NBFCDataList"));
const StudentRegistrations = lazy(
  () => import("../AdminPages/StudentRegistrations"),
);
const InitiatedAmountList = lazy(
  () => import("../AdminPages/InitiatedAmountList"),
);
const ApprovedAmountList = lazy(
  () => import("../AdminPages/ApprovedAmountList"),
);
const WithdrawalRequests = lazy(
  () => import("../AdminPages/WithdrawalUsersList"),
);
const FuelExpenses = lazy(() => import("../AdminPages/FuelExpenses"));
const BulkInviteCampaign = lazy(
  () => import("../AdminPages/BulkInviteCampaign"),
);
const CampaignUpload = lazy(() => import("../AdminPages/CampaignUpload"));
const CampaignForm = lazy(() => import("../AdminPages/CampaignForm"));
const PincodesData = lazy(() => import("../AdminPages/PincodesData"));

// Companies Admin
const CompanyList = lazy(() => import("../features/companies/pages/CompanyList"));
const JobsManagement = lazy(() => import("../Companies/Pages/JobsManage"));
const GetAllJobs = lazy(() => import("../Companies/Pages/GetAllJobs"));
const WeHiringPage = lazy(() => import("../Companies/Pages/WeHiringPage"));
const NewsPapers = lazy(() => import("../Companies/Pages/NewsPapers"));
const DigitalInvestment = lazy(
  () => import("../Companies/Pages/DigitalInvestment"),
);
const RotaryData = lazy(() => import("../Companies/Pages/RotaryData"));
const CampaignsWithComments = lazy(
  () => import("../Companies/Pages/CampaignsWithComments"),
);
const StudentSalesData = lazy(
  () => import("../Companies/Pages/StudentSalesData"),
);

// Agents Admin
const AgentsAdminLayout = lazy(
  () => import("../features/agents/components/AgentsAdminLayout.jsx"),
);
const AssistantsList = lazy(
  () => import("../AgentsAdmin/Pages/AssistantsList"),
);
const PlansList = lazy(() => import("../AgentsAdmin/Pages/PlansList"));
const AgentsList = lazy(() => import("../AgentsAdmin/Pages/AgentStatusList"));
const GeminiUsers = lazy(() => import("../AgentsAdmin/Pages/GeminiUsers"));
const ConversationsList = lazy(
  () => import("../AgentsAdmin/Pages/ConversationsList"),
);
const AgentManagement = lazy(
  () => import("../AgentsAdmin/Pages/AgentManagement"),
);
const AgentsRegisteredUsers = lazy(
  () => import("../AgentsAdmin/Pages/AgentsRegisteredUsers"),
);
const AgentUserProfile = lazy(
  () => import("../AgentsAdmin/Pages/AgentUserProfile"),
);
const GPTStore = lazy(() => import("../AgentsAdmin/Pages/GPTStore"));
const UserHistoryAdmin = lazy(
  () => import("../AgentsAdmin/Pages/UserHistoryAdmin"),
);
const AgentsCreatrionUsers = lazy(
  () => import("../AgentsAdmin/Pages/AgentsCreationData"),
);
const AgentsBmvCoinsUpdated = lazy(
  () => import("../AgentsAdmin/Pages/AgentsBmvCoinsUpdated"),
);
const AgentStoreManager = lazy(
  () => import("../AgentsAdmin/Pages/AgentStoreManager"),
);
const FreelancersList = lazy(() => import("../AgentsAdmin/Pages/Freelancer"));

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
  { path: "allinformationofbarcode/:itemId", element: AllInforMationOfBarCode },
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
