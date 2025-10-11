// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Table,
//   Card,
//   Input,
//   Row,
//   Col,
//   Select,
//   Modal,
//   Form,
//   InputNumber,
//   Button,
//   Tag,
//   message,
//   Checkbox,
//   Space,
//   Descriptions,
//   Divider,
//   Tooltip,
// } from "antd";
// import BASE_URL from "../../AdminPages/Config";
// import AgentsAdminLayout from "../Components/AgentsAdminLayout";

// const { Search } = Input;
// const { Option } = Select;

// const AssistantsList = () => {
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Table pagination (client view) + server cursor
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 20,
//     total: 0,
//   });
//   const [cursorAfter, setCursorAfter] = useState(null);
//   const [hasMore, setHasMore] = useState(false);
//   const [lastId, setLastId] = useState(null);

//   // Forms / Modals
//   const [statusModalVisible, setStatusModalVisible] = useState(false);
//   const [toolsModalVisible, setToolsModalVisible] = useState(false);
//   const [previewVisible, setPreviewVisible] = useState(false);

//   const [selectedAssistant, setSelectedAssistant] = useState(null);
//   const [selectedStatus, setSelectedStatus] = useState("APPROVED");
//   const [authorizedByOptions, setAuthorizedByOptions] = useState([]);
//   const [form] = Form.useForm();
//   const [toolForm] = Form.useForm();
//   const [selectedTools, setSelectedTools] = useState([]);
// const [isSearching, setIsSearching] = useState(false);
//   const accessToken = localStorage.getItem("token") || "";
//   const userId = localStorage.getItem("userId") || "";

//   // ---------- Utils ----------
//   const parseTools = (a) => {
//     try {
//       if (!a || !a.tools) return [];
//       const parsed = JSON.parse(a.tools);
//       if (Array.isArray(parsed)) return parsed;
//     } catch {}
//     if (a && a.toolUsed) {
//       return a.toolUsed
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);
//     }
//     return [];
//   };



//   const renderStatusTag = (statusRaw) => {
//     const s = (statusRaw || "").toString().toUpperCase().trim();
//     if (s === "APPROVED") return <Tag color="success">APPROVED</Tag>;
//     if (s === "REQUESTED") return <Tag color="processing">REQUESTED</Tag>;
//     if (s === "REJECTED") return <Tag color="error">REJECTED</Tag>;
//     if (s === "DELETED" || s === "DELETD") return <Tag>DELETED</Tag>;
//     return <Tag>{statusRaw || "-"}</Tag>;
//   };

//   // ---------- Fetching ----------
//   const fetchAssistants = async ({
//     limit,
//     after,
//     replace = false,
//     searchValue = "",
//   }) => {
//     try {
//       setLoading(true);
//       const url =
//         `${BASE_URL}/ai-service/agent/getAllAssistants?limit=${encodeURIComponent(
//           String(limit)
//         )}` + (after ? `&after=${encodeURIComponent(after)}` : "");

//       const res = await fetch(url, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch assistants");

//       const json = await res.json();
//       const fetched = (json && json.data) || [];

//       setHasMore(!!(json && json.hasMore));
//       setLastId((json && json.lastId) || null);

//       const newData = replace ? fetched : [...data, ...fetched];
//       setData(newData);

//       const newFiltered = searchValue.trim()
//         ? newData.filter((item) =>
//             (item.name || "").toLowerCase().includes(searchValue.toLowerCase())
//           )
//         : newData;
//       setFilteredData(newFiltered);

//       setPagination((prev) => ({
//         ...prev,
//         total: newFiltered.length + (json.hasMore ? prev.pageSize : 0),
//       }));
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to load assistants");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     setCursorAfter(null);
//     setHasMore(false);
//     setLastId(null);
//     setData([]);
//     setFilteredData([]);
//     fetchAssistants({ limit: pagination.pageSize, replace: true });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- Pagination change ----------
//  const handleTableChange = async (newPagination) => {
//    const goingForward = newPagination.current > pagination.current;
//    const pageSizeChanged = newPagination.pageSize !== pagination.pageSize;

//    setPagination({
//      current: newPagination.current,
//      pageSize: newPagination.pageSize,
//      total: newPagination.total,
//    });

