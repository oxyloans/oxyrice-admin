import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spin, Alert } from "antd";
import AdminPanelLayoutTest from "./AdminPanelTest";

const CategoryInventory = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://meta.oxyglobal.tech/api/product-service/getActiveCategoryInventory",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
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
    },
    {
      title: "Unit",
      dataIndex: "itemUnit",
      key: "itemUnit",
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
      render: (text) => text || "N/A",
      align: "center",
    },
    {
      title: "Sold Count",
      dataIndex: "soldCount",
      key: "soldCount",
      render: (text) => text || "N/A",
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
                    render: (status) => (status ? "Active" : "Inactive"),
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
                pagination={{ pageSize: 5 }}
                bordered
                scroll={{ x: true }}
              />
            </div>
          ))
        )}
      </div>
    </AdminPanelLayoutTest>
  );
};

export default CategoryInventory;
