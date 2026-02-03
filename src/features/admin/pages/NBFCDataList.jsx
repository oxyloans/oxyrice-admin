import React, { useEffect, useState, useCallback } from "react";
import { Table, Spin, Input, Row, Col } from "antd";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "../components/AdminPanel";
import debounce from "lodash/debounce"; // use lodash debounce

const { Search } = Input;

const NBFCDataList = () => {
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [searchText, setSearchText] = useState("");
  // Add a new state to store full unfiltered data
  const [originalData, setOriginalData] = useState([]);
  const fetchData = async (page = 1, size = 100, search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/marketing-service/campgin/nbfcdatalist`,
        {
          params: {
            page: page - 1,
            size,
          },
        },
      );

      const { data: fetchedData = [], totalItems = 0 } = response.data;

      setOriginalData(fetchedData); // Save the original data
      setData(fetchedData); // Set the filtered data (initially same)
      setTotalItems(totalItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
      setCurrentPage(1);

      const lowerCased = value.toLowerCase();

      const filtered = originalData.filter((item) => {
        return (
          item.nbfcName?.toLowerCase().includes(lowerCased) ||
          item.whether?.toLowerCase().includes(lowerCased) ||
          item.corporateIdentificationNumber?.toLowerCase().includes(lowerCased)
        );
      });

      setData(filtered);
    }, 500),
    [originalData],
  );

  const columns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      align: "center",
      width: 70,
      fixed: "left",
    },
    {
      title: "NBFC Name",
      dataIndex: "nbfcName",
      key: "nbfcName",
      align: "center",
      width: 200,
    },
    {
      title: "City",
      dataIndex: "whether",
      key: "whether",
      align: "center",
      width: 120,
    },
    // {
    //   title: "Classification",
    //   dataIndex: "classification",
    //   key: "classification",
    //   align: "center",
    //   width: 100,
    // },
    {
      title: "Layer",
      dataIndex: "corporateIdentificationNumber",
      key: "corporateIdentificationNumber",
      align: "center",
      width: 120,
    },
    {
      title: "CIN",
      dataIndex: "layer",
      key: "layer",
      align: "center",
      width: 120,
    },
    // {
    //   title: "Address",
    //   dataIndex: "address",
    //   key: "address",
    //   align: "center",
    //   width: 100,
    // },
    {
      title: "Address",
      dataIndex: "emailId",
      key: "emailId",
      align: "center",
      width: 250,
    },
    {
      title: "Email",
      dataIndex: "regionalOffice",
      key: "regionalOffice",
      align: "center",
      width: 200,
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div style={{ padding: 24 }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <h2 style={{ margin: 0 }}>NBFC Data Table</h2>
          </Col>
          <Col>
            <Search
              placeholder="Search NBFC Name, Layer, or City"
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalItems,
              showSizeChanger: true,
              pageSizeOptions: ["100", "200", "300", "400"],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 100);
              },
            }}
            bordered
            scroll={{ x: 1500 }}
          />
        </Spin>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default NBFCDataList;
