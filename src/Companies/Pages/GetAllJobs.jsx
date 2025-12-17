import React, { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Empty,
  Button,
  Tag,
  Avatar,
  Typography,
  message,
  Modal,
} from "antd";
import axios from "axios";
import CompaniesLayout from "../Components/CompaniesLayout";
import BASE_URL from "../../AdminPages/Config";
import {
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title } = Typography;
const { confirm } = Modal;

const GetAllJobs = () => {
  const [jobs, setJobs] = useState([]);
 
 const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(null);
 // Pagination
 const [page, setPage] = useState(0);
 const [pageSize, setPageSize] = useState(10);
 const [totalElements, setTotalElements] = useState(0);


useEffect(() => {
  fetchJobs(page, pageSize);
}, [page, pageSize]);
const fetchJobs = async (pg = 0, size = 10) => {
  try {
    setLoading(true);

    const res = await axios.get(
      `${BASE_URL}/marketing-service/campgin/getuserandallusersappliedjobs?page=${pg}&size=${size}`
    );

    const data = res.data;

    setJobs(data.content || []);
    setTotalElements(data.totalElements || 0);
    setPage(data.number || 0);
    setPageSize(data.size || 10);
  } catch (error) {
    console.error(error);
    message.error("Failed to load jobs");
  } finally {
    setLoading(false);
  }
};


  // ✅ Salary Format
  const formatSalary = (min, max) => {
    if (!min && !max) return "N/A";
    return `₹${min?.toLocaleString() || "0"} - ₹${max?.toLocaleString() || "0"}`;
  };

  // ✅ Date Format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Toggle Job Status
  const handleStatusToggle = (jobId, currentStatus) => {
    confirm({
      title: "Confirm Status Change",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ${
        currentStatus ? "deactivate" : "activate"
      } this job?`,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          setUpdateLoading(jobId);
          const response = await fetch(
            `${BASE_URL}/marketing-service/campgin/updatejobstatus`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: jobId,
                jobStatus: !currentStatus, // toggle
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update job status");
          }

          // ✅ Update state instantly
          setJobs((prevJobs) =>
            prevJobs.map((job) =>
              job.id === jobId ? { ...job, jobStatus: !currentStatus } : job
            )
          );

          message.success(
            `Job ${!currentStatus ? "activated" : "deactivated"} successfully`
          );
        } catch (error) {
          console.error("Error updating job status:", error);
          message.error("Failed to update job status. Please try again.");
        } finally {
          setUpdateLoading(null);
        }
      },
    });
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
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      align: "center",
      render: (jobTitle) => jobTitle || "N/A",
    },

    {
      title: "Cover Letter",
      dataIndex: "coverLetter",
      key: "coverLetter",
      align: "center",
      width: 200,
      render: (text) => (
        <div className="text-sm max-w-[200px] max-h-[120px] overflow-y-auto bg-gray-50 p-2 rounded">
          {text || "N/A"}
        </div>
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
      render: (date) => formatDate(date),
    },

    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      render: (date) => formatDate(date),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (val) =>
        val ? <Tag color="green">Active</Tag> : <Tag color="red">InActive</Tag>,
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
            My Job Postings
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

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="medium" tip="Loading jobs..." />
          </div>
        ) : jobs.length === 0 ? (
          <Empty description="No jobs posted yet." />
        ) : (
          <Table
            columns={columns}
            dataSource={jobs}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page + 1,
              pageSize: pageSize,
              total: totalElements,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`,
              onChange: (newPage, newSize) => {
                setPage(newPage - 1); // convert to 0-based for backend
                setPageSize(newSize);
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

export default GetAllJobs;
