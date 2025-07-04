import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Spin,
  Typography,
  Select,
  message,
  Button,
  Modal,
} from "antd";
import axios from "axios";
import AdminPanelLayoutTest from "./AdminPanel";
import BASE_URL from "./Config";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

// Order status mapping
const orderStatusMap = {
  0: "Incomplete",
  1: "Order Placed",
  2: "Order Accepted",
  3: "Order Assigned",
  PickedUp: "Order Picked Up",
  4: "Order Delivered",
  5: "Order Rejected",
  6: "Order Canceled",
};

// All employee coupon codes
const couponOptions = [
  "ARUNA75",
  "TULASI200",
  "TULASI75",
  "ARUNA200",
  "SWATHI200",
  "SWATHI75",
  "HEMA200",
  "JYOTHI200",
  "JYOTHI100",
  "SATHYA200",
  "PRATHA150",
];

const OrdersByCoupon = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [visibleItems, setVisibleItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (selectedCoupon) {
      fetchOrders(selectedCoupon);
    }
  }, [selectedCoupon]);

  const fetchOrders = async (couponCode) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/getAllOrdersBasedOnCouponCode?couponCode=${couponCode}`
      );
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
        message.warning("No orders found for this coupon code.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders. Try again.");
    }
    setLoading(false);
  };

  const orderColumns = [
    {
      title: "S.No.",
      key: "serial",
      render: (text, record, index) => index + 1,
      align: "center",
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      align: "center",
      key: "orderId",
      render: (id) => `#${id?.slice(-4)}`,
    },
    {
      title: "Coupon Code",
      dataIndex: "couponCode",
      align: "center",
      key: "couponCode",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      align: "center",
      key: "orderStatus",
      render: (status) => (
        <Tag color="green">{orderStatusMap[status] || "Unknown"}</Tag>
      ),
    },
    {
      title: "Discount",
      align: "center",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (amount) => `₹ ${amount}`,
    },
    {
      title: "Grand Total",
      dataIndex: "grandTotal",
      align: "center",
      key: "grandTotal",
      render: (total) => `₹ ${total}`,
    },
    {
      title: "Delivery Date",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      align: "center",
      render: (date) => (date ? dayjs(date).format("DD-MM-YYYY hh:mm A") : "-"),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (text, record) => (
        <Button
          style={{
            backgroundColor: "#008CBA",
            color: "#fff",
            border: "none",
          }}
          onClick={() => {
            setSelectedItems(record.list || []);
            setModalOpen(true);
          }}
        >
          Items View
        </Button>
      ),
    },
    
  ];

  const itemColumns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      align: "center",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Weight (Kg)",
      dataIndex: "weight",
      key: "weight",
      align: "center",
    },
    {
      title: "Unit",
      dataIndex: "itemUnit",
      key: "itemUnit",
      align: "center",
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div style={{ padding: 20 }}>
        <Title level={4}>Select Coupon Code to View Orders</Title>
        <Select
          showSearch
          placeholder="Select a Coupon Code"
          style={{ width: 200, marginBottom: 20 }}
          onChange={(value) => setSelectedCoupon(value.trim())}
          optionFilterProp="children"
        >
          {couponOptions.map((code) => (
            <Option key={code} value={code}>
              {code}
            </Option>
          ))}
        </Select>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <Spin size="small" />
          </div>
        ) : (
          selectedCoupon && (
            <Table
              rowKey="orderId"
              columns={orderColumns}
              dataSource={orders}
              pagination={{ pageSize: 20 }}
              bordered
              scroll={{ x: "100%" }}
            />
          )
        )}

        {/* Modal for showing items */}
        <Modal
          title="Ordered Items"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
        >
          <Table
            columns={itemColumns}
            dataSource={selectedItems}
            rowKey={(item, index) => index.toString()}
            pagination={false}
            size="small"
          />
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default OrdersByCoupon;
