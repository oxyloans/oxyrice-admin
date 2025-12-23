import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  message as antdMessage,
  Card,
  Typography,
  Modal,
  DatePicker,
  Spin,
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";

const { Option } = Select;
const { Title } = Typography;
const OFFERS_API = `${BASE_URL}/cart-service/cart/activeOffers`;
const CampaignUpload = () => {
  const [excelLoading, setExcelLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [currentFormType, setCurrentFormType] = useState("");
  const [excelImageList, setExcelImageList] = useState([]);
  const [whatsappImageList, setWhatsappImageList] = useState([]);

  const [excelForm] = Form.useForm();
  const [whatsappForm] = Form.useForm();

  const [excelFile, setExcelFile] = useState(null);
  const [excelImage, setExcelImage] = useState(null);
  const [excelInviteType, setExcelInviteType] = useState("");

  const [whatsappImage, setWhatsappImage] = useState(null);
  const [whatsappInviteType, setWhatsappInviteType] = useState("");

  const [offersLoading, setOffersLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [selectedOfferName, setSelectedOfferName] = useState("");
  const fetchOffers = async () => {
    try {
      setOffersLoading(true);
      const res = await axios.get(OFFERS_API);

      const list = Array.isArray(res.data) ? res.data : [];
      const activeOnly = list.filter((x) => x?.active === true);

      setOffers(
        activeOnly.map((x) => ({
          id: x.id,
          offerName: x.offerName,
          active: x.active,
        }))
      );
    } catch (e) {
      console.error(e);
      antdMessage.error("Failed to load offers");
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleExcelPreview = (values) => {
    if (!excelImage || !values.message || !excelInviteType) {
      antdMessage.warning(
        "Please fill all required fields and upload the image."
      );
      return;
    }

    const isReferral = values.type === "referral";

    // ✅ If no type => no offer selected
    if (!values.type) {
      antdMessage.warning("Please select an Offer.");
      return;
    }

    // ✅ If NOT referral => offerId must be present
    if (!isReferral && !values.offerId) {
      antdMessage.warning("Please select an Offer.");
      return;
    }

    setPreviewData({
      ...values,
      inviteType: excelInviteType,
      image: excelImage,
      file: excelFile,
      offerName: selectedOfferName,
    });
    setCurrentFormType("excel");
    setPreviewVisible(true);
  };

  const handleWhatsappPreview = (values) => {
    if (!whatsappImage || !values.message || !whatsappInviteType) {
      antdMessage.warning(
        "Please fill all required fields and upload the image."
      );
      return;
    }

    setPreviewData({
      ...values,
      inviteType: whatsappInviteType,
      image: whatsappImage,
    });
    setCurrentFormType("whatsapp");
    setPreviewVisible(true);
  };

  const handleConfirmSubmit = async () => {
    setPreviewVisible(false);

    const values = previewData;
    const formData = new FormData();
    formData.append("image", values.image);

    if (currentFormType === "excel") {
      if (values.file) formData.append("file", values.file);
      const isReferral = values.type === "referral";
      const params = {
        inviteType: values.inviteType,
        message: values.message,
        type: values.type, // always send type
        ...(values.mobileNumber && { mobileNumber: values.mobileNumber }),
        ...(values.orderCount && { orderCount: values.orderCount }),
        ...(!isReferral && values.offerId ? { offerId: values.offerId } : {}),
      };

      try {
        setExcelLoading(true);
        const response = await axios.post(
          `${BASE_URL}/order-service/campaignThroughExcel`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            params,
          }
        );
        antdMessage.success("Excel Campaign successfully submitted!");
        excelForm.resetFields();
        setExcelFile(null);
        setExcelImage(null);
        setExcelImageList([]); // 🔥 clears image UI
        setExcelInviteType("");
        setSelectedOfferName("");
      } catch (error) {
        console.error("Excel Upload failed:", error);
        antdMessage.error("❌ Excel Campaign submission failed.");
      } finally {
        setExcelLoading(false);
      }
    } else if (currentFormType === "whatsapp") {
      const params = {
        inviteType: values.inviteType,
        message: values.message,

        ...(values.mobileNumber && { mobileNumber: values.mobileNumber }),
        ...(values.campaignName && { campaignName: values.campaignName }),
        ...(values.orderCount && { orderCount: values.orderCount }),
        ...(values.limit && { limit: values.limit }),

        ...(values.startDate && {
          startDate: values.startDate.format("YYYY-MM-DD"),
        }),
        ...(values.endDate && { endDate: values.endDate.format("YYYY-MM-DD") }),
      };

      try {
        setWhatsappLoading(true);
        const response = await axios.post(
          `${BASE_URL}/order-service/whatsAppcampaign`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            params,
          }
        );
        antdMessage.success("WhatsApp Campaign successfully submitted!");
        whatsappForm.resetFields();
        setWhatsappImageList([]); // 🔥 clears image UI
        setWhatsappImage(null);
        setWhatsappInviteType("");
      } catch (error) {
        console.error("WhatsApp Upload failed:", error);
        antdMessage.error("WhatsApp Campaign submission failed.");
      } finally {
        setWhatsappLoading(false);
      }
    }
  };

  return (
    <AdminPanelLayoutTest>
      <div className="min-h-screen bg-gradient-to-br via-white p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="text-start mb-4 text-gray-800">
            Campaign Management
          </Title>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Excel Campaign */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <FileExcelOutlined className="text-white text-xl" />
                  <span className="text-white font-semibold">
                    Campaign Through Excel
                  </span>
                </div>
              }
              headStyle={{ background: "#008cba", color: "white" }}
              className="shadow-md"
            >
              <Form
                form={excelForm}
                layout="vertical"
                onFinish={handleExcelPreview}
              >
                <Form.Item
                  label="Invite Type"
                  name="inviteType"
                  rules={[
                    { required: true, message: "Please select invite type" },
                  ]}
                >
                  <Select
                    placeholder="Select invite type"
                    onChange={setExcelInviteType}
                  >
                    <Option value="sampleMessage">Sample Message</Option>
                    <Option value="message">Message</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Message"
                  name="message"
                  rules={[{ required: true, message: "Please enter message" }]}
                >
                  <Input.TextArea
                    rows={6}
                    placeholder="Enter your message..."
                  />
                </Form.Item>
                <Form.Item
                  label="Offer"
                  name="offerId"
                  rules={[
                    {
                      validator: async (_, value) => {
                        const type = excelForm.getFieldValue("type");
                        if (type === "referral") return Promise.resolve(); // ✅ allow referral
                        if (!value)
                          return Promise.reject(
                            new Error("Please select an offer")
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    placeholder={
                      offersLoading ? "Loading offers..." : "Select offer"
                    }
                    loading={offersLoading}
                    showSearch
                    optionFilterProp="label"
                    onChange={(value, option) => {
                      // ✅ Referral selected
                      if (value === "referral") {
                        setSelectedOfferName("referral");

                        // ✅ Clear offerId from form (so it won't go to payload)
                        excelForm.setFieldsValue({
                          offerId: undefined,
                          type: "referral",
                        });
                        return;
                      }

                      // ✅ Normal offer selected
                      const offerName = option?.label || "";
                      setSelectedOfferName(offerName);

                      excelForm.setFieldsValue({
                        offerId: value,
                        type: offerName,
                      });
                    }}
                    filterOption={(input, option) =>
                      (option?.label || "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    notFoundContent={
                      offersLoading ? <Spin size="small" /> : "No offers"
                    }
                  >
                    {/* ✅ STATIC Referral option */}
                    <Option value="referral" label="referral">
                      Referral
                    </Option>

                    {/* ✅ DYNAMIC offers */}
                    {offers.map((o) => (
                      <Option key={o.id} value={o.id} label={o.offerName}>
                        {o.offerName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* ✅ hidden type */}
                <Form.Item name="type" hidden rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                {excelInviteType !== "message" && (
                  <Form.Item
                    label="Mobile Number (Optional)"
                    name="mobileNumber"
                    rules={[
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter mobile number" />
                  </Form.Item>
                )}

                {excelInviteType !== "sampleMessage" && (
                  <Form.Item label="Upload Excel File (Optional)">
                    <Upload
                      beforeUpload={(file) => {
                        setExcelFile(file);
                        return false;
                      }}
                      accept=".xlsx,.xls"
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>
                        Select Excel File
                      </Button>
                    </Upload>
                  </Form.Item>
                )}

                <Form.Item label="Upload Image" required>
                  <Upload
                    fileList={excelImageList}
                    beforeUpload={(file) => {
                      setExcelImage(file);
                      setExcelImageList([file]); // ✅ control file
                      return false;
                    }}
                    onRemove={() => {
                      setExcelImage(null);
                      setExcelImageList([]);
                    }}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Select Image</Button>
                  </Upload>
                </Form.Item>

                <Form.Item className="text-right mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={excelLoading}
                    style={{
                      backgroundColor: "#008cba",
                      borderRadius: "10px",
                      height: "45px",
                      fontWeight: 600,
                    }}
                    block
                  >
                    Preview Excel Campaign
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* WhatsApp Campaign */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <MessageOutlined className="text-white text-xl" />
                  <span className="text-white font-semibold">
                    WhatsApp Campaign
                  </span>
                </div>
              }
              headStyle={{ background: "#1ab394", color: "white" }}
              className="shadow-md"
            >
              <Form
                form={whatsappForm}
                layout="vertical"
                onFinish={handleWhatsappPreview}
              >
                <Form.Item
                  label="Invite Type"
                  name="inviteType"
                  rules={[
                    { required: true, message: "Please select invite type" },
                  ]}
                >
                  <Select
                    placeholder="Select invite type"
                    onChange={setWhatsappInviteType}
                  >
                    <Option value="sampleMessage">Sample Message</Option>
                    <Option value="askOxyCustomers">AskOxy Customers</Option>
                    <Option value="kukatpallyCustomer">
                      kukatpallyCustomer
                    </Option>
                    <Option value="agents">Agents</Option>
                  </Select>
                </Form.Item>
                {whatsappInviteType === "sampleMessage" && (
                  <Form.Item
                    label="Campaign Name"
                    name="campaignName"
                    rules={[
                      { required: true, message: "Please enter message" },
                    ]}
                  >
                    <Input placeholder="Enter campaign name" />
                  </Form.Item>
                )}
                {whatsappInviteType === "agents" && (
                  <Form.Item
                    label="Campaign Name"
                    name="campaignName"
                    rules={[
                      { required: true, message: "Please enter message" },
                    ]}
                  >
                    <Input placeholder="Enter campaign name" />
                  </Form.Item>
                )}
                {whatsappInviteType === "kukatpallyCustomer" && (
                  <Form.Item
                    label="Campaign Name"
                    name="campaignName"
                    rules={[
                      { required: true, message: "Please enter message" },
                    ]}
                  >
                    <Input placeholder="Enter campaign name" />
                  </Form.Item>
                )}
                {whatsappInviteType === "askOxyCustomers" && (
                  <Form.Item
                    label="Campaign Name"
                    name="campaignName"
                    rules={[
                      { required: true, message: "Please enter message" },
                    ]}
                  >
                    <Input placeholder="Enter campaign name" />
                  </Form.Item>
                )}

                <Form.Item
                  label="Message"
                  name="message"
                  rules={[{ required: true, message: "Please enter message" }]}
                >
                  <Input.TextArea
                    rows={6}
                    placeholder="Enter your message..."
                  />
                </Form.Item>
                {whatsappInviteType === "sampleMessage" && (
                  <Form.Item
                    label="Start Date"
                    name="startDate"
                    rules={[
                      { required: true, message: "Please select start date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select start date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                )}

                {whatsappInviteType === "sampleMessage" && (
                  <Form.Item
                    label="End Date"
                    name="endDate"
                    rules={[
                      { required: true, message: "Please select end date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select end date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                )}
                {whatsappInviteType === "sampleMessage" && (
                  <Form.Item
                    label="Mobile Number"
                    name="mobileNumber"
                    rules={[
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter mobile number" />
                  </Form.Item>
                )}
                {whatsappInviteType === "askOxyCustomers" && (
                  <Form.Item
                    label="Start Date"
                    name="startDate"
                    rules={[
                      { required: true, message: "Please select start date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select start date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                )}

                {whatsappInviteType === "askOxyCustomers" && (
                  <Form.Item
                    label="End Date"
                    name="endDate"
                    rules={[
                      { required: true, message: "Please select end date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select end date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                )}
                {whatsappInviteType === "agents" && (
                  <Form.Item
                    label="Start Date"
                    name="startDate"
                    rules={[
                      { required: true, message: "Please select start date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select start date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                )}

                {whatsappInviteType === "agents" && (
                  <Form.Item
                    label="End Date"
                    name="endDate"
                    rules={[
                      { required: true, message: "Please select end date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select end date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                )}
                {/* {whatsappInviteType === "sampleMessage" && (
                  <Form.Item
                    label="Order Count"
                    name="orderCount"
                    rules={[
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter order count" />
                  </Form.Item>
                )} */}
                {whatsappInviteType === "agents" && (
                  <Form.Item
                    label="Limit "
                    name="limit"
                    rules={[
                      { required: true, message: "Please enter limit" },
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter limit" />
                  </Form.Item>
                )} {whatsappInviteType === "sampleMessage" && (
                  <Form.Item
                    label="Limit "
                    name="limit"
                    rules={[
                      { required: true, message: "Please enter limit" },
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter limit" />
                  </Form.Item>
                )}
                {whatsappInviteType === "kukatpallyCustomer" && (
                  <Form.Item
                    label="Limit "
                    name="limit"
                    rules={[
                      { required: true, message: "Please enter limit" },
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter limit" />
                  </Form.Item>
                )}
                {whatsappInviteType === "askOxyCustomers" && (
                  <Form.Item
                    label="Order Count"
                    name="orderCount"
                    rules={[
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter order count" />
                  </Form.Item>
                )}
                {whatsappInviteType === "askOxyCustomers" && (
                  <Form.Item
                    label="Limit "
                    name="limit"
                    rules={[
                      { required: true, message: "Please enter limit" },
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter limit" />
                  </Form.Item>
                )}
                <Form.Item label="Upload Image" required>
                  <Upload
                    fileList={whatsappImageList}
                    beforeUpload={(file) => {
                      setWhatsappImage(file);
                      setWhatsappImageList([file]);
                      return false;
                    }}
                    onRemove={() => {
                      setWhatsappImage(null);
                      setWhatsappImageList([]);
                    }}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Select Image</Button>
                  </Upload>
                </Form.Item>
                <Form.Item className="text-right mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={whatsappLoading}
                    style={{
                      backgroundColor: "#1ab394",
                      borderRadius: "10px",
                      height: "45px",
                      fontWeight: 600,
                    }}
                    block
                  >
                    Preview WhatsApp Campaign
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>

        {/* 🔍 Preview Modal */}
        <Modal
          open={previewVisible}
          title="Preview Campaign Details"
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setPreviewVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={handleConfirmSubmit}
              style={{ background: "#008cba" }}
            >
              Confirm & Submit
            </Button>,
          ]}
        >
          <p>
            <strong>Invite Type:</strong> {previewData.inviteType}
          </p>
          <p>
            <strong>Message:</strong> {previewData.message}
            {previewData.startDate && (
              <p>
                <strong>Start Date:</strong>{" "}
                {previewData.startDate.format
                  ? previewData.startDate.format("YYYY-MM-DD")
                  : previewData.startDate}
              </p>
            )}
            {previewData.endDate && (
              <p>
                <strong>End Date:</strong>{" "}
                {previewData.endDate.format
                  ? previewData.endDate.format("YYYY-MM-DD")
                  : previewData.endDate}
              </p>
            )}
            {previewData.limit && (
              <p>
                <strong>Limit:</strong> {previewData.limit}
              </p>
            )}
          </p>
          {previewData.mobileNumber && (
            <p>
              <strong>Mobile Number:</strong> {previewData.mobileNumber}
            </p>
          )}
          {previewData.orderCount && (
            <p>
              <strong>Order Count:</strong> {previewData.orderCount}
            </p>
          )}
          {previewData.file && (
            <p>
              <strong>Excel File:</strong> {previewData.file.name}
            </p>
          )}
          {previewData.image && (
            <div className="mt-3">
              <strong>Image Preview:</strong>
              <img
                src={URL.createObjectURL(previewData.image)}
                alt="preview"
                className="mt-2 rounded-md border w-32 h-32 object-cover"
              />
            </div>
          )}
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default CampaignUpload;
