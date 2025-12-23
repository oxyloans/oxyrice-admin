import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Spin,
  Input,
  Row,
  Col,
  message,
  DatePicker,
  Button,
  Modal,
  Image,
  Card,
  Statistic,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";

const { Search } = Input;
const { RangePicker } = DatePicker;

const FuelExpenses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([dayjs().startOf("month"), dayjs()]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const accessToken = localStorage.getItem("token") || "";

  // Fetch Summary Data
  const fetchFuelStats = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = dates[0]?.format("YYYY-MM-DD");
      const endDate = dates[1]?.format("YYYY-MM-DD");

      const response = await axios.get(
        `${BASE_URL}/ai-service/agent/fuel-stats?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching fuel stats:", error);
      message.error("Failed to fetch fuel expenses summary.");
    } finally {
      setLoading(false);
    }
  }, [dates]);

  useEffect(() => {
    fetchFuelStats();
  }, [fetchFuelStats]);

  // Fetch details for a specific user
  // Fetch details for a specific user
  const fetchUserFuelDetails = async (userId) => {
    try {
      setModalLoading(true);
      const startDate = dates[0]?.format("YYYY-MM-DD");
      const endDate = dates[1]?.format("YYYY-MM-DD");

      const response = await axios.get(
        `${BASE_URL}/ai-service/agent/dboy-fuel-stats-whole?startDate=${startDate}&endDate=${endDate}&userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // ✅ Sort by createdAt (newest first)
      const sortedData = (response.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setModalData(sortedData);
    } catch (error) {
      console.error("Error fetching user fuel details:", error);
      message.error("Failed to fetch detailed fuel records.");
    } finally {
      setModalLoading(false);
    }
  };

  // Table Columns for Summary
  const columns = [
    {
      title: "S.No",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 60,
    },
    {
      title: "User ID",
      dataIndex: "user_id",
      key: "user_id",
      render: (id) => id?.slice(-4),
      align: "center",
    },
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",
      align: "center",
    },
    {
      title: "Total Records",
      dataIndex: "total_records",
      key: "total_records",
      align: "center",
    },
    {
      title: "Total Amount (₹)",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amt) => amt?.toFixed(2),
      align: "center",
    },
    {
      title: "Total Liters",
      dataIndex: "total_liters",
      key: "total_liters",
      render: (l) => l?.toFixed(2),
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedUser(record);
            setModalVisible(true);
            fetchUserFuelDetails(record.user_id);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const formatIST = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Modal Table Columns
  const modalColumns = [
    {
      title: "S.No",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 60,
    },
    {
      title: "Sender Details",
      key: "senderDetails",
      render: (_, record) => (
        <div style={{ lineHeight: 1.6 }}>
          <div>
            <strong>User ID:</strong> {record.userId?.slice(-4)}
          </div>
          <div>
            <strong>Sender Name:</strong> {record.senderName}
          </div>
          <div>
            <strong>Mobile Number:</strong> {record.senderMobileNumber}
          </div>
          <div>
            <strong>Fuel Type:</strong> {record.fuelType}
          </div>
        </div>
      ),
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
      render: (a) => parseFloat(a).toFixed(2),
      align: "center",
    },
    {
      title: "Liters",
      dataIndex: "liters",
      key: "liters",
      render: (l) => parseFloat(l).toFixed(2),
      align: "center",
    },
    {
      title: "Rate/Liter",
      dataIndex: "ratePerLiter",
      key: "ratePerLiter",
      align: "center",
    },
    {
      title: "Created At (IST)",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (t) => formatIST(t),
      align: "center",
    },
    // {
    //   title: "Updated At (IST)",
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    //   render: (t) => formatIST(t),
    //   align: "center",
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          style={{
            color: status === "COMPLETED" ? "green" : "red",
            fontWeight: 600,
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Fuel Image",
      dataIndex: "imageUrls",
      key: "imageUrls",
      align: "center",
      render: (url) => (
        <Image
          width={60}
          height={60}
          src={url}
          alt="Fuel Slip"
          style={{ borderRadius: 8, objectFit: "cover" }}
        />
      ),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div style={{ padding: 24 }}>
        {/* ✅ Summary Cards Row (Top Section) */}
        <Row
          gutter={[16, 16]}
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
          {[
            {
              title: "Total Liters",
              value: data
                .reduce((acc, curr) => acc + (curr.total_liters || 0), 0)
                .toFixed(2),
              gradient: "linear-gradient(135deg, #008cba, #3b82f6)",
            },
            {
              title: "Total Amount (₹)",
              value: data
                .reduce((acc, curr) => acc + (curr.total_amount || 0), 0)
                .toFixed(2),
              gradient: "linear-gradient(135deg, #1ab394, #2E8B00)",
            },
            {
              title: "Total Records",
              value: data.reduce(
                (acc, curr) => acc + (curr.total_records || 0),
                0
              ),
              gradient: "linear-gradient(135deg, #f59e0b, #FF6300)",
            },
          ].map((item, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                style={{
                  height: "100%",
                  background: item.gradient,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 120,
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: "white", fontSize: 16 }}>
                      {item.title}
                    </span>
                  }
                  value={item.value}
                  valueStyle={{ color: "white", fontSize: 22, fontWeight: 600 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Header */}
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#4B0082" }}>
              Fuel Expenses Summary
            </h2>
          </Col>

          <Col>
            <RangePicker
              value={dates}
              onChange={(values) => values && setDates(values)}
              allowClear={false}
              format="YYYY-MM-DD"
              style={{ marginRight: 10 }}
            />
            <Button
              type="primary"
              style={{ backgroundColor: "#008cba", color: "#fff" }}
              onClick={fetchFuelStats}
            >
              Fetch Data
            </Button>
          </Col>
        </Row>

        {/* Search */}
        {/* Search */}
        <Row style={{ margin: "16px 0" }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by User Name"
              allowClear
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                if (!value) {
                  // Reset full data when search is cleared
                  fetchFuelStats();
                } else {
                  setData((prev) =>
                    prev.filter((item) =>
                      item.user_name.toLowerCase().includes(value)
                    )
                  );
                }
              }}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>

        {/* Summary Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="medium" tip="Loading data..." />
          </div>
        ) : (
          <Table
            bordered
            dataSource={data}
            columns={columns}
            rowKey="user_id"
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["50", "100", "200", "300"],
            }}
            scroll={{ x: true }}
          />
        )}

        {/* Modal */}
        <Modal
          open={modalVisible}
          title={
            selectedUser
              ? `Fuel Details for ${selectedUser.user_name}`
              : "Fuel Details"
          }
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={1000}
          centered
        >
          {modalLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="medium" tip="Loading details..." />
            </div>
          ) : (
            <Table
              bordered
              dataSource={modalData}
              columns={modalColumns}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              scroll={{ x: true, y: 400 }}
            />
          )}
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default FuelExpenses;
