import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spin, Alert, Tag } from "antd";
import AdminPanelLayoutTest from "../components/AdminPanel";
import BASE_URL from "../../../core/config/Config";

const CategoryInventory = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ per-category pagination state (so each category table keeps its own page)
  const [pageState, setPageState] = useState({}); // { [catId]: { current: 1, pageSize: 10 } }

  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/product-service/getActiveCategoryInventory`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        const data = response.data || [];
        setCategoryData(data);

        // ✅ init pagination state for each category
        const init = {};
        data.forEach((c) => {
          init[c.catId] = { current: 1, pageSize: 10 };
        });
        setPageState(init);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const itemColumns = (catId) => {
    const currentPage = pageState[catId]?.current || 1;
    const pageSize = pageState[catId]?.pageSize || 10;

    return [
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
              maxHeight: 120,
              overflowX: "auto",
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
  };

  return (
    <AdminPanelLayoutTest>
      <div className="p-4 w-full max-w-7xl mx-auto">
        {loading ? (
          // ✅ Spin tip fixed (nested)
          <div className="flex justify-center items-center">
            <Spin tip="Loading data...">
              <div style={{ minHeight: 160, minWidth: 240 }} />
            </Spin>
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
          categoryData.map((category) => {
            const catId = category.catId;
            const currentPage = pageState[catId]?.current || 1;
            const pageSize = pageState[catId]?.pageSize || 10;

            return (
              <div
                key={catId}
                className="mb-8 bg-white shadow-md p-4 rounded-lg"
              >
                {/* ✅ Category header table */}
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
                      render: (status) => (
                        <Tag color={status ? "green" : "red"}>
                          {status ? "Active" : "Inactive"}
                        </Tag>
                      ),
                    },
                  ]}
                  // ✅ IMPORTANT: include catId so rowKey works
                  dataSource={[
                    {
                      catId: category.catId,
                      catName: category.catName,
                      categoriesType: category.categoriesType,
                      status: category.status,
                    },
                  ]}
                  rowKey={(row) => row.catId} // ✅ FIXED key warning
                  pagination={false}
                  showHeader={false}
                  scroll={{ x: true }}
                  bordered
                  className="mb-4"
                />

                {/* ✅ Items table */}
                <Table
                  columns={itemColumns(catId)}
                  dataSource={category.itemInventoryResponseList || []}
                  // ✅ safer rowKey in case itemId is missing/duplicate
                  rowKey={(row, idx) => row.itemId || `${catId}-${idx}`}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: (category.itemInventoryResponseList || []).length,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showQuickJumper: true,
                    showTotal: (total) => `Total ${total} items`,
                    onChange: (page, size) => {
                      setPageState((prev) => ({
                        ...prev,
                        [catId]: { current: page, pageSize: size },
                      }));
                    },
                  }}
                  bordered
                  scroll={{ x: "100%" }}
                />
              </div>
            );
          })
        )}
      </div>
    </AdminPanelLayoutTest>
  );
};

export default CategoryInventory;
