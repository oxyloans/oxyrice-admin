import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Table, Button, Spin, Alert } from "antd";
import AdminPanelLayoutTest from "./AdminPanelTest";

const CategoryInventory = () => {
  // States for storing API data
  const [categoryData, setCategoryData] = useState([]); // Set to an empty array initially
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the data from the API
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
        console.log("API Response:", response.data); // Check the response structure
        setCategoryData(response.data); // Store the response data (array of categories)
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  // If data is still loading, show the loading spinner
  // if (loading) {
  //   return (
  //     <div style={{ textAlign: "center", padding: "50px" }}>
  //       <Spin size="large" tip="Loading data..." />
  //     </div>
  //   );
  // }

  // If there's an error, show an error message
  // if (error) {
  //   return (
  //     <div style={{ textAlign: "center", padding: "50px" }}>
  //       <Alert message={error} type="error" />
  //     </div>
  //   );
  // }

  // If there is no data available
  // if (categoryData.length === 0) {
  //   return (
  //     <div style={{ textAlign: "center", padding: "50px" }}>
  //       <Alert message="No categories available" type="info" />
  //     </div>
  //   );
  // }

  // Columns for Item Inventory Table
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
      render: (text) => text || "0", // Default to "N/A" if no data
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

  // Add Category Info as a row in the table
  const getCategoryTableData = () => {
    return categoryData.map((category) => {
      const categoryInfoRow = {
        key: category.catId,
        catName: category.catName,
        categoriesType: category.categoriesType,
        status: category.status ? "Active" : "Inactive",
        itemInventoryResponseList: category.itemInventoryResponseList, // Inventory items
      };
      return categoryInfoRow;
    });
  };

 return (
   <div>
     <AdminPanelLayoutTest>
       {loading ? (
         <div className="flex justify-center items-center h-full">
           <Spin />
         </div>
       ) : (
         categoryData.map((category) => (
           <Row gutter={16} className="mb-8" key={category.catId}>
             <Col xs={24}>
               {/* Render Category Info inside the Table */}
               <Table
                 columns={[
                   {
                     title: "Category Name",
                     dataIndex: "catName",
                     key: "catName",
                     render: (text) => <strong>{text}</strong>,
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
                   },
                 ]}
                 dataSource={[
                   {
                     catName: category.catName,
                     categoriesType: category.categoriesType,
                     status: category.status ? "Active" : "Inactive",
                   },
                 ]}
                 pagination={false}
                 showHeader={false}
                 rowKey="catId"
                 loading={loading}
                 bordered
                 scroll={{ x: "100%" }}
               />

               {/* Item Inventory Table for the Category */}
               <Table
                 columns={columns}
                 dataSource={category.itemInventoryResponseList}
                 rowKey="itemId"
                 pagination={{ pageSize: 5 }}
                 bordered
                 loading={loading}
                 scroll={{ x: "100%" }}
               />
             </Col>
           </Row>
         ))
       )}
     </AdminPanelLayoutTest>
   </div>
 );

};

export default CategoryInventory;
