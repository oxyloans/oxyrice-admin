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

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/marketing-service/campgin/getalljobsbyuserid`
      );
      setJobs(res.data || []);
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
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Company",
      dataIndex: "companyLogo",
      key: "company",
      width: 220,
      render: (logo, record) => (
        <div className="flex items-center space-x-2">
          <Avatar
            src={logo || undefined}
            alt={record.companyName || "Unknown"}
            size={40}
          >
            {(record.companyName || "U")[0].toUpperCase()}
          </Avatar>
          <div className="hidden md:block">
            <div className="font-medium text-sm">
              {record.companyName || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {record.industry || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Position",
      key: "position",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-sm mb-1">
            {record.jobTitle || "N/A"}
          </div>
          <div className="text-sm text-gray-600 mb-1">
            {record.jobDesignation || "N/A"}
          </div>
          <div className="flex flex-wrap gap-1">
            <Tag color="blue">{record.jobType || "N/A"}</Tag>
            <Tag color="green">{record.workMode || "N/A"}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Details",
      key: "details",
      width: 180,
      render: (_, record) => (
        <div className="text-sm space-y-1 break-words whitespace-normal">
          <div>
            <strong>Location:</strong> {record.jobLocations || "N/A"}
          </div>
          <div>
            <strong>Salary:</strong>{" "}
            {formatSalary(record.salaryMin, record.salaryMax)}
          </div>
          <div>
            <strong>Experience:</strong> {record.experience || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      width: 200,
      render: (skills) => (
        <div
          className="text-sm max-w-[200px] max-h-[100px] overflow-y-auto text-gray-700 p-2 bg-gray-50 rounded"
          title={skills || ""}
        >
          {skills || "N/A"}
        </div>
      ),
    },
    {
      title: "Company Details",
      key: "job_details",
      width: 240,
      render: (record) => (
        <div className="text-sm flex flex-col space-y-1 text-gray-700">
          {record.applicationDeadLine && (
            <div>
              <span className="font-semibold text-gray-900">Deadline: </span>
              {formatDate(record.applicationDeadLine)}
            </div>
          )}
          {record.companyEmail && (
            <div>
              <span className="font-semibold text-gray-900">Email: </span>
              {record.companyEmail}
            </div>
          )}
          {record.jobSource && (
            <div>
              <span className="font-semibold text-gray-900">Source: </span>
              {record.jobSource}
            </div>
          )}
          {(record.countryCode || record.contactNumber) && (
            <div>
              <span className="font-semibold text-gray-900">Contact: </span>
              {record.countryCode || ""} {record.contactNumber || "N/A"}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          {/* <Button
            type="primary"
            size="small"
            className="bg-[#008cba] hover:bg-[#007a9f] text-white rounded-md"
            icon={<EditOutlined />}
          >
            Update
          </Button> */}
          <Button
            size="small"
            loading={updateLoading === record.id}
            onClick={() => handleStatusToggle(record.id, record.jobStatus)}
            className={`rounded-md text-white ${
              record.jobStatus
                ? "bg-[#1ab394] hover:bg-[#008cba]"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {record.jobStatus ? "Active" : "Inactive"}
          </Button>
        </div>
      ),
    },
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
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            bordered
            className="max-w-7xl mx-auto"
          />
        )}
      </div>
    </CompaniesLayout>
  );
};

export default GetAllJobs;
