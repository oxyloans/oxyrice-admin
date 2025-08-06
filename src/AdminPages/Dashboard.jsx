// import React, { useEffect, useState } from "react";
// import {
//   Layout,
//   Typography,
//   Card,
//   Space,
//   Badge,
//   Button,
//   Tooltip,
//   Row,
//   Col,
//   DatePicker,
//   Table,
//   message,
//   Tag,
// } from "antd";
// import { Line } from "react-chartjs-2";
// import {
//   UserOutlined,
//   TeamOutlined,
//   CalendarOutlined,
//   ClockCircleOutlined,
//   RiseOutlined,
//   ReloadOutlined,
//   SearchOutlined,
//   PhoneOutlined,
//   WhatsAppOutlined,
//   DownloadOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import AdminPanelLayoutTest from "./AdminPanel";
// import * as XLSX from "xlsx";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title as ChartTitle,
//   Tooltip as ChartTooltip,
//   Legend,
// } from "chart.js";
// import BASE_URL from "./Config";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   ChartTitle,
//   ChartTooltip,
//   Legend
// );

// const { Content } = Layout;
// const { Title, Text } = Typography;

// const DashboardTest = () => {
//   const [analyticsData, setAnalyticsData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [toDate, setToDate] = useState(null);

//   const [userDetails, setUserDetails] = useState([]);
//   const [userDetailsLoading, setUserDetailsLoading] = useState(false);
//   const [downloadLoading, setDownloadLoading] = useState(false);
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 100,
//     total: 0,
//   });

//   const handleToDateChange = (date) => {
//     setToDate(date);
//   };

//   const handleFromDateChange = (date) => {
//     setStartDate(date);
//   };

