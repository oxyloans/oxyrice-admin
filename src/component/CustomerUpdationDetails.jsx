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
import AdminPanelLayout from "./AdminPanelLayout";
import { ExperimentOutlined, ExperimentFilled } from "@ant-design/icons";

const { Option } = Select;

const CustomerUpdationDetails = () => {
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
        "https://meta.oxyloans.com/api/erice-service/user/getAllUsers",
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
          "https://meta.oxyloans.com/api/erice-service/user/updateMobileNumber",
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
        "https://meta.oxyloans.com/api/erice-service/user/updateTestUsers",
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

  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value) {
      const filtered = customerData.filter(
        (item) =>
          item.userId.toString().toLowerCase().includes(value) ||
          item.mobileNumber?.toLowerCase().includes(value) ||
          item.primaryType?.toLowerCase().includes(value) ||
          item.status?.toString().toLowerCase().includes(value)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(customerData);
    }
  };

  const columns = [
    {
      title: "S.NO",
      render: (_, __, index) => index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    {
      title: "UserID",
      dataIndex: "userId",
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
      render: (testUser) => (testUser ? "True" : "False"),
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
            Edit
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
    <AdminPanelLayout>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2 className="text-xl font-bold">Customer Details Updation List</h2>
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
        dataSource={filteredItems.slice(
          (currentPage - 1) * entriesPerPage,
          currentPage * entriesPerPage
        )}
        columns={columns}
        rowKey="userId"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: entriesPerPage,
          total: filteredItems.length,
          onChange: setCurrentPage,
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
                { required: true, message: "Please input mobile number!" },
              ]}
            >
              <Input />
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
    </AdminPanelLayout>
  );
};

export default CustomerUpdationDetails;
