import AdminPanelLayout from "./AdminPanelLayout";
import React, { useState,useRef } from 'react';
import { Table, DatePicker, Select,Row,Spin,Modal, Col,Button, message } from 'antd';
import axios from 'axios';
import moment from 'moment'; 
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from 'uuid';
import "jspdf-autotable";
import { AiOutlineDownload } from "react-icons/ai";

const { RangePicker } = DatePicker;
const accessToken = localStorage.getItem('accessToken');
const {Option }= Select;
// Generate a unique order ID using UUID v4
const uniqueOrderId = uuidv4();

const OrdersList = () => {
  const [dateRange, setDateRange] = useState([]);
  const [orderStatus, setOrderStatus] = useState('All');
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [toDate, setToDate] = useState(moment()); 
  const [fromDate, setFromDate] = useState(moment()); 
  const [orderDetails, setOrderDetails] = useState(null);



  const handleDateChange = (dates) => setDateRange(dates);
  const handleStatusChange = (value) => setOrderStatus(value);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Handle date change for From Date
  const handleFromDateChange = (date) => {
    setFromDate(date);
  };
console.log(orderDetails);
const fetchOrderDetailsModal = async (orderId) => {
  setLoading(true);
  try {
    const response = await axios.get(
      `https://meta.oxyloans.com/api/erice-service/order/getOrdersByOrderId/${orderId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (response?.data) {
      console.log("Fetched Order Details:", response.data);
      setOrderDetails(response.data[0]); // Assuming it's an array and you need the first item
    } else {
      console.error("Empty response:", response);
    }
  } catch (error) {
    console.error("Error fetching order details:", error.response || error.message);
  } finally {
    setLoading(false);
  }
  
};
 // Handle "View" button click
 const handleViewClick = (orderId) => {
  fetchOrderDetailsModal(orderId); // Fetch order details
  setIsModalVisible(true); // Show modal
};

  // Function to handle Print Button click
  const handleViewClick1 = async (orderId) => {
    await fetchOrderDetailsModal(orderId); // Fetch order details
  };

  
  const handleDownloadPDF = () => {
    if (!orderDetails) {
      console.error('Order details not found');
      return;
    }
  
    const {
      orderId,
      customerName,
      orderdate,
      customermobilenumber,
      address,
      orderItems = [],
      subtotal,
      deliveryfee,
      granttotal
    } = orderDetails;
  
    const pdf = new jsPDF();
  
    // Set font and title
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#4CAF50'); // Green color for the title
    pdf.text('BILL FROM OXYRICE', 14, 20); // Custom title
    
    // Add Order and Date Information
    pdf.setFontSize(16);
    pdf.setTextColor('#000000');
    pdf.text(`Invoice No: ${orderId}`, 14, 30);
    pdf.text(`Billing Date: ${orderdate}`, 14, 40);
  
    // Add separator line
    pdf.setDrawColor(150);
    pdf.line(14, 45, 200, 45);
  
    // Invoice From Details
    pdf.setFontSize(14);
    pdf.text('Invoice From:', 14, 55);
    pdf.setFontSize(12);
    pdf.text('OXYRICE COMPANY', 14, 65);
    pdf.text('GSTIN: 1234567890', 14, 75);
  
    // Invoice To Details
    pdf.setFontSize(14);
    pdf.text('Invoice To:', 105, 55); // Start from a different position
    pdf.setFontSize(12);
    pdf.text(customerName, 105, 65);
    pdf.text(customermobilenumber, 105, 75);
    pdf.text(address, 105, 85);
  
    // Add Item Details (Invoice Breakup)
    pdf.setFontSize(14);
    pdf.text('Invoice Breakup', 14, 105);
    pdf.setFontSize(12);
  
    // Add table for items
    const itemsRows = orderItems.map(item => [
      item.itemName,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);
  
    pdf.autoTable({
      startY: 115,
      head: [['Item Description', 'Quantity', 'Unit Cost', 'Total']],
      body: itemsRows,
      theme: 'striped',
      headStyles: { fillColor: '#4CAF50', textColor: '#ffffff', fontSize: 12 },
      bodyStyles: { fontSize: 10, textColor: '#333333' },
      alternateRowStyles: { fillColor: '#f9f9f9' },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' }, // Item Description
        1: { cellWidth: 40 }, // Quantity
        2: { cellWidth: 40 }, // Unit Cost
        3: { cellWidth: 40 }  // Total
      }
    });
  
    // Add the subtotal, discount, delivery fee, and grand total at the bottom
    const summaryRows = [
      ['SUB TOTAL', `$${subtotal?.toFixed(2) || 'N/A'}`],
      ['DELIVERY FEE', `$${deliveryfee?.toFixed(2) || 'N/A'}`],
      ['GRAND TOTAL', `$${granttotal?.toFixed(2) || 'N/A'}`]
    ];
  
    pdf.autoTable({
      startY: pdf.autoTable.previous.finalY + 10,
      head: [['Field', 'Amount']],
      body: summaryRows,
      theme: 'striped',
      headStyles: { fillColor: '#4CAF50', textColor: '#ffffff', fontSize: 12 },
      bodyStyles: { fontSize: 12, textColor: '#333333' },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 80 }
      }
    });
  
    // Add footer with generation date
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.setTextColor('#555555');
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      14,
      pageHeight - 10
    );
  
    // Add footer note
    pdf.text('Thank you for shopping with OxyRice!', 14, pageHeight - 5);
  
    // Save the PDF
    pdf.save(`Order_${orderId}.pdf`);
  };
  

// Handle modal close
const handleModalClose = () => {
  setIsModalVisible(false);
  setOrderDetails(null);
};

  // Handle date change for To Date
  const handleToDateChange = (date) => {
    setToDate(date);
  };



  
  
  
// Define table columns
const columns = [
  { title: 'Order Id', dataIndex: 'orderId', key: 'orderId',align:'center' },
  { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate',align:'center' },
  // {
  //   title: 'Customer Id',
  //   dataIndex: 'customerId',
  //   key: 'customerId',
  //   render: (text) => text || 'N/A',align:'center'
  // },

  { title: 'G T', dataIndex: 'grandTotal', key: 'grandTotal', align:'center' },
  {
    title: 'P T',
    dataIndex: 'paymentType',
    key: 'paymentType',
    align:'center',
    render: (type) => (type === 1 ? 'ONLINE' : type === 2 ? 'COD' : 'Other'),
  },
  {
    title: 'P S',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    // render: (type) => (type === 1 ? 'COMPLEATED' : type === 2 ? 'PENDING' : 'Other'),
    align:'center'
  },
  {
    title: 'Status',
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    align:'center',
    render: (status) => {
      const statusMap = {
        '0': 'Incomplete',
        '1': 'Order Placed',
        '2': 'Order Accepetd',
        '3': 'Order Picked',
        '4': 'Order Delivered',
        '5': 'Order Rejected',
        '6': 'Order Canceled',
      };
      return statusMap[status] || 'Pending';
      
    },
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    render: (order) => (
      <>
        <Button
          type="link"
          style={{
            backgroundColor: "#23C6C8",
            color: "white",
            padding: "2px",
            margin: "2px",
          }}
          onClick={() => handleViewClick(order.orderId)} // Call handleViewClick with orderId
        >
          View
        </Button>
  
        <Button
          onClick={() => handleViewClick1(order.orderId)} // Pass orderId to fetch order details and print
          type="link"
          style={{
            backgroundColor: "#23C6C8",
            color: "white",
          }}
        >
          Print
        </Button>
  
        {orderDetails && (
          <Button
            onClick={handleDownloadPDF} // Download PDF button shown when orderDetails are available
            type="link"
            style={{
              backgroundColor: "#23C6C8",
              color: "white",
              marginTop: "10px"
            }}
          >
            Download PDF
          </Button>
        )}
      </>
    ),
  }
  ,
];



// const handleDownloadPDF = () => {
//   const doc = new jsPDF();
//   const tableColumn = ["Order ID", "Order Date","Grand Total","Payment Type", "Order Status"];
//   const tableRows = [];

//   // Convert data source to rows
//   orderData.forEach((item) => {
//     const row = [item.orderId, item.orderDate, item.grandTotal,item.paymentType, item.orderStatus];
//     tableRows.push(row);
//   });

//   // Add the table to PDF
//   doc.autoTable({
//     head: [tableColumn],
//     body: tableRows,
//   });

//   // Save the PDF
//   doc.save("OrderData.pdf");
// };
const handleDownloadExcel = (orderData) => {
  // Ensure orderData is an array
  const data = Array.isArray(orderData) ? orderData : [];

  // Check if data is empty
  if (data.length === 0) {
    console.error("No order data available for download.");
    return; // Exit the function
  }

  // Prepare data for Excel sheet
  const rows = data.map((item) => ({
    "Order ID": item.orderId || "N/A",
    "Order Date": item.orderDate || "N/A",
    "Grand Total": item.grandTotal || "N/A",
    "Payment Type": item.paymentType
      ? item.paymentType === 1
        ? "ONLINE"
        : item.paymentType === 2
        ? "COD"
        : "Other"
      : "Other",
    "Order Status": item.orderStatus
      ? (() => {
          const statusMap = {
            "0": "Incomplete",
            "1": "Order Placed",
            "2": "Order Accepted",
            "3": "Order Picked",
            "4": "Order Delivered",
            "5": "Order Rejected",
            "6": "Order Canceled",
          };
          return statusMap[item.orderStatus] || "Pending";
        })()
      : "N/A",
  }));

  // Create a new workbook and add data to a worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Order Data");

  // Generate and download the Excel file
  XLSX.writeFile(workbook, "OrderData.xlsx");
};

const fetchOrderDetails = async () => {
  if (!accessToken) {
    message.error('User not authenticated. Please log in.');
    return;
  }

  // Ensure both dates are selected
  if (!fromDate || !toDate) {
    message.error('Please select a valid date range.');
    return;
  }

  // Ensure the fromDate is before the toDate
  if (fromDate.isAfter(toDate)) {
    message.error('From date cannot be later than To date.');
    return;
  }

  const startDate = fromDate.format('YYYY-MM-DD');
  const endDate = toDate.format('YYYY-MM-DD');
  const statusValue = orderStatus !== 'All' ? orderStatus : undefined;

  try {
    setLoading(true);
    const response = await axios.get(`https://meta.oxyloans.com/api/erice-service/order/date-range`, {
      params: { startDate, endDate, status: statusValue },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('API Response:', response.data); // Confirm the structure of response data

    if (response.status === 200) {
      let orders = response.data;
      const uniqueOrderId = uuidv4();
      console.log('Generated Unique Order ID:', uniqueOrderId);
      // Filter results based on status if specified
      if (statusValue) {
        orders = orders.filter(order => order.orderStatus === statusValue);
      }

      setOrderData(orders);
      message.success('Data fetched successfully');
    } else {
      message.error('No data found');
    }
  } catch (error) {
    console.error('Error fetching order data:', error);
    message.error('An error occurred while fetching data');
  } finally {
    setLoading(false);
  }
};

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };



  const orderStatusMap = {
    '0': 'Incomplete',
    '1': 'Order Placed',
    '2': 'Order Accepted',
    '3': 'Order Picked',
    '4': 'Order Delivered',
    '5': 'Order Rejected',
    '6': 'Order Canceled',
  };


  const paymentTypeMap = {
    1: 'ONLINE',
    2: 'COD',
  };
  

  
  const paymentTypeStatus = {
    1: 'COMPLEATED',
    2: 'PENDING',
  };
  return (
    <AdminPanelLayout>
      <div>
       
      <div>
  {/* Filters Row */}
  <Row justify="space-between" align="middle" className="mb-4">
    {/* Order Status */}
    <Col xs={24} sm={12} md={6}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
      <Select
        className="w-full"
        value={orderStatus}
        onChange={handleStatusChange}
      >
        <Option value="All">All</Option>
        <Option value="0">Incomplete</Option>
        <Option value="1">Order Placed</Option>
        <Option value="2">Order Accepted</Option>
        <Option value="3">Order Picked</Option>
        <Option value="4">Order Delivered</Option>
        <Option value="5">Order Rejected</Option>
        <Option value="6">Order Canceled</Option>
      </Select>
    </Col>

    {/* From Date */}
    <Col xs={24} sm={12} md={4}>
      <label
        htmlFor="from_date"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        From Date
      </label>
      <DatePicker
        value={fromDate}
        onChange={handleFromDateChange}
        format="YYYY-MM-DD"
        className="w-full"
      />
    </Col>

    {/* To Date */}
    <Col xs={24} sm={12} md={4}>
      <label
        htmlFor="to_date"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        To Date
      </label>
      <DatePicker
        value={toDate}
        onChange={handleToDateChange}
        format="YYYY-MM-DD"
        className="w-full"
      />
    </Col>

    {/* Action Buttons */}
    <Col xs={24} sm={24} md={6} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-end">
  
      <Button
        className="text-white w-full sm:w-auto"
        style={{
          backgroundColor: '#1AB394',
        }}
        onClick={fetchOrderDetails}
        loading={loading}
      >
        Get Data
      </Button>
      <Button
        className="text-white w-full sm:w-auto flex items-center justify-center gap-2"
        style={{
          backgroundColor: "#1c84c6",
        }}
        onClick={() => handleDownloadExcel(orderData)}
      >
        <AiOutlineDownload className="text-lg" />
        Download
      </Button>
    </Col>
  </Row>

  {/* Orders List and Entries Per Page */}
  <Row justify="space-between" align="middle" className="mb-4">
    <Col>
      <h2 className="text-xl font-bold mb-2 sm:mb-0">Orders List</h2>
    </Col>
    <Col className="flex items-center gap-2">
      <span>Show</span>
      <Select
        value={entriesPerPage}
        onChange={handleEntriesPerPageChange}
        style={{ width: 70 }}
      >
        <Option value={5}>5</Option>
        <Option value={10}>10</Option>
        <Option value={20}>20</Option>
      </Select>
      <span>entries</span>
    </Col>
  </Row>
</div>

        <Table
       
          columns={columns}
          dataSource={orderData}
          loading={loading}
          rowKey="orderId"
          bordered
          scroll={{ x: '100%' }}
          pagination={{ pageSize: entriesPerPage, onChange: (page) => setCurrentPage(page) }}
          // pagination={false}
        />
       {/* Modal for Order Details */}



       <Modal
  title="Order Details"
  visible={isModalVisible}
  onCancel={handleModalClose}
  footer={null}
  width={650}
>
{loading ? (
  <div className="flex justify-center items-center h-full">
    <Spin />
  </div>
  ) : orderDetails ? (
    <div>
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Order ID</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">{orderDetails?.orderId || "N/A"}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Customer Mobile</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">{orderDetails?.customermobilenumber || "N/A"} - {orderDetails?.customerName || "N/A"}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Customer Address</strong></td>
            <td className="border border-gray-300 px-2 py-1">
              <strong>Flat No:</strong> {orderDetails?.flatNo || "N/A"}, <br />
              <strong>Land Mark:</strong> {orderDetails?.landMark || "N/A"}, <br />
              <strong>Location:</strong> {orderDetails?.address || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Order Status</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">
  {orderDetails?.orderstatus ? orderStatusMap[orderDetails.orderstatus] : "N/A"}
</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Payment Type</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">
  {orderDetails?.payment ? paymentTypeMap[orderDetails.payment] || 'Other' : 'N/A'}
</td>
          </tr>
          <tr>
            {/* <td className="border border-gray-300 px-2 py-1 text-center"><strong>Payment Status</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">
  {paymentTypeStatus[orderDetails?.payment] || "N/A"}
</td> */}

          </tr>
        </tbody>
      </table>

      <h2 className="font-semibold mb-2 text-center">Menu Item Details</h2>
      <Table
        columns={[
          { title: "Menu Item", dataIndex: "itemName", key: "itemName",align:'center' },
          { title: "Quantity", dataIndex: "quantity", key: "quantity",align:'center' },
          { title: "Price", dataIndex: "price", key: "price",align:'center' ,render: (text) => `₹${text || "0.00"}` },
          { title: "Total Price", dataIndex: "price", key: "price",align:'center', render: (text) => `₹${text || "0.00"}` },
        ]}
        dataSource={orderDetails?.orderItems || []}
        rowKey={(record, index) => index}
        pagination={false}
      />

      <h2 className="font-semibold mt-4 "><strong>Order Totals</strong></h2>
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Sub Total</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">₹{orderDetails?.subtotal || "0.00"}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Delivery Fee</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">₹{orderDetails?.deliveryfee || "0.00"}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Grand Total</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">₹{orderDetails?.granttotal || "0.00"}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Subscription Amount Used</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">₹{orderDetails?.subscriptionAmountUsed || "0.00"}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 text-center"><strong>Referral Amount Used</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">₹{orderDetails?.referralAmountUsed || "0.00"}</td>
          </tr>
        </tbody>
      </table>

      
      {/* <Table
        dataSource={orderDetails?.orderHistory || []}
        columns={[
          { title: "Status", dataIndex: "status", key: "status", render: (text) => ({"1": "Order Placed", "2": "Processing", "3": "Shipped", "4": "Delivered"}[text] || "Unknown")) },
          { title: "Updated At", dataIndex: "createdAt", key: "createdAt", render: (text) => text ? new Date(text).toLocaleString() : "N/A" },
        ]}
        rowKey={(record, index) => index}
        pagination={false}
      /> */}
    </div>
  ) : (
    <p>No order details available.</p>
  )}
</Modal>





      </div>
    </AdminPanelLayout>
  );
};

export default OrdersList;


