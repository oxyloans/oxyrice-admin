import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Input, message, Spin, Modal, Form } from "antd";
import axios from "axios";
import debounce from "lodash/debounce";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingAuthorizedBy, setEditingAuthorizedBy] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newAuthorizedBy, setNewAuthorizedBy] = useState("");

  const token = localStorage.getItem("token");

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/ai-service/agent/getAllAgentApproved`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // API returns array directly
      setAgents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to fetch agents");
      console.error("Fetch agents error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Save agent (update or create)
  const saveAgent = async (id, authorizedBy) => {
    if (!authorizedBy.trim()) {
      message.error("Authorized By field cannot be empty");
      return;
    }
    setLoading(true);
    try {
      if (id) {
        // Update existing
        await axios.patch(
          `${BASE_URL}/ai-service/agent/agentApprovedName`,
          { id, authorizedBy },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Agent updated successfully");
      } else {
        // Create new
        await axios.patch(
          `${BASE_URL}/ai-service/agent/agentApprovedName`,
          { id, authorizedBy },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Agent created successfully");
      }
      fetchAgents();
      setEditingId(null);
      setEditingAuthorizedBy("");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save agent");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSetAuthorizedBy = useCallback(
    debounce((value) => setEditingAuthorizedBy(value), 300),
    []
  );

  useEffect(() => {
    if (token) {
      fetchAgents();
    } else {
      message.error("No authorization token found. Please log in.");
    }
  }, [fetchAgents, token]);

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditingAuthorizedBy(record.authorizedBy);
  };

  const handleSave = (id) => {
    saveAgent(id, editingAuthorizedBy);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingAuthorizedBy("");
  };

  // Modal handlers
  const openModal = () => {
    setNewAuthorizedBy("");
    setIsModalVisible(true);
  };
  const handleModalOk = () => {
    saveAgent(null, newAuthorizedBy);
    setIsModalVisible(false);
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Authorized By",
      dataIndex: "authorizedBy",
      key: "authorizedBy",
      align: "center",
      render: (text, record) => {
        if (editingId === record.id) {
          return (
            <Input
              value={editingAuthorizedBy}
              onChange={(e) => debouncedSetAuthorizedBy(e.target.value)}
              onPressEnter={() => handleSave(record.id)}
              maxLength={100}
            />
          );
        }
        return text || "N/A";
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) =>
        editingId === record.id ? (
          <>
            <Button
              onClick={() => handleSave(record.id)}
              style={{
                backgroundColor: "#008cba",
                borderColor: "#008cba",
                color: "#fff",
                marginRight: 8,
              }}
            >
              Save
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </>
        ) : (
          <Button
            onClick={() => handleEdit(record)}
            style={{
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            }}
          >
            Edit
          </Button>
        ),
    },
  ];

  return (
    <AgentsAdminLayout>
      <div style={{ padding: "20px" }}>
        {/* Header with Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2>Authorized Users Management</h2>
          <Button
            style={{
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            }}
            onClick={openModal}
          >
            + Add Authorized User
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            dataSource={agents}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
          />
        </Spin>

        {/* Modal for Adding New User */}
        <Modal
          title="Add Authorized User"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="Save"
          okButtonProps={{
            style: {
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            },
          }}
        >
          <Form layout="vertical">
            <Form.Item label="Authorized By" required>
              <Input
                placeholder="Enter authorized user name"
                value={newAuthorizedBy}
                onChange={(e) => setNewAuthorizedBy(e.target.value)}
                maxLength={100}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AgentsAdminLayout>
  );
};

export default AgentManagement;
