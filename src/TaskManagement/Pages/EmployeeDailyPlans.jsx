import React, { useState, useEffect } from "react";
import { Card, Table, Spin, Empty, Typography, message } from "antd";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Title } = Typography;

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

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("API DATA ===>", data);

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
      title: "SI. No",
      key: "sno",
      width: 80,
      render: (text, record, index) => index + 1,
    },

    {
      title: "Plan of the Day",
      dataIndex: "plan",
      key: "plan",
    },
    {
      title: "End of the Day Report",
      dataIndex: "end",
      key: "end",
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
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return <Empty description="No employee plans data available" />;
  }

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Title level={1} style={{ marginBottom: "32px" }}>
          Employee Daily Plans & Reports
        </Title>

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
            // ✅ Latest date first
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          return (
            <Card
              key={employee.name || index}
              title={<Title level={4}>{employee.name || "Employee"}</Title>}
              style={{ marginBottom: "24px" }}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={columns}
                dataSource={tableData}
                rowKey="key"
                pagination={tableData.length > 10 ? { pageSize: 10 } : false}
                bordered
              />
            </Card>
          );
        })}
      </div>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeDailyPlans;
