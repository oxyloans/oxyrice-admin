import React, { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Empty,
  Button,
  Typography,
  message,
  Modal,
  Select,
  Input,
  Space,
} from "antd";
import axios from "axios";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";
import {
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title } = Typography;
const { Option } = Select;

const GetAllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  // Pagination (server-side)
  const [page, setPage] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Search (client-side on current page)
  const [searchText, setSearchText] = useState("");

  const [openCover, setOpenCover] = useState(false);
  const [coverText, setCoverText] = useState("");

  useEffect(() => {
    fetchJobs(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const openCoverLetter = (text) => {
    setCoverText(text || "");
    setOpenCover(true);
  };

  const fetchJobs = async (pg = 0, size = 20) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/marketing-service/campgin/getuserandallusersappliedjobs?page=${pg}&size=${size}`
      );

      const data = res.data;

      const list = data?.content || [];
      setJobs(list);
      setFilteredJobs(list); // reset filtered for current page
      setTotalElements(data?.totalElements || 0);
      setPage(data?.number ?? pg);
      setPageSize(data?.size ?? size);

      // keep search consistent after refetch
      if (searchText) {
        applySearch(searchText, list);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (value, sourceList = jobs) => {
    const val = (value || "").trim().toLowerCase();
    if (!val) {
      setFilteredJobs(sourceList);
      return;
    }

    const filtered = (sourceList || []).filter((item) => {
      return (
        String(item?.userName || "")
          .toLowerCase()
          .includes(val) ||
        String(item?.jobTitle || "")
          .toLowerCase()
          .includes(val) ||
        String(item?.mobileNumber || "")
          .toLowerCase()
          .includes(val)
      );
    });

    setFilteredJobs(filtered);
  };

  // ✅ Columns
  const columns = [
    {
      title: "S.No.",
      key: "serial",
      align: "center",
      width: 80,
      render: (_text, _record, index) => page * pageSize + index + 1,
    },
    {
      title: "Name",
      dataIndex: "userName",
      key: "userName",
      align: "center",
      render: (userName) => userName || "N/A",
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      align: "center",
      render: (jobTitle) => jobTitle || "N/A",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber1",
      align: "center",
      render: (mobileNumber) => mobileNumber || "N/A",
    },

   {
        title: "Cover Letter",
        dataIndex: "coverLetter",
        key: "coverLetter",
        align: "center",
        responsive: ["md"],
        render: (text) => (
          <Button
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => openCoverLetter(text)}
          >
            View
          </Button>
        ),
      },

    {
      title: "Notice Period",
      dataIndex: "noticePeriod",
      key: "noticePeriod",
      align: "center",
      render: (text) => text || "N/A",
    },

    {
      title: "Resume",
      dataIndex: "resumeUrl",
      key: "resumeUrl",
      align: "center",
      render: (url) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View Resume
          </a>
        ) : (
          "N/A"
        ),
    },

    {
      title: "Applied Date",
      dataIndex: "appliedAt",
      key: "appliedAt",
      align: "center",
      render: (createdAt) => dayjs(createdAt).format("YYYY-MM-DD"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },

  

    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 140,
    //   render: (_, record) => (
    //     <div className="flex flex-col gap-2">
    //       <Button
    //         size="small"
    //         loading={updateLoading === record.id}
    //         onClick={() => handleStatusToggle(record.id, record.jobStatus)}
    //         className={`rounded-md text-white ${
    //           record.jobStatus
    //             ? "bg-[#1ab394] hover:bg-[#008cba]"
    //             : "bg-red-600 hover:bg-red-700"
    //         }`}
    //       >
    //         {record.jobStatus ? "Active" : "Inactive"}
    //       </Button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            All Users' Applied Jobs
          </Title>
          <Button
            style={{
              backgroundColor: "#008cba",
              color: "#f7f7f7",
              borderColor: "#008cba",
            }}
            icon={<PlusOutlined />}
            href="/admin/jobsmanage"
          >
            Add Job
          </Button>
        </div>

        {/* ✅ Top bar: Show entries + Search */}
        <div
          className="max-w-7xl mx-auto"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Show</span>
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setPage(0); // ✅ reset page
              }}
              style={{ width: 110 }}
            >
              {[20, 30, 40, 50].map((num) => (
                <Option key={num} value={num}>
                  {num}
                </Option>
              ))}
            </Select>
            <span>entries</span>
          </div>

          <Input
            placeholder="Search name / job title / mobile"
            value={searchText}
            allowClear
            prefix={<SearchOutlined />}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              applySearch(value, jobs);
            }}
            style={{ width: 300, maxWidth: "100%" }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="medium" tip="Loading jobs..." />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Empty description="No jobs found." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredJobs}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page + 1, // table is 1-based
              pageSize: pageSize,
              total: totalElements,
              showSizeChanger: false, // ✅ Select controls size
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`,
              onChange: (newPage) => {
                setPage(newPage - 1); // backend is 0-based
              },
            }}
            scroll={{ x: true }}
            bordered
            className="max-w-7xl mx-auto"
          />
        )}

        {/* Cover Letter Modal */}
        <Modal
          title="Cover Letter"
          open={openCover}
          onCancel={() => setOpenCover(false)}
          footer={[
            <Button key="close" onClick={() => setOpenCover(false)}>
              Close
            </Button>,
          ]}
        >
          <div className="max-h-[50vh] overflow-auto whitespace-pre-wrap text-sm text-slate-700">
            {coverText || "N/A"}
          </div>
        </Modal>
      </div>
    </CompaniesLayout>
  );
};

export default GetAllJobs;