//    if (pageSizeChanged) {
//      setCursorAfter(null);
//      setHasMore(false);
//      setLastId(null);
//      setData([]);
//      setFilteredData([]);
//      if (isSearching) {
//        await fetchSearch({
//          limit: newPagination.pageSize,
//          message: searchTerm,
//          replace: true,
//        });
//      } else {
//        await fetchAssistants({ limit: newPagination.pageSize, replace: true });
//      }
//      return;
//    }

//    const needRows = newPagination.current * newPagination.pageSize;
//    if (goingForward && filteredData.length < needRows && hasMore && lastId) {
//      if (isSearching) {
//        await fetchSearch({
//          limit: newPagination.pageSize,
//          after: lastId,
//          message: searchTerm,
//        });
//      } else {
//        await fetchAssistants({ limit: pagination.pageSize, after: lastId });
//      }
//    }
//  };
// const fetchSearch = async ({ limit, after, message, replace = false }) => {
//   try {
//     setLoading(true);
//     const url =
//       `${BASE_URL}/ai-service/agent/webSearchForAgent?message=${encodeURIComponent(message)}` 
//     const res = await fetch(url, {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     if (!res.ok) throw new Error("Failed to fetch search results");

//     const json = await res.json();
//     const fetched = (json && json.data) || [];

//     setHasMore(!!(json && json.hasMore));
//     setLastId((json && json.lastId) || null);

//     const newData = replace ? fetched : [...data, ...fetched];
//     setData(newData);

//     setFilteredData(newData); // Search results are already filtered

//     setPagination((prev) => ({
//       ...prev,
//       total: newData.length + (json.hasMore ? prev.pageSize : 0),
//     }));
//   } catch (err) {
//     console.error(err);
//     message.error("Failed to load search results");
//   } finally {
//     setLoading(false);
//   }
// };
//   // ---------- Live search ----------
// const handleSearchChange = (e) => {
//   const value = e.target.value || "";
//   setSearchTerm(value);

//   setCursorAfter(null);
//   setHasMore(false);
//   setLastId(null);
//   setData([]);
//   setFilteredData([]);

//   if (value.trim()) {
//     setIsSearching(true);
//     fetchSearch({ limit: pagination.pageSize, message: value, replace: true });
//   } else {
//     setIsSearching(false);
//     fetchAssistants({
//       limit: pagination.pageSize,
//       replace: true,
//       searchValue: "",
//     }); // <-- pass empty string
//   }
// };


//   // ---------- Status Update ----------
//   const openStatusModal = (assistant) => {
//     setSelectedAssistant(assistant);
//     setSelectedStatus("APPROVED");
//     form.setFieldsValue({ status: "APPROVED", freetrails: 5 });
//     setStatusModalVisible(true);
//   };

//   const handleSaveStatus = async () => {
//     try {
//       await form.validateFields();
//       const values = form.getFieldsValue();

//       if (!selectedAssistant || !selectedAssistant.assistantId) {
//         message.error("Missing assistantId");
//         return;
//       }

//       const payload = {
//         assistanId: selectedAssistant.assistantId,
//         userId,
//         status: values.status,
//         authorizedBy: values.authorizedBy,
//         freetrails:
//           values.status === "APPROVED" ? Number(values.freetrails) : 0,
//       };

//       const res = await fetch(
//         `${BASE_URL}/ai-service/agent/assistanceApprove`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) throw new Error("Failed to update status");
//       message.success("Agent status updated successfully!");
//       setStatusModalVisible(false);

//       setCursorAfter(null);
//       setHasMore(false);
//       setLastId(null);
//       setData([]);
//       setFilteredData([]);
//       if (isSearching) {
//         await fetchSearch({ limit: pagination.pageSize, message: searchTerm, replace: true });
//       } else {
//         await fetchAssistants({ limit: pagination.pageSize, replace: true });
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Error updating assistant status");
//     }
//   };

//   // ---------- Fetch Authorized By Options ----------
//   const fetchAuthorizedByOptions = async () => {
//     try {
//       const res = await fetch(
//         `${BASE_URL}/ai-service/agent/getAllAgentApproved`,
//         {
//           method: "GET",
//           headers: {
//             Accept: "*/*",
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (!res.ok) throw new Error("Failed to fetch authorized by options");

