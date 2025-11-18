import React, { useState } from "react";
import { Form, InputNumber, Button, message, Card } from "antd";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";
import BASE_URL from "../../AdminPages/Config";

const AgentsBmvCoinsUpdated = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSaveCoins = async (values) => {
    const { assignCoins } = values;

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user-service/SaveBmvCoinsToAgent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignCoins }),
        }
      );

      const data = await response.json();

      // ---------- FIXED LOGIC HERE ----------
      const success =
        data?.status === true ||
        (data?.message && data.message.toLowerCase().includes("success"));

      if (success) {
        message.success(data.message || "Saved successfully");
      } else {
        message.error(data.message || "Failed to save");
      }
      // --------------------------------------
    } catch (error) {
      message.error("API Error! Try again");
    }

    setLoading(false);
  };

  return (
    <AgentsAdminLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
        <Card className="max-w-md mx-auto shadow-md">
          <h2 className="text-xl font-semibold mb-6">
            Assign BMV Coins to Agent
          </h2>

          <Form form={form} layout="vertical" onFinish={handleSaveCoins}>
            <Form.Item
              label="Enter Coins"
              name="assignCoins"
              rules={[
                { required: true, message: "Please enter number of coins" },
                {
                  type: "number",
                  min: 1,
                  message: "Coins must be greater than 0",
                },
              ]}
            >
              <InputNumber className="w-full" placeholder="Enter coins" />
            </Form.Item>

            <Form.Item>
              <Button
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#008cba",
                  color: "white",
                  borderColor: "#008cba",
                  fontWeight: "bold",
                  padding: "6px 16px",
                  borderRadius: "6px",
                }}
                block
              >
                Save Coins
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AgentsAdminLayout>
  );
};

export default AgentsBmvCoinsUpdated;