//   const fetchCounts = async () => {
//     try {
//       setRefreshing(true);
//       const response = await axios.get(`${BASE_URL}/user-service/counts`);
//       setAnalyticsData(response.data);
//       setLoading(false);
//       setRefreshing(false);
//     } catch (error) {
//       console.error("Error fetching count data:", error);
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const fetchUserDetails = async (fromDate, endDate, page = 0, size = 100) => {
//     try {
//       setUserDetailsLoading(true);

//       // Ensure both dates are selected
//       if (!fromDate || !endDate) {
//         message.error("Please select a valid date range.");
//         setUserDetailsLoading(false);
//         return;
//       }

//       // Ensure the fromDate is before the endDate
//       if (fromDate.isAfter(endDate)) {
//         message.error("From date cannot be later than To date.");
//         setUserDetailsLoading(false);
//         return;
//       }

//       // Format the dates for API call
//       const formattedStartDate = fromDate.format("YYYY-MM-DD");
//       const formattedEndDate = endDate.format("YYYY-MM-DD");

//       const response = await axios.get(
//         `${BASE_URL}/user-service/date-rangeuserdetails?startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=${page}&size=${size}`
//       );

//       // Process the response data
//       if (response.data) {
//         const dataWithIndex = (response.data.content || response.data).map(
//           (item, index) => ({
//             ...item,
//             serialNumber: page * size + index + 1,
//           })
//         );

//         setUserDetails(dataWithIndex);
//         setPagination({
//           ...pagination,
//           current: page + 1,
//           total: response.data.totalElements || response.data.length,
//         });
//       }
//       setUserDetailsLoading(false);
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//       setUserDetailsLoading(false);
//     }
//   };

//   // New function to fetch all users for Excel download
//   const fetchAllUsersForDownload = async (fromDate, endDate) => {
//     try {
//       setDownloadLoading(true);

//       // Ensure both dates are selected
//       if (!fromDate || !endDate) {
//         message.error("Please select a valid date range.");
//         setDownloadLoading(false);
//         return null;
//       }

//       // Ensure the fromDate is before the endDate
//       if (fromDate.isAfter(endDate)) {
//         message.error("From date cannot be later than To date.");
//         setDownloadLoading(false);
//         return null;
//       }

//       // Format the dates for API call
//       const formattedStartDate = fromDate.format("YYYY-MM-DD");
//       const formattedEndDate = endDate.format("YYYY-MM-DD");

//       // Making request for all users without pagination
//       const response = await axios.get(
//         `${BASE_URL}/user-service/date-rangeuserdetails?startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=0&size=10000`
//       );

//       // Process the response data
//       if (response.data) {
//         const dataWithIndex = (response.data.content || response.data).map(
//           (item, index) => ({
//             ...item,
//             serialNumber: index + 1,
//           })
//         );
//         setDownloadLoading(false);
//         return dataWithIndex;
//       }
//       setDownloadLoading(false);
//       return null;
//     } catch (error) {
//       console.error("Error fetching users for download:", error);
//       message.error("Failed to fetch users for download");
//       setDownloadLoading(false);
//       return null;
//     }
//   };

//   const handleFilter = () => {
//     fetchUserDetails(startDate, toDate);
//   };

//   const handleTableChange = (pagination) => {
//     fetchUserDetails(
//       startDate,
//       toDate,
//       pagination.current - 1,
//       pagination.pageSize
//     );
//   };

//   const refreshAllData = () => {
//     fetchCounts();
//     // Only fetch user details if dates are selected
//     if (startDate && toDate) {
//       fetchUserDetails(startDate, toDate);
//     }
//   };

//   // Function to format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");
//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   };

//   // Function to download Excel
//   const downloadExcel = async () => {
//     if (!startDate || !toDate) {
//       message.error("Please select a valid date range before downloading");
//       return;
//     }

//     const allUsers = await fetchAllUsersForDownload(startDate, toDate);

//     if (!allUsers || allUsers.length === 0) {
//       message.info("No data available for download");
//       return;
//     }

//     try {
//       // Prepare data for Excel format
//       const excelData = allUsers.map((user, index) => {
//         const name =
//           user.fullName ||
//           `${user.firstName || ""} ${user.lastName || ""}`.trim();
//         return {
//           "S.No": index + 1,
//           "User ID": user.id || "-",
//           "Customer Name": name || "No name provided",
//           "WhatsApp Number": user.whatsappNumber || "-",
//           "Mobile Number": user.mobileNumber || "-",
//           "Registration Date": formatDate(user.created_at),
//         };
//       });

//       // Create workbook and worksheet
//       const workbook = XLSX.utils.book_new();
//       const worksheet = XLSX.utils.json_to_sheet(excelData);

//       // Add worksheet to workbook
//       XLSX.utils.book_append_sheet(
//         workbook,
//         worksheet,
//         "User Registration Data"
//       );

//       // Format the filename with date range
//       const fromDateStr = startDate.format("YYYY-MM-DD");
//       const toDateStr = toDate.format("YYYY-MM-DD");
//       const fileName = `User_Registrations_${fromDateStr}_to_${toDateStr}.xlsx`;

//       // Write file and download
//       XLSX.writeFile(workbook, fileName);
//       message.success("Excel file downloaded successfully");
//     } catch (error) {
//       console.error("Error generating Excel:", error);
//       message.error("Failed to generate Excel file");
//     }
//   };

//   useEffect(() => {
//     fetchCounts();
//     // Initial user details fetch only if dates are set
//     if (startDate && toDate) {
//       fetchUserDetails(startDate, toDate);
//     }

//     // Set up auto-refresh every 5 minutes
//     const refreshInterval = setInterval(() => {
//       refreshAllData();
//     }, 300000);

//     return () => clearInterval(refreshInterval);
//   }, []);

//   // Calculate growth percentage
//   const calculateGrowth = (current, previous) => {
//     if (!previous) return 0;
//     return (((current - previous) / previous) * 100).toFixed(1);
//   };

//   // Chart Data with gradient
//   const chartData = {
//     labels: ["Yesterday", "Today", "This Week", "This Month"],
//     datasets: [
//       {
//         label: "User Growth",
//         data: [
//           analyticsData.yesterdayUsers || 0,
//           analyticsData.todayUsers || 0,
//           analyticsData.thisWeekUsers || 0,
//           analyticsData.thisMonthUsers || 0,
//         ],
//         fill: true,
//         backgroundColor: (context) => {
//           const ctx = context.chart.ctx;
//           const gradient = ctx.createLinearGradient(0, 0, 0, 350);
//           gradient.addColorStop(0, "rgba(66, 133, 244, 0.25)");
//           gradient.addColorStop(1, "rgba(66, 133, 244, 0.02)");
//           return gradient;
//         },
//         borderColor: "#4285F4",
//         borderWidth: 2,
//         tension: 0.4,
//         pointBackgroundColor: "#ffffff",
//         pointBorderColor: "#4285F4",
//         pointBorderWidth: 2,
//         pointRadius: 5,
//         pointHoverRadius: 8,
//         pointHoverBackgroundColor: "#4285F4",
//         pointHoverBorderColor: "#ffffff",
//         pointHoverBorderWidth: 2,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top",
//         labels: { font: { size: 14, family: "Inter" } },
//       },
//       title: {
//         display: true,
//         text: "User Growth Analytics",
//         font: { size: 18, family: "Inter", weight: "600" },
//         color: "#1a3353",
//       },
//       tooltip: {
//         backgroundColor: "#1a3353",
//         titleFont: { size: 14 },
//         bodyFont: { size: 12 },
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: { color: "rgba(0, 0, 0, 0.05)" },
//         title: { display: true, text: "Number of Users" },
//       },
//       x: {
//         grid: { display: false },
//       },
//     },
//   };

//   const StatCard = ({ title, value, icon, color, description, growth }) => (
//     <Card
//       className="shadow-sm hover:shadow-md transition-all duration-300 rounded-lg border-0"
//       style={{ background: "#fff", borderLeft: `4px solid ${color}` }}
//       bodyStyle={{ padding: "20px" }}
//     >
//       <Space direction="vertical" size={12} className="w-full">
//         <div className="flex justify-between items-center">
//           <div>
//             <Text className="text-gray-500 uppercase text-xs font-medium mr-1">
//               {title}
//             </Text>
//             <Title
//               level={2}
//               className="m-0"
//               style={{ color, fontSize: "28px" }}
//             >
//               {new Intl.NumberFormat("en-US").format(value || 0)}
//             </Title>
//           </div>
//           <div
//             className="p-3 rounded-full"
//             style={{ backgroundColor: `${color}10` }}
//           >
//             {React.cloneElement(icon, { style: { fontSize: 24, color } })}
//           </div>
//         </div>
//         <div className="flex justify-between items-center">
//           <Text className="text-gray-600 text-sm">{description}</Text>
//           {growth && (
//             <Text
//               className={`text-sm ${
//                 growth >= 0 ? "text-green-600" : "text-red-600"
//               }`}
//             >
//               <RiseOutlined rotate={growth >= 0 ? 0 : 180} className="mr-1" />
//               {growth >= 0 ? "+" : ""}
//               {growth}%
//             </Text>
//           )}
//         </div>
//       </Space>
//     </Card>
//   );

//   // Define columns for the user details table
//   const columns = [
//     {
//       title: "S.No",
//       dataIndex: "serialNumber",
//       key: "serialNumber",
//       align: "center",
//       width: 80,
//     },
//     {
//       title: "User ID",
//       dataIndex: "id",
//       key: "id",
//       align: "center",
//       ellipsis: true,
//       render: (itemId) => (
//         <span className="text-gray-500 font-mono text-xs">
//           #{itemId?.substring(itemId.length - 4) || "N/A"}
//         </span>
//       ),
//     },
//     {
//       title: "Customer Contact",
//       key: "contact",
//       align: "center",
//       render: (text, record) => {
//         if (record.whatsappNumber && !record.mobileNumber) {
//           return (
//             <Tooltip title="WhatsApp Number">
//               <Tag color="green" icon={<WhatsAppOutlined />}>
//                 {record.whatsappNumber}
//               </Tag>
//             </Tooltip>
//           );
//         } else if (record.mobileNumber && !record.whatsappNumber) {
//           return (
//             <Tooltip title="Mobile Number">
//               <Tag color="blue" icon={<PhoneOutlined />}>
//                 {record.mobileNumber}
//               </Tag>
//             </Tooltip>
//           );
//         } else if (record.mobileNumber && record.whatsappNumber) {
//           return (
//             <Space direction="vertical" size="small">
//               <Tooltip title="WhatsApp Number">
//                 <Tag color="green" icon={<WhatsAppOutlined />}>
//                   {record.whatsappNumber}
//                 </Tag>
//               </Tooltip>
//               <Tooltip title="Mobile Number">
//                 <Tag color="blue" icon={<PhoneOutlined />}>
//                   {record.mobileNumber}
//                 </Tag>
//               </Tooltip>
//             </Space>
//           );
//         } else {
//           return <Text type="secondary">No contact info</Text>;
//         }
//       },
//     },
//     {
//       title: "Customer Name",
//       key: "name",
//       align: "center",
//       render: (text, record) => {
//         const name =
//           record.fullName ||
//           `${record.firstName || ""} ${record.lastName || ""}`.trim();
//         return name || <Text type="secondary">No name provided</Text>;
//       },
//     },
//     {
//       title: "Registration Date",
//       dataIndex: "created_at",
//       key: "created_at",
//       align: "center",
//       render: (text) => formatDate(text),
//     },
//   ];

//   return (
//     <AdminPanelLayoutTest>
//       <Layout style={{ background: "#f8fafc" }}>
//         <Content className="p-6 md:p-8 min-h-screen">
//           <div className="max-w-7xl mx-auto">
//             <Row justify="space-between" align="middle" className="mb-8">
//               <Col>
//                 <Title
//                   level={2}
//                   style={{
//                     color: "#1a3353",
//                     margin: 0,
//                     fontFamily: "Inter, sans-serif",
//                   }}
//                 >
//                   Admin Dashboard
//                 </Title>
//               </Col>
//               <Col>
//                 <Tooltip title="Refresh data">
//                   <Badge dot={refreshing}>
//                     <Button
//                       type="default"
//                       icon={<ReloadOutlined spin={refreshing} />}
//                       onClick={refreshAllData}
//                       disabled={refreshing}
//                       style={{
//                         borderRadius: 8,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         width: 36,
//                         height: 36,
//                         padding: 0,
//                       }}
//                     />
//                   </Badge>
//                 </Tooltip>
//               </Col>
//             </Row>

//             {loading ? (
//               <div className="text-center py-12">
//                 <Text className="text-gray-500">Loading dashboard...</Text>
//               </div>
//             ) : (
//               <>
//                 <Row gutter={[24, 24]} className="mb-8">
//                   <Col xs={24} sm={12} lg={6}>
//                     <StatCard
//                       title="Total Users"
//                       value={analyticsData.totalUsers}
//                       icon={<TeamOutlined />}
//                       color="#1890ff"
//                       description="All registered users"
//                     />
//                   </Col>
//                   <Col xs={24} sm={12} lg={6}>
//                     <StatCard
//                       title="Today Users"
//                       value={analyticsData.todayUsers}
//                       icon={<ClockCircleOutlined />}
//                       color="#52c41a"
//                       description="New users today"
//                       growth={calculateGrowth(
//                         analyticsData.todayUsers,
//                         analyticsData.yesterdayUsers
//                       )}
//                     />
//                   </Col>
//                   <Col xs={24} sm={12} lg={6}>
//                     <StatCard
//                       title="This Week Users"
//                       value={analyticsData.thisWeekUsers}
//                       icon={<CalendarOutlined />}
//                       color="#fa8c16"
//                       description="New users this week"
//                     />
//                   </Col>
//                   <Col xs={24} sm={12} lg={6}>
//                     <StatCard
//                       title="This Month Users"
//                       value={analyticsData.thisMonthUsers}
//                       icon={<UserOutlined />}
//                       color="#f5222d"
//                       description="New users this month"
//                     />
//                   </Col>
//                 </Row>

//                 <Row gutter={[24, 24]} className="mb-8">
//                   <Col xs={24}>
//                     <Card
//                       className="shadow-sm rounded-lg border-0"
//                       bodyStyle={{ padding: "24px", height: "400px" }}
//                     >
//                       <Line data={chartData} options={chartOptions} />
//                     </Card>
//                   </Col>
//                 </Row>

//                 {/* Date Range Filter and User Details Section */}
//                 <Row gutter={[24, 24]}>
//                   <Col xs={24}>
//                     <Card
//                       title="User Registration Details"
//                       className="shadow-sm rounded-lg border-0"
//                       extra={
//                         <div className="flex flex-col md:flex-row gap-3 md:items-end w-full">
//                           <div className="flex flex-col w-full md:w-auto">
//                             <Text className="text-xs text-gray-500">From</Text>
//                             <DatePicker
//                               value={startDate}
//                               onChange={handleFromDateChange}
//                               format="YYYY-MM-DD"
//                               className="w-full min-w-[160px]"
//                               placeholder="Select From Date"
//                             />
//                           </div>

//                           <div className="flex flex-col w-full md:w-auto">
//                             <Text className="text-xs text-gray-500">To</Text>
//                             <DatePicker
//                               value={toDate}
//                               onChange={handleToDateChange}
//                               format="YYYY-MM-DD"
//                               className="w-full min-w-[160px]"
//                               placeholder="Select To Date"
//                             />
//                           </div>

//                           <div className="flex flex-col w-full md:w-auto">
//                             <Text className="text-xs text-gray-500">
//                               Get Data
//                             </Text>
//                             <Button
//                               style={{ background: "#008CBA", color: "white" }}
//                               icon={<SearchOutlined />}
//                               onClick={handleFilter}
//                               className="w-full md:w-auto"
//                             >
//                               Get Data
//                             </Button>
//                           </div>

//                           <div className="flex flex-col w-full md:w-auto">
//                             <Text className="text-xs text-gray-500">
//                               Export Data
//                             </Text>
//                             <Button
//                               icon={<DownloadOutlined />}
//                               onClick={downloadExcel}
//                               loading={downloadLoading}
//                               disabled={!startDate || !toDate}
//                               style={{
//                                 background: "#04AA6D",
//                                 borderColor: "#52c41a",
//                                 color: "white",
//                               }}
//                               className="w-full md:w-auto"
//                             >
//                               Download Excel
//                             </Button>
//                           </div>
//                         </div>
//                       }
//                     >
//                       <div className="overflow-x-auto">
//                         <Table
//                           columns={columns}
//                           dataSource={userDetails}
//                           rowKey="id"
//                           loading={userDetailsLoading}
//                           pagination={pagination}
//                           onChange={handleTableChange}
//                           scroll={{ x: "max-content" }}
//                           bordered
//                         />
//                       </div>
//                     </Card>
//                   </Col>
//                 </Row>
//               </>
//             )}
//           </div>
//         </Content>
//       </Layout>
//     </AdminPanelLayoutTest>
//   );
// };

// export default DashboardTest;

import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Card,
  Space,
  Badge,
  Button,
  Tooltip,
  Row,
  Col,
  DatePicker,
  Spin,
  Table,
  message,
  Tag,
} from "antd";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs"; // Import dayjs for date handling
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  ReloadOutlined,
  SearchOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import AdminPanelLayoutTest from "./AdminPanel"; // Assuming this is your layout component
