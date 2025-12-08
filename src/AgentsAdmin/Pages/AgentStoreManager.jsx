import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Form,
  message,
  Switch,
  Checkbox,
  Space,
  Tag,
  Empty,
  Spin,
  Image,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";
import BASE_URL from "../../AdminPages/Config";

const PAGE_SIZE = 100;

const AgentStoreManager = () => {
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [lastId, setLastId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isStoreModal, setIsStoreModal] = useState(false);
  const [isAgentsModal, setIsAgentsModal] = useState(false);
  const [isAgentsShowModal, setIsAgentsShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [isStoreConfirm, setIsStoreConfirm] = useState(false);
  const [isAgentsConfirm, setIsAgentsConfirm] = useState(false);

  const [form] = Form.useForm();
  const accessToken = localStorage.getItem("token") || "";

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Dynamic base URL
  const isSandbox = window.location.href.includes("sandbox");
  const baseUrl = isSandbox
    ? "https://www.sandbox.askoxy.ai"
    : "https://www.askoxy.ai";

  const noAuthUrlPrefix = `${baseUrl}/ai-store/`;
  const filteredAssistants = assistants.filter((agent) =>
    agent.agentName?.toLowerCase().includes(agentSearch.toLowerCase())
  );

  // Slugify store name for clean URL
  const slugify = (text) =>
    text
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .trim("-")
      .slice(0, 30) || "store";

  // Copy to clipboard with fallback
  const handleCopy = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          message.success("URL copied to clipboard!");
        })
        .catch(() => {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    message.success("URL copied!");
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/ai-service/agent/getAiStoreAllAgents`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const result = await res.json();

      // Handle both array and single object response
      const data = Array.isArray(result.reverse())
        ? result
        : result.data
          ? Array.isArray(result.data)
            ? result.data
            : [result]
          : [result];

      const validStores = data.filter((store) => store && store.storeId);
      setStoreData(validStores);
      // 🔥 keep modal store in sync after reload
      if (selectedStore) {
        const updatedStore = validStores.find(
          (s) => s.storeId === selectedStore.storeId
        );
        if (updatedStore) {
          setSelectedStore(updatedStore);
        }
      }
    } catch (err) {
      message.error("Failed to load stores");
      setStoreData([]);
    } finally {
      setLoading(false);
    }
  };
  // FIXED: Validation first → then confirmation
  const handleSaveStoreClick = async () => {
    try {
      await form.validateFields(); // This will trigger validation
      setIsStoreConfirm(true); // Only open confirmation if valid
    } catch (errorInfo) {
      // Validation failed → do nothing, errors already shown
      console.log("Validation Failed:", errorInfo);
    }
  };

  /** Load Assistants (cursor based) */
  const fetchAssistants = async (page = 1, append = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const url = `${BASE_URL}/ai-service/agent/getAllAssistants?limit=${PAGE_SIZE}${
        page > 1 && lastId ? `&after=${lastId}` : ""
      }`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...getAuthHeader(),
          Accept: "application/json",
        },
      });

      const json = await res.json();
      const rawList = json.data || [];

      const mapped = rawList.map((item) => ({
        agentId: item.agentId || item.assistantId,
        assistantId: item.assistantId || item.agentId, // keep both if needed
        agentName: item.name || "Untitled Agent",
        imageUrl: item.imageUrl || null, // ← THIS IS THE KEY ADDITION
        agentStatus: item.agentStatus || "INACTIVE",
        agentCreatorName: item.agentCreatorName || null,
        // Add any other fields your backend expects in agentDetailsOnAdUser
      }));

      setAssistants((prev) => (append ? [...prev, ...mapped] : mapped));
      setHasMore(json.hasMore === true);

      if (mapped.length > 0) {
        setLastId(rawList[rawList.length - 1].assistantId);
      }
    } catch (err) {
      message.error("Failed to load assistants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchAssistants(1, false);
  }, []);

  /** Change Agent Status */
  const handleStatusChange = (agent, storeId) => {
    Modal.confirm({
      title: "Confirm Status Change",
      content: `Are you sure you want to set "${agent.agentName}" as ${
        agent.agentStatus === "ACTIVE" ? "Inactive" : "Active"
      }?`,
      okText: "Yes, Change",
      cancelText: "Cancel",
      okButtonProps: {
        style: { background: "#1ab394", borderColor: "#1ab394" },
      },
      onOk: () => updateAgentStatus(agent, storeId),
    });
  };

  const updateAgentStatus = async (agent, storeId) => {
    try {
      const newStatus = agent.agentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const payload = {
        agentId: agent.agentId,
        // storeId,
        agentStatus: newStatus,
        inactiveType: "STOREAGENT",
      };

      const res = await fetch(
        `${BASE_URL}/ai-service/agent/activeInactiveStoreAgents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Status update failed");

      message.success(`Agent status updated to ${newStatus}`);
      await fetchStores(); // Wait for fresh data
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      message.error(err.message || "Status update failed");
    }
  };

  /** Add More Assistants */
  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchAssistants(nextPage, true);
  };
  // 🔥 Add this function ABOVE the Modal

  /** Save Store (Create or Update) */
  const saveStore = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();

      const payload = isEditMode
        ? {
            storeId: selectedStore.storeId,
            storeName: values.storeName,
            description: values.description,
            storeCreatedBy: "ADMIN",
            storeImageUrl: values.storeImageUrl, // ← added for update as well
          }
        : {
            storeName: values.storeName,
            description: values.description,
            storeCreatedBy: "ADMIN",
            storeImageUrl: values.storeImageUrl, // ← from upload API
          };

      const res = await fetch(
        `${BASE_URL}/ai-service/agent/agentStoreCreation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save store");

      message.success(
        isEditMode ? "Store updated successfully" : "Store created successfully"
      );

      setIsStoreModal(false);
      form.resetFields();
      fetchStores();
    } catch (err) {
      // 👉 This prevents validation errors from showing your generic error
      if (err.errorFields) return;

      message.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  /** Save Agents to Store */
  const saveAgentsToStore = async () => {
    if (!selectedStore) return message.error("Store not selected");
    if (selectedAgents.length === 0)
      return message.error("Please select at least 1 agent");

    const payload = {
      storeId: selectedStore.storeId,
      storeName: selectedStore.storeName,
      storeImageUrl: selectedStore.storeImageUrl,
      agentDetailsOnAdUser: selectedAgents,
    };

    try {
      const res = await fetch(
        `${BASE_URL}/ai-service/agent/saveAgentsInStore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save agents");

      message.success("Agents added to store successfully");
      setIsAgentsModal(false);
      setSelectedAgents([]);
      fetchStores();
    } catch (err) {
      message.error(err.message || "Failed to save agents");
    }
  };

  const toggleStoreStatus = (storeId, currentStatus, storeName) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    Modal.confirm({
      title: "Confirm Status Change",
      content: (
        <span>
          Are you sure you want to mark the store{" "}
          <strong style={{ color: "#008cba" }}>{storeName}</strong> as{" "}
          <strong
            style={{ color: newStatus === "ACTIVE" ? "#22C55E" : "#EF4444" }}
          >
            {newStatus}
          </strong>
          ?
        </span>
      ),
      okText: "Yes, Change",
      cancelText: "No",
      okButtonProps: {
        style: {
          background: newStatus === "ACTIVE" ? "#22C55E" : "#EF4444",
          borderColor: newStatus === "ACTIVE" ? "#22C55E" : "#EF4444",
        },
      },

      onOk: async () => {
        try {
          const payload = {
            storeId,
            aiStoreStatus: newStatus,
            inactiveType: "STORE",
          };

          const res = await fetch(
            `${BASE_URL}/ai-service/agent/activeInactiveStoreAgents`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!res.ok) throw new Error("Status update failed");

          message.success(
            `Store "${storeName}" successfully marked as ${newStatus}`
          );

          fetchStores();
        } catch (err) {
          message.error(err.message || "Failed to update store status");
        }
      },
    });
  };

  /** TABLE COLUMNS */
  const columns = [
    {
      title: "S.No",
      dataIndex: "sno",
      key: "sno",
      align: "center",

      render: (_, __, index) => index + 1,
    },
    {
      title: "Store Name",
      dataIndex: "storeName",
      key: "storeName",

      align: "center",
      render: (text) => <strong>{text || "-"}</strong>,
    },
    {
      title: "Created By",
      dataIndex: "storeCreatedBy",
      key: "storeCreatedBy",

      align: "center",
      render: (text) => <Tag color="blue">{text || "-"}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            textAlign: "center",
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </div>
      ),

      align: "center",
    },

    {
      title: <div style={{ textAlign: "center" }}>AI Store URL (Public)</div>,
      align: "center",
      render: (_, record) => {
        const slug = slugify(record.storeName);
        const url = `${noAuthUrlPrefix}${slug}`;
        return (
          <Space direction="vertical" size={4}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008cba] text-md break-all"
            >
              {url}
            </a>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(url)}
            >
              Copy
            </Button>
          </Space>
        );
      },
    },
    {
      title: "Agents",
      key: "agents",
      align: "center",

      render: (_, record) => {
        const agents = record.agentDetailsOnAdUser || [];

        if (agents.length === 0) {
          return (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No Agents"
              style={{ margin: "8px 0" }}
            />
          );
        }

        return (
          <Button
            type="link"
            size="small"
            style={{ color: "#008cba", fontWeight: 500 }}
            onClick={() => {
              setSelectedStore(record);
              setIsAgentsShowModal(true); // Reuse your existing modal
            }}
          >
            View {agents.length} Agent{agents.length > 1 ? "s" : ""}
          </Button>
        );
      },
    },
    {
      title: "AI Store Status",
      dataIndex: "aiStoreStatus",
      key: "aiStoreStatus",

      align: "center",
      render: (text) => <strong>{text || "-"}</strong>,
    },
    {
      title: "Actions",
      align: "center",

      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: "90%" }}>
          <Button
            icon={<EditOutlined />}
            style={{
              background: "#1ab394",
              color: "#fff",
              border: "none",
              width: "100%",
            }}
            onClick={() => {
              setIsEditMode(true);
              setSelectedStore(record);
              form.setFieldsValue({
                storeName: record.storeName,
                description: record.description,
                storeImageUrl: record.storeImageUrl, // ← ADD THIS
              });
              setIsStoreModal(true);
            }}
          >
            Edit Store
          </Button>

          <Button
            icon={<UsergroupAddOutlined />}
            style={{
              background: "#008cba",
              color: "#fff",
              border: "none",
              width: "100%",
            }}
            onClick={() => {
              setSelectedStore(record);
              setSelectedAgents([]);
              setIsAgentsModal(true);
            }}
          >
            Add Agents
          </Button>
          <Button
            onClick={() =>
              toggleStoreStatus(
                record.storeId,
                record.aiStoreStatus,
                record.storeName
              )
            }
            style={{
              background:
                record.aiStoreStatus === "ACTIVE" ? "#EF4444" : "#00999999",
              color: "#fff",
            }}
          >
            {record.aiStoreStatus === "ACTIVE"
              ? "Make Inactive"
              : "Make Active"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AgentsAdminLayout>
      <div style={{ padding: "16px", background: "#fff", minHeight: "100vh" }}>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: 0,
              color: "#1a1a1a",
            }}
          >
            Agent AI Store Manager
          </h1>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: "#008cba",
              borderColor: "#008cba",
              height: "40px",
              fontWeight: "500",
            }}
            onClick={() => {
              setIsEditMode(false);
              form.resetFields();
              setIsStoreModal(true);
            }}
          >
            Add AI Store
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={storeData}
          loading={loading}
          rowKey={(rec) => rec.storeId}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} stores`,
          }}
          bordered
          scroll={{ x: "true" }}
          style={{
            background: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        />

        {/* STORE MODAL */}
        <Modal
          title={
            <span style={{ fontSize: "18px", fontWeight: "600" }}>
              {isEditMode ? "Update AI Store" : "Create AI Store"}
            </span>
          }
          open={isStoreModal}
          onCancel={() => {
            setIsStoreModal(false);
            form.resetFields();
          }}
          confirmLoading={saving}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsStoreModal(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>,

            <Button
              key="confirm"
              type="primary"
              style={{ background: "#1ab394", borderColor: "#1ab394" }}
              onClick={handleSaveStoreClick} // 🔥 IMPORTANT
            >
              {isEditMode ? "Update Store" : "Create Store"}
            </Button>,
          ]}
          width={500}
        >
          <Form layout="vertical" form={form} style={{ marginTop: "20px" }}>
            {/* Store Name */}
            <Form.Item
              name="storeName"
              label="Store Name"
              rules={[
                { required: true, message: "Please enter store name" },
                { min: 3, message: "Store name must be at least 3 characters" },
              ]}
            >
              <Input placeholder="Enter store name" size="large" />
            </Form.Item>

            {/* Description */}
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter description" },
                {
                  min: 10,
                  message: "Description must be at least 10 characters",
                },
              ]}
            >
              <Input.TextArea rows={4} showCount maxLength={500} />
            </Form.Item>

            {/* STORE IMAGE */}
            <Form.Item
              label="Store Image"
              name="storeImageUrl"
              rules={[
                {
                  required: !isEditMode, // required only in create mode
                  message: "Please upload an image",
                },
              ]}
            >
              <div>
                {/* Image Preview */}
                {form.getFieldValue("storeImageUrl") && (
                  <>
                    <p>
                      <strong>Image Preview:</strong>
                    </p>
                    <img
                      src={form.getFieldValue("storeImageUrl")}
                      alt="store"
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        marginBottom: 10,
                      }}
                    />
                  </>
                )}

                {/* File upload */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const accessToken = localStorage.getItem("token");
                    const uploadUrl = `${BASE_URL}/upload-service/upload?id=45880e62-acaf-4645-a83e-d1c8498e923e&fileType=aadhar`;

                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      const res = await fetch(uploadUrl, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${accessToken}` },
                        body: formData,
                      });

                      const json = await res.json();
                      if (!json.documentPath) {
                        return message.error("Upload failed");
                      }

                      // Save uploaded image URL into form
                      form.setFieldsValue({ storeImageUrl: json.documentPath });

                      // Trigger AntD error to clear
                      form.validateFields(["storeImageUrl"]);
                    } catch {
                      message.error("Upload failed");
                    }
                  }}
                />
              </div>
            </Form.Item>

            {/* HIDDEN FIELD (MANDATORY IN CREATE MODE) */}
            <Form.Item
              name="storeImageUrl"
              hidden
              rules={[
                {
                  required: !isEditMode,
                  message: "Please upload an image",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        {/* STORE CONFIRMATION */}
        <Modal
          open={isStoreConfirm}
          title="Confirm Store Details"
          onCancel={() => setIsStoreConfirm(false)}
          footer={[
            <Button key="no" onClick={() => setIsStoreConfirm(false)}>
              Cancel
            </Button>,
            <Button
              key="yes"
              type="primary"
              style={{ background: "#1ab394", borderColor: "#1ab394" }}
              loading={saving}
              onClick={() => {
                setIsStoreConfirm(false);
                saveStore();
              }}
            >
              Confirm Save
            </Button>,
          ]}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <p>
              <strong>Store Name:</strong> {form.getFieldValue("storeName")}
            </p>
            <p>
              <strong>Description:</strong> {form.getFieldValue("description")}
            </p>
            {form.getFieldValue("storeImageUrl") && (
              <div>
                <strong>Store Image:</strong>
                <br />
                <Image
                  width={120}
                  src={form.getFieldValue("storeImageUrl")}
                  alt="Store preview"
                  style={{ marginTop: 8, borderRadius: 8 }}
                  fallback="https://via.placeholder.com/120?text=No+Image"
                />
              </div>
            )}
          </Space>
        </Modal>

        {/* VIEW & MANAGE AGENTS MODAL - Now with Table + S.No */}
        <Modal
          title={
            <span
              style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}
            >
              Agents in Store:{" "}
              <strong style={{ color: "#008cba" }}>
                {selectedStore?.storeName}
              </strong>
            </span>
          }
          open={isAgentsShowModal}
          onCancel={() => {
            setIsAgentsShowModal(false);
            setSelectedStore(null);
          }}
          width={800}
          key={selectedStore?.storeId + refreshTrigger} // THIS IS THE MAIN FIX
          bodyStyle={{ padding: "20px" }}
          footer={null} // 🔴 no OK button, only close
        >
          {selectedStore && (
            <Table
              dataSource={selectedStore.agentDetailsOnAdUser || []}
              rowKey="agentId"
              pagination={false}
              bordered
              scroll={{ x: "true" }}
              size="middle"
              style={{ marginTop: 16 }}
              columns={[
                {
                  title: <strong>S.No</strong>,
                  key: "sno",
                  width: 70,
                  align: "center",
                  render: (_, __, index) => (
                    <span style={{ fontWeight: 600, color: "#008cba" }}>
                      {index + 1}
                    </span>
                  ),
                },
                {
                  title: <strong>Agent Id</strong>,
                  dataIndex: "agentId",
                  key: "agentId",
                  align: "center",
                  render: (text) => (
                    <span style={{ fontWeight: 500 }}>{text.slice(-4)}</span>
                  ),
                },

                {
                  title: <strong>Agent Name</strong>,
                  dataIndex: "agentName",
                  key: "agentName",
                  align: "center",
                  render: (text) => (
                    <span style={{ fontWeight: 500 }}>
                      {text || "Unnamed Agent"}
                    </span>
                  ),
                },
                {
                  title: <strong>Agent Image</strong>,
                  dataIndex: "imageUrl",
                  key: "imageUrl",
                  align: "center",
                  render: (url) => (
                    <div style={{ textAlign: "center" }}>
                      {" "}
                      <Image width={50} src={url} alt="company logo" />{" "}
                    </div>
                  ),
                },

                {
                  title: <strong>Status</strong>,
                  key: "status",
                  width: 140,
                  align: "center",

                  render: (_, agent) => (
                    <Switch
                      checked={agent.agentStatus === "ACTIVE"}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                      style={{
                        backgroundColor:
                          agent.agentStatus === "ACTIVE"
                            ? "#1ab394"
                            : "#d9d9d9",
                      }}
                      onChange={() =>
                        handleStatusChange(agent, selectedStore.storeId)
                      }
                    />
                  ),
                },
              ]}
            />
          )}

          {(!selectedStore?.agentDetailsOnAdUser ||
            selectedStore.agentDetailsOnAdUser.length === 0) && (
            <Empty
              description="No agents added to this store yet"
              style={{ margin: "40px 0" }}
            />
          )}
        </Modal>
        {/* ADD AGENTS MODAL */}
        <Modal
          title={
            <span style={{ fontSize: "18px", fontWeight: "600" }}>
              Add Agents to "{selectedStore?.storeName || ""}"
            </span>
          }
          open={isAgentsModal}
          onCancel={() => {
            setIsAgentsModal(false);
            setSelectedAgents([]);
            setAgentSearch(""); // reset search on close
          }}
          onOk={saveAgentsToStore}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsAgentsModal(false);
                setSelectedAgents([]);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="confirm"
              type="primary"
              disabled={selectedAgents.length === 0}
              style={{ background: "#1ab394", borderColor: "#1ab394" }}
              onClick={() => setIsAgentsConfirm(true)}
            >
              Add {selectedAgents.length} Agents
            </Button>,
          ]}
          okButtonProps={{
            style: {
              background: "#1ab394",
              borderColor: "#1ab394",
              height: "38px",
            },
            disabled: selectedAgents.length === 0,
          }}
          cancelButtonProps={{
            style: { height: "38px" },
          }}
          width={600}
        >
          <div style={{ marginTop: "12px" }}>
            {/* 🔍 Search box */}
            <Input.Search
              allowClear
              placeholder="Search agents by name..."
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              style={{ marginBottom: "12px" }}
            />

            <div
              style={{
                marginBottom: "12px",
                padding: "8px 12px",
                background: "#f0f5ff",
                borderRadius: "4px",
                fontSize: "13px",
                color: "#1890ff",
              }}
            >
              {selectedAgents.length} agent
              {selectedAgents.length !== 1 ? "s" : ""} selected
            </div>

            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #e8e8e8",
                padding: "12px",
                borderRadius: "6px",
                background: "#fafafa",
              }}
            >
              {loading && assistants.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spin tip="Loading agents..." />
                </div>
              ) : filteredAssistants.length === 0 ? (
                <Empty description="No agents available" />
              ) : (
                filteredAssistants.map((agent) => {
                  const isSelected = selectedAgents.some(
                    (x) => x.agentId === agent.agentId
                  );
                  return (
                    <div
                      key={agent.agentId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "10px",
                        padding: "10px 12px",
                        background: "#fff",
                        borderRadius: "6px",
                        border: `1px solid ${isSelected ? "#1ab394" : "#e8e8e8"}`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        ...(isSelected && { background: "#f0f9f4" }), // Optional: highlight selected row
                      }}
                      onClick={(e) => {
                        // Toggle only if not clicking the checkbox (prevents double-trigger)
                        if (e.target.tagName !== "INPUT") {
                          setSelectedAgents((prev) =>
                            isSelected
                              ? prev.filter((x) => x.agentId !== agent.agentId)
                              : [...prev, agent]
                          );
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#1ab394";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(26,179,148,0.15)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#e8e8e8";
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent bubble to div onClick
                          setSelectedAgents((prev) =>
                            isSelected
                              ? prev.filter((x) => x.agentId !== agent.agentId)
                              : [...prev, agent]
                          );
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flex: 1,
                        }}
                      >
                        {agent.imageUrl ? (
                          <img
                            src={agent.imageUrl}
                            alt={agent.agentName}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#ddd",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              color: "#999",
                            }}
                          >
                            {agent.agentName?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span style={{ fontWeight: "500", fontSize: "14px" }}>
                          {agent.agentName}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {hasMore && (
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <Button
                  onClick={loadMore}
                  loading={loading}
                  style={{ height: "38px" }}
                >
                  Load More Agents
                </Button>
              </div>
            )}
          </div>
        </Modal>
        {/* AGENTS CONFIRMATION */}
        <Modal
          open={isAgentsConfirm}
          title="Confirm Agents Selection"
          onCancel={() => setIsAgentsConfirm(false)}
          footer={[
            <Button key="no" onClick={() => setIsAgentsConfirm(false)}>
              Cancel
            </Button>,
            <Button
              key="yes"
              type="primary"
              style={{ background: "#1ab394", borderColor: "#1ab394" }}
              onClick={() => {
                setIsAgentsConfirm(false);
                saveAgentsToStore();
              }}
            >
              Confirm Save
            </Button>,
          ]}
        >
          <p>
            <strong>Total Selected Agents:</strong> {selectedAgents.length}
          </p>

          <Table
            dataSource={selectedAgents}
            rowKey="agentId"
            pagination={false}
            bordered
            columns={[
              {
                title: "S.No",
                render: (_, __, index) => index + 1,
                align: "center",
                width: 70,
              },
              {
                title: "Agent ID",
                dataIndex: "agentId",
                align: "center",
                render: (id) => id?.slice(-4),
              },
              {
                title: "Agent Name",
                dataIndex: "agentName",
                align: "center",
              },
            ]}
          />
        </Modal>
      </div>
    </AgentsAdminLayout>
  );
};

export default AgentStoreManager;
