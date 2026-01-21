// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Table,
//   Spin,
//   Empty,
//   Typography,
//   message,
//   Collapse,
//   Row,
//   Col,
//   Grid,
// } from "antd";
// import TaskAdminPanelLayout from "../Layout/AdminPanel";
// import BASE_URL from "../../AdminPages/Config";

// const { Title, Text } = Typography;
// const { Panel } = Collapse;
// const { useBreakpoint } = Grid;

// const EmployeeDailyPlans = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const screens = useBreakpoint();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const accessToken = localStorage.getItem("token");

//         const response = await fetch(
//           `${BASE_URL}/ai-service/agent/planOftheDataEmployes`,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           },
//         );

//         if (!response.ok) throw new Error("Failed to fetch data");

//         const data = await response.json();
//         setEmployees(data || []);
//       } catch (error) {
//         console.error(error);
//         message.error("Failed to load employee plans data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Keep columns stable, adjust widths for small screens
//   const columns = useMemo(
//     () => [
//       {
//         title: "SI No",
//         width: 70,
//         render: (text, record, index) => index + 1,
//         fixed: screens.md ? "left" : undefined,
//       },
//       {
//         title: "Plan of the Day",
//         dataIndex: "plan",
//         key: "plan",
//         width: screens.md ? 420 : 320,
//         render: (text) => (
//           <Text style={{ whiteSpace: "pre-wrap" }}>{text || "-"}</Text>
//         ),
//       },
//       {
//         title: "End of Day Report",
//         dataIndex: "end",
//         key: "end",
//         width: screens.md ? 420 : 320,
//         render: (text) => (
//           <Text style={{ whiteSpace: "pre-wrap" }}>{text || "-"}</Text>
//         ),
//       },
//       {
//         title: "Date",
//         dataIndex: "date",
//         key: "date",
//         width: 150,
//         sorter: (a, b) => new Date(a.date) - new Date(b.date),
//         defaultSortOrder: "descend",
//       },
//     ],
//     [screens.md],
//   );

//   if (loading) {
//     return (
//       <TaskAdminPanelLayout>
//         <div style={{ textAlign: "center", padding: "80px 16px" }}>
//           <Spin size="large" />
//         </div>
//       </TaskAdminPanelLayout>
//     );
//   }

//   if (!employees || employees.length === 0) {
//     return (
//       <TaskAdminPanelLayout>
//         <div style={{ padding: "24px 16px" }}>
//           <Empty description="No employee plans data available" />
//         </div>
//       </TaskAdminPanelLayout>
//     );
//   }

//   return (
//     <TaskAdminPanelLayout>
//       <div
//         style={{
//           background: "#ffffff",
//           minHeight: "100vh",
//           padding: screens.md ? "24px 24px" : "16px 12px",
//         }}
//       >
//         {/* Responsive container */}
//         <div
//           style={{
//             maxWidth: "1280px",
//             margin: "0 auto",
//             width: "100%",
//           }}
//         >
//           <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 12 }}>
//             <Col span={24}>
//               <Title
//                 level={screens.md ? 4 : 5}
//                 style={{
//                   margin: 0,
//                   color: "#1ab394",
//                   fontWeight: 600,
//                 }}
//               >
//                 Employee Daily Plans & Reports
//               </Title>
//               <Text type="secondary" style={{ fontSize: 12 }}>
//                 View Plan of the Day and End of Day reports employee-wise.
//               </Text>
//             </Col>
//           </Row>

//           <Collapse
//             accordion
//             bordered={false}
//             expandIconPosition="end"
//             style={{ background: "transparent" }}
//           >
//             {employees.map((employee, index) => {
//               const dateMap = new Map();

//               (employee.list || []).forEach((item) => {
//                 if (!dateMap.has(item.date)) {
//                   dateMap.set(item.date, { plan: "-", end: "-" });
//                 }

//                 const entry = dateMap.get(item.date);
//                 if (item.planOfTheDay) entry.plan = item.planOfTheDay;
//                 if (item.endOfTheDay) entry.end = item.endOfTheDay;
//               });

//               const tableData = Array.from(dateMap.entries())
//                 .map(([date, value]) => ({
//                   key: `${employee.name || "emp"}-${date}`,
//                   date,
//                   plan: value.plan,
//                   end: value.end,
//                 }))
//                 .sort((a, b) => new Date(b.date) - new Date(a.date));

