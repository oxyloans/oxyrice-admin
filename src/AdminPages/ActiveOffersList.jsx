import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Spin,
  Button,
  Popconfirm,
  Input,
  Row,
  Col,
} from "antd";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";
import { SearchOutlined } from "@ant-design/icons"; // Add this import
const { Title } = Typography;
const { Search } = Input;

const ActiveOffersList = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const pageSize = 20;

  const fetchActiveOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/cart-service/cart/activeOffers`);
      setOffers(response.data);
      setFilteredOffers(response.data);
    } catch (error) {
      console.error("Error fetching active offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const search = value.toLowerCase();
    setSearchText(search);
    const filtered = offers.filter(
      (offer) =>
        offer.offerName?.toLowerCase().includes(search) ||
        offer.freeItemName?.toLowerCase().includes(search) ||
        offer.freeItemId?.toLowerCase().includes(search)
    );
    setFilteredOffers(filtered);
    setCurrentPage(1); // reset to page 1 after filtering
  };

  const toggleOfferStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${BASE_URL}/cart-service/cart/${id}/status?active=${!currentStatus}`);
      await fetchActiveOffers();
    } catch (error) {
      console.error("Error updating offer status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      align: "center",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Free Item ID (Last 4)",
      dataIndex: "freeItemId",
      key: "freeItemId",
      align: "center",
      render: (id) => id?.slice(-4),
    },
    {
      title: "Free Item Name",
      dataIndex: "freeItemName",
      key: "freeItemName",
      align: "center",
    },
    {
      title: "Offer Name",
      dataIndex: "offerName",
      key: "offerName",
      align: "center",
    },
    {
      title: "Min Qty (KG)",
      dataIndex: "minQtyKg",
      key: "minQtyKg",
      align: "center",
    },
    {
      title: "Min Qty (Units)",
      dataIndex: "minQty",
      key: "minQty",
      align: "center",
    },
    {
      title: "Free Qty",
      dataIndex: "freeQty",
      key: "freeQty",
      align: "center",
    },
    {
      title: "One Time Only",
      dataIndex: "freeOnce",
      key: "freeOnce",
      align: "center",
      render: (freeOnce) => (
        <Tag color={freeOnce ? "green" : "red"}>{freeOnce ? "True" : "False"}</Tag>
      ),
    },
    {
      title: "Active",
      key: "active",
      align: "center",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Popconfirm
            title={`Are you sure you want to ${record.active ? "deactivate" : "activate"} this offer?`}
            onConfirm={() => toggleOfferStatus(record.id, record.active)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="medium"
              loading={updatingId === record.id}
              style={{
                marginTop: 5,
                backgroundColor: record.active ? "#f44336" : "#008CBA",
                color: "white",
                border: "none",
              }}
            >
              {record.active ? "Inactive" : "Active"}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4}>Active Offers</Title>
            </Col>
            <Col>
              <Input
                placeholder="Search by Offer or Free Item Name"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                prefix={<SearchOutlined />} // This adds the search icon inside the input
                style={{ width: 300 }}
              />
            </Col>
          </Row>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="medium" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOffers}
            rowKey="id"
            bordered
            scroll={{ x: 100 }}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredOffers.length,
              onChange: (page) => setCurrentPage(page),
            }}
          />
        )}
      </Card>
    </AdminPanelLayoutTest>
  );
};

export default ActiveOffersList;
