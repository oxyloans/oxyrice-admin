import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spin, Alert, Tag } from "antd";
import AdminPanelLayoutTest from "../components/AdminPanel";
import BASE_URL from "./Config";
const CategoryInventory = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default 10

  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/product-service/getActiveCategoryInventory`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        setCategoryData(response.data);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const columns = [
    {
      title: "S.No.",
      key: "serial",
      render: (_, __, index) => (currentPage - 1) * pageSize + (index + 1),
      align: "center",
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      render: (text) => <strong>{text}</strong>,
      align: "center",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (text) => (
        <div
          style={{
            textAlign: "center",
            display: "-webkit-box",
            maxWidth: 300,
            WebkitBoxOrient: "vertical",
            maxHeight: 120, // limit height
            overflowX: "auto", // horizontal scroll
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Unit",
      dataIndex: "itemUnit",
      key: "itemUnit",
      align: "center",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      align: "center",
    },
    {
      title: "Total Quantity",
      dataIndex: "totalItemQty",
      key: "totalItemQty",
      render: (text) => text || "0",
      align: "center",
    },
    {
      title: "Available Count",
      dataIndex: "availableCount",
      key: "availableCount",
      render: (text) => text || "0",
      align: "center",
    },
    {
      title: "Sold Count",
      dataIndex: "soldCount",
      key: "soldCount",
      render: (text) => text || "0",
      align: "center",
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div className="p-4 w-full max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="medium" tip="Loading data..." />
          </div>
        ) : error ? (
          <Alert message={error} type="error" className="text-center" />
        ) : categoryData.length === 0 ? (
          <Alert
            message="No categories available"
            type="info"
            className="text-center"
          />
        ) : (
          categoryData.map((category) => (
            <div
              key={category.catId}
              className="mb-8 bg-white shadow-md p-4 rounded-lg"
            >
              <Table
                columns={[
                  {
                    title: "S.No.",
                    key: "serial",
                    render: (_, __, index) =>
                      (currentPage - 1) * pageSize + (index + 1),
                    align: "center",
                  },
                  {
                    title: "Category Name",
                    dataIndex: "catName",
                    key: "catName",
                    align: "center",
                  },
                  {
                    title: "Category Type",
                    dataIndex: "categoriesType",
                    key: "categoriesType",
                    align: "center",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    align: "center",
                    render: (status) => (
                      <Tag color={status ? "green" : "red"}>
                        {status ? "Active" : "Inactive"}
                      </Tag>
                    ),
                  },
                ]}
                dataSource={[
                  {
                    catName: category.catName,
                    categoriesType: category.categoriesType,
                    status: category.status,
                  },
                ]}
                pagination={false}
                showHeader={false}
                scroll={{ x: true }}
                rowKey="catId"
                bordered
                className="mb-4"
              />

              <Table
                columns={columns}
                dataSource={category.itemInventoryResponseList}
                rowKey="itemId"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: category.itemInventoryResponseList.length,
                  showSizeChanger: false, // ✅ because your Select is the page size changer
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} items`,
                  onChange: (page) => setCurrentPage(page),
                }}
                bordered
                scroll={{ x: "100%" }}
              />
            </div>
          ))
        )}
      </div>
    </AdminPanelLayoutTest>
  );
};

export default CategoryInventory;