//               return (
//                 <Panel
//                   key={employee.name || index}
//                   header={
//                     <div style={{ width: "100%" }}>
//                       {/* Responsive header: stacks on mobile, inline on desktop */}
//                       <Row
//                         gutter={[8, 4]}
//                         align="middle"
//                         justify="space-between"
//                       >
//                         <Col xs={24} sm={16}>
//                           <Text
//                             strong
//                             style={{
//                               fontSize: screens.md ? 14 : 13,
//                               color: "#008cba",
//                               display: "block",
//                               overflow: "hidden",
//                               textOverflow: "ellipsis",
//                               whiteSpace: "nowrap",
//                             }}
//                             title={employee.name || "Employee"}
//                           >
//                             {employee.name || "Employee"}
//                           </Text>
//                         </Col>
//                         <Col
//                           xs={24}
//                           sm={8}
//                           style={{ textAlign: screens.sm ? "right" : "left" }}
//                         >
//                           <Text type="secondary" style={{ fontSize: 12 }}>
//                             {tableData.length} Records
//                           </Text>
//                         </Col>
//                       </Row>
//                     </div>
//                   }
//                   style={{
//                     marginBottom: 12,
//                     borderRadius: 10,
//                     border: "1px solid #e9e9e9",
//                     overflow: "hidden",
//                     background: "#fff",
//                   }}
//                 >
//                   <div
//                     style={{
//                       width: "100%",
//                       overflowX: "auto", // key for mobile responsiveness
//                     }}
//                   >
//                     <Table
//                       columns={columns}
//                       dataSource={tableData}
//                       rowKey="key"
//                       size="small"
//                       bordered
//                       pagination={
//                         tableData.length > 10
//                           ? {
//                               pageSize: 10,
//                               size: "small",
//                               showSizeChanger: false,
//                             }
//                           : false
//                       }
//                       scroll={{
//                         x: 980, // forces horizontal scroll on small devices, prevents squishing
//                       }}
//                     />
//                   </div>
//                 </Panel>
//               );
//             })}
//           </Collapse>
//         </div>
//       </div>
//     </TaskAdminPanelLayout>
//   );
// };

// export default EmployeeDailyPlans;