//       const json = await res.json();
//       const authorizedByList = json.map((item) => item.authorizedBy);
//       setAuthorizedByOptions(authorizedByList);
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to load authorized by options");
//     }
//   };

//   useEffect(() => {
//     fetchAuthorizedByOptions();
//   }, []);
//   // ---------- Tools Update ----------
//   const openToolsModal = (assistant) => {
//     setSelectedAssistant(assistant);
//     setSelectedTools([]); // Reset selected tools when opening the modal
//     toolForm.resetFields(); // Reset the form fields
//     setToolsModalVisible(true);
//   };

//   const handleSaveTools = async (type) => {
//     if (!selectedAssistant || !selectedAssistant.agentId) {
//       message.error("Missing agentId");
//       return;
//     }

//     const payload = { agentId: selectedAssistant.agentId };
//     if (type === "update") {
//       payload.enabledTools = selectedTools;
//       payload.removeToolType = "";
//     } else {
//       payload.enabledTools = [];
//       payload.removeToolType = selectedTools.length
//         ? selectedTools.join(",")
//         : "file_search,web_search";
//     }

//     const endpoint =
//       type === "update"
//         ? `${BASE_URL}/ai-service/agent/update-tools`
//         : `${BASE_URL}/ai-service/agent/remove-tools`;

//     try {
//       const res = await fetch(endpoint, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Failed to update tools");
//       message.success(
//         type === "update"
//           ? "Tools updated successfully!"
//           : "Tools removed successfully!"
//       );
//       setToolsModalVisible(false);
//       setSelectedTools([]); // Reset selected tools after saving
//       toolForm.resetFields(); // Reset form after saving
//       setCursorAfter(null);
//       setHasMore(false);
//       setLastId(null);
//       setData([]);
//       setFilteredData([]);
//       await fetchAssistants({ limit: pagination.pageSize, replace: true });
//     } catch (err) {
//       console.error(err);
//       message.error("Error saving tools");
//     }
//   };

//   // ---------- Columns ----------
//   const columns = useMemo(
//     () => [
//       {
//         title: "S.No",
//         key: "sno",
//         align: "center",
//         render: (_text, _record, index) =>
//           (pagination.current - 1) * pagination.pageSize + index + 1,
//       },
//       // {
//       //   title: "Assistant ID",
//       //   dataIndex: "assistantId",
//       //   key: "assistantId",
//       //   align: "center",
//       //   render: (id) => (id ? `#${id.slice(-4)}` : "-"),
//       //   width: 120,
//       // },
//       {
//         title: "Agent ID",
//         dataIndex: "agentId",
//         key: "agentId",
//         align: "center",
//         render: (id) => (id ? `#${id.slice(-4)}` : "-"),
//       },
//       {
//         title: "Agent Name",
//         dataIndex: "name",
//         key: "name",
//         align: "center",
//       },
//       {
//         title: "Creator Name",
//         dataIndex: "creatorName",
//         key: "creatorName",
//         align: "center",
//       },
//       {
//         title: "Approved By",
//         dataIndex: "authorizedBy",
//         key: "authorizedBy",
//         align: "center",
//       },
//       {
//         title: "Tool Used",
//         dataIndex: "toolUsed",
//         key: "toolUsed",
//         align: "center",
//       },
//       {
//         title: "Description",
//         dataIndex: "description",
//         key: "description",
//         align: "center",
//         render: (text) => (
//           <div
//             style={{
//               maxWidth: 300,
//               textAlign: "center",
//               display: "-webkit-box",
//               WebkitLineClamp: 3,
//               WebkitBoxOrient: "vertical",
//               overflow: "hidden",
//             }}
//           >
//             {text}
//           </div>
//         ),
//       },
//       // {
//       //   title: "Instructions",
//       //   dataIndex: "instructions",
//       //   key: "instructions",
//       //   align: "center",
//       //   render: (text) => (
//       //     <div
//       //       style={{
//       //         maxWidth: 300,
//       //         textAlign: "center",
//       //         display: "-webkit-box",
//       //         WebkitLineClamp: 3,
//       //         WebkitBoxOrient: "vertical",
//       //         overflow: "hidden",
//       //       }}
//       //     >
//       //       {text}
//       //     </div>
//       //   ),
//       // },

