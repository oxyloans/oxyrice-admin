import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Spin,
  Empty,
  Image,
  Typography,
  message,
  Row,
  Col,
  Select,
  Input,
} from "antd";
import axios from "axios";
import CompaniesLayout from "../Components/CompaniesLayout";
import BASE_URL from "../../AdminPages/Config";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const API_URL = `${BASE_URL}/ai-service/agent/getNewsPapaerJobsPaoting`;

const NewsPapers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ toolbar states
  const [search, setSearch] = useState("");

  // ✅ table pagination states (antd is 1-based)
  const [pagination, setPagination] = useState({ current: 1, pageSize:50 });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const accessToken = localStorage.getItem("accessToken") || "";
        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const data = Array.isArray(res.data) ? res.data : [];

        // ✅ sort by date (latest first)
        const sorted = [...data].sort((a, b) => {
          const da =
            new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0;
          const db =
            new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0;
          return db - da;
        });

        setRows(sorted);
      } catch (err) {
        console.error(err);
        message.error("Failed to load News Paper Job Postings");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // ✅ filter (client-side)
  const filteredRows = useMemo(() => {
    const val = (search || "").trim().toLowerCase();
    if (!val) return rows;

    return rows.filter((r) =>
      String(r?.name || "")
        .toLowerCase()
        .includes(val)
    );
  }, [rows, search]);

  const total = filteredRows.length;

  const columns = [
    {
      title: "S.No.",
      key: "serial",
      align: "center",
     
      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    
    },
    {
      title: "News Paper Image",
      dataIndex: "image",
      key: "image",
      align: "center",
    
      render: (url) => (
        <div style={{ textAlign: "center" }}>
          <Image width={100} src={url} alt="news paper" />
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (createdAt) =>
        createdAt ? dayjs(createdAt).format("YYYY-MM-DD") : "N/A",
      sorter: (a, b) =>
        new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
        {/* ✅ Heading */}
        <div className="flex justify-between items-center mb-2 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            News Paper Job Postings
          </Title>
        </div>

        {/* ✅ ONE ROW: Show entries (left) + Search (right) */}
        <Row
          align="middle"
          justify="space-between"
          style={{
            marginBottom: 12,
            gap: 12,
            flexWrap: "wrap",
          }}
          className="max-w-7xl mx-auto"
        >
          {/* LEFT */}
          <Col xs={24} sm={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>Show</span>
              <Select
                value={pagination.pageSize}
                onChange={(value) =>
                  setPagination({ current: 1, pageSize: value })
                }
                style={{ width: 120 }}
              >
                {[50, 70, 80, 90, 100].map((num) => (
                  <Option key={num} value={num}>
                    {num}
                  </Option>
                ))}
              </Select>
              <span>entries</span>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="medium" tip="Loading NewsPapaer JobsPosting..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRows}
            rowKey={(record, idx) => `${idx}-${record?.name || "row"}`}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              showSizeChanger: false, // ✅ Select controls it
              showQuickJumper: true,
              showTotal: (t, range) =>
                `${range[0]}-${range[1]} of ${t} records`,
              onChange: (page) =>
                setPagination((p) => ({ ...p, current: page })),
            }}
            scroll={{ x: true }}
            bordered
            className="max-w-7xl mx-auto"
          />
        )}
      </div>
    </CompaniesLayout>
  );
};

export default NewsPapers;
