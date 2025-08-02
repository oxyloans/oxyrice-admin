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
  fontWeight: 600,
  fontSize: 14,
  color: "#555",
  minWidth: 130,
  display: "inline-block",
};

const valueStyle = {
  fontWeight: 700,
  fontSize: 16,
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
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });

    saveAs(blob, `Team_Attendance_${selectedMonth.format("YYYY-MM")}.xlsx`);
  };

  const filteredData = useMemo(() => {
    return data
      .filter((user) =>
        user.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, searchText]);

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
        <Search
          placeholder="Search by name"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 320 }}
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
            <Spin size="large" />
          </div>
        ) : filteredData.length === 0 ? (
          <Text type="danger">No data available.</Text>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredData.map((user) => (
              <Col
                key={user.userid}
                xs={24}
                sm={12}
                md={8} // 3 columns on medium+ screens
              >
                <Card
                  title={
                    <Space>
                      <UserOutlined
                        style={{ fontSize: 22, color: "#1890ff" }}
                      />
                      <Text
                        strong
                        style={{
                          fontSize: 18,
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
                    boxShadow: "0 4px 14px rgba(24, 144, 255, 0.15)",
                    width: "100%",
                  }}
                  bodyStyle={{ padding: 16 }}
                  hoverable
                >
                  <div style={{ lineHeight: 2 }}>
                    <div>
                      <ApartmentOutlined style={iconStyle} />
                      <span style={labelStyle}>Department:</span>
                      <span style={valueStyle}>{user.department || "N/A"}</span>
                    </div>
                    <div>
                      <CalendarTwoTone
                        twoToneColor="#eb2f96"
                        style={iconStyle}
                      />
                      <span style={labelStyle}>Leave Days:</span>
                      <span style={valueStyle}>
                        {user.leaveDaysInMonth != null
                          ? user.leaveDaysInMonth
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <ScheduleOutlined style={iconStyle} />
                      <span style={labelStyle}>Pod Updates:</span>
                      <span style={valueStyle}>
                        {user.podUpdateReport != null
                          ? user.podUpdateReport
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <ClockCircleOutlined style={iconStyle} />
                      <span style={labelStyle}>Avg Spent Hours:</span>
                      <span style={valueStyle}>
                        {user.avgSpentHours != null
                          ? user.avgSpentHours
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <CalendarOutlined style={iconStyle} />
                      <span style={labelStyle}>Working Days:</span>
                      <span style={valueStyle}>
                        {user.workingDays != null ? user.workingDays : "N/A"}
                      </span>
                    </div>
                    <div>
                      <CalendarOutlined style={iconStyle} />
                      <span style={labelStyle}>Public Holidays:</span>
                      <span style={valueStyle}>
                        {user.publicHoliday != null
                          ? user.publicHoliday
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <CalendarOutlined style={iconStyle} />
                      <span style={labelStyle}>Total Month Days:</span>
                      <span style={valueStyle}>
                        {user.monthDays != null ? user.monthDays : "N/A"}
                      </span>
                    </div>
                    <div>
                      <CalendarOutlined style={iconStyle} />
                      <span style={labelStyle}>Sundays:</span>
                      <span style={valueStyle}>
                        {user.sundayCount != null ? user.sundayCount : "N/A"}
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