//       // {
//       //   title: "Tools",
//       //   dataIndex: "tools",
//       //   key: "tools",
//       //   align: "center",
//       //   width: 140,
//       //   render: (_t, record) => {
//       //     const list = parseTools(record);
//       //     return list.length ? list.join(", ") : "—";
//       //   },
//       // },
//       {
//         title: "Status",
//         dataIndex: "status",
//         key: "status",
//         align: "center",
//         render: (status) => renderStatusTag(status),
//       },
//       {
//         title: "Actions",
//         key: "actions",
//         align: "center",

//         render: (_, record) => (
//           <div
//             style={{ display: "flex", gap: "8px", justifyContent: "center" }}
//           >
//             <Button
//               type="primary"
//               onClick={() => {
//                 setSelectedAssistant(record);
//                 setPreviewVisible(true);
//               }}
//               style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
//             >
//               Preview
//             </Button>
//             <Button
//               type="default"
//               onClick={() => openToolsModal(record)}
//               style={{
//                 backgroundColor: "#6a1b9a",
//                 color: "#fff",
//                 borderColor: "#6a1b9a",
//               }}
//             >
//               Manage Tools
//             </Button>
//           </div>
//         ),
//       },
//     ],
//     [pagination.current, pagination.pageSize]
//   );

//   // ---------- Render ----------
//   return (
//     <AgentsAdminLayout>
//       <Card
//         className="shadow-md rounded-lg"
//         title={
//           <Row justify="space-between" align="middle" style={{ width: "100%" }}>
//             <Col
//             >
//               <h1 style={{ margin: 0, textAlign: "center" }}>
//                 Agents Creation List
//               </h1>
//             </Col>
//             <Col>
//               <Search
//                 placeholder="Search by Agent Name"
//                 allowClear
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 style={{ width: 300 }}
//               />
//             </Col>
//           </Row>
//         }
//       >
//         <Table
//           rowKey={(r) => r.assistantId || Math.random().toString(36).slice(2)}
//           loading={loading}
//           columns={columns}
//           dataSource={filteredData}
//           pagination={{
//             ...pagination,
//             showSizeChanger: true,
//             pageSizeOptions: ["20", "40", "60", "80"],
//           }}
//           onChange={handleTableChange}
//           bordered
//           scroll={{ x: true }}
//         />

//         {/* Preview Modal */}
//         <Modal
//           open={previewVisible}
//           onCancel={() => setPreviewVisible(false)}
//           footer={
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: "12px",
//                 padding: "12px 0",
//               }}
//             >
//               <Tooltip title="Update the agent's status">
//                 <Button
//                   type="primary"
//                   onClick={() => {
//                     if (!selectedAssistant) return;
//                     setPreviewVisible(false);
//                     openStatusModal(selectedAssistant);
//                   }}
//                   style={{
//                     backgroundColor: "#008cba",
//                     borderColor: "#008cba",
//                     color: "#fff",
//                     borderRadius: "6px",
//                     padding: "0 16px",
//                     height: "40px",
//                     fontWeight: 500,
//                   }}
//                   loading={loading}
//                   disabled={!selectedAssistant}
//                   aria-label="Update Agent status"
//                 >
//                   Update Status
//                 </Button>
//               </Tooltip>
             
//               <Tooltip title="Close the preview">
//                 <Button
//                   onClick={() => setPreviewVisible(false)}
//                   style={{
//                     borderRadius: "6px",
//                     padding: "0 16px",
//                     height: "40px",
//                     fontWeight: 500,
//                   }}
//                   aria-label="Close preview modal"
//                 >
//                   Close
//                 </Button>
//               </Tooltip>
//             </div>
//           }
//           width={650}
//           centered
//           closable
//           closeIcon={<span style={{ fontSize: "18px", color: "#666" }}>✕</span>}
//           bodyStyle={{
//             maxHeight: "70vh",
//             overflowY: "auto",

