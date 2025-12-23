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
  Tabs,
  Pagination,
  message,
} from "antd";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";

import { data } from "autoprefixer";

const { Title } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const ActiveOffersList = () => {
  const [activeOffers, setActiveOffers] = useState([]);
  const [comboOffers, setComboOffers] = useState([]);
  const [filteredActive, setFilteredActive] = useState([]);
  const [filteredComboOffers, setFilteredComboOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [comboSearchText, setComboSearchText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [comboPage, setComboPage] = useState(1);
  const [comboPageSize, setComboPageSize] = useState(25);
  const [comboTotal, setComboTotal] = useState(0);

  const pageSize = 20;

  const fetchActiveOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/cart-service/cart/activeOffers`
      );
      setActiveOffers(response.data);
      setFilteredActive(response.data);
      message.success("Active offers loaded successfully");
    } catch (error) {
      message.error(
        "Failed to fetch active offers: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComboOffers = async (page = 1, size =25) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/product-service/combo-offers?page=${page - 1}&size=${size}`
      );
      const { content, totalElements } = response.data;
      setComboOffers(content || []);
      setFilteredComboOffers(content || []);
      setComboTotal(totalElements || 0);
      message.success("Combo offers loaded successfully");
    } catch (error) {
      message.error(
        "Failed to fetch combo offers: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "active") {
      fetchActiveOffers();
    } else {
      fetchComboOffers(comboPage, comboPageSize);
    }
  }, [activeTab, comboPage, comboPageSize]);

  const handleSearch = (value) => {
    const search = value.toLowerCase();
    setSearchText(search);
    const filtered = activeOffers.filter(
      (offer) =>
        offer.offerName?.toLowerCase().includes(search) ||
        offer.freeItemName?.toLowerCase().includes(search) ||
        offer.freeItemId?.toLowerCase().includes(search)
    );
    setFilteredActive(filtered);
    setCurrentPage(1);
  };

  const handleComboSearch = (value) => {
    setComboSearchText(value.toLowerCase());
  };
  
  useEffect(() => {
    if (!comboSearchText.trim()) {
      setFilteredComboOffers(comboOffers);
    } else {
      const matched = comboOffers.filter((offer) =>
        offer.comboItemName?.toLowerCase().includes(comboSearchText)
      );
      setFilteredComboOffers(matched);
    }
  }, [comboSearchText, comboOffers]);
  
  
  const toggleOfferStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(
        `${BASE_URL}/cart-service/cart/${id}/status?active=${!currentStatus}`
      );
      await fetchActiveOffers();
      message.success(
        `Offer ${currentStatus ? "deactivated" : "activated"} successfully`
      );
    } catch (error) {
      message.error(
        "Failed to update offer status: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleComboStatus = async (comboId) => {
    console.log("Toggling combo status for:", comboId);
    setUpdatingId(comboId);
    try {
      await axios.patch(
        `${BASE_URL}/product-service/updateComboStatus/${comboId}`
      );
      await fetchComboOffers(comboPage, comboPageSize);
      message.success("Combo status updated successfully");
    } catch (error) {
      message.error(
        "Failed to update combo status: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUpdatingId(null);
    }
  };
  const deactivateItem = async (comboId, itemId) => {
    const key = `${comboId}-${itemId}`;
    setUpdatingId(key);
    console.log("Deactivating item:", comboId, itemId);
    try {
      await axios.patch(
        `${BASE_URL}/product-service/updateItem/${comboId}/${itemId}`
      );
      if (data.status === 200) {
        message.success("Item inactive successfully");
      }
      await fetchComboOffers(comboPage, comboPageSize);
    } catch (error) {
      message.error(
        "Failed to deactivate item: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOfferColumns = [
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
        <span className="status-indicator font-bold">
          {freeOnce ? "True" : "False"}
        </span>
      ),
    },
    {
      title: "Active",
      key: "active",
      align: "center",
      render: (_, record) => (
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
              backgroundColor: record.active ? "#008CBA" : "#f44336",
              color: "white",
              border: "none",
            }}
          >
            {record.active ? "Active" : "Inactive"}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const comboOfferColumns = [
    {
      title: "S.No",
      key: "serial",
      render: (text, record, index) =>
        (comboPage - 1) * comboPageSize + index + 1,
      align: "center",
    },
    {
      title: "Combo Name",
      dataIndex: "comboItemName",
      key: "comboItemName",
      align: "center",
      render: (text) => <div style={{ whiteSpace: "normal" }}>{text}</div>,
    },
    {
      title: <div style={{ textAlign: "center" }}>Combo Image</div>,
      dataIndex: "imageUrl",
      key: "comboImage",
      align: "center", // center the content horizontally
      render: (url) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={url}
            alt="Combo"
            style={{ maxWidth: 100, maxHeight: 60, objectFit: "contain" }}
          />
        </div>
      ),
    },
    {
      title: "Items",
      key: "items",
      align: "center",
      render: (_, record) => {
        const itemColumns = [
          {
            title: "Item Name",
            dataIndex: "itemName",
            align: "center",
            key: "itemName",
            render: (text) => <strong>{text?.trim()}</strong>,
          },
          {
            title: <div style={{ textAlign: "center" }}>Combo Image</div>,
            dataIndex: "imageUrl",
            key: "Image",
            align: "center", // center the content horizontally
            render: (url) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={url}
                  alt="Combo"
                  style={{ maxWidth: 100, maxHeight: 60, objectFit: "contain" }}
                />
              </div>
            ),
          },
          {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
          },
          {
            title: "MRP (₹)",
            dataIndex: "itemMrp",
            key: "itemMrp",
            align: "center",
          },
          {
            title: "Price (₹)",
            dataIndex: "itemPrice",
            key: "itemPrice",
            align: "center",
          },
          {
            title: "Action",
            key: "action",
            align: "center",
            render: (_, item) => {
              const comboId = record.comboItemId;
              const itemId = item.individualItemId;
              const updateKey = `${comboId}-${itemId}`;

              return (
                <Popconfirm
                  title="Are you sure you want to deactivate this item?"
                  onConfirm={() => deactivateItem(comboId, itemId)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    size="small"
                    loading={updatingId === updateKey}
                  >
                    Inactive
                  </Button>
                </Popconfirm>
              );
            },
          },
        ];
        const activeItems = (record.items || []).filter(
          (it) => it?.status === true
        );
        return (
          <Table
            columns={itemColumns}
            dataSource={activeItems}
            rowKey={(item, index) => index}
            pagination={false}
            scroll={{ x: true }}
            size="small"
            bordered
          />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title={`Are you sure you want to update status of this combo offer?`}
          onConfirm={() => toggleComboStatus(record.comboItemId)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            size="small"
            loading={updatingId === record.comboItemId}
            style={{
              backgroundColor: "#008CBA",
              color: "white",
              border: "none",
            }}
          >
            All Items Inactive
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <Card>
        <Tabs
          defaultActiveKey="active"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          type="card"
        >
          <TabPane tab="Active Offers" key="active">
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Title level={4}>Active Offers</Title>
              </Col>
              <Col>
                <Search
                  placeholder="Search by Offer or Free Item"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                  // prefix={<SearchOutlined />}
                  style={{ width: 300 }}
                />
              </Col>
            </Row>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="medium" />
              </div>
            ) : (
              <Table
                columns={activeOfferColumns}
                dataSource={filteredActive}
                rowKey="id"
                bordered
                scroll={{ x: true }}
                pagination={{
                  current: currentPage,
                  pageSize,
                  total: filteredActive.length,
                  onChange: (page) => setCurrentPage(page),
                }}
              />
            )}
          </TabPane>

          <TabPane tab="Combo Offers" key="combo">
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  Combo Offers
                </Title>
              </Col>
              <Col>
                <Search
                  placeholder="Search by Combo Item Name"
                  value={comboSearchText}
                  onChange={(e) => handleComboSearch(e.target.value)}
                  allowClear
                
                  style={{ width: 300 }}
                />
              </Col>
            </Row>

            {loading ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="medium" />
              </div>
            ) : (
              <>
                <Table
                  columns={comboOfferColumns}
                  dataSource={filteredComboOffers}
                  rowKey="comboItemId"
                  bordered
                  pagination={false}
                  scroll={{ x: true }}
                />
                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Pagination
                    current={comboPage}
                    pageSize={comboPageSize}
                    total={comboTotal}
                    showSizeChanger
                    pageSizeOptions={["25", "50", "75", "100"]}
                    onChange={(page, size) => {
                      setComboPage(page);
                      setComboPageSize(size);
                    }}
                  />
                </div>
              </>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </AdminPanelLayoutTest>
  );
};

export default ActiveOffersList;
