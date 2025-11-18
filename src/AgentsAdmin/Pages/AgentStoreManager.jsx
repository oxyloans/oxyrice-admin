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
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";
import BASE_URL from "../../AdminPages/Config";

const PAGE_SIZE = 20;

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
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  const [form] = Form.useForm();
  const accessToken = localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${accessToken}` };

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Dynamic base URL
  const isSandbox = window.location.href.includes("sandbox");
  const baseUrl = isSandbox
    ? "https://www.sandbox.askoxy.ai"
    : "https://www.askoxy.ai";
  const authUrlPrefix = `${baseUrl}/main/ai-store/`;
  const noAuthUrlPrefix = `${baseUrl}/ai-store/`;

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
  /** Fetch Stores */
  //   const fetchStores = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await fetch(
  //         `${BASE_URL}/ai-service/agent/getAiStoreAllAgents`,
  //         { headers }
  //       );
  //       const data = await res.json();
  //       setStoreData([data]);
  //     } catch (err) {
  //       message.error("Failed to fetch store data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

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
      const data = Array.isArray(result)
        ? result
        : result.data
          ? Array.isArray(result.data)
            ? result.data
            : [result]
          : [result];

      setStoreData(data.filter((store) => store && store.storeId));
    } catch (err) {
      message.error("Failed to load stores");
      setStoreData([]);
    } finally {
      setLoading(false);
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
        agentName: item.name || "Untitled Agent",
        agentStatus: item.agentStatus || "INACTIVE",
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
        storeId,
        agentStatus: newStatus,
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
      fetchStores();
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
          }
        : {
            storeName: values.storeName,
            description: values.description,
            storeCreatedBy: "ADMIN",
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
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </div>
      ),

      align: "center",
    },
    // {
    //   title: <div style={{ textAlign: "center" }}>Service URL (With Auth)</div>,
    //   align: "center",
    //   render: (_, record) => {
    //     const slug = slugify(record.storeName);
    //     const url = `${authUrlPrefix}${record.storeId.slice(-4)}/${slug}`;
    //     return (
    //       <Space direction="vertical" size={4}>
    //         <a
    //           href={url}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //           className="text-blue-600 text-xs break-all"
    //         >
    //           {url}
    //         </a>
    //         <Button
    //           size="small"
    //           icon={<CopyOutlined />}
    //           onClick={() => handleCopy(url)}
    //         >
    //           Copy
    //         </Button>
    //       </Space>
    //     );
    //   },
    // },

    // Without Authorization URL
    {
      title: <div style={{ textAlign: "center" }}>Service URL (Public)</div>,
      align: "center",
      render: (_, record) => {
        const slug = slugify(record.storeName);
        const url = `${noAuthUrlPrefix}${record.storeId.slice(-4)}/${slug}`;
        return (
          <Space direction="vertical" size={4}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 text-xs break-all"
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

      render: (_, record) =>
        !record.agentDetailsOnAdUser?.length ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No Agents"
            style={{ margin: "8px 0" }}
          />
        ) : (
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {record.agentDetailsOnAdUser.map((agent) => (
              <div
                key={agent.agentId}
                style={{
                  marginBottom: "8px",
                  padding: "12px",
                  background: "#fafafa",
                  borderRadius: "6px",
                  border: "1px solid #e8e8e8",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <strong style={{ fontSize: "14px" }}>
                    {agent.agentName}
                  </strong>
                  <Switch
                    checked={agent.agentStatus === "ACTIVE"}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    style={{
                      background:
                        agent.agentStatus === "ACTIVE" ? "#1ab394" : "#d9d9d9",
                    }}
                    onChange={() => handleStatusChange(agent, record.storeId)}
                  />
                </div>
              </div>
            ))}
          </div>
        ),
    },
    {
      title: "Actions",
      align: "center",

      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: "85%" }}>
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
          onOk={saveStore}
          okText={isEditMode ? "Update Store" : "Create Store"}
          okButtonProps={{
            style: {
              background: "#1ab394",
              borderColor: "#1ab394",
              height: "38px",
            },
          }}
          cancelButtonProps={{
            style: { height: "38px" },
          }}
          width={500}
        >
          <Form layout="vertical" form={form} style={{ marginTop: "20px" }}>
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
              <Input.TextArea
                rows={4}
                placeholder="Enter store description"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Form>
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
          }}
          onOk={saveAgentsToStore}
          okText={`Add ${selectedAgents.length} Agent${selectedAgents.length !== 1 ? "s" : ""}`}
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
          <div style={{ marginTop: "20px" }}>
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
                maxHeight: "400px",
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
              ) : assistants.length === 0 ? (
                <Empty description="No agents available" />
              ) : (
                assistants.map((agent) => (
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
                      border: "1px solid #e8e8e8",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#1ab394";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(26,179,148,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e8e8e8";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => {
                      const checkbox = document.getElementById(
                        `agent-${agent.agentId}`
                      );
                      if (checkbox) checkbox.click();
                    }}
                  >
                    <Checkbox
                      id={`agent-${agent.agentId}`}
                      checked={selectedAgents.some(
                        (x) => x.agentId === agent.agentId
                      )}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedAgents((p) => [...p, agent]);
                        } else {
                          setSelectedAgents((p) =>
                            p.filter((x) => x.agentId !== agent.agentId)
                          );
                        }
                      }}
                    />
                    <span style={{ fontWeight: "500", fontSize: "14px" }}>
                      {agent.agentName}
                    </span>
                  </div>
                ))
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
      </div>
    </AgentsAdminLayout>
  );
};

export default AgentStoreManager;