//             backgroundColor: "#f9fafb",
//             borderRadius: "8px",
//           }}
//           style={{ borderRadius: "12px" }}
//           title={
//             <div
//               style={{
//                 fontSize: "20px",
//                 fontWeight: 600,
//                 color: "#1a1a1a",
//                 padding: "8px 0",
//               }}
//             >
//               Agent Details
//             </div>
//           }
//         >
//           {selectedAssistant ? (
//             <>
//               <Descriptions
//                 bordered
//                 column={1}
//                 size="middle"
//                 labelStyle={{
//                   fontWeight: 600,
//                   width: "30%",
//                   backgroundColor: "#f0f2f5",
//                   padding: "12px",
//                 }}
//                 contentStyle={{
//                   whiteSpace: "pre-wrap",
//                   padding: "12px",
//                   backgroundColor: "#fff",
//                 }}
//                 style={{ backgroundColor: "#fff", borderRadius: "8px" }}
//               >
//                 <Descriptions.Item label="Assistant ID">
//                   {selectedAssistant.assistantId}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Created Name">
//                   {selectedAssistant.creatorName}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Agent ID">
//                   {selectedAssistant.agentId}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="User ID">
//                   {selectedAssistant.userId}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Agent Name">
//                   {selectedAssistant.name}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Model">
//                   {selectedAssistant.model}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Created At">
//                   {selectedAssistant.createdAt
//                     ? new Date(
//                         Number(selectedAssistant.createdAt) * 1000
//                       ).toLocaleString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })
//                     : ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Description">
//                   {selectedAssistant.description || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Instructions">
//                   <div
//                     style={{
//                       maxHeight: "200px",
//                       overflowY: "auto",
//                       padding: "8px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "4px",
//                     }}
//                   >
//                     {selectedAssistant.instructions || ""}
//                   </div>
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Header Title">
//                   {selectedAssistant.headerTitle || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="User Experience Summary">
//                   {selectedAssistant.userExperienceSummary || ""}
//                 </Descriptions.Item>{" "}
//                 <Descriptions.Item label="Domain">
//                   {selectedAssistant.domain || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Main Problem Solved">
//                   {selectedAssistant.mainProblemSolved || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Business">
//                   {selectedAssistant.business || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Unique Solution">
//                   {selectedAssistant.uniqueSolution || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Contact Details">
//                   {selectedAssistant.contactDetails || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Approved By">
//                   {selectedAssistant.authorizedBy || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Status">
//                   {renderStatusTag(selectedAssistant.status) || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Approved At">
//                   {selectedAssistant.approvedAt
//                     ? new Date(selectedAssistant.approvedAt).toLocaleString(
//                         "en-US",
//                         {
//                           year: "numeric",
//                           month: "long",
//                           day: "numeric",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         }
//                       )
//                     : ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Tool Used">
//                   {selectedAssistant.toolUsed || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Tools">
//                   {parseTools(selectedAssistant).length > 0
//                     ? parseTools(selectedAssistant).join(", ")
//                     : ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Choose Store">
//                   {selectedAssistant.chooseStore || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Similarity">
//                   {selectedAssistant.similarity || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Conversation Tone">
//                   {selectedAssistant.converstionTone || ""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Image">
//                   {selectedAssistant.imageUrl ? (
//                     <img
//                       src={selectedAssistant.imageUrl}
//                       alt={`Assistant ${selectedAssistant.name || "image"}`}
//                       style={{
//                         maxWidth: "200px",
//                         borderRadius: "8px",
//                         boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                       }}
//                     />
//                   ) : (
//                     ""
//                   )}
//                 </Descriptions.Item>
//               </Descriptions>
//               <Divider style={{ margin: "16px 0", borderColor: "#e8ecef" }} />
//             </>
//           ) : (
//             <div
//               style={{
//                 textAlign: "center",
//                 color: "#888",
//                 fontSize: "16px",
//                 padding: "24px",
//               }}
//             >
//               No assistant selected
//             </div>
//           )}
//         </Modal>

