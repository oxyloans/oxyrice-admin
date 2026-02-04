import AdminPanelLayout from "./AdminPanelLayout";
import React, { useState } from "react";
import { Table, Button } from "antd";




// Define table columns
const columns = [
  { title: "Order Id", dataIndex: "orderId", key: "orderId", align: "center" },
  {
    title: "Order Date",
    dataIndex: "orderDate",
    key: "orderDate",
    align: "center",
  },
  {
    title: "Grand Total",
    dataIndex: "grandTotal",
    key: "grandTotal",
    align: "center",
  },
  {
    title: "Payment Type",
    dataIndex: "paymentType",
    key: "paymentType",
    align: "center",
    render: (type) => (type === 1 ? "ONLINE" : type === 2 ? "COD" : "NA"),
  },
  {
    title: "Payment Status",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    render: (status) => status || "Pending",
    align: "center",
  },
  {
    title: "Status",
    dataIndex: "orderStatus",
    key: "orderStatus",
    align: "center",
    render: (status) => {
      const statusMap = {
        0: "Incomplete",
        4: "Order Delivered",
        6: "Order Canceled",
      };
      return statusMap[status] || "Pending";
    },
  },
  {
    title: "Action",
    key: "action",
    align: "center",
    render: () => (
      <>
        <Button type="link">View</Button>
        <Button type="link">Print</Button>
      </>
    ),
  },
];

const ReturnList = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  // const fetchOrderDetails = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(`https://meta.oxyloans.com/api/erice-service/order/cancelled-incomplete`, {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     });

  //     console.log('API Response:', response.data); // Confirm the structure of response data

  //     if (response.status === 200) {
  //       setOrderData(response.data);
  //       message.success('Data fetched successfully');
  //     } else {
  //       message.error('No data found');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching order data:', error);
  //     message.error('An error occurred while fetching data');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchOrderDetails();
  // }, []);
  return (
    <AdminPanelLayout>
      <div className="p-4">
        <h2 className="text-1xl mb-6">Return Replied List</h2>

        <Table
          columns={columns}
          dataSource={orderData}
          loading={loading}
          rowKey="orderId"
          scroll={{ x: "100%" }}
          className="border rounded-md shadow-sm"
        />
      </div>
    </AdminPanelLayout>
  );
};

export default ReturnList;
