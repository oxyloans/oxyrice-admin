import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Checkbox,
  Space,
  Descriptions,
  Divider,
  Switch,
  Tooltip,
} from "antd";
import { Tabs } from "antd";

import BASE_URL from "../../../core/config/Config";
import AgentsAdminLayout from "../components/AgentsAdminLayout";
import axios from "axios";

const { Search } = Input;
const { Option } = Select;

const AssistantsList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showBusinessCardModal, setShowBusinessCardModal] = useState(false);
  const [businessCardData, setBusinessCardData] = useState(null);
  // Table pagination (client view) + server cursor
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [cursorAfter, setCursorAfter] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState(null);
  const searchTimeoutRef = useRef(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [toolsModalVisible, setToolsModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("APPROVED");
  const [authorizedByOptions, setAuthorizedByOptions] = useState([]);
  const [form] = Form.useForm();
  const [toolForm] = Form.useForm();
  const [selectedTools, setSelectedTools] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const accessToken = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("userId") || "";

  // ---------- Utils ----------
  const parseTools = (a) => {
    try {
      if (!a || !a.tools) return [];
      const parsed = JSON.parse(a.tools);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    if (a && a.toolUsed) {
      return a.toolUsed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const renderStatusTag = (statusRaw) => {
    const s = (statusRaw || "").toString().toUpperCase().trim();
    if (s === "APPROVED") return <Tag color="success">APPROVED</Tag>;
    if (s === "REQUESTED") return <Tag color="processing">REQUESTED</Tag>;
    if (s === "REJECTED") return <Tag color="error">REJECTED</Tag>;
    if (s === "DELETED" || s === "DELETD") return <Tag>DELETED</Tag>;
    return <Tag>{statusRaw || "-"}</Tag>;
  };

  const renderInteractionTag = (view) => {
    const s = (view || "").toString().toLowerCase().trim();

    switch (s) {
      case "public":
        return <Tag color="green">Public</Tag>;
      case "private":
        return <Tag color="blue">Private</Tag>;
      default:
        return <Tag color="default">{view || "-"}</Tag>;
    }
  };
  const renderInteractionTag1 = (fileUrl) => {
    // Check if URL is empty, null, undefined, or blank string
    if (!fileUrl || fileUrl.trim() === "") {
      return <span style={{ color: "red" }}>No Files</span>;
    }

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#1677ff", textDecoration: "underline" }}
      >
        View
      </a>
    );
  };

  // ---------- Hide Agent (Name / Description) ----------
  const handleToggleHideAgent = async (record, hide) => {
    if (!record?.agentId) {
      message.error("Missing agentId");
      return;
    }

    try {
      const url = `${BASE_URL}/ai-service/agent/hideAgent?agentId=${encodeURIComponent(
        record.agentId,
      )}&hide=${hide}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "*/*",
        },
      });

      if (!res.ok) throw new Error("Failed to update hide status");

      message.success(
        hide ? "Agent hidden successfully" : "Agent is now visible",
      );

      // THIS LINE FIXES THE REFRESH ISSUE
      await fetchAssistants({
        limit: pagination.pageSize,
        replace: true,
        searchValue: searchTerm,
        status: statusFilter,
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to update visibility");
    }
  };

  // ---------- Delete Agent ----------
  const handleDeleteAgent = async (record) => {
    if (!record?.assistantId) {
      message.error("Missing assistantId");
      return;
    }

    try {
      const url = `${BASE_URL}/ai-service/agent/delete/${encodeURIComponent(
        record.assistantId,
      )}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "*/*",
        },
      });

      if (!res.ok) throw new Error("Failed to delete agent");

      message.success("Agent deleted successfully");

      // Refresh the list after deletion
      await fetchAssistants({
        limit: pagination.pageSize,
        replace: true,
        searchValue: searchTerm,
        status: statusFilter,
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to delete agent");
    }
  };

  // ---------- Fetching ----------
  const fetchAssistants = async ({
    limit,
    after = null,
    replace = false,
    searchValue = "",
    status = "ALL",
  }) => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/ai-service/agent/getAllAssistants?limit=${encodeURIComponent(
        String(limit),
      )}`;

      if (after) {
        url += `&after=${encodeURIComponent(after)}`;
      }

      if (status !== "ALL") {
        url += `&status=${encodeURIComponent(status)}`;
      }

      if (searchValue) {
        url += `&search=${encodeURIComponent(searchValue)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assistants");

      const json = await res.json();
      console.log("API Response:", json); // Debug log
      const fetched = await Promise.all(
        ((json && json.data) || []).map(async (item) => {
          if (item.userId) {
            const creatorName = await fetchCreatorName(item.userId);
            return { ...item, creatorName };
          }
          return { ...item, creatorName: "Unknown" };
        }),
      );

      console.log("Processed data:", fetched); // Debug log
      setHasMore(!!(json && json.hasMore));
      setLastId(
        fetched.length > 0 ? fetched[fetched.length - 1].assistantId : null,
      );

      if (replace) {
        setData(fetched);
        // Don't apply additional filters if we have search results (they're already filtered by API)
        if (isSearching) {
          setFilteredData(fetched);
        } else {
          // Apply status filter to the new data (only for non-search requests)
          let filtered = fetched;
          if (status !== "ALL") {
            filtered = filtered.filter(
              (item) => item.status?.toUpperCase() === status,
            );
          }
          setFilteredData(filtered);
        }
      } else {
        setData((prev) => [...prev, ...fetched]);
        setFilteredData((prev) => [...prev, ...fetched]);
      }

      setPagination((prev) => ({
        ...prev,
        total:
          json.total ||
          (replace ? fetched.length : prev.total + fetched.length),
      }));
    } catch (err) {
      console.error(err);
      message.error("Failed to load assistants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData([]);
    setFilteredData([]);
    setLastId(null);
    setHasMore(false);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
    fetchAssistants({
      limit: pagination.pageSize,
      replace: true,
      status: statusFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);
  // Fetch user profile details based on userId
  const fetchCreatorName = async (userId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/user-service/customerProfileDetails?customerId=${userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch user profile");
      const json = await response.json();
      return json?.firstName + " " + json?.lastName;
    } catch (err) {
      console.error("Error fetching creator name:", err);
      return "Unknown";
    }
  };

  const handleNextPage = async () => {
    if (hasMore && lastId) {
      await fetchAssistants({
        limit: pagination.pageSize,
        after: lastId,
        replace: true,
        searchValue: searchTerm,
        status: statusFilter,
      });
      setPagination((prev) => ({ ...prev, current: prev.current + 1 }));
    }
  };

  const handlePrevPage = async () => {
    if (pagination.current > 1) {
      setData([]);
      setFilteredData([]);
      setLastId(null);
      setHasMore(false);
      setPagination((prev) => ({ ...prev, current: prev.current - 1 }));
      await fetchAssistants({
        limit: pagination.pageSize,
        replace: true,
        searchValue: searchTerm,
        status: statusFilter,
      });
    }
  };

  const fetchSearch = async (searchValue) => {
    try {
      setIsSearching(true);
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/ai-service/agent/webSearchForAgent?message=${encodeURIComponent(searchValue)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch search results");

      const json = await res.json();

      // ✅ API returns all, so we filter exactly what was searched
      let filteredResults = [];
      if (json?.data?.length) {
        filteredResults = json.data.filter((item) =>
          item?.name?.toLowerCase()?.includes(searchValue.toLowerCase()),
        );
      }

      // ✅ Show only filtered results
      setData(filteredResults);
      setFilteredData(filteredResults);
      setPagination((prev) => ({
        ...prev,
        total: filteredResults.length,
        current: 1, // Reset to first page for search results
      }));

      console.log("Search results loaded:", filteredResults.length, "items");
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to load search results");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value?.trim() || "";
    setSearchTerm(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      if (!value) {
        // If no search term, fetch all data again (respecting current status filter)
        setIsSearching(false);
        fetchAssistants({
          limit: pagination.pageSize,
          replace: true,
          status: statusFilter,
        });
      } else {
        // Hit API with search term
        fetchSearch(value);
      }
    }, 500); // Increased timeout for API call
  };

  // ---------- Status Update ----------
  const openStatusModal = (assistant) => {
    setSelectedAssistant(assistant);
    setSelectedStatus("APPROVED");
    form.setFieldsValue({ status: "APPROVED", freetrails: 5 });
    setStatusModalVisible(true);
  };

  const handleSaveStatus = async () => {
    setLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (!selectedAssistant || !selectedAssistant.assistantId) {
        message.error("Missing assistantId");
        return;
      }
      const payload = {
        assistanId: selectedAssistant.assistantId,
        userId,
        adminComments:
          values.status === "PENDING" || values.status === "REJECTED"
            ? values.adminComments
            : "",
        status: values.status,
        authorizedBy: values.authorizedBy,
        freetrails:
          values.status === "APPROVED" ? Number(values.freetrails) : 0,
      };

      const response = await fetch(
        `${BASE_URL}/ai-service/agent/assistanceApprove`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );
      // ─────── SMART SUCCESS DETECTION (This fixes your issue) ───────
      const responseText = await response.text();

      // Always refresh the list first
      await fetchAssistants({
        limit: pagination.pageSize,
        replace: true,
        searchValue: searchTerm,
        status: statusFilter,
      });

      if (!response.ok) throw new Error("Failed to update status");
      if (values.status === "APPROVED") {
        message.success("Agent approved successfully!");
      } else if (values.status === "REJECTED") {
        message.success("Agent rejected successfully!");
      } else if (values.status === "PENDING") {
        message.success("Agent marked as pending!");
      } else if (values.status === "REQUESTED") {
        message.success("Agent marked as requested!");
      } else if (values.status === "DELETED") {
        message.success("Agent deleted successfully!");
      } else {
        message.success("Agent status updated successfully!");
      }
      setStatusModalVisible(false);

      setCursorAfter(null);
      setHasMore(false);
      setLastId(null);
      setData([]);
      setFilteredData([]);
      await fetchAssistants({
        limit: pagination.pageSize,
        replace: true,
        searchValue: searchTerm,
        status: statusFilter,
      });
    } catch (err) {
      console.error(err);

      if (err.errorFields) return;
      message.error(err.message || "Error updating assistant status");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch Authorized By Options ----------
  const fetchAuthorizedByOptions = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/ai-service/agent/getAllAgentApproved`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch authorized by options");

      const json = await res.json();
      const authorizedByList = json.map((item) => item.authorizedBy);
      setAuthorizedByOptions(authorizedByList);
    } catch (err) {
      console.error(err);
      message.error("Failed to load authorized by options");
    }
  };

  useEffect(() => {
    fetchAuthorizedByOptions();
  }, []);

  const openToolsModal = (assistant) => {
    setSelectedAssistant(assistant);
    setSelectedTools([]); // Reset selected tools when opening the modal
    toolForm.resetFields(); // Reset the form fields
    setToolsModalVisible(true);
  };

  const handleSaveTools = async (type) => {
    if (!selectedAssistant || !selectedAssistant.agentId) {
      message.error("Missing agentId");
      return;
    }

    const payload = { agentId: selectedAssistant.agentId };
    if (type === "update") {
      payload.enabledTools = selectedTools;
      payload.removeToolType = "";
    } else {
      payload.enabledTools = [];
      payload.removeToolType = selectedTools.length
        ? selectedTools.join(",")
        : "file_search,web_search";
    }

    const endpoint =
      type === "update"
        ? `${BASE_URL}/ai-service/agent/update-tools`
        : `${BASE_URL}/ai-service/agent/remove-tools`;

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update tools");
      message.success(
        type === "update"
          ? "Tools updated successfully!"
          : "Tools removed successfully!",
      );
      setToolsModalVisible(false);
      setSelectedTools([]); // Reset selected tools after saving
      toolForm.resetFields(); // Reset form after saving
      setCursorAfter(null);
      setHasMore(false);
      setLastId(null);
      setData([]);
      setFilteredData([]);
      await fetchAssistants({ limit: pagination.pageSize, replace: true });
    } catch (err) {
      console.error(err);
      message.error("Error saving tools");
    }
  };

  const ViewBusinessCardFunc = (businessCardId) => {
    console.log("Business Card ID:", businessCardId);
    if (businessCardId) {
      axios
        .get(
          `${BASE_URL}/ai-service/agent/getBusinessCardById/${businessCardId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then((response) => {
          console.log("Business Card Details", response.data);
          setBusinessCardData(response.data.data);
          setShowBusinessCardModal(true);
        })
        .catch((error) => {
          console.log("Error fetching business card details", error);
          message.error(
            error.response.data.error || "Error fetching business card details",
          );
        });
    }
  };

  // ---------- Columns ----------
  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "sno",
        align: "center",
        width: 70,
        render: (_text, _record, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      // {
      //   title: "Assistant ID",
      //   dataIndex: "assistantId",
      //   key: "assistantId",
      //   align: "center",
      //   render: (id) => (id ? `#${id.slice(-4)}` : "-"),
      //   width: 120,
      // },
      {
        title: "Agent Details",
        key: "agentDetails",
        align: "center",

        render: (_, record) => (
          <div style={{ textAlign: "left", lineHeight: "1.6" }}>
            <div>
              <b style={{ color: "#008cba" }}>Creator Name:</b>{" "}
              {record.creatorName || "-"}
            </div>
            <div>
              <b style={{ color: "#1ab394" }}>Agent Name:</b>{" "}
              {record.name || "-"}
            </div>
            <div>
              <b>Agent ID:</b>{" "}
              {record.agentId ? `#${record.agentId.slice(-4)}` : "-"}
            </div>
            <div>
              <b>Role User:</b> {record.roleUser || "-"}
            </div>
            <div>
              <b>Purpose:</b> {record.purpose || "-"}
            </div>
            <div>
              <b>Goals:</b> {record.goals || "-"}
            </div>
            <div>
              <b>View Files:</b>{" "}
              {record.url ? renderInteractionTag1(record.url) : "-"}
            </div>

            <div>
              <b>View:</b>{" "}
              {record.view ? renderInteractionTag(record.view) : "-"}
            </div>

            {/* <div
              className={record.interactionMode=="BusinessCard" ? "cursor-pointer" : null}
              onClick={() => ViewBusinessCardFunc(record?.businessCardId)}
            >
              <b>Interaction Mode:</b>{" "}
              {record.interactionMode
                ? renderInteractionTag(record.interactionMode)
                : "-"}
            </div> */}

            <div
              onClick={() => {
                if (
                  record.interactionMode === "BusinessCard" &&
                  record?.businessCardId
                ) {
                  ViewBusinessCardFunc(record.businessCardId);
                }
              }}
              style={{
                cursor:
                  record.interactionMode === "BusinessCard"
                    ? "pointer"
                    : "default",
                padding:
                  record.interactionMode === "BusinessCard" ? "6px 10px" : "0",
                borderRadius: "6px",
                background:
                  record.interactionMode === "BusinessCard"
                    ? "#e6f7ff"
                    : "transparent",
                border:
                  record.interactionMode === "BusinessCard"
                    ? "1px dashed #1890ff"
                    : "none",
                display: "inline-block",
                marginTop:
                  record.interactionMode === "BusinessCard" ? "5px" : "0",
              }}
            >
              <b>Interaction Mode:</b>{" "}
              {record.interactionMode ? (
                record.interactionMode === "BusinessCard" ? (
                  <span style={{ color: "#1890ff", fontWeight: 600 }}>
                    {renderInteractionTag(record.interactionMode)} (View Card)
                  </span>
                ) : (
                  renderInteractionTag(record.interactionMode)
                )
              ) : (
                "-"
              )}
            </div>
          </div>
        ),
      },

      // {
      //   title: "Approved By",
      //   dataIndex: "authorizedBy",
      //   key: "authorizedBy",
      //   align: "center",
      // },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        align: "center",
        render: (text) => (
          <div
            style={{
              textAlign: "center",
              display: "-webkit-box",
              maxWidth: 300,
              WebkitBoxOrient: "vertical",
              maxHeight: 120, // limit height
              overflowX: "auto", // horizontal scroll
            }}
          >
            {text}
          </div>
        ),
      },
      // {
      //   title: "Agent Status",
      //   dataIndex: "status",
      //   key: "status",
      //   align: "center",
      //   render: (status) => renderStatusTag(status),
      // },

      // {
      //   title: "Instructions",
      //   dataIndex: "instructions",
      //   key: "instructions",
      //   align: "center",
      //   render: (text) => (
      //     <div
      //       style={{
      //         maxWidth: 300,
      //         textAlign: "center",
      //         display: "-webkit-box",
      //         WebkitLineClamp: 4,
      //         WebkitBoxOrient: "vertical",
      //         overflow: "hidden",
      //       }}
      //     >
      //       {text}
      //     </div>
      //   ),
      // },
      // {
      //   title: "Interaction Mode",
      //   dataIndex: "interactionMode",
      //   key: "interactionMode",
      //   align: "center",
      // },
      // {
      //   title: "Tools",
      //   dataIndex: "tools",
      //   key: "tools",
      //   align: "center",
      //   width: 140,
      //   render: (_t, record) => {
      //     const list = parseTools(record);
      //     return list.length ? list.join(", ") : "—";
      //   },
      // },
      // {
      //   title: "View Files",
      //   dataIndex: "url",
      //   key: "url",
      //   align: "center",
      //   render: (url) => renderInteractionTag1(url),
      // },
      // {
      //   title: "View",
      //   dataIndex: "view",
      //   key: "view",
      //   align: "center",
      //   render: (view) => renderInteractionTag(view),
      // },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => renderStatusTag(status),
      },

      {
        title: "Actions",
        key: "actions",
        align: "center",

        render: (_, record) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Status */}
            {/* <div>{renderStatusTag(record.status)}</div> */}

            {/* Preview Button */}
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedAssistant(record);
                setPreviewVisible(true);
              }}
              style={{
                backgroundColor: "#008cba",
                borderColor: "#008cba",
                height: "32px",
                width: "100px",
                fontWeight: 500,
              }}
            >
              Preview
            </Button>

            {/* Hide / Show Switch */}
            <Tooltip
              title={
                record.hideAgent
                  ? "This agent is currently HIDDEN in Bharat AI Store"
                  : "This agent is VISIBLE in Bharat AI Store"
              }
            >
              <Button
                size="small"
                style={{
                  backgroundColor: record.hideAgent ? "#ff4d4f" : "#1ab394",
                  borderColor: record.hideAgent ? "#ff4d4f" : "#1ab394",
                  color: "white",
                  height: "32px",
                  width: "100px",
                  fontWeight: 500,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: record.hideAgent ? "Show Agent?" : "Hide Agent?",
                    content: record.hideAgent
                      ? "This agent will be VISIBLE in Bharat AI Store."
                      : "This agent will be HIDDEN from Bharat AI Store.",
                    okText: "Yes",
                    cancelText: "No",
                    onOk: () =>
                      handleToggleHideAgent(record, !record.hideAgent),
                  });
                }}
              >
                {record.hideAgent ? "Hidden" : "Visible"}
              </Button>
            </Tooltip>

            {/* Delete Button */}
            <Tooltip title="Permanently delete this agent">
              <Button
                size="small"
                danger
                style={{
                  height: "32px",
                  width: "100px",
                  fontWeight: 500,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: "Delete Agent?",
                    content:
                      "This action cannot be undone. The agent will be permanently deleted.",
                    okText: "Delete",
                    okType: "danger",
                    cancelText: "Cancel",
                    onOk: () => handleDeleteAgent(record),
                  });
                }}
              >
                Delete
              </Button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [pagination.current, pagination.pageSize],
  );

  // ---------- Render ----------
  return (
    <AgentsAdminLayout>
      <Card>
        {/* Title and Search Row */}
        <Row
          justify="space-between"
          align="middle"
          style={{
            marginBottom: 16,
            paddingBottom: 16,
          }}
        >
          <Col>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
              Agents Creation List
            </h1>
          </Col>
          <Col>
            <Search
              placeholder="Search by Agent Name"
              allowClear
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: 300 }}
            />
          </Col>
        </Row>

        {/* Items per page and Pagination Row */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span>Show</span>
              <Select
                value={pagination.pageSize}
                onChange={(value) => {
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: value,
                    current: 1,
                  }));
                  fetchAssistants({
                    limit: value,
                    replace: true,
                    searchValue: searchTerm,
                    status: statusFilter,
                  });
                }}
                style={{ width: 80 }}
              >
                <Option value={50}>50</Option>
                <Option value={80}>80</Option>
                <Option value={100}>100</Option>
              </Select>
              <span>entries</span>
            </div>
          </Col>
          <Col>
            <div
              style={{
                padding: "12px 16px",
              }}
            >
              <Button.Group>
                <Button
                  disabled={pagination.current === 1}
                  onClick={handlePrevPage}
                >
                  Previous
                </Button>
                <Button disabled>Page {pagination.current}</Button>
                <Button
                  disabled={!hasMore || filteredData.length === 0}
                  onClick={handleNextPage}
                >
                  Next
                </Button>
              </Button.Group>
            </div>
          </Col>
        </Row>

        {/* <Tabs
          activeKey={statusFilter}
          onChange={(key) => {
            setStatusFilter(key);
            setSearchTerm(""); // Clear search when changing tabs
            setIsSearching(false); // Reset search state
            setPagination((p) => ({ ...p, current: 1 }));
          }}
          style={{ marginBottom: 16 }}
          items={[
            { key: "ALL", label: "All" },
            { key: "REQUESTED", label: "REQUESTED" },
            { key: "APPROVED", label: "APPROVED" },
          ]}
        /> */}

        <Table
          rowKey={(r) => r.agentId || r.assistantId}
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          bordered
          scroll={{ x: true, y: "500px" }}
        />

        {/* Preview Modal */}
        <Modal
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "12px 0",
              }}
            >
              <Tooltip title="Update the agent's status">
                <Button
                  type="primary"
                  onClick={() => {
                    if (!selectedAssistant) return;
                    setPreviewVisible(false);
                    openStatusModal(selectedAssistant);
                  }}
                  style={{
                    backgroundColor: "#008cba",
                    borderColor: "#008cba",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "0 16px",
                    height: "40px",
                    fontWeight: 500,
                  }}
                  loading={loading}
                  disabled={!selectedAssistant}
                  aria-label="Update Agent status"
                >
                  Update Status
                </Button>
              </Tooltip>

              <Tooltip title="Close the preview">
                <Button
                  onClick={() => setPreviewVisible(false)}
                  style={{
                    borderRadius: "6px",
                    padding: "0 16px",
                    height: "40px",
                    fontWeight: 500,
                  }}
                  aria-label="Close preview modal"
                >
                  Close
                </Button>
              </Tooltip>
            </div>
          }
          width={650}
          centered
          closable
          closeIcon={<span style={{ fontSize: "18px", color: "#666" }}>✕</span>}
          bodyStyle={{
            maxHeight: "70vh",
            overflowY: "auto",

            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
          style={{ borderRadius: "12px" }}
          title={
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#1a1a1a",
                padding: "8px 0",
              }}
            >
              Agent Details
            </div>
          }
        >
          {selectedAssistant ? (
            <>
              <Descriptions
                bordered
                column={1}
                size="middle"
                labelStyle={{
                  fontWeight: 600,
                  width: "30%",
                  backgroundColor: "#f0f2f5",
                  padding: "12px",
                }}
                contentStyle={{
                  whiteSpace: "pre-wrap",
                  padding: "12px",
                  backgroundColor: "#fff",
                }}
                style={{ backgroundColor: "#fff", borderRadius: "8px" }}
              >
                <Descriptions.Item label="Assistant ID">
                  {selectedAssistant.assistantId}
                </Descriptions.Item>
                <Descriptions.Item label="Created Name">
                  {selectedAssistant.creatorName}
                </Descriptions.Item>
                <Descriptions.Item label="Agent ID">
                  {selectedAssistant.agentId}
                </Descriptions.Item>
                <Descriptions.Item label="User ID">
                  {selectedAssistant.userId}
                </Descriptions.Item>
                <Descriptions.Item label="Agent Name">
                  {selectedAssistant.name}
                </Descriptions.Item>
                <Descriptions.Item label="Interaction Mode">
                  {selectedAssistant.interactionMode}
                </Descriptions.Item>
                <Descriptions.Item label="Role User">
                  {selectedAssistant.roleUser}
                </Descriptions.Item>
                <Descriptions.Item label="Purpose">
                  {selectedAssistant.purpose}
                </Descriptions.Item>
                <Descriptions.Item label="goals">
                  {selectedAssistant.goals}
                </Descriptions.Item>
                <Descriptions.Item label="View Files">
                  {selectedAssistant?.url &&
                  selectedAssistant.url.trim() !== "" ? (
                    <a
                      href={selectedAssistant.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1677ff", textDecoration: "underline" }}
                    >
                      View File
                    </a>
                  ) : (
                    <span style={{ color: "red" }}>No file uploaded</span>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="View">
                  {selectedAssistant.view}
                </Descriptions.Item>
                <Descriptions.Item label="Approved By">
                  {selectedAssistant.approvedBy}
                </Descriptions.Item>

                <Descriptions.Item label="Admin Comments">
                  {selectedAssistant.adminComments}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {selectedAssistant.activeStatus ? (
                    <Tag color="success">Active</Tag>
                  ) : (
                    <Tag color="error">Inactive</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  {selectedAssistant.model}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {selectedAssistant.createdAt
                    ? new Date(
                        Number(selectedAssistant.createdAt) * 1000,
                      ).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedAssistant.description || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Instructions">
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "8px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "4px",
                    }}
                  >
                    {selectedAssistant.instructions || ""}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Approved At">
                  {selectedAssistant.approvedAt
                    ? new Date(selectedAssistant.approvedAt).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Tool Used">
                  {selectedAssistant.toolUsed || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Tools">
                  {parseTools(selectedAssistant).length > 0
                    ? parseTools(selectedAssistant).join(", ")
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Choose Store">
                  {selectedAssistant.chooseStore || ""}
                </Descriptions.Item>

                <Descriptions.Item label="Image">
                  {selectedAssistant.imageUrl ? (
                    <img
                      src={selectedAssistant.imageUrl}
                      alt={`Assistant ${selectedAssistant.name || "image"}`}
                      style={{
                        maxWidth: "200px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Descriptions.Item>
              </Descriptions>
              <Divider style={{ margin: "16px 0", borderColor: "#e8ecef" }} />
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#888",
                fontSize: "16px",
                padding: "24px",
              }}
            >
              No assistant selected
            </div>
          )}
        </Modal>

        {/* Status Modal */}
        {/* Status Update Modal - FIXED & CLEAN */}
        <Modal
          open={statusModalVisible}
          title="Update Assistant Status"
          onCancel={() => {
            setStatusModalVisible(false);
            form.resetFields();
            setSelectedStatus("APPROVED");
          }}
          footer={null} // We use custom buttons below for full control
          destroyOnClose
          width={520}
          closeIcon={<span style={{ fontSize: 18 }}>×</span>}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                placeholder="Select status"
                onChange={(value) => {
                  setSelectedStatus(value);
                  if (value !== "APPROVED") {
                    form.setFieldsValue({ freetrails: undefined });
                  } else {
                    form.setFieldsValue({ freetrails: 5 });
                  }
                }}
              >
                <Option value="APPROVED">APPROVED</Option>
                <Option value="REQUESTED">REQUESTED</Option>
                <Option value="PENDING">PENDING</Option>
                <Option value="REJECTED">REJECTED</Option>
                <Option value="DELETED">DELETED</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Authorized By"
              name="authorizedBy"
              rules={[
                { required: true, message: "Please select authorized person" },
              ]}
            >
              <Select placeholder="Select authorized name" showSearch>
                {authorizedByOptions.map((authBy) => (
                  <Option key={authBy} value={authBy}>
                    {authBy}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedStatus === "APPROVED" && (
              <Form.Item
                label="Free Trials"
                name="freetrails"
                rules={[
                  {
                    required: true,
                    validator: (_, value) =>
                      value && value >= 5
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Minimum 5 free trials required"),
                          ),
                  },
                ]}
              >
                <InputNumber
                  min={5}
                  style={{ width: "100%" }}
                  placeholder="Enter free trials (min 5)"
                />
              </Form.Item>
            )}

            {(selectedStatus === "PENDING" ||
              selectedStatus === "REJECTED") && (
              <Form.Item
                label="Admin Comments"
                name="adminComments"
                rules={[
                  { required: true, message: "Admin comments are required" },
                ]}
              >
                <Input.TextArea rows={3} placeholder="Enter reason..." />
              </Form.Item>
            )}
          </Form>

          {/* Custom Footer Buttons - With Proper Loading */}
          <div
            style={{
              marginTop: 24,
              textAlign: "right",
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => {
                setStatusModalVisible(false);
                form.resetFields();
                setSelectedStatus("APPROVED");
              }}
              style={{ height: 40, fontWeight: 500 }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              loading={loading}
              disabled={loading}
              style={{
                backgroundColor: "#008cba",
                borderColor: "#008cba",
                color: "#fff",
                height: 40,
                fontWeight: 500,
                minWidth: 100,
              }}
              onClick={handleSaveStatus}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Modal>
        {/* Tools Modal */}
        <Modal
          open={toolsModalVisible}
          onCancel={() => {
            setToolsModalVisible(false);
            setSelectedTools([]); // Reset selected tools on modal close
            toolForm.resetFields(); // Reset form on modal close
          }}
          footer={
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
                onClick={() => handleSaveTools("update")}
              >
                Save Tools
              </Button>
              <Button danger onClick={() => handleSaveTools("remove")}>
                Remove Tools
              </Button>
            </Space>
          }
          title="Manage Tools"
          width={520}
          destroyOnClose
        >
          <Form form={toolForm} layout="vertical">
            <Form.Item
              label="Select Tools"
              name="selectedTools"
              rules={[
                {
                  required: true,
                  message: "Please select at least one tool",
                },
              ]}
            >
              <Checkbox.Group
                options={[
                  { label: "File Search", value: "file_search" },
                  { label: "Web Search", value: "web_search" },
                ]}
                value={selectedTools}
                onChange={(values) => setSelectedTools(values)}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Display and edit Buisness card details Modal */}
        <Modal
          title="Business Card Details"
          open={showBusinessCardModal}
          onCancel={() => setShowBusinessCardModal(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setShowBusinessCardModal(false)}
            >
              Ok
            </Button>,
          ]}
          width={600}
        >
          <div>
            {businessCardData?.imagePath !== null ? (
              <div>
                <div>
                  <strong>Business Card Image:</strong>
                </div>
                <img
                  src={businessCardData?.imagePath}
                  alt="Business Card"
                  style={{ maxWidth: "100%", marginTop: 8 }}
                />
              </div>
            ) : (
              <div>No Business Card Image Available</div>
            )}
          </div>
        </Modal>
      </Card>
    </AgentsAdminLayout>
  );
};

export default AssistantsList;
