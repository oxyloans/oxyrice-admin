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
import { Link } from "react-router-dom";
import AdminPanelLayoutTest from "./AdminPanelTest";
import { MdModeEditOutline } from "react-icons/md";
import "../ItemList.css"; // Import custom CSS for responsive styling
import CategoryList from "./CategoryList";
const { Option } = Select;

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [form] = Form.useForm(); // Create a form instance
  const accessToken = localStorage.getItem("accessToken");
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    fetchItemsData();
  }, []);

  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyglobal.tech/api/product-service/getItemsData",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Data Fetched Successfully");

      // Filter data where quantity is 1 or 26
      const filteredData = response.data.filter(
        (item) => item.quantity === 1 || item.quantity === 26
      );

      // Sort to display items with quantity 26 first
      const sortedData = filteredData.sort((a, b) => b.quantity - a.quantity);
      setItems(sortedData);
      console.log(sortedData);
      setFilteredItems(response.data);
    } catch (error) {
      message.error("Error fetching items data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    setSelectedFile(e.target.files[0]);
  }
};

const handleUpdateItem = async (values) => {
  setLoading(true);
  if (selectedItem) {
    try {
      const formData = new FormData();

      // Append file if selected
      if (selectedFile) {
        formData.append("multiPart", selectedFile);
      }
      formData.append("fileType", "document");
      formData.append("itemName", values.itemName);
      formData.append("quantity", values.quantity || 0);
      formData.append("weight", values.weight || 0);
      formData.append("itemUnit", values.itemUnit);
      formData.append("itemDescription", values.itemDescription);
      formData.append("tag", values.tag);

      await axios.patch(
       `https://meta.oxyglobal.tech/api/product-service/UpdateItems?itemId=${selectedItem.itemId}`,

        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Item updated successfully");
      fetchItemsData();
      form.resetFields();
      setSelectedFile(null);
      document.getElementById("fileInput").value = ""; // Clear file input

      handleCancel();
    } catch (error) {
      message.error(
        "Error updating item: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  }
};


useEffect(() => {
  if (selectedItem) {
    form.setFieldsValue({
      itemName: selectedItem.itemName,
      quantity: selectedItem.quantity || "",
      weight: selectedItem.weight || "",
      itemUnit: selectedItem.units,
      tag: selectedItem.tag || "",
      itemDescription: selectedItem.itemDescription || "",
     
    });
  }
}, [selectedItem]);

  const handleViewGeneratedBarCodes = async (item) => {
    setLoading(true);
    try {
      const url =
        "https://meta.oxyglobal.tech/api/product-service/viewGeneratedBarCodes";

      const response = await axios.post(
        url,
        {
          catId: item.categoryId,
          itemId: item.itemId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data) {
        const downloadUrl = response.data; // The URL returned by the API

        // Create a link and trigger the download
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${item.itemName}.pdf`; // Set filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        message.success("Barcode file downloaded successfully!");
      } else {
        message.error("Failed to retrieve barcode download URL.");
      }
    } catch (error) {
      console.error("Error fetching barcodes:", error);
      message.error("Failed to retrieve barcodes.");
    } finally {
      setLoading(false);
    }
  };

  const handleToGenerateBarCodes = async (item) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://meta.oxyglobal.tech/api/product-service/generateBarCodes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            catId: item.categoryId,
            itemId: item.itemId,
          }),
        }
      );
      if (response.status === 500) {
        alert("All barcodes have already been generated up to 40");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch the file");
      }

      const blob = await response.blob(); // Convert response to a blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.itemName}.pdf`; // Set the filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up URL object
    } catch (error) {
      console.error("Error downloading the file:", error);
    } finally {
      setLoading(false);
    }
  };

  const showUpdateModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  // Pagination logic
  const paginatedCustomers = items.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
const columns = [
  {
    title: "S.NO",
    key: "serialNo",
    render: (text, record, index) =>
      index + 1 + (currentPage - 1) * entriesPerPage,
    align: "center",
    responsive: ["md"],
  },
  {
    title: "Item Name",
    dataIndex: "itemName",
    key: "itemName",
    align: "center",
  },
  {
    title: "Category Name",
    dataIndex: "categoryName",
    key: "categoryName",
    align: "center",
    responsive: ["md"],
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
  },
  {
    title: "Weight",
    dataIndex: "weight",
    key: "weight",
    align: "center",
  },
  {
    title: "Units",
    dataIndex: "units",
    key: "units",
    align: "center",
    responsive: ["md"],
  },
  {
    title: "Item Logo",
    dataIndex: "itemImage",
    key: "itemImage",
    align: "center",
    render: (text) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={text}
          alt="Item Logo"
          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 5 }}
        />
      </div>
    ),
  },
  {
    title: "Action",
    key: "action",
    align: "center",
    render: (text, item) => (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {/* Edit Button */}
        <Button
          onClick={() => showUpdateModal(item)}
          style={{
            backgroundColor: "#008CBA",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}
          disabled={loading}
        >
          Edit
        </Button>

        {/* Barcode Information Button */}
        <Button
          style={{
            backgroundColor: "#1AB394",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}
          disabled={loading}
        >
          <Link
            to={`/admin/allinformationofbarcode/${item.itemId}`}
            style={{ color: "white", textDecoration: "none" }}
          >
            Barcode Info
          </Link>
        </Button>

        {/* View Bar Codes Button */}
        <Button
          type="primary"
          onClick={() => handleViewGeneratedBarCodes(item)}
          style={{
            backgroundColor: "#008CBA",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}
          disabled={loading}
        >
          View Bar Codes
        </Button>

        {/* Generate Bar Codes Button */}
        <Button
          type="primary"
          onClick={() => handleToGenerateBarCodes(item)}
          style={{
            backgroundColor: "#1AB394",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}
          disabled={loading}
        >
          Generate Bar Codes
        </Button>
      </div>
    ),
  },
];


  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Normalize and trim input
    setSearchTerm(value);

    if (value) {
      // Filter items based on the search term
      const filtered = items.filter(
        (item) =>
          item.itemName?.toLowerCase().includes(value) || // Safe access with optional chaining
          item.categoryName?.toLowerCase().includes(value) ||
          item.quantity?.toString().toLowerCase().includes(value) ||
          item.Units?.toLowerCase().includes(value)
      );

      setFilteredItems(filtered); // Update the filtered items
    } else {
      setFilteredItems(items); // Reset to all items when search term is empty
    }
  };

  return (
    <AdminPanelLayoutTest>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2 className="text-xl font-bold mb-2 sm:mb-0">Items List</h2>
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
        rowKey="itemId"
        loading={loading}
        pagination={{
          pageSize: entriesPerPage,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: "100%" }} // Enables horizontal scroll on smaller screens
        bordered
      />
      <Modal
        title="Update Item"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="responsive-modal"
      >
        {selectedItem && (
          <Form form={form} onFinish={handleUpdateItem} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Name"
                  name="itemName"
                  // rules={[
                  //   { required: true, message: "Please input the item name!" },
                  // ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Quantity"
                  name="quantity"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please input the item quantity!",
                  //   },
                  // ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Weight"
                  name="weight"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please input the item weight!",
                  //   },
                  // ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Unit"
                  name="itemUnit"
                  // rules={[
                  //   { required: true, message: "Please input the item unit!" },
                  // ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Description"
                  name="itemDescription"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please input the item description!",
                  //   },
                  // ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Tags"
                  name="tag"
                  // rules={[
                  //   { required: true, message: "Please input the item tags!" },
                  // ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              {/* File Upload */}
              <Col xs={24} sm={12}>
                <Form.Item label="Upload File" name="multiPart">
                  <Input type="file" onChange={handleFileChange} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  marginRight: "8px",
                  backgroundColor: "#1C84C6",
                  color: "white",
                }}
                disabled={loading}
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </AdminPanelLayoutTest>
  );
};

export default ItemList;
