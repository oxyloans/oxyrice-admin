import React, { useEffect, useState } from "react";
import { Table, Card, Spin, message, Input, Row, Col } from "antd";
import CompaniesLayout from "../Components/CompaniesLayout";
import BASE_URL from "../../AdminPages/Config";
import dayjs from "dayjs";

const getMaskedUserId = (userId) => {
  if (!userId) return "";
  const str = String(userId);
  return `#${str.slice(-4).padStart(4, "0")}`;
};

const WeHiringPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/marketing-service/campgin/getAllInterestedUsres`
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        // Filter for askOxyOfers === 'WEAREHIRING'
        let filtered = Array.isArray(json)
          ? json.filter((u) => u.askOxyOfers === "WEAREHIRING")
          : [];
        // Sort by createdAt descending
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setData(filtered);
      } catch (err) {
        message.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered data for search
  const filteredData = search
    ? data.filter(
        (item) =>
          item.mobileNumber && item.mobileNumber.toString().includes(search)
      )
    : data;

  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  const columns = [
    {
      title: "S.No.",
      dataIndex: "serial",
      key: "serial",
      align: "center",
      width: 80,
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      fixed: "left",
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      width: 120,
      render: (userId) => <span>{getMaskedUserId(userId)}</span>,
      fixed: "left",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      align: "center",
      width: 160,
    },
    {
      title: "User Role",
      dataIndex: "userRole",
      key: "userRole",
      align: "center",
      width: 120,
      render: (role) =>
        role === "FREELANCER" ? (
          <span style={{ color: "#1AB394", fontWeight: 600 }}>FREELANCER</span>
        ) : (
          role || "-"
        ),
    },
    {
      title: "Project Type",
      dataIndex: "projectType",
      key: "projectType",
      align: "center",
      width: 160,
    },
    {
      title: "Offer",
      dataIndex: "askOxyOfers",
      key: "askOxyOfers",
      align: "center",
      width: 140,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 180,
      render: (createdAt) => dayjs(createdAt).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <CompaniesLayout>
      <Card style={{ margin: 24 }} bodyStyle={{ padding: 0 }}>
        <Row
          align="middle"
          justify="space-between"
          style={{ padding: 16, flexWrap: "wrap" }}
        >
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={12}
            xl={12}
            style={{
              textAlign: "left",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            We Are Hiring - Interested Users
          </Col>
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={12}
            xl={12}
            style={{ textAlign: "right", marginBottom: 8 }}
          >
            <Input.Search
              placeholder="Search by Mobile Number"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260, width: "100%" }}
              size="large"
            />
          </Col>
        </Row>
        <Spin spinning={loading} tip="Loading...">
          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="userId"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredData.length,
                showSizeChanger: false,
                onChange: (page, pageSize) =>
                  setPagination({ current: page, pageSize }),
              }}
              scroll={{ x: true }}
              bordered
              style={{ minWidth: 900 }}
            />
          </div>
        </Spin>
      </Card>
    </CompaniesLayout>
  );
};

export default WeHiringPage;
