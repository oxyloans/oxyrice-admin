import React, { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Empty,
  Typography,
  message,
  Collapse,
  Row,
  Col,
} from "antd";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const EmployeeDailyPlans = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        const response = await fetch(
          "https://meta.oxyloans.com/api/ai-service/agent/planOftheDataEmployes",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setEmployees(data || []);
      } catch (error) {
        console.error(error);
        message.error("Failed to load employee plans data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: "SI No",
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Plan of the Day",
      dataIndex: "plan",
      key: "plan",
      render: (text) => <Text>{text || "-"}</Text>,
    },
    {
      title: "End of Day Report",
      dataIndex: "end",
      key: "end",
      render: (text) => <Text>{text || "-"}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: "descend",
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return <Empty description="No employee plans data available" />;
  }

  return (
    <TaskAdminPanelLayout>
      <div
        style={{
          background: "#ffffff",
          minHeight: "100vh",
          padding: "24px 16px",
        }}
      >
        {/* max-w-7xl style container */}
        <div
          style={{
            maxWidth: "1280px", // approx Tailwind max-w-7xl
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Small Professional Title */}
          <Title
            level={4}
            style={{
              marginBottom: "16px",
              color: "#1ab394",
              fontWeight: 600,
            }}
          >
            Employee Daily Plans & Reports
          </Title>

          <Collapse accordion bordered={false}>
            {employees.map((employee, index) => {
              const dateMap = new Map();

              (employee.list || []).forEach((item) => {
                if (!dateMap.has(item.date)) {
                  dateMap.set(item.date, { plan: "-", end: "-" });
                }

                const entry = dateMap.get(item.date);
                if (item.planOfTheDay) entry.plan = item.planOfTheDay;
                if (item.endOfTheDay) entry.end = item.endOfTheDay;
              });

              const tableData = Array.from(dateMap.entries())
                .map(([date, value]) => ({
                  key: `${employee.name}-${date}`,
                  date,
                  plan: value.plan,
                  end: value.end,
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

              return (
                <Panel
                  key={employee.name || index}
                  header={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: "14px",
                          color: "#008cba",
                        }}
                      >
                        {employee.name || "Employee"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {tableData.length} Records
                      </Text>
                    </div>
                  }
                  style={{
                    marginBottom: "12px",
                    borderRadius: "6px",
                    border: "1px solid #e6e6e6",
                    overflow: "hidden",
                  }}
                >
                  <Table
                    columns={columns}
                    dataSource={tableData}
                    rowKey="key"
                    pagination={
                      tableData.length > 10
                        ? { pageSize: 10, size: "small" }
                        : false
                    }
                    size="small"
                    bordered
                    scroll={{ x: true }}
                  />
                </Panel>
              );
            })}
          </Collapse>
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeDailyPlans;
