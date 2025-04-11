import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, DatePicker, Select, Button, Spin, message } from "antd";
import moment from "moment";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

const { Option } = Select;

const TaskManagementByDate = () => {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(moment());
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  const fetchTasksByDate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/user-service/write/get-task-by-date`,
        {
          specificDate: date.format("YYYY-MM-DD"),
          taskStatus: status,
        }
      );
      setTasks(response.data || []);
    } catch (err) {
      message.error("Failed to fetch tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksByDate();
  }, [date, status]);

  const columns = [
    {
      title: "Plan of the Day",
      dataIndex: "planOftheDay",
      key: "planOftheDay",
      align: "center",
    },
    {
      title: "Assigned To",
      dataIndex: "taskAssignTo",
      key: "taskAssignTo",
      align: "center",
    },
    {
      title: "Created At",
      dataIndex: "planCreatedAt",
        key: "planCreatedAt",
        align: "center",    
      render: (text) =>
        text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A",
    },
    {
      title: "Plan Status",
      dataIndex: "planStatus",
        key: "planStatus",
        align: "center",
    },
    {
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
        align: "center",
    },
    {
      title: "Status",
      dataIndex: "taskStatus",
        key: "taskStatus",
        align: "center",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded ${
            status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "End of Day Summary",
      dataIndex: "endOftheDay",
        key: "endOftheDay",
        align: "center",
      render: (text) => text || "N/A",
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Task Management by Date</h1>

        <div className="flex items-center gap-4 mb-4">
          <DatePicker value={date} onChange={(d) => setDate(d)} />
          <Select value={status} onChange={setStatus} style={{ width: 150 }}>
            <Option value="PENDING">Pending</Option>
            <Option value="COMPLETED">Completed</Option>
          </Select>
          <Button onClick={fetchTasksByDate} type="primary">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center mt-10">
            <Spin size="medium" />
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={tasks}
            columns={columns}
            bordered
                          pagination={{ pageSize: 5 }}
                          scroll={{ x: true }}
          />
        )}
      </div>
    </TaskAdminPanelLayout>
  );
};

export default TaskManagementByDate;
