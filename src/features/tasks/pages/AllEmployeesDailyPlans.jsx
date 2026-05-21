import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  DatePicker,
  Button,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import BASE_URL from "../../../core/config/Config";
import useAuth from "../../../shared/hooks/useAuth";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const PRIMARY = "#008cba";
const SUCCESS = "#1ab394";
const DATE_FORMAT = "YYYY-MM-DD";

const AllEmployeesDailyPlans = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState(dayjs().subtract(6, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  const screens = useBreakpoint();
  const { accessToken } = useAuth();

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const body = {
        startDate: startDate.format(DATE_FORMAT),
        endDate: endDate.format(DATE_FORMAT),
      };
      const response = await fetch(
        `${BASE_URL}/ai-service/agent/planOftheDataEmployes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
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
  }, [startDate, endDate, accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => {
    const planWidth = screens.lg ? 520 : screens.md ? 420 : 320;
    const endWidth = screens.lg ? 520 : screens.md ? 420 : 320;
    return [
      { title: "S.No", width: 70, align: "center", render: (_t, _r, i) => i + 1 },
      {
        title: "Plan Of the Day",
        dataIndex: "plan",
        key: "plan",
        width: planWidth,
        render: (text) => (
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <Text style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text || "-"}</Text>
          </div>
        ),
      },
      {
        title: "End Of the Day",
        dataIndex: "end",
        key: "end",
        width: endWidth,
        render: (text) => (
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <Text style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text || "-"}</Text>
          </div>
        ),
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 140,
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
        defaultSortOrder: "descend",
      },
    ];
  }, [screens.lg, screens.md]);

  const employeesWithTableData = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return (employees || [])
      .map((employee, index) => {
        const dateMap = new Map();
        (employee.list || []).forEach((item) => {
          if (!dateMap.has(item.date)) {
            dateMap.set(item.date, { plan: "-", end: "-", userId: item?.userId || "" });
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

        return { employee, index, name, userLast4, tableData };
      })
      .filter((x) => {
        if (!x.tableData || x.tableData.length === 0) return false;
        if (!q) return true;
        return x.name.toLowerCase().includes(q);
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  }, [employees, searchText]);

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
          {/* Header + Filters */}
          <Row gutter={[16, 16]} align="bottom" justify="space-between" style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <Title level={screens.md ? 4 : 5} style={{ margin: 0, color: SUCCESS, fontWeight: 700 }}>
                Employee Work Logs
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                View daily work plans and end-of-day summaries employee-wise.
              </Text>
            </Col>

            <Col xs={24} md={16}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", justifyContent: screens.md ? "flex-end" : "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>From Date</Text>
                  <DatePicker
                    value={startDate}
                    onChange={(val) => val && setStartDate(val)}
                    format={DATE_FORMAT}
                    allowClear={false}
                    size="large"
                    placeholder="Select From Date"
                    style={{ borderRadius: 8, minWidth: 160 }}
                    disabledDate={(d) => endDate && d.isAfter(endDate, "day")}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>To Date</Text>
                  <DatePicker
                    value={endDate}
                    onChange={(val) => val && setEndDate(val)}
                    format={DATE_FORMAT}
                    allowClear={false}
                    size="large"
                    placeholder="Select To Date"
                    style={{ borderRadius: 8, minWidth: 160 }}
                    disabledDate={(d) => startDate && d.isBefore(startDate, "day")}
                  />
                </div>
                <Button
                  size="large"
                  onClick={fetchData}
                  loading={loading}
                  style={{ borderRadius: 8, background: SUCCESS, borderColor: SUCCESS, color: "#fff", fontWeight: 600, minWidth: 110 }}
                >
                  Get Data
                </Button>
                <Input
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                  placeholder="Search employee"
                  size="large"
                  style={{ borderRadius: 8, minWidth: 180, maxWidth: 200 }}
                />
              </div>
            </Col>
          </Row>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" />
            </div>
          ) : employeesWithTableData.length === 0 ? (
            <Empty description="No employee work logs found for selected range." />
          ) : (
            <Collapse
              accordion
              bordered={false}
              expandIconPosition="end"
              style={{ background: "transparent" }}
            >
              {employeesWithTableData.map(({ index, name, userLast4, tableData }) => (
                <Panel
                  key={`${name}-${index}`}
                  header={
                    <Row gutter={[8, 6]} align="middle" justify="space-between" style={{ width: "100%" }}>
                      <Col xs={24} sm={16} style={{ minWidth: 0 }}>
                        <Space size={10} wrap>
                          <Tag
                            icon={<UserOutlined />}
                            style={{ borderColor: PRIMARY, color: PRIMARY, background: "#fff", fontWeight: 700 }}
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
                      <Col xs={24} sm={8} style={{ textAlign: screens.sm ? "right" : "left" }}>
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
                  <div style={{ width: "100%", overflowX: "auto" }}>
                    <Table
                      columns={columns}
                      dataSource={tableData}
                      rowKey="key"
                      size="small"
                      bordered
                      pagination={tableData.length > 10 ? { pageSize: 10, size: "small", showSizeChanger: false } : false}
                      scroll={{ x: "100%" }}
                    />
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default AllEmployeesDailyPlans;
