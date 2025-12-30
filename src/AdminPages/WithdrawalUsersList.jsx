import React, { useEffect, useState } from "react";
import { Table, Tag, Input, Button, message, Popconfirm } from "antd";
import axios from "axios";
import moment from "moment";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";

const WithdrawalRequests = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchWithdrawalUsers();
  }, []);

  const fetchWithdrawalUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/order-service/getAllWithdrawalUsers`
      );
      setData(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error("Error fetching withdrawal users:", error);
      message.error("Failed to fetch withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  // Approve API
  const approveWithdrawal = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/order-service/approveAmount`, {
        customerId: userId,
        status: "APPROVED",
      });
      message.success("Withdrawal approved successfully");
      fetchWithdrawalUsers(); // Refresh data
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      message.error("Failed to approve withdrawal");
    }
  };

  // Handle Search
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter(
      (item) =>
        item.userId.toLowerCase().includes(value.toLowerCase()) ||
        item.status.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

    const columns = [
      {
        title: "S.No",
        key: "index",
        align: "center",
        render: (text, record, index) => index + 1,
      },
      {
        title: "User ID (last 4)",
        dataIndex: "userId",
        key: "userId",
        align: "center",
        render: (text) => `#${text.slice(-4)}`,
      },
      {
        title: "Request Amount",
        dataIndex: "requestAmount",
        key: "requestAmount",
        align: "center",
        render: (amount) => `₹${amount.toLocaleString()}`,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => (
          <Tag color={status === "Requested" ? "orange" : "green"}>
            {status}
          </Tag>
        ),
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        render: (timestamp) => moment(timestamp).format("DD-MM-YYYY HH:mm"),
      },
    //   {
    //     title: "Error Message",
    //     dataIndex: "errorMessage",
    //     key: "errorMessage",
    //     align: "center",
    //     render: (msg) => (msg ? msg : "—"),
    //   },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) =>
          record.status === "Requested" ? (
            <Popconfirm
              title="Approve this withdrawal?"
              onConfirm={() => approveWithdrawal(record.userId)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" style={{backgroundColor:"#008cba" ,border:"#008cba",color:"f7f7f7"}} size="small">
                Approve
              </Button>
            </Popconfirm>
          ) : (
            <Tag color="green">Approved</Tag>
          ),
      },
    ];

  return (
    <AdminPanelLayoutTest>
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h1>Withdrawal Requests</h1>
          <Input.Search
            placeholder="Search by User ID or Status"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="userId"
          loading={loading}
          bordered
          pagination={{ pageSize: 5 }}
        />
      </div>
    </AdminPanelLayoutTest>
  );
};

export default WithdrawalRequests;
