import React, { useEffect, useMemo, useState } from "react";
import { Table, Spin, Empty, Image, Typography, message } from "antd";
import axios from "axios";
import CompaniesLayout from "../Components/CompaniesLayout";
import BASE_URL from "../../AdminPages/Config";
const { Title } = Typography;

const API_URL =
  `${BASE_URL}/ai-service/agent/getNewsPapaerJobsPaoting`;

// ✅ date formatter (supports "YYYY-MM-DD HH:mm:ss.SSS")
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  // Convert "2025-12-19 11:38:30.539" -> "2025-12-19T11:38:30.539"
  const iso = String(dateString).replace(" ", "T");
  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return dateString; // fallback raw

  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NewsPapers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ client-side pagination
  const [page, setPage] = useState(1); // antd is 1-based
  const [pageSize, setPageSize] = useState(20);

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
        return db - da; // latest first
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

  const total = rows.length;

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
  }, [rows, page, pageSize]);

  const columns = [
    {
      title: "S.No.",
      key: "serial",
      align: "center",
      width: 90,
      render: (_text, _record, index) => (page - 1) * pageSize + index + 1,
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (val) => val || "N/A",
    },
    {
      title: "New Paper Image",
      dataIndex: "image",
      key: "image",
      align: "center",
      width: 110,
      render: (url) => (
        <div style={{ textAlign: "center" }}>
          {" "}
          <Image width={100} src={url} alt="company logo" />{" "}
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (val) => formatDate(val),
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            News Paper Job Postings
          </Title>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" tip="Loading..." />
          </div>
        ) : total === 0 ? (
          <div className="max-w-7xl mx-auto">
            <Empty description="No postings found." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={pagedRows}
            rowKey={(record, idx) => `${idx}-${record?.name || "row"}`}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t, range) =>
                `${range[0]}-${range[1]} of ${t} records`,
              onChange: (newPage, newSize) => {
                setPage(newPage);
                setPageSize(newSize || 10);
              },
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
