import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  DatePicker,
  Button,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import BASE_URL from "../../../core/config/Config";
import useAuth from "../../../shared/hooks/useAuth";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const PRIMARY = "#008cba";
const SUCCESS = "#1ab394";
const DATE_FORMAT = "YYYY-MM-DD";

const TodayPlans = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { accessToken } = useAuth();
  const screens = useBreakpoint();

  const today = dayjs().format(DATE_FORMAT);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());

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

  const todayCards = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const start = startDate;
    const end = endDate;

    return (employees || [])
      .map((emp) => {
        const empName = (emp?.name || "Employee").trim();
        const list = Array.isArray(emp?.list) ? emp.list : [];

        const filtered = list.filter((x) => {
          if (!x?.date) return false;
          const d = dayjs(x.date);
          return (
            (!start || !d.isBefore(start, "day")) &&
            (!end || !d.isAfter(end, "day"))
          );
        });

        if (filtered.length === 0) return null;
        if (q && !empName.toLowerCase().includes(q)) return null;

        // merge by date
        const dateMap = new Map();
        filtered.forEach((cur) => {
          if (!dateMap.has(cur.date)) {
            dateMap.set(cur.date, {
              planOfTheDay: "-",
              endOfTheDay: "-",
              userId: "",
              date: cur.date,
            });
          }
          const acc = dateMap.get(cur.date);
          if (cur.planOfTheDay) acc.planOfTheDay = cur.planOfTheDay;
          if (cur.endOfTheDay) acc.endOfTheDay = cur.endOfTheDay;
          if (cur.userId) acc.userId = cur.userId;
        });

        const records = Array.from(dateMap.values()).sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );

        const userId = records[0]?.userId || "";
        const last4 = userId ? String(userId).slice(-4) : "----";

        return { key: empName, name: empName, userLast4: last4, records };
      })
      .filter(Boolean)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  }, [employees, startDate, endDate, searchText]);

  const stats = useMemo(() => {
    let podCount = 0;
    let eodCount = 0;
    todayCards.forEach(({ records }) => {
      records.forEach((r) => {
        if (r.planOfTheDay && r.planOfTheDay !== "-") podCount++;
        if (r.endOfTheDay && r.endOfTheDay !== "-") eodCount++;
      });
    });
    return { totalEmployees: todayCards.length, podCount, eodCount };
  }, [todayCards]);

  const isToday =
    startDate?.format(DATE_FORMAT) === today &&
    endDate?.format(DATE_FORMAT) === today;

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
            {[
              {
                label: "Total Employees",
                value: stats.totalEmployees,
                color: PRIMARY,
                bg: "#f6fbff",
                sub: "Employees with plans/reports",
              },
              {
                label: "POD Submitted",
                value: stats.podCount,
                color: SUCCESS,
                bg: "#f6ffed",
                sub: "Plans of the Day submitted",
              },
              {
                label: "EOD Submitted",
                value: stats.eodCount,
                color: "#722ed1",
                bg: "#f9f0ff",
                sub: "End of Day reports submitted",
              },
              {
                label: isToday ? "Today" : "Date Range",
                value: isToday
                  ? today
                  : `${startDate?.format(DATE_FORMAT)} → ${endDate?.format(DATE_FORMAT)}`,
                color: "#555",
                bg: "#fafafa",
                sub: isToday ? "Today records only" : "Filtered range",
              },
            ].map(({ label, value, color, bg, sub }) => (
              <Col xs={24} sm={12} md={6} key={label}>
                <Card
                  style={{ borderRadius: 14, border: "1px solid #e9e9e9", background: bg }}
                  bodyStyle={{ padding: 14 }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
                  <div style={{ fontSize: 15, fontWeight: 800, color, wordBreak: "break-word" }}>
                    {value}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{sub}</Text>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Title + Filters */}
          <Row gutter={[16, 16]} align="bottom" justify="space-between" style={{ marginBottom: 4 }}>
            <Col xs={24} md={8}>
              <Title level={screens.md ? 4 : 5} style={{ margin: 0, color: PRIMARY, fontWeight: 700 }}>
                Employee Daily Plans
              </Title>
              <Text style={{ fontSize: 12, color: "#595959" }}>
                Showing records for selected date range.
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
                  prefix={<SearchOutlined style={{ color: PRIMARY }} />}
                  placeholder="Search employee"
                  size="large"
                  style={{ borderRadius: 8, minWidth: 180, maxWidth: 200 }}
                />
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0 16px" }} />

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" />
            </div>
          ) : todayCards.length === 0 ? (
            <Empty description="No Plan/End-of-Day records found for selected range." />
          ) : (
            <Row gutter={[12, 12]}>
              {todayCards.map(({ key, name, userLast4, records }) =>
                records.map((item) => (
                  <Col key={`${key}-${item.date}`} xs={24}>
                    <Card
                      hoverable
                      style={{ borderRadius: 14, border: "1px solid #e9e9e9", overflow: "hidden" }}
                      bodyStyle={{ padding: screens.md ? 16 : 12 }}
                      title={
                        <Row gutter={[8, 8]} align="middle" justify="space-between">
                          <Col xs={24} md={14}>
                            <Space size={10} style={{ minWidth: 0 }}>
                              <Tag
                                icon={<UserOutlined />}
                                style={{ borderColor: PRIMARY, color: PRIMARY, background: "#fff", fontWeight: 700 }}
                              >
                                ID: {userLast4}
                              </Tag>
                              <Text
                                strong
                                style={{ color: PRIMARY, fontSize: 15, maxWidth: screens.md ? 520 : "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                title={name}
                              >
                                {name}
                              </Text>
                            </Space>
                          </Col>
                          <Col xs={24} md={10} style={{ display: "flex", justifyContent: screens.md ? "flex-end" : "flex-start" }}>
                            <Tag
                              icon={<CalendarOutlined />}
                              style={{ borderColor: "#d9d9d9", background: "#fafafa", color: "#555", fontWeight: 600 }}
                            >
                              {item.date}
                            </Tag>
                          </Col>
                        </Row>
                      }
                    >
                      <Row gutter={[12, 12]} style={{ alignItems: "stretch" }}>
                        <Col xs={24} md={12} style={{ display: "flex" }}>
                          <div style={{ flex: 1, border: "1px solid #e9f5ff", background: "#f6fbff", borderRadius: 12, padding: screens.md ? 14 : 12, display: "flex", flexDirection: "column" }}>
                            <Text strong style={{ color: PRIMARY, fontSize: 13 }}>Plan of the Day</Text>
                            <div style={{ marginTop: 8, minHeight: 200, maxHeight: 200, overflowY: "auto", width: "100%" }}>
                              <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13 }}>
                                {item.planOfTheDay || "-"}
                              </Paragraph>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} md={12} style={{ display: "flex" }}>
                          <div style={{ flex: 1, border: "1px solid #f6e7ff", background: "#fcf7ff", borderRadius: 12, padding: screens.md ? 14 : 12, display: "flex", flexDirection: "column" }}>
                            <Text strong style={{ color: "#722ed1", fontSize: 13 }}>End of the Day</Text>
                            <div style={{ marginTop: 8, minHeight: 200, maxHeight: 200, overflowY: "auto", width: "100%" }}>
                              <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13 }}>
                                {item.endOfTheDay || "-"}
                              </Paragraph>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                )),
              )}
            </Row>
          )}
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default TodayPlans;
