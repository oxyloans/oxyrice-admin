import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Pagination,
  Table,
  Modal,
  Row,
  Col,
  Spin,
  Select,
} from "antd";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelTest.jsx";
import { Link } from "react-router-dom";

const Sellers = () => {
  const [sellerDetails, setSellerDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSeller, setEditingSeller] = useState(null);
  const [form] = Form.useForm();
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSellers, setFilteredSellers] = useState([]);

  const accessToken = localStorage.getItem("accessToken");
  const { Option } = Select;

  // Fetch seller details on mount
  useEffect(() => {
    fetchSellerDetails();
  }, []);

  const staticData = [
    { storeName: "Oxyrice Store", sellerName: "Radhakrishna Rao" },
  ];

  const fetchSellerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyloans.com/api/erice-service/user/sellerData",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Data fetched successfully");
      setSellerDetails(response.data);
      setFilteredSellers(response.data);
    } catch (error) {
      message.error("Failed to fetch seller details");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      await axios.patch(
        "https://meta.oxyloans.com/api/erice-service/user/saveSellerDetails",
        {
          id: editingSeller.sellerId,
          ...values,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Seller details updated successfully");
      setEditingSeller(null);
      form.resetFields();
      fetchSellerDetails();
    } catch (error) {
      message.error("Failed to update seller details");
    }
  };

  const handleEdit = (seller) => {
    setEditingSeller(seller);
    form.setFieldsValue({
      sellerStoreName: seller.sellerStoreName,
      sellerName: seller.sellerName,
      sellerEmail: seller.sellerEmail,
      sellerMobile: seller.sellerMobile,
      sellerAddress: seller.sellerAddress,
      sellerLat: seller.sellerLat,
      sellerLng: seller.sellerLng,
      sellerRadious: seller.sellerRadious,
    });
  };

  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      title: "S.No",
      render: (_, __, index) => (currentPage - 1) * entriesPerPage + index + 1,
      align: "center",
    },
    {
      title: "Store Name",
      dataIndex: "sellerStoreName",
      key: "sellerStoreName",
      align: "center",
      render: (text) => text || "Oxyrice", // Default to "Oxyrice" if no value is provided
    },
    {
      title: "Seller Name",
      dataIndex: "sellerName",
      key: "sellerName",
      align: "center",
      render: (text) => text || "Radhakrishna", // Default to "Radhakrishna" if no value is provided
    },

    {
      title: "Email",
      dataIndex: "sellerEmail",
      key: "sellerEmail",
      align: "center",
    },
    // {
    //   title: "Mobile",
    //   dataIndex: "sellerMobile",
    //   key: "sellerMobile",
    //   align: "center",
    // },
    // {
    //   title: "Address",
    //   dataIndex: "sellerAddress",
    //   key: "sellerAddress",
    //   align: "center",
    // },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Row gutter={16} justify="center">
          {/* <Col>
            <Button
              onClick={() => handleEdit(record)}
              style={{
                backgroundColor: "#1AB394",
                color: "white",
                marginBottom: "16px",
              }}
            >
              Edit
            </Button>
          </Col> */}
          <Col>
            <Link to={`/admin/sellers-items/${record.sellerId}`}>
              <Button
                style={{
                  backgroundColor: "#1AB394",
                  color: "white",
                  marginBottom: "16px",
                }}
              >
                Items
              </Button>
            </Link>
          </Col>
        </Row>
      ),
    },
  ];
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Normalize and trim input
    setSearchTerm(value);

    if (value) {
      // Filter sellers based on the search term
      const filtered = sellerDetails.filter(
        (seller) =>
          seller.sellerStoreName?.toLowerCase().includes(value) || // Safe access with optional chaining
          seller.sellerName?.toLowerCase().includes(value) ||
          seller.sellerEmail?.toLowerCase().includes(value) ||
          seller.sellerMobile?.toLowerCase().includes(value) ||
          seller.sellerAddress?.toLowerCase().includes(value)
      );

      setFilteredSellers(filtered); // Update the filtered sellers
    } else {
      setFilteredSellers(sellerDetails); // Reset to all sellers when the search term is empty
    }
  };

  return (
    <AdminPanelLayout>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2 className="text-xl font-bold mb-2 sm:mb-0">Sellers List</h2>
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

      <div style={{ padding: "20px", marginTop: "20px" }}>
        {loading ? (
          <Spin
            tip="Loading seller details..."
            style={{ display: "block", margin: "auto", marginTop: "50px" }}
          />
        ) : (
          <>
            <Table
              dataSource={filteredSellers.slice(
                (currentPage - 1) * entriesPerPage,
                currentPage * entriesPerPage
              )}
              columns={columns}
              rowKey="sellerId"
              pagination={false}
              scroll={{ x: "max-content" }}
              bordered
            />
            <Row justify="end" className="mt-4">
              <Pagination
                current={currentPage}
                total={filteredSellers.length}
                pageSize={entriesPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </Row>

            <Modal
              title="Edit Seller Details"
              visible={!!editingSeller}
              onCancel={() => {
                setEditingSeller(null);
                form.resetFields();
              }}
              footer={null}
            >
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Store Name"
                      name="sellerStoreName"
                      rules={[
                        { required: true, message: "Please enter store name" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Seller Name"
                      name="sellerName"
                      rules={[
                        { required: true, message: "Please enter seller name" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="sellerEmail"
                      rules={[
                        { required: true, message: "Please enter email" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Mobile"
                      name="sellerMobile"
                      rules={[
                        {
                          required: true,
                          message: "Please enter mobile number",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Address"
                      name="sellerAddress"
                      rules={[
                        { required: true, message: "Please enter address" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Latitude" name="sellerLat">
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Longitude" name="sellerLng">
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Radius" name="sellerRadious">
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="center">
                  <Col>
                    <Button type="primary" htmlType="submit">
                      Update
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default Sellers;