import React, { useEffect, useMemo, useState } from "react";
import {
  Spin,
  Empty,
  Typography,
  message,
  Row,
  Col,
  Grid,
  Input,
  Card,
  Tag,
  Space,
  Divider,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const PRIMARY = "#008cba";
const SUCCESS = "#1ab394";

const TodayPlans = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchText, setSearchText] = useState("");

  const screens = useBreakpoint();

  // Today (YYYY-MM-DD)
  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("token");

        const response = await fetch(
          `${BASE_URL}/ai-service/agent/planOftheDataEmployes`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        message.error("Failed to load employee plans data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayCards = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return (
      (employees || [])
        .map((emp) => {
          const empName = (emp?.name || "Employee").trim();
          const list = Array.isArray(emp?.list) ? emp.list : [];

          const todayItem = list.find((x) => x?.date === today);
          if (!todayItem) return null;

          if (q && !empName.toLowerCase().includes(q)) return null;

          const userId = todayItem?.userId || "";
          const last4 = userId ? String(userId).slice(-4) : "----";

          return {
            key: `${empName}-${today}`,
            name: empName,
            userLast4: last4,
            date: todayItem?.date || today,
            planOfTheDay: todayItem?.planOfTheDay || "-",
            endOfTheDay: todayItem?.endOfTheDay || "-",
          };
        })
        .filter(Boolean)
        // ✅ ALPHABETICAL SORT (A → Z)
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        )
    );
  }, [employees, today, searchText]);
  // ✅ 2) stats AFTER todayCards
  const stats = useMemo(() => {
    const totalEmployees = todayCards.length;

    const podCount = todayCards.filter((x) => {
      const v = (x.planOfTheDay || "").trim();
      return v && v !== "-";
    }).length;

    const eodCount = todayCards.filter((x) => {
      const v = (x.endOfTheDay || "").trim();
      return v && v !== "-";
    }).length;

    return { totalEmployees, podCount, eodCount };
  }, [todayCards]);

  if (loading) {
    return (
      <TaskAdminPanelLayout>
        <div style={{ textAlign: "center", padding: "80px 16px" }}>
          <Spin size="medium" />
        </div>
      </TaskAdminPanelLayout>
    );
  }

  return (
    <TaskAdminPanelLayout>
      <div
        style={{
          background: "#ffffff",
          minHeight: "100vh",
          padding: screens.md ? "24px 24px" : "16px 12px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
            {/* Total Employees */}
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#f6fbff", // light blue
                }}
                bodyStyle={{ padding: 14 }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total Employees
                </Text>
                <div style={{ fontSize: 16, fontWeight: 800, color: PRIMARY }}>
                  {stats.totalEmployees}
                </div>
                <Text type="secondary">Employees with plans/reports today</Text>
              </Card>
            </Col>

            {/* POD Submitted */}
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#f6ffed", // light green
                }}
                bodyStyle={{ padding: 14 }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  POD Submitted
                </Text>
                <div style={{ fontSize: 16, fontWeight: 800, color: SUCCESS }}>
                  {stats.podCount}
                </div>
                <Text type="secondary">Plans of the Day submitted</Text>
              </Card>
            </Col>

            {/* EOD Submitted */}
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#f9f0ff", // light purple
                }}
                bodyStyle={{ padding: 14 }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  EOD Submitted
                </Text>
                <div
                  style={{ fontSize: 16, fontWeight: 800, color: "#722ed1" }}
                >
                  {stats.eodCount}
                </div>
                <Text type="secondary">End of Day reports submitted</Text>
              </Card>
            </Col>

            {/* Today */}
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#fafafa", // neutral grey
                }}
                bodyStyle={{ padding: 14 }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Today
                </Text>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#555" }}>
                  {today}
                </div>
                <Text type="secondary">Today records only</Text>
              </Card>
            </Col>
          </Row>

          {/* ✅ Title + Search */}
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} md={14}>
              <Title
                level={screens.md ? 4 : 5}
                style={{
                  margin: 0,
                  color: "#008cba", // PRIMARY
                  fontWeight: 700,
                }}
              >
                Employee Daily Plans (Today)
              </Title>

              <Text
                style={{
                  fontSize: 12,
                  color: "#595959", // softer secondary text
                  fontWeight: 500,
                }}
              >
                Showing only records that match today’s date.
              </Text>
            </Col>

            {/* Search */}
            <Col
              xs={24}
              md={10}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Input
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined style={{ color: "#008cba" }} />}
                placeholder="Search employee name"
                size="large"
                style={{
                  maxWidth: 360,
                  width: "100%",
                  borderRadius: 10,
                }}
              />
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0 16px" }} />

          {/* Content */}
          {todayCards.length === 0 ? (
            <Empty
              description={`No Plan/End-of-Day records found for today (${today}).`}
            />
          ) : (
            <Row gutter={[12, 12]}>
              {todayCards.map((item) => (
                <Col key={item.key} xs={24} sm={24} md={24} lg={24} xl={24}>
                  {/* ONE CARD PER EMPLOYEE */}
                  <Card
                    hoverable
                    style={{
                      borderRadius: 14,
                      border: "1px solid #e9e9e9",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: screens.md ? 16 : 12 }}
                    title={
                      <Row
                        gutter={[8, 8]}
                        align="middle"
                        justify="space-between"
                      >
                        {/* Left: Name */}
                        <Col xs={24} md={14}>
                          <Space size={10} style={{ minWidth: 0 }}>
                            <Tag
                              icon={<UserOutlined />}
                              style={{
                                borderColor: PRIMARY,
                                color: PRIMARY,
                                background: "#fff",
                                fontWeight: 700,
                              }}
                            >
                              ID: {item.userLast4}
                            </Tag>

                            <Text
                              strong
                              style={{
                                color: PRIMARY,
                                fontSize: 15,
                                display: "block",
                                maxWidth: screens.md ? 520 : "100%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={item.name}
                            >
                              {item.name}
                            </Text>
                          </Space>
                        </Col>

                        {/* Right: Date */}
                        <Col
                          xs={24}
                          md={10}
                          style={{
                            display: "flex",
                            justifyContent: screens.md
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          <Tag
                            icon={<CalendarOutlined />}
                            style={{
                              borderColor: "#d9d9d9",
                              background: "#fafafa",
                              color: "#555",
                              fontWeight: 600,
                            }}
                          >
                            {item.date}
                          </Tag>
                        </Col>
                      </Row>
                    }
                  >
                    {/* Plan + EOD side-by-side on desktop, stacked on mobile */}
                    <Row gutter={[12, 12]}>
                      <Col xs={24} md={12}>
                        <div
                          style={{
                            height: "100%",
                            border: "1px solid #e9f5ff",
                            background: "#f6fbff",
                            borderRadius: 12,
                            padding: screens.md ? 14 : 12,
                          }}
                        >
                          <Text strong style={{ color: PRIMARY, fontSize: 13 }}>
                            Plan of the Day
                          </Text>
                          <Paragraph
                            style={{
                              marginTop: 8,
                              marginBottom: 0,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              fontSize: 13,
                            }}
                          >
                            {item.planOfTheDay || "-"}
                          </Paragraph>
                        </div>
                      </Col>

                      <Col xs={24} md={12}>
                        <div
                          style={{
                            height: "100%",
                            border: "1px solid #f6e7ff",
                            background: "#fcf7ff",
                            borderRadius: 12,
                            padding: screens.md ? 14 : 12,
                          }}
                        >
                          <Text
                            strong
                            style={{ color: "#722ed1", fontSize: 13 }}
                          >
                            End of the Day
                          </Text>
                          <Paragraph
                            style={{
                              marginTop: 8,
                              marginBottom: 0,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              fontSize: 13,
                            }}
                          >
                            {item.endOfTheDay || "-"}
                          </Paragraph>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default TodayPlans;
