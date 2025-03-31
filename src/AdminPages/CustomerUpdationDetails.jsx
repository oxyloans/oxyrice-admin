import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Select,
  Form,
  Input,
  message,
  Row,
  Col,
} from "antd";
import AdminPanelLayoutTest from "./AdminPanel";

import BASE_URL from "./Config";
const { Option } = Select;

const CustomerDetails = () => {
  const [customerData, setCustomerData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchItemsData();
  }, []);

  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `{BASE_URL}/erice-service/user/getAllUsers`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = response.data;
      message.success("Data Fetched Successfully");
      setCustomerData(data);
      setFilteredItems(data);
    } catch (error) {
      message.error("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (values) => {
    if (selectedItem) {
      setModalLoading(true);
      try {
        await axios.patch(
          `{BASE_URL}/erice-service/user/updateMobileNumber`,
          {
            userId: selectedItem.userId,
            mobileNumber: values.mobileNumber,
            userStatus: values.userStatus,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        message.success("Data updated successfully");
        fetchItemsData();
        handleCancel();
      } catch (error) {
        message.error("Error updating item: " + error.message);
      } finally {
        setModalLoading(false);
      }
    }
  };

  const handleUpdateTestUser = async (item) => {
    try {
      await axios.patch(
        `{BASE_URL}/erice-service/user/updateTestUsers`,
        {
          userId: item.userId,
          testUser: !item.testUser,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      message.success("Test user status updated successfully");
      fetchItemsData();
    } catch (error) {
      message.error("Error updating test user status: " + error.message);
    }
  };

  useEffect(() => {
    if (isModalVisible && selectedItem) {
      form.setFieldsValue({
        mobileNumber: selectedItem?.mobileNumber || "",
        userStatus: selectedItem?.status || "",
      });
    }
  }, [isModalVisible, selectedItem, form]);

  const showUpdateModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.trim().toLowerCase(); // Trim and convert to lowercase
    setSearchTerm(searchValue);

    if (searchValue) {
      const filtered = customerData.filter((item) => {
        const email = item.email?.toLowerCase() || "";
        const mobileNumber = item.mobileNumber?.toLowerCase() || "";
        const primaryType = item.primaryType?.toLowerCase() || "";
        const customerName = item.customerName?.toLowerCase() || "";
        const status = item.status?.toString().toLowerCase() || "";

        return (
          email.includes(searchValue) ||
          mobileNumber.includes(searchValue) ||
          primaryType.includes(searchValue) ||
          customerName.includes(searchValue) ||
          status.includes(searchValue)
        );
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems(customerData); // Reset to original data
    }
  };

  const columns = [
    {
      title: "S.NO",
      render: (_, __, index) => index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    // {
    //   title: "User ID",
    //   dataIndex: "userId",
    //   align: "center",
    // },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      align: "center",
    },
    {
      title: "Customer Email",
      dataIndex: "email",
      align: "center",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      align: "center",
    },
    {
      title: "Primary Type",
      dataIndex: "primaryType",
      align: "center",
    },
    {
      title: "Test User",
      dataIndex: "testUser",
      align: "center",
      render: (testUser) => (testUser ? "Test User" : "Live User"),
    },
    {
      title: "Actions",
      align: "center",
      render: (_, item) => (
        <>
          <Button
            onClick={() => showUpdateModal(item)}
            style={{
              backgroundColor: "#1AB394",
              color: "white",
              marginRight: "8px",
            }}
          >
            Update
          </Button>
          <Button
            onClick={() => handleUpdateTestUser(item)}
            style={{
              backgroundColor: item.testUser ? "#ec4758" : "#1c84c6",
              color: "white",
            }}
          >
            {item.testUser ? "Test User" : "Live User"}
          </Button>
        </>
      ),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2 className="text-xl font-bold">User Mobile Number Update</h2>
        </Col>
      </Row>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          Show{" "}
          <Select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            style={{ width: 70 }}
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>{" "}
          entries
        </Col>
        <Col>
          Search:{" "}
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 150 }}
          />
        </Col>
      </Row>
      <Table
        dataSource={filteredItems}
        columns={columns}
        rowKey="userId"
        loading={loading}
        pagination={{
          pageSize: entriesPerPage,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: "100%" }}
        bordered
      />

      <Modal
        title="Update Customer Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        confirmLoading={modalLoading}
      >
        {selectedItem && (
          <Form form={form} onFinish={handleUpdateItem} layout="vertical">
            <Form.Item
              label="Mobile Number"
              name="mobileNumber"
              rules={[
                { required: true, message: "Please update the mobile number!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Mobile number must be exactly 10 digits!",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>

            <Form.Item
              label="User Status"
              name="userStatus"
              rules={[
                { required: true, message: "Please select a user status!" },
              ]}
            >
              <Select>
                <Option value="CUSTOMER">CUSTOMER</Option>
                <Option value="SELLER">SELLER</Option>
                <Option value="DELIVERY BOY">DELIVERYBOY</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Update
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </AdminPanelLayoutTest>
  );
};

export default CustomerDetails;