//         {/* Status Modal */}
//         <Modal
//           open={statusModalVisible}
//           onCancel={() => setStatusModalVisible(false)}
//           onOk={handleSaveStatus}
//           title="Update Assistant Status"
//           okText="Save"
//           okButtonProps={{
//             style: {
//               backgroundColor: "#008cba",
//               borderColor: "#008cba",
//               color: "#fff",
//             },
//           }}
//           cancelButtonProps={{
//             style: {
//               backgroundColor: "#f0f0f0",
//               borderColor: "#d9d9d9",
//               color: "#000",
//             },
//           }}
//           destroyOnClose
//         >
//           <Form form={form} layout="vertical">
//             <Form.Item
//               label="Status"
//               name="status"
//               rules={[{ required: true, message: "Please select status" }]}
//             >
//               <Select
//                 onChange={(value) => {
//                   setSelectedStatus(value);
//                   if (value !== "APPROVED") {
//                     form.setFieldsValue({ freetrails: undefined });
//                   } else {
//                     form.setFieldsValue({ freetrails: 5 });
//                   }
//                 }}
//               >
//                 <Option value="APPROVED">APPROVED</Option>
//                 <Option value="REQUESTED">REQUESTED</Option>
//                 <Option value="REJECTED">REJECTED</Option>
//                 <Option value="DELETED">DELETED</Option>
//               </Select>
//             </Form.Item>
//             <Form.Item
//               label="Authorized By"
//               name="authorizedBy"
//               rules={[
//                 { required: true, message: "Please select an authorized name" },
//               ]}
//             >
//               <Select placeholder="Select an authorized name">
//                 {authorizedByOptions.map((authBy) => (
//                   <Option key={authBy} value={authBy}>
//                     {authBy}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//             {selectedStatus === "APPROVED" && (
//               <Form.Item
//                 label="Free Trials"
//                 name="freetrails"
//                 rules={[
//                   {
//                     required: true,
//                     validator: (_rule, value) => {
//                       if (value == null || value === "") {
//                         return Promise.reject(
//                           new Error("Please enter free trials (min 5)")
//                         );
//                       }
//                       if (Number(value) < 5) {
//                         return Promise.reject(
//                           new Error("Free trials must be at least 5")
//                         );
//                       }
//                       return Promise.resolve();
//                     },
//                   },
//                 ]}
//               >
//                 <InputNumber
//                   style={{ width: "100%" }}
//                   min={1}
//                   step={1}
//                   precision={0}
//                   placeholder="Enter minimum 5 free trials"
//                   controls={false}
//                   parser={(v) => (v ? v.replace(/\D/g, "") : "")}
//                 />
//               </Form.Item>
//             )}
//           </Form>
//         </Modal>

//         {/* Tools Modal */}
//         <Modal
//           open={toolsModalVisible}
//           onCancel={() => {
//             setToolsModalVisible(false);
//             setSelectedTools([]); // Reset selected tools on modal close
//             toolForm.resetFields(); // Reset form on modal close
//           }}
//           footer={
//             <Space style={{ display: "flex", justifyContent: "flex-end" }}>
//               <Button
//                 type="primary"
//                 style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
//                 onClick={() => handleSaveTools("update")}
//               >
//                 Save Tools
//               </Button>
//               <Button danger onClick={() => handleSaveTools("remove")}>
//                 Remove Tools
//               </Button>
//             </Space>
//           }
//           title="Manage Tools"
//           width={520}
//           destroyOnClose
//         >
//           <Form form={toolForm} layout="vertical">
//             <Form.Item
//               label="Select Tools"
//               name="selectedTools"
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select at least one tool",
//                 },
//               ]}
//             >
//               <Checkbox.Group
//                 options={[
//                   { label: "File Search", value: "file_search" },
//                   { label: "Web Search", value: "web_search" },
//                 ]}
//                 value={selectedTools}
//                 onChange={(values) => setSelectedTools(values)}
//               />
//             </Form.Item>
//           </Form>
//         </Modal>
//       </Card>
//     </AgentsAdminLayout>
//   );
// };

// export default AssistantsList;







