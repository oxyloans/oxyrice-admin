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
import TaskAdminPanelLayout from "../components/AdminPanel";
import BASE_URL from "../../../core/config/Config";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const PRIMARY = "#008cba";
const SUCCESS = "#1ab394";

const TodayPlans = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // ✅ FIX: Merge multiple records for same date (plan + eod can be in different objects)
  const todayCards = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return (employees || [])
      .map((emp) => {
        const empName = (emp?.name || "Employee").trim();
        const list = Array.isArray(emp?.list) ? emp.list : [];

        // ✅ get all records for today
        const todayItems = list.filter((x) => x?.date === today);
        if (todayItems.length === 0) return null;

        // Search filter
        if (q && !empName.toLowerCase().includes(q)) return null;

        // ✅ merge plan + eod from multiple objects
        const merged = todayItems.reduce(
          (acc, cur) => {
            if (cur?.planOfTheDay) acc.planOfTheDay = cur.planOfTheDay;
            if (cur?.endOfTheDay) acc.endOfTheDay = cur.endOfTheDay;
            if (cur?.userId) acc.userId = cur.userId;
            if (cur?.date) acc.date = cur.date;
            return acc;
          },
          {
            planOfTheDay: "-",
            endOfTheDay: "-",
            userId: "",
            date: today,
          },
        );

        const userId = merged.userId || "";
        const last4 = userId ? String(userId).slice(-4) : "----";

        return {
          key: `${empName}-${today}`,
          name: empName,
          userLast4: last4,
          date: merged.date || today,
          planOfTheDay: merged.planOfTheDay || "-",
          endOfTheDay: merged.endOfTheDay || "-",
        };
      })
      .filter(Boolean)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  }, [employees, today, searchText]);

  // ✅ Stats
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
          {/* Stats */}
          <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#f6fbff",
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

            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#f6ffed",
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

            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#f9f0ff",
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

            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #e9e9e9",
                  background: "#fafafa",
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

          {/* Title + Search */}
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} md={14}>
              <Title
                level={screens.md ? 4 : 5}
                style={{ margin: 0, color: PRIMARY, fontWeight: 700 }}
              >
                Employee Daily Plans (Today)
              </Title>
              <Text style={{ fontSize: 12, color: "#595959", fontWeight: 500 }}>
                Showing only records that match today’s date.
              </Text>
            </Col>

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
                prefix={<SearchOutlined style={{ color: PRIMARY }} />}
                placeholder="Search employee name"
                size="large"
                style={{ maxWidth: 360, width: "100%", borderRadius: 10 }}
              />
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0 16px" }} />

          {todayCards.length === 0 ? (
            <Empty
              description={`No Plan/End-of-Day records found for today (${today}).`}
            />
          ) : (
            <Row gutter={[12, 12]}>
              {todayCards.map((item) => (
                <Col key={item.key} xs={24}>
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