import BASE_URL from "./Config";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  Legend
);

const { Content } = Layout;
const { Title, Text } = Typography;

const DashboardTest = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // const [startDate, setStartDate] = useState(null);
  // const [toDate, setToDate] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(2, "day")); // Default: last 2 days
  const [toDate, setToDate] = useState(dayjs()); // Default: today
  const [userDetails, setUserDetails] = useState([]);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100000,
    total: 0,
  });

  const handleToDateChange = (date) => setToDate(date);
  const handleFromDateChange = (date) => setStartDate(date);

  const fetchCounts = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${BASE_URL}/user-service/counts`);
      setAnalyticsData(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching count data:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserDetails = async (fromDate, endDate, page = 0, size = 100) => {
    try {
      setUserDetailsLoading(true);
      if (!fromDate || !endDate) {
        message.error("Please select a valid date range.");
        setUserDetailsLoading(false);
        return;
      }
      if (fromDate.isAfter(endDate)) {
        message.error("From date cannot be later than To date.");
        setUserDetailsLoading(false);
        return;
      }
      const formattedStartDate = fromDate.format("YYYY-MM-DD");
      const formattedEndDate = endDate.format("YYYY-MM-DD");
      const response = await axios.get(
        `${BASE_URL}/user-service/date-rangeuserdetails?startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=${page}&size=${size}`
      );
      if (response.data) {
        const dataWithIndex = (response.data.content || response.data).map(
          (item, index) => ({
            ...item,
            serialNumber: page * size + index + 1,
          })
        );
        setUserDetails(dataWithIndex);
        setPagination({
          ...pagination,
          current: page + 1,
          total: response.data.totalElements || response.data.length,
        });
      }
      setUserDetailsLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetailsLoading(false);
    }
  };

  const fetchAllUsersForDownload = async (fromDate, endDate) => {
    try {
      setDownloadLoading(true);
      if (!fromDate || !endDate) {
        message.error("Please select a valid date range.");
        setDownloadLoading(false);
        return null;
      }
      if (fromDate.isAfter(endDate)) {
        message.error("From date cannot be later than To date.");
        setDownloadLoading(false);
        return null;
      }
      const formattedStartDate = fromDate.format("YYYY-MM-DD");
      const formattedEndDate = endDate.format("YYYY-MM-DD");
      const response = await axios.get(
        `${BASE_URL}/user-service/date-rangeuserdetails?startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=0&size=10000`
      );
      if (response.data) {
        const dataWithIndex = (response.data.content || response.data).map(
          (item, index) => ({
            ...item,
            serialNumber: index + 1,
          })
        );
        setDownloadLoading(false);
        return dataWithIndex;
      }
      setDownloadLoading(false);
      return null;
    } catch (error) {
      console.error("Error fetching users for download:", error);
      message.error("Failed to fetch users for download");
      setDownloadLoading(false);
      return null;
    }
  };

  const handleFilter = () => fetchUserDetails(startDate, toDate);

  const handleTableChange = (pagination) => {
    fetchUserDetails(
      startDate,
      toDate,
      pagination.current - 1,
      pagination.pageSize
    );
  };

  const refreshAllData = () => {
    fetchCounts();
    if (startDate && toDate) fetchUserDetails(startDate, toDate);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const downloadExcel = async () => {
    if (!startDate || !toDate) {
      message.error("Please select a valid date range before downloading");
      return;
    }
    const allUsers = await fetchAllUsersForDownload(startDate, toDate);
    if (!allUsers || allUsers.length === 0) {
      message.info("No data available for download");
      return;
    }
    try {
      const excelData = allUsers.map((user, index) => {
        const name =
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return {
          "S.No": index + 1,
          "User ID": user.id || "-",
          "Customer Name": name || "No name provided",
          "WhatsApp Number": user.whatsappNumber || "-",
          "Mobile Number": user.mobileNumber || "-",
          "Registration Date": formatDate(user.created_at),
        };
      });
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "User Registration Data"
      );
      const fromDateStr = startDate.format("YYYY-MM-DD");
      const toDateStr = toDate.format("YYYY-MM-DD");
      const fileName = `User_Registrations_${fromDateStr}_to_${toDateStr}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      message.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error generating Excel:", error);
      message.error("Failed to generate Excel file");
    }
  };

  useEffect(() => {
    fetchCounts();
    if (startDate && toDate) fetchUserDetails(startDate, toDate);
    const refreshInterval = setInterval(() => refreshAllData(), 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const chartData = {
    labels: ["Yesterday", "Today", "This Week", "This Month"],
    datasets: [
      {
        label: "User Growth",
        data: [
          analyticsData.yesterdayUsers || 0,
          analyticsData.todayUsers || 0,
          analyticsData.thisWeekUsers || 0,
          analyticsData.thisMonthUsers || 0,
        ],
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          return gradient;
        },
        borderColor: "#3b82f6",
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#3b82f6",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, family: "Inter" } },
      },
      title: {
        display: true,
        text: "User Growth Analytics",
        font: { size: 18, family: "Inter", weight: "600" },
        color: "#1f2937",
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Number of Users" },
      },
      x: { grid: { display: false } },
    },
  };

  const StatCard = ({ title, value, icon, color, description, growth }) => (
    <Card
      className="shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl border-none"
      style={{ background: "#fff", borderLeft: `4px solid ${color}` }}
      bodyStyle={{ padding: "20px" }}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Text className="text-gray-500 uppercase text-xs font-medium">
              {title}
            </Text>
            <Title level={2} className="m-0 text-3xl" style={{ color }}>
              {new Intl.NumberFormat("en-US").format(value || 0)}
            </Title>
          </div>
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `${color}10` }}
          >
            {React.cloneElement(icon, { style: { fontSize: 24, color } })}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Text className="text-gray-600 text-sm">{description}</Text>
          {growth && (
            <Text
              className={`text-sm ${growth >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              <RiseOutlined rotate={growth >= 0 ? 0 : 180} className="mr-1" />
              {growth >= 0 ? "+" : ""}
              {growth}%
            </Text>
          )}
        </div>
      </div>
    </Card>
  );

  const columns = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
      align: "center",
      width: 80,
    },
    {
      title: "User ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      ellipsis: true,
      render: (itemId) => (
        <span className="text-gray-500 font-mono text-xs">
          #{itemId?.substring(itemId.length - 4) || "N/A"}
        </span>
      ),
    },
    {
      title: "Register From",
      dataIndex: "registerFrom",
      key: "registerFrom",
      align: "center",
      ellipsis: true,
      render: (_, record) => (
        <div className="text-gray-500 font-mono text-xs leading-snug">
          <div>
            <strong>UserType:</strong> {record.userType}
          </div>
          <div>
            <strong>From:</strong> {record.registerFrom}
          </div>
        </div>
      ),
    },

    {
      title: "Customer Contact",
      key: "contact",
      align: "center",
      render: (text, record) => {
        if (record.whatsappNumber && !record.mobileNumber) {
          return (
            <Tooltip title="WhatsApp Number">
              <Tag color="green" icon={<WhatsAppOutlined />}>
                {record.whatsappNumber}
              </Tag>
            </Tooltip>
          );
        } else if (record.mobileNumber && !record.whatsappNumber) {
          return (
            <Tooltip title="Mobile Number">
              <Tag color="blue" icon={<PhoneOutlined />}>
                {record.mobileNumber}
              </Tag>
            </Tooltip>
          );
        } else if (record.mobileNumber && record.whatsappNumber) {
          return (
            <Space direction="vertical" size="small">
              <Tooltip title="WhatsApp Number">
                <Tag color="green" icon={<WhatsAppOutlined />}>
                  {record.whatsappNumber}
                </Tag>
              </Tooltip>
              <Tooltip title="Mobile Number">
                <Tag color="blue" icon={<PhoneOutlined />}>
                  {record.mobileNumber}
                </Tag>
              </Tooltip>
            </Space>
          );
        } else {
          return <Text type="secondary">No contact info</Text>;
        }
      },
    },
    {
      title: "Customer Name",
      key: "name",
      align: "center",
      render: (text, record) => {
        const name =
          record.fullName ||
          `${record.firstName || ""} ${record.lastName || ""}`.trim();
        return name || <Text type="secondary">No name provided</Text>;
      },
    },
    {
  title: "Address",
  key: "address",
  align: "center",
 
  render: (_, record) => (
    <div className="text-gray-500 font-mono text-xs leading-snug text-left">
      <div><strong>Flat No:</strong> {record.flatNo}</div>
      <div><strong>Landmark:</strong> {record.landMark}</div>
      <div><strong>Pincode:</strong> {record.pinCode}</div>
      <div><strong>Address:</strong> {record.address}</div>
      <div><strong>Type:</strong> {record.addressType}</div>
    </div>
  ),
}
,
    {
      title: "Registration Date",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (text) => formatDate(text),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <Layout className="min-h-screen">
        <Content className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Title level={2} className="text-gray-800 font-bold m-0">
                Admin Dashboard
              </Title>
              <Tooltip title="Refresh data">
                <Badge dot={refreshing}>
                  <Button
                    type="default"
                    icon={<ReloadOutlined spin={refreshing} />}
                    onClick={refreshAllData}
                    disabled={refreshing}
                    className="rounded-lg w-10 h-10 flex items-center justify-center"
                  />
                </Badge>
              </Tooltip>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="medium" tip="Loading dashboard..." />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <StatCard
                    title="Total Users"
                    value={analyticsData.totalUsers}
                    icon={<TeamOutlined />}
                    color="#3b82f6"
                    description="All registered users"
                  />
                  <StatCard
                    title="Today Users"
                    value={analyticsData.todayUsers}
                    icon={<ClockCircleOutlined />}
                    color="#10b981"
                    description="New users today"
                    growth={calculateGrowth(
                      analyticsData.todayUsers,
                      analyticsData.yesterdayUsers
                    )}
                  />
                  <StatCard
                    title="This Week Users"
                    value={analyticsData.thisWeekUsers}
                    icon={<CalendarOutlined />}
                    color="#f59e0b"
                    description="New users this week"
                  />
                  <StatCard
                    title="This Month Users"
                    value={analyticsData.thisMonthUsers}
                    icon={<UserOutlined />}
                    color="#ef4444"
                    description="New users this month"
                  />
                </div>

                <Card className="shadow-sm rounded-xl mb-6 border-none">
                  <div className="h-[400px]">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </Card>

                <Card
                  title="User Registration Details"
                  className="shadow-sm rounded-xl border-none"
                  extra={
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex flex-col w-full sm:w-auto">
                        <Text className="text-xs text-gray-500 mb-1">From</Text>
                        <DatePicker
                          value={startDate}
                          onChange={handleFromDateChange}
                          format="YYYY-MM-DD"
                          className="w-full"
                          placeholder="Select From Date"
                        />
                      </div>
                      <div className="flex flex-col w-full sm:w-auto">
                        <Text className="text-xs text-gray-500 mb-1">To</Text>
                        <DatePicker
                          value={toDate}
                          onChange={handleToDateChange}
                          format="YYYY-MM-DD"
                          className="w-full"
                          placeholder="Select To Date"
                        />
                      </div>
                      <Button
                        className="bg-[#2980b9] text-white  w-full sm:w-auto"
                        icon={<SearchOutlined />}
                        onClick={handleFilter}
                      >
                        Filter
                      </Button>
                      <Button
                        className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                        icon={<DownloadOutlined />}
                        onClick={downloadExcel}
                        loading={downloadLoading}
                        disabled={!startDate || !toDate}
                      >
                        Export
                      </Button>
                    </div>
                  }
                >
                  <div className="overflow-x-auto">
                    <Table
                      columns={columns}
                      dataSource={userDetails}
                      rowKey="id"
                      loading={userDetailsLoading}
                      pagination={pagination}
                      onChange={handleTableChange}
                      scroll={{ x: true }}
                      bordered
                      className="rounded-lg"
                    />
                  </div>
                </Card>
              </>
            )}
          </div>
        </Content>
      </Layout>
    </AdminPanelLayoutTest>
  );
};

export default DashboardTest;
