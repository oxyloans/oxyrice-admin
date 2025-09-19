import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Input,
  Row,
  Col,
  Select,
  Modal,
  Form,
  InputNumber,
  Button,
  Tag,
  message,
} from "antd";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const { Search } = Input;
const { Option } = Select;

const AssistantsList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("APPROVED");
  const [form] = Form.useForm();

  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  // Fetch Assistants
  const fetchAssistants = async (page, pageSize) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/ai-service/agent/getAllAssistants?limit=${pageSize}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const json = await res.json();
      const fetchedData = json.data || [];
      setData(fetchedData);
      setFilteredData(fetchedData);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: fetchedData.length,
      }));
    } catch (err) {
      console.error("Error fetching assistants:", err);
      message.error("Failed to load assistants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (newPagination) => {
    // If your API supports server pagination, you can refetch here.
    // For now, just update local pagination.
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  // LIVE search - filters as you type; clearing restores full list
  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredData(data);
      setPagination((prev) => ({ ...prev, current: 1, total: data.length }));
      return;
    }

    const filtered = data.filter((item) =>
      (item.name || "").toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    setPagination((prev) => ({ ...prev, current: 1, total: filtered.length }));
  };

  // Open Status Modal
  const openStatusModal = (assistant) => {
    setSelectedAssistant(assistant);
    setSelectedStatus("APPROVED");
    form.setFieldsValue({ status: "APPROVED", freetrails: 1 });
    setModalVisible(true);
  };

  // Handle Status Save
  const handleSaveStatus = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      const payload = {
        // keep the key as your backend expects (typo intentional if server needs it)
        assistanId: selectedAssistant.assistantId,
        userId,
        status: values.status,
        freetrails:
          values.status === "APPROVED" ? Number(values.freetrails) : 0,
      };

      const res = await fetch(
        `${BASE_URL}/ai-service/agent/assistanceApprove`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");
      message.success("Assistant status updated successfully!");
      setModalVisible(false);
      fetchAssistants(1, pagination.pageSize);
    } catch (err) {
      console.error(err);
      message.error("Error updating assistant status");
    }
  };

  const renderStatusTag = (statusRaw) => {
    const s = (statusRaw || "").toString().toUpperCase().trim();
    if (s === "APPROVED") return <Tag color="success">APPROVED</Tag>;
    if (s === "REQUESTED") return <Tag color="processing">REQUESTED</Tag>;
    if (s === "REJECTED") return <Tag color="error">REJECTED</Tag>;
    if (s === "DELETED" || s === "DELETD")
      return <Tag color="default">DELETED</Tag>;
    return <Tag>{statusRaw || "-"}</Tag>;
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      align: "center",
      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 80,
    },
    {
      title: "Assistant ID",
      dataIndex: "assistantId",
      key: "assistantId",
      align: "center",
      render: (id) => (id ? `#${id.slice(-4)}` : "-"),
      width: 120,
    },
    { title: "Name", dataIndex: "name", key: "name", align: "center" },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      align: "center",
      width: 140,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (text) => (
        <div
          style={{
            maxWidth: 400,
            textAlign: "center",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Instructions",
      dataIndex: "instructions",
      key: "instructions",
      align: "center",
      render: (text) => (
        <div
          style={{
            maxWidth: 400,
            textAlign: "center",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => renderStatusTag(status),
      width: 140,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_text, record) => (
        <Button
          type="primary"
          style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
          onClick={() => openStatusModal(record)}
        >
          Update Status
        </Button>
      ),
      width: 160,
    },
  ];

  return (
    <AgentsAdminLayout>
      <Card
        className="shadow-md rounded-lg"
        title={
          <Row justify="space-between" align="middle" style={{ width: "100%" }}>
            <Col>
              <h3 style={{ margin: 0, textAlign: "center" }}>
                Assistants List
              </h3>
            </Col>
            <Col>
              <Search
                placeholder="Search by Assistant Name"
                allowClear
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ width: 300 }}
              />
            </Col>
          </Row>
        }
      >
        <Table
          rowKey="assistantId"
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["50", "100", "200", "300"],
          }}
          onChange={handleTableChange}
          bordered
          scroll={{ x: true }}
        />

        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSaveStatus}
          title="Update Assistant Status"
          okText="Save"
          okButtonProps={{
            style: {
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            },
          }}
          cancelButtonProps={{
            style: {
              backgroundColor: "#f0f0f0",
              borderColor: "#d9d9d9",
              color: "#000",
            },
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                onChange={(value) => {
                  setSelectedStatus(value);
                  if (value !== "APPROVED") {
                    form.setFieldsValue({ freetrails: undefined });
                  } else {
                    form.setFieldsValue({ freetrails: 1 });
                  }
                }}
              >
                <Option value="APPROVED">APPROVED</Option>
                <Option value="REQUESTED">REQUESTED</Option>

                <Option value="REJECTED">REJECTED</Option>
                <Option value="DELETED">DELETED</Option>
              </Select>
            </Form.Item>

            {selectedStatus === "APPROVED" && (
              <Form.Item
                label="Free Trials"
                name="freetrails"
                rules={[
                
                  {
                    validator: (_, value) => {
                      if (value && Number(value) < 5) {
                        return Promise.reject(
                          new Error("Free trials must be at least 5")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1} // ✅ user can type from 1, but validator enforces >= 5
                  step={1}
                  precision={0} // ✅ integers only
                  placeholder="Enter minimum 5 free trials"
                  controls={false} // ✅ hides +/- buttons
                  parser={(value) => value?.replace(/\D/g, "") || ""} // ✅ strip non-numeric
                />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Card>
    </AgentsAdminLayout>
  );
};

export default AssistantsList;
