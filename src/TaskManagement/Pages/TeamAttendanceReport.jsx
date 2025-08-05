import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Spin,
  Typography,
  DatePicker,
  Button,
  message,
  Space,
  Input,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  FileExcelOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarTwoTone,
  ScheduleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Title, Text } = Typography;
const { Search } = Input;

const labelStyle = {
  fontWeight: 550,
  fontSize: 14,
  color: "#555",
  minWidth: 130,
  display: "inline-block",
};

const valueStyle = {
  fontWeight: 700,
  fontSize: 12,
  color: "#111",
};

const iconStyle = { fontSize: 20, color: "#1890ff", marginRight: 8 };

const TeamAttendanceReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [searchText, setSearchText] = useState("");

  const fetchAttendanceData = async (month) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/user-service/write/team_attendance_report?month=${month}`
      );
      setData(response.data || []);
    } catch (error) {
      message.error("Failed to fetch attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedMonth.format("YYYY-MM"));
  }, []);

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(date);
      fetchAttendanceData(date.format("YYYY-MM"));
    }
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      message.warning("No data to export.");
      return;
    }

    const users = data.filter((_, index) => index !== 0);

    const formattedData = users.map((user) => ({
      Name: user.name,
      Department: user.department,
      "Leave Days": user.leaveDaysInMonth,
      "POD Updates": user.podUpdateReport,
      "EOD Updates": user.eodUpdationEntries,
      "EMP Working Days": user.employeeWorkingDays,
      "Avg Per Day Spent Hours": user.avgPerDaySpentHours,
      "Monthly Spend Hours": user.employeeMonthlySpentHours,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });

    saveAs(blob, `Team_Attendance_${selectedMonth.format("YYYY-MM")}.xlsx`);
  };

  const filteredData = useMemo(() => {
    return data
      .filter((user) =>
        user.name?.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, searchText]);



  
  const summaryCards = [
    {
      label: "Working Days",
      value: filteredData[0]?.workingDays ?? "N/A",
      icon: <CalendarOutlined style={{ fontSize: 30, color: "#1890ff" }} />,
      bgColor: "#e6f7ff",
    },
    {
      label: "Public Holidays",
      value: filteredData[0]?.publicHoliday ?? "N/A",
      icon: <CalendarOutlined style={{ fontSize: 30, color: "#cf1322" }} />,
      bgColor: "#fff1f0",
    },
    {
      label: "Total Month Days",
      value: filteredData[0]?.monthDays ?? "N/A",
      icon: <CalendarOutlined style={{ fontSize: 30, color: "#389e0d" }} />,
      bgColor: "#f6ffed",
    },
    {
      label: "Sundays",
      value: filteredData[0]?.sundayCount ?? "N/A",
      icon: <CalendarOutlined style={{ fontSize: 30, color: "#faad14" }} />,
      bgColor: "#fffbe6",
    },
    {
      label: "Monthly Working Hrs",
      value: filteredData[0]?.monthlyWorkingHours ?? "",
      icon: <CalendarOutlined style={{ fontSize: 30, color: "#722ed1" }} />,
      bgColor: "#f9f0ff",
    },
    {
      label: "Total Employees",
      value: filteredData[0]?.totalEmpCount ?? "",
      icon: <CalendarOutlined style={{ fontSize: 30, color: "#13c2c2" }} />,
      bgColor: "#e6fffb", // Updated background color for 6th card
    },
  ];



  return (
    <TaskAdminPanelLayout>
      <Card
        title={
          <Space>
            <TeamOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Team Attendance Report
            </Title>
          </Space>
        }
        extra={
          <Space wrap>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              allowClear={false}
            />
            <Button
              icon={<FileExcelOutlined />}
              type="primary"
              onClick={exportToExcel}
            >
              Download Excel
            </Button>
          </Space>
        }
        style={{ margin: 20, borderRadius: 10 }}
        bodyStyle={{ paddingTop: 20 }}
      >
        {/* Top 5 Summary Cards */}
        {!loading && filteredData.length > 0 && (
          <Row gutter={[24, 24]} justify="start" style={{ marginBottom: 30 }}>
            {summaryCards.map((item, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={4}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 10,
                    background: item.bgColor,
                    textAlign: "center",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    height: "100%",
                  }}
                >
                  <div style={{ marginBottom: 8 }}>{item.icon}</div>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {item.label}
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 18, color: "#111" }}>
                    {item.value}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Search
          placeholder="Search by name"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 20, maxWidth: 320 }}
        />

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <Spin size="medium" />
          </div>
        ) : filteredData.length === 0 ? (
          <Text type="danger">No data available.</Text>
        ) : (
          <Row gutter={[24, 24]} justify="start">
            {filteredData.map((user) => (
              <Col
                key={user.userid}
                xs={24}
                sm={12}
                lg={8}
                style={{ display: "flex" }}
              >
                <Card
                  title={
                    <Space>
                      <UserOutlined
                        style={{ fontSize: 20, color: "#1890ff" }}
                      />
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          color: "#0c5484",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "calc(100% - 40px)",
                        }}
                        title={user.name}
                      >
                        {user.name}
                      </Text>
                    </Space>
                  }
                  style={{
                    borderRadius: 10,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    width: "100%",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  bodyStyle={{ padding: 16 }}
                  hoverable
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.0)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <div style={{ lineHeight: 2 }}>
                    <div>
                      <ApartmentOutlined style={iconStyle} />
                      <span style={labelStyle}>Department:</span>
                      <span style={valueStyle}>{user.department || ""}</span>
                    </div>
                    <div>
                      <CalendarTwoTone
                        twoToneColor="#eb2f96"
                        style={iconStyle}
                      />
                      <span style={labelStyle}>Leave Days:</span>
                      <span style={valueStyle}>{user.leaveDaysInMonth}</span>
                    </div>
                    <div>
                      <UserOutlined style={iconStyle} />
                      <span style={labelStyle}>POD Updates:</span>
                      <span style={valueStyle}>{user.podUpdateReport}</span>
                    </div>
                    <div>
                      <UserOutlined style={iconStyle} />
                      <span style={labelStyle}>EOD Updates:</span>
                      <span style={valueStyle}>{user.eodUpdationEntries}</span>
                    </div>
                    <div>
                      <UserOutlined style={iconStyle} />
                      <span style={labelStyle}>EMP Working Days:</span>
                      <span style={valueStyle}>{user.employeeWorkingDays}</span>
                    </div>
                    <div>
                      <ClockCircleOutlined style={iconStyle} />
                      <span style={labelStyle}>Avg Spent Hours:</span>
                      <span style={valueStyle}>{user.avgPerDaySpentHours}</span>
                    </div>
                    <div>
                      <ScheduleOutlined style={iconStyle} />
                      <span style={labelStyle}>Monthly Spent Hours:</span>
                      <span style={valueStyle}>
                        {user.employeeMonthlySpentHours}
                      </span>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </TaskAdminPanelLayout>
  );
};

export default TeamAttendanceReport;
