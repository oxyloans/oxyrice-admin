import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Input, message, Spin, Modal, Form } from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const token = localStorage.getItem("token");

  /** Fetch Agents */
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/ai-service/agent/getAllAgentApproved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAgents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to fetch agents");
      console.error("Fetch agents error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /** Save Authorized By */
  const saveAgent = async (values) => {
    setLoading(true);
    try {
      await axios.patch(
        `${BASE_URL}/ai-service/agent/agentApprovedName`,
        {
          id: selectedAgentId || "6810c5e4-0e80-4673-bff3-f3f2ac1e863e",
          authorizedBy: values.authorizedBy,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Authorized user added successfully");
      fetchAgents();
      setIsModalVisible(false);
      // reset form only after success
      form.resetFields();
      setSelectedAgentId(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save agent");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAgents();
    } else {
      message.error("No authorization token found. Please log in.");
    }
  }, [fetchAgents, token]);

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
     render: (id) => (
       <>
         {id && (
           <span style={{ color: "#008cba", fontWeight: 600 }}>
             #{id.slice(-4)}
           </span>
         )}
       </>
     ),
   },
   {
     title: "Authorized By",
     dataIndex: "authorizedBy",
     key: "authorizedBy",
     align: "center",
   },
 ];


  return (
    <AgentsAdminLayout>
      <div style={{ padding: "20px" }}>
        {/* Header with Add button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1>Authorized Users Management</h1>
          <Button
            type="primary"
            style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
            onClick={() => setIsModalVisible(true)}
          >
            Add Authorized User
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

        {/* Modal for Add */}
        <Modal
          title="Add Authorized User"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)} // just close, don't reset
          okText="Save"
          confirmLoading={loading}
          onOk={() => form.submit()} // trigger Form validation
          destroyOnClose={false} // 👈 keeps form values intact
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={saveAgent} // called only if validation passes
            preserve={true} // 👈 ensures values stay even when closed
          >
            <Form.Item
              label="Authorized By"
              name="authorizedBy"
              rules={[
                {
                  required: true,
                  message: "Please enter authorized user name",
                },
              ]}
            >
              <Input placeholder="Enter authorized user name" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AgentsAdminLayout>
  );
};

export default AgentManagement;
