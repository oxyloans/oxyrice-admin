import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Spin,
  Button,
  Space,
  Select,
  Input,
  Modal,
  TimePicker,
  Form,
  message,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "./Config";
import dayjs from "dayjs";
import AdminPanelLayoutTest from "./AdminPanelTest";

const { Option } = Select;
const dayOrder = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/fetchTimeSlotlist`
      );
      const sortedData = response.data.sort(
        (a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]
      );
      setTimeSlots(sortedData);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    } finally {
      setLoading(false);
    }
  };

  // Parse time slot string to dayjs object
  const parseTimeSlot = (timeSlotStr) => {
    if (!timeSlotStr) return { start: null, end: null };

    const parts = timeSlotStr.split(" - ");
    if (parts.length !== 2) return { start: null, end: null };

    return {
      start: dayjs(parts[0], "hh:mm A"),
      end: dayjs(parts[1], "hh:mm A"),
    };
  };

  // Handle Add New Time Slot
  const handleAddTimeSlot = async (values) => {
    try {
      const formatTimeSlot = (start, end) =>
        start && end
          ? `${start.format("hh:mm A")} - ${end.format("hh:mm A")}`
          : "";

      const payload = {
        dayOfWeek: values.dayOfWeek,
        isAvailable: values.isAvailable,
        timeSlot1: formatTimeSlot(values.timeSlot1Start, values.timeSlot1End),
        timeSlot2: formatTimeSlot(values.timeSlot2Start, values.timeSlot2End),
        timeSlot3: formatTimeSlot(values.timeSlot3Start, values.timeSlot3End),
        timeSlot4: formatTimeSlot(values.timeSlot4Start, values.timeSlot4End),
      };

      await axios.post(`${BASE_URL}/order-service/add`, payload);
      message.success("Time Slot added successfully!");
      fetchTimeSlots();
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding time slot:", error);
      message.error("Failed to add time slot.");
    }
  };

  // Handle Delete with API integration
  const handleDelete = async (id) => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${BASE_URL}/order-service/deleteSlot`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: { id },
      });

      message.success("Time slot deleted successfully!");
      fetchTimeSlots(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting time slot:", error);
      message.error("Failed to delete time slot. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Update with API integration
  const handleUpdate = (record) => {
    setCurrentTimeSlot(record);

    // Parse time slots to prepare form initial values
    const timeSlot1 = parseTimeSlot(record.timeSlot1);
    const timeSlot2 = parseTimeSlot(record.timeSlot2);
    const timeSlot3 = parseTimeSlot(record.timeSlot3);
    const timeSlot4 = parseTimeSlot(record.timeSlot4);

    // Set initial values for the edit form
    editForm.setFieldsValue({
      dayOfWeek: record.dayOfWeek.toUpperCase(),
      isAvailable: record.isAvailable,
      timeSlot1Start: timeSlot1.start,
      timeSlot1End: timeSlot1.end,
      timeSlot2Start: timeSlot2.start,
      timeSlot2End: timeSlot2.end,
      timeSlot3Start: timeSlot3.start,
      timeSlot3End: timeSlot3.end,
      timeSlot4Start: timeSlot4.start,
      timeSlot4End: timeSlot4.end,
    });

    setIsEditModalOpen(true);
  };

  // Handle form submission for update
  const handleUpdateSubmit = async (values) => {
    try {
      setUpdateLoading(true);

      const formatTimeSlot = (start, end) =>
        start && end
          ? `${start.format("hh:mm A")} - ${end.format("hh:mm A")}`
          : "";

      const payload = {
        id: currentTimeSlot.id,
        dayOfWeek: values.dayOfWeek,
        isAvailable: values.isAvailable,
        timeSlot1: formatTimeSlot(values.timeSlot1Start, values.timeSlot1End),
        timeSlot2: formatTimeSlot(values.timeSlot2Start, values.timeSlot2End),
        timeSlot3: formatTimeSlot(values.timeSlot3Start, values.timeSlot3End),
        timeSlot4: formatTimeSlot(values.timeSlot4Start, values.timeSlot4End),
      };

      await axios.patch(
        `${BASE_URL}/order-service/timeSlotStatusChange`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      message.success("Time slot updated successfully!");
      fetchTimeSlots(); // Refresh the list after update
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating time slot:", error);
      message.error("Failed to update time slot. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const columns = [
    {
      title: "Day",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      align: "center",
    },
    {
      title: "Time Slot 1",
      dataIndex: "timeSlot1",
      key: "timeSlot1",
      align: "center",
    },
    {
      title: "Time Slot 2",
      dataIndex: "timeSlot2",
      key: "timeSlot2",
      align: "center",
    },
    {
      title: "Time Slot 3",
      dataIndex: "timeSlot3",
      key: "timeSlot3",
      align: "center",
    },
    {
      title: "Time Slot 4",
      dataIndex: "timeSlot4",
      key: "timeSlot4",
      align: "center",
    },
    {
      title: "Availability",
      dataIndex: "isAvailable",
      key: "isAvailable",
      align: "center",
      render: (isAvailable) => (
        <Tag color={isAvailable ? "red" : "green"}>
          {isAvailable ? "Not Available" : "Available"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            style={{ color: "#008CBA" }}
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this time slot?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: deleteLoading }}
          >
            <Button type="default" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div className="p-4">
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
            padding: "0 8px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: "0",
            }}
          >
            Time Slots Management
          </h2>

          <Button
            type="primary"
            style={{
              backgroundColor: "#008CBA",
              border: "none",
              display: "flex",
              alignItems: "center",
            }}
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Time Slot
          </Button>
        </div>

        {/* Table Section */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "150px",
            }}
          >
            <Spin size="medium" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={timeSlots}
            rowKey="id"
            scroll={{ x: "100%" }}
            bordered
          />
        )}

        {/* Add Time Slot Modal */}
        <Modal
          title="Add New Time Slot"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddTimeSlot}>
            <Form.Item
              label="Day of Week"
              name="dayOfWeek"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select Day">
                <Option value="MONDAY">Monday</Option>
                <Option value="TUESDAY">Tuesday</Option>
                <Option value="WEDNESDAY">Wednesday</Option>
                <Option value="THURSDAY">Thursday</Option>
                <Option value="FRIDAY">Friday</Option>
                <Option value="SATURDAY">Saturday</Option>
                <Option value="SUNDAY">Sunday</Option>
              </Select>
            </Form.Item>

            {[1, 2, 3, 4].map((slot) => (
              <Form.Item key={slot} label={`Time Slot ${slot}`}>
                <div className="flex gap-2">
                  <Form.Item name={`timeSlot${slot}Start`} noStyle>
                    <TimePicker
                      format="hh:mm A"
                      use12Hours
                      placeholder="Start Time"
                    />
                  </Form.Item>
                  <span> - </span>
                  <Form.Item name={`timeSlot${slot}End`} noStyle>
                    <TimePicker
                      format="hh:mm A"
                      use12Hours
                      placeholder="End Time"
                    />
                  </Form.Item>
                </div>
              </Form.Item>
            ))}
            <Form.Item
              name="isAvailable"
              label="Availability"
              rules={[
                { required: true, message: "Please select availability!" },
              ]}
            >
              <Select placeholder="Select availability">
                <Option value={false}>Available</Option>
                <Option value={true}>Not Available</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Save Time Slot
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Time Slot Modal */}
        <Modal
          title="Edit Time Slot"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdateSubmit}>
            <Form.Item
              label="Day of Week"
              name="dayOfWeek"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select Day">
                <Option value="MONDAY">Monday</Option>
                <Option value="TUESDAY">Tuesday</Option>
                <Option value="WEDNESDAY">Wednesday</Option>
                <Option value="THURSDAY">Thursday</Option>
                <Option value="FRIDAY">Friday</Option>
                <Option value="SATURDAY">Saturday</Option>
                <Option value="SUNDAY">Sunday</Option>
              </Select>
            </Form.Item>

            {[1, 2, 3, 4].map((slot) => (
              <Form.Item key={slot} label={`Time Slot ${slot}`}>
                <div className="flex gap-2">
                  <Form.Item name={`timeSlot${slot}Start`} noStyle>
                    <TimePicker
                      format="hh:mm A"
                      use12Hours
                      placeholder="Start Time"
                    />
                  </Form.Item>
                  <span> - </span>
                  <Form.Item name={`timeSlot${slot}End`} noStyle>
                    <TimePicker
                      format="hh:mm A"
                      use12Hours
                      placeholder="End Time"
                    />
                  </Form.Item>
                </div>
              </Form.Item>
            ))}
            <Form.Item
              name="isAvailable"
              label="Availability"
              rules={[
                { required: true, message: "Please select availability!" },
              ]}
            >
              <Select placeholder="Select availability">
                <Option value={false}>Available</Option>
                <Option value={true}>Not Available</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={updateLoading}
              >
                Update Time Slot
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default TimeSlots;