import React, { useEffect, useMemo, useState } from "react";
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
  Tooltip,
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

  // Table pagination (client view) + server cursor
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [cursorAfter, setCursorAfter] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState(null);

  // Forms / Modals
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

  // ---------- Fetching ----------
  const fetchAssistants = async ({
    limit,
    after,
    replace = false,
    searchValue = "",
  }) => {
    try {
      setLoading(true);
      const url =
        `${BASE_URL}/ai-service/agent/getAllAssistants?limit=${encodeURIComponent(
          String(limit)
        )}` + (after ? `&after=${encodeURIComponent(after)}` : "");

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assistants");

      const json = await res.json();
      const fetched = (json && json.data) || [];

      setHasMore(!!(json && json.hasMore));
      setLastId((json && json.lastId) || null);

      const newData = replace ? fetched : [...data, ...fetched];
      setData(newData);

      const newFiltered = searchValue.trim()
        ? newData.filter((item) =>
            (item.name || "").toLowerCase().includes(searchValue.toLowerCase())
          )
        : newData;
      setFilteredData(newFiltered);

      setPagination((prev) => ({
        ...prev,
        total: newFiltered.length + (json.hasMore ? prev.pageSize : 0),
      }));
    } catch (err) {
      console.error(err);
      message.error("Failed to load assistants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursorAfter(null);
    setHasMore(false);
    setLastId(null);
    setData([]);
    setFilteredData([]);
    fetchAssistants({ limit: pagination.pageSize, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Pagination change ----------
  const handleTableChange = async (newPagination) => {
    const goingForward = newPagination.current > pagination.current;
    const pageSizeChanged = newPagination.pageSize !== pagination.pageSize;

    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });

    if (pageSizeChanged) {
      setCursorAfter(null);
      setHasMore(false);
      setLastId(null);
      setData([]);
      setFilteredData([]);
      if (isSearching) {
        await fetchSearch({
          limit: newPagination.pageSize,
          message: searchTerm,
          replace: true,
        });
      } else {
        await fetchAssistants({ limit: newPagination.pageSize, replace: true });
      }
      return;
    }

    const needRows = newPagination.current * newPagination.pageSize;
    if (goingForward && filteredData.length < needRows && hasMore && lastId) {
      if (isSearching) {
        await fetchSearch({
          limit: newPagination.pageSize,
          after: lastId,
          message: searchTerm,
        });
      } else {
        await fetchAssistants({ limit: pagination.pageSize, after: lastId });
      }
    }
  };
  const fetchSearch = async (searchValue) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/ai-service/agent/webSearchForAgent?message=${encodeURIComponent(searchValue)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch search results");

      const json = await res.json();

      // ✅ API returns all, so we filter exactly what was searched
      let filteredResults = [];
      if (json?.data?.length) {
        filteredResults = json.data.filter((item) =>
          item?.name?.toLowerCase()?.includes(searchValue.toLowerCase())
        );
      }

      // ✅ Show only filtered results
      setData(filteredResults);
      setFilteredData(filteredResults);
      setPagination((prev) => ({
        ...prev,
        total: filteredResults.length,
      }));
    } catch (error) {
      console.error(error);
      message.error("Failed to load search results");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Trigger search on paste instantly
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData("text").trim();
    if (pastedText) {
      setSearchTerm(pastedText);
      fetchSearch(pastedText); // hit API directly for pasted text
    }
  };
  // ---------- Live search ----------
  // ✅ Handle input / paste changes (no double API calls)
  let searchTimeout = null;

  const handleSearchChange = (e) => {
    const value = e.target.value?.trim() || "";
    setSearchTerm(value);
    clearTimeout(searchTimeout);

    if (!value) {
      // Reset to full list when search is cleared
      fetchAssistants({ limit: pagination.pageSize, replace: true });
      return;
    }

    // ✅ Debounce to prevent double calls
    searchTimeout = setTimeout(() => {
      fetchSearch(value);
    }, 400);
  };

  // ---------- Status Update ----------
  const openStatusModal = (assistant) => {
    setSelectedAssistant(assistant);
    setSelectedStatus("APPROVED");
    form.setFieldsValue({ status: "APPROVED", freetrails: 5 });
    setStatusModalVisible(true);
  };

  const handleSaveStatus = async () => {
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
        status: values.status,
        authorizedBy: values.authorizedBy,
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
      message.success("Agent status updated successfully!");
      setStatusModalVisible(false);

      setCursorAfter(null);
      setHasMore(false);
      setLastId(null);
      setData([]);
      setFilteredData([]);
      if (isSearching) {
        await fetchSearch({
          limit: pagination.pageSize,
          message: searchTerm,
          replace: true,
        });
      } else {
        await fetchAssistants({ limit: pagination.pageSize, replace: true });
      }
    } catch (err) {
      console.error(err);
      message.error("Error updating assistant status");
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
            Accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
        }
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
  // ---------- Tools Update ----------
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
          : "Tools removed successfully!"
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

  // ---------- Columns ----------
  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "sno",
        align: "center",
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
        title: "Agent ID",
        dataIndex: "agentId",
        key: "agentId",
        align: "center",
        render: (id) => (id ? `#${id.slice(-4)}` : "-"),
      },
      {
        title: "Agent Name",
        dataIndex: "name",
        key: "name",
        align: "center",
      },
      {
        title: "Creator Name",
        dataIndex: "creatorName",
        key: "creatorName",
        align: "center",
      },
      {
        title: "Approved By",
        dataIndex: "authorizedBy",
        key: "authorizedBy",
        align: "center",
      },
      {
        title: "Tool Used",
        dataIndex: "toolUsed",
        key: "toolUsed",
        align: "center",
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        align: "center",
        render: (text) => (
          <div
            style={{
              maxWidth: 300,
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
      //         WebkitLineClamp: 3,
      //         WebkitBoxOrient: "vertical",
      //         overflow: "hidden",
      //       }}
      //     >
      //       {text}
      //     </div>
      //   ),
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
            style={{ display: "flex", gap: "8px", justifyContent: "center" }}
          >
            <Button
              type="primary"
              onClick={() => {
                setSelectedAssistant(record);
                setPreviewVisible(true);
              }}
              style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
            >
              Preview
            </Button>
            <Button
              type="default"
              onClick={() => openToolsModal(record)}
              style={{
                backgroundColor: "#6a1b9a",
                color: "#fff",
                borderColor: "#6a1b9a",
              }}
            >
              Manage Tools
            </Button>
          </div>
        ),
      },
    ],
    [pagination.current, pagination.pageSize]
  );

  // ---------- Render ----------
  return (
    <AgentsAdminLayout>
      <Card
        className="shadow-md rounded-lg"
        title={
          <Row justify="space-between" align="middle" style={{ width: "100%" }}>
            <Col>
              <h1 style={{ margin: 0, textAlign: "center" }}>
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
        }
      >
        <Table
          rowKey={(r) => r.assistantId || Math.random().toString(36).slice(2)}
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["20", "40", "60", "80"],
          }}
          onChange={handleTableChange}
          bordered
          scroll={{ x: true }}
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
                <Descriptions.Item label="Model">
                  {selectedAssistant.model}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {selectedAssistant.createdAt
                    ? new Date(
                        Number(selectedAssistant.createdAt) * 1000
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
                <Descriptions.Item label="Header Title">
                  {selectedAssistant.headerTitle || ""}
                </Descriptions.Item>
                <Descriptions.Item label="User Experience Summary">
                  {selectedAssistant.userExperienceSummary || ""}
                </Descriptions.Item>{" "}
                <Descriptions.Item label="Domain">
                  {selectedAssistant.domain || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Main Problem Solved">
                  {selectedAssistant.mainProblemSolved || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Business">
                  {selectedAssistant.business || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Unique Solution">
                  {selectedAssistant.uniqueSolution || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Contact Details">
                  {selectedAssistant.contactDetails || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Approved By">
                  {selectedAssistant.authorizedBy || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {renderStatusTag(selectedAssistant.status) || ""}
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
                        }
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
                <Descriptions.Item label="Similarity">
                  {selectedAssistant.similarity || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Conversation Tone">
                  {selectedAssistant.converstionTone || ""}
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
        <Modal
          open={statusModalVisible}
          onCancel={() => setStatusModalVisible(false)}
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
          destroyOnClose
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
                    form.setFieldsValue({ freetrails: 5 });
                  }
                }}
              >
                <Option value="APPROVED">APPROVED</Option>
                <Option value="REQUESTED">REQUESTED</Option>
                <Option value="REJECTED">REJECTED</Option>
                <Option value="DELETED">DELETED</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Authorized By"
              name="authorizedBy"
              rules={[
                { required: true, message: "Please select an authorized name" },
              ]}
            >
              <Select placeholder="Select an authorized name">
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
                    validator: (_rule, value) => {
                      if (value == null || value === "") {
                        return Promise.reject(
                          new Error("Please enter free trials (min 5)")
                        );
                      }
                      if (Number(value) < 5) {
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
                  min={1}
                  step={1}
                  precision={0}
                  placeholder="Enter minimum 5 free trials"
                  controls={false}
                  parser={(v) => (v ? v.replace(/\D/g, "") : "")}
                />
              </Form.Item>
            )}
          </Form>
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
      </Card>
    </AgentsAdminLayout>
  );
};

export default AssistantsList;
