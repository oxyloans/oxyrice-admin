import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Spin,
  Button,
  Space,
  Select,
  Modal,
  TimePicker,
  Form,
  message,
  Popconfirm,
  Switch,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";
import AdminPanelLayoutTest from "../components/AdminPanel";

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
        `${BASE_URL}/order-service/fetchTimeSlotlist`,
      );
      const sortedData = response.data.sort(
        (a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek],
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
        slot1Status: values.slot1Status || false,
        slot2Status: values.slot2Status || false,
        slot3Status: values.slot3Status || false,
        slot4Status: values.slot4Status || false,
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
      dayOfWeek: record.dayOfWeek,
      isAvailable: record.isAvailable,
      timeSlot1Start: timeSlot1.start,
      timeSlot1End: timeSlot1.end,
      timeSlot2Start: timeSlot2.start,
      timeSlot2End: timeSlot2.end,
      timeSlot3Start: timeSlot3.start,
      timeSlot3End: timeSlot3.end,
      timeSlot4Start: timeSlot4.start,
      timeSlot4End: timeSlot4.end,
      slot1Status: record.slot1Status || false,
      slot2Status: record.slot2Status || false,
      slot3Status: record.slot3Status || false,
      slot4Status: record.slot4Status || false,
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
        slot1Status: values.slot1Status,
        slot2Status: values.slot2Status,
        slot3Status: values.slot3Status,
        slot4Status: values.slot4Status,
      };

      await axios.patch(
        `${BASE_URL}/order-service/timeSlotStatusChange`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
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

  // Helper function to render slot status tag
  const renderSlotStatus = (status) => {
    // false means active, true means inactive
    return (
      <Tag color={status ? "red" : "green"}>
        {status ? "Inactive" : "Active"}
      </Tag>
    );
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
      key: "timeSlot1Group",
      align: "center",
      render: (_, record) => (
        <div>
          <div>{record.timeSlot1 || "Not Set"}</div>
          {renderSlotStatus(record.slot1Status)}
        </div>
      ),
    },
    {
      title: "Time Slot 2",
      key: "timeSlot2Group",
      align: "center",
      render: (_, record) => (
        <div>
          <div>{record.timeSlot2 || "Not Set"}</div>
          {renderSlotStatus(record.slot2Status)}
        </div>
      ),
    },
    {
      title: "Time Slot 3",
      key: "timeSlot3Group",
      align: "center",
      render: (_, record) => (
        <div>
          <div>{record.timeSlot3 || "Not Set"}</div>
          {renderSlotStatus(record.slot3Status)}
        </div>
      ),
    },
    {
      title: "Time Slot 4",
      key: "timeSlot4Group",
      align: "center",
      render: (_, record) => (
        <div>
          <div>{record.timeSlot4 || "Not Set"}</div>
          {renderSlotStatus(record.slot4Status)}
        </div>
      ),
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
              <div key={slot} className="mb-4">
                <Form.Item label={`Time Slot ${slot}`}>
                  <div className="flex gap-2 mb-2">
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
                <Form.Item
                  name={`slot${slot}Status`}
                  label="Slot Status"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch
                    checkedChildren="Inactive"
                    unCheckedChildren="Active"
                  />
                </Form.Item>
              </div>
            ))}

            <Form.Item
              name="isAvailable"
              label="Day Availability"
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
              <div key={slot} className="mb-4">
                <Form.Item label={`Time Slot ${slot}`}>
                  <div className="flex gap-2 mb-2">
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
                <Form.Item
                  name={`slot${slot}Status`}
                  label="Slot Status"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Inactive"
                    unCheckedChildren="Active"
                  />
                </Form.Item>
              </div>
            ))}

            <Form.Item
              name="isAvailable"
              label="Day Availability"
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
