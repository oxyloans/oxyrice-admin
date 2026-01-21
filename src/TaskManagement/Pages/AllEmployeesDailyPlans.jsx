import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Spin,
  Empty,
  Typography,
  message,
  Collapse,
  Row,
  Col,
  Grid,
  Input,
  Space,
  Tag,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const PRIMARY = "#008cba";
const SUCCESS = "#1ab394";

const AllEmployeesDailyPlans = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search by employee name
  const [searchText, setSearchText] = useState("");

  const screens = useBreakpoint();

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

  // ✅ Table columns (responsive widths + wrap)
  const columns = useMemo(() => {
    const planWidth = screens.lg ? 520 : screens.md ? 420 : 320;
    const endWidth = screens.lg ? 520 : screens.md ? 420 : 320;

    return [
      {
        title: "S.No",
        width: 70,
        align: "center",
        render: (_t, _r, index) => index + 1,
        
      },
      {
        title: "Plan Of the Day",
        dataIndex: "plan",
        key: "plan",
        width: planWidth,
        render: (text) => (
          <Text style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {text || "-"}
          </Text>
        ),
      },
      {
        title: "End Of the Day",
        dataIndex: "end",
        key: "end",
        width: endWidth,
        render: (text) => (
          <Text style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {text || "-"}
          </Text>
        ),
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
       maxWidth: 140,
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
        defaultSortOrder: "descend",
      },
    ];
  }, [screens.lg, screens.md]);

  // ✅ Build panel data per employee (keep existing logic)
  const employeesWithTableData = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return (
      (employees || [])
        .map((employee, index) => {
          const dateMap = new Map();

          (employee.list || []).forEach((item) => {
            if (!dateMap.has(item.date)) {
              dateMap.set(item.date, {
                plan: "-",
                end: "-",
                userId: item?.userId || "",
              });
            }

            const entry = dateMap.get(item.date);
            if (item.planOfTheDay) entry.plan = item.planOfTheDay;
            if (item.endOfTheDay) entry.end = item.endOfTheDay;
            if (item.userId) entry.userId = item.userId;
          });

          const tableData = Array.from(dateMap.entries())
            .map(([date, value]) => ({
              key: `${employee.name || "emp"}-${date}`,
              date,
              plan: value.plan,
              end: value.end,
              userId: value.userId,
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          const name = (employee.name || "Employee").trim();
          const userLast4 = tableData?.[0]?.userId
            ? String(tableData[0].userId).slice(-4)
            : "----";

          return {
            employee,
            index,
            name,
            userLast4,
            tableData,
          };
        })
        // ✅ Search filter by name
        .filter((x) => {
          if (!q) return true;
          return x.name.toLowerCase().includes(q);
        })
        // ✅ Alphabetical order
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        )
    );
  }, [employees, searchText]);

  if (loading) {
    return (
      <TaskAdminPanelLayout>
        <div style={{ textAlign: "center", padding: "80px 16px" }}>
          <Spin size="medium" />
        </div>
      </TaskAdminPanelLayout>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <TaskAdminPanelLayout>
        <div style={{ padding: "24px 16px" }}>
          <Empty description="No employee work logs available" />
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
          {/* ✅ Header + Search (responsive) */}
          <Row
            gutter={[12, 12]}
            align="middle"
            justify="space-between"
            style={{ marginBottom: 12 }}
          >
            <Col xs={24} md={14}>
              <Title
                level={screens.md ? 4 : 5}
                style={{ margin: 0, color: SUCCESS, fontWeight: 700 }}
              >
                Employee Work Logs
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                View daily work plans and end-of-day summaries employee-wise.
              </Text>
            </Col>

            <Col
              xs={24}
              md={10}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Input
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder="Search employee name"
                size="large"
                style={{ width: "100%", maxWidth: 360 }}
              />
            </Col>
          </Row>

          {/* ✅ Panels */}
          <Collapse
            accordion
            bordered={false}
            expandIconPosition="end"
            style={{ background: "transparent" }}
          >
            {employeesWithTableData.map(
              ({ employee, index, name, userLast4, tableData }) => {
                if (!tableData || tableData.length === 0) return null;

                return (
                  <Panel
                    key={`${name}-${index}`}
                    header={
                      <Row
                        gutter={[8, 6]}
                        align="middle"
                        justify="space-between"
                        style={{ width: "100%" }}
                      >
                        <Col xs={24} sm={16} style={{ minWidth: 0 }}>
                          <Space size={10} wrap>
                            <Tag
                              icon={<UserOutlined />}
                              style={{
                                borderColor: PRIMARY,
                                color: PRIMARY,
                                background: "#fff",
                                fontWeight: 700,
                              }}
                            >
                              ID: {userLast4}
                            </Tag>

                            <Text
                              strong
                              style={{
                                fontSize: screens.md ? 14 : 13,
                                color: PRIMARY,
                                display: "block",
                                maxWidth: screens.md ? 520 : "100%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={name}
                            >
                              {name}
                            </Text>
                          </Space>
                        </Col>

                        <Col
                          xs={24}
                          sm={8}
                          style={{ textAlign: screens.sm ? "right" : "left" }}
                        >
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {tableData.length} Records
                          </Text>
                        </Col>
                      </Row>
                    }
                    style={{
                      marginBottom: 12,
                      borderRadius: 12,
                      border: "1px solid #e9e9e9",
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    {/* ✅ Mobile-safe scroll wrapper */}
                    <div style={{ width: "100%", overflowX: "auto" }}>
                      <Table
                        columns={columns}
                        dataSource={tableData}
                        rowKey="key"
                        size="small"
                        bordered
                        pagination={
                          tableData.length > 10
                            ? {
                                pageSize: 10,
                                size: "small",
                                showSizeChanger: false,
                              }
                            : false
                        }
                        scroll={{ x: "100%" }}
                      />
                    </div>
                  </Panel>
                );
              },
            )}
          </Collapse>
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default AllEmployeesDailyPlans;
