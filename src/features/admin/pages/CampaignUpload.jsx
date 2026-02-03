import React, { useState, useEffect, useMemo } from "react";
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
  Row,
  Col,
  Divider,
  DatePicker,
  Spin,
  Tabs,
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "../components/AdminPanel";

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
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
  const MAX_IMAGE_BYTES = 1048576; // 1MB
  const MAX_EXCEL_BYTES = 5242880; // 5MB
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
        })),
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
        "Please fill all required fields and upload the image.",
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
        "Please fill all required fields and upload the image.",
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
          },
        );
        antdMessage.success("Excel Campaign successfully submitted!");
        excelForm.resetFields();
        resetExcelFormAll();

        setExcelFile(null);
        setExcelImage(null);
        setExcelImageList([]); // 🔥 clears image UI
        setExcelInviteType("");
        setSelectedOfferName("");
      } catch (error) {
        console.error("Excel Upload failed:", error);
        const errorMessage =
          error.response?.data?.message || error.message || "";
        if (
          errorMessage.includes("Maximum upload size exceeded") ||
          errorMessage.includes("FileSizeLimitExceededException") ||
          errorMessage.includes("exceeds its maximum permitted size")
        ) {
          // Check if it's an image or Excel file error
          if (errorMessage.includes("image")) {
            antdMessage.error(
              "Please upload an image below 1MB. The uploaded image exceeds the size limit.",
            );
          } else {
            antdMessage.error(
              "Please upload an Excel file below 5MB. The uploaded file exceeds the size limit.",
            );
          }
        } else {
          antdMessage.error("Excel Campaign submission failed.");
        }
      } finally {
        setExcelLoading(false);
      }
    } else if (currentFormType === "whatsapp") {
      const params = {
        inviteType: values.inviteType,
        message: values.message,

        ...(values.mobileNumber && { mobileNumber: values.mobileNumber }),
        ...(values.name && { name: values.name }),
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
          },
        );
        antdMessage.success("WhatsApp Campaign successfully submitted!");
        whatsappForm.resetFields();
        resetWhatsappFormAll();
        setWhatsappImageList([]); // 🔥 clears image UI
        setWhatsappImage(null);
        setWhatsappInviteType("");
      } catch (error) {
        console.error("WhatsApp Upload failed:", error);
        const errorMessage =
          error.response?.data?.message || error.message || "";
        if (
          errorMessage.includes("Maximum upload size exceeded") ||
          errorMessage.includes("FileSizeLimitExceededException") ||
          errorMessage.includes("exceeds its maximum permitted size")
        ) {
          antdMessage.error(
            "Please upload an image below 1MB. The uploaded image exceeds the size limit.",
          );
        } else {
          antdMessage.error("WhatsApp Campaign submission failed.");
        }
      } finally {
        setWhatsappLoading(false);
      }
    }
  };
  const formatBytesMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);
  const isWhatsappDatesRequired = useMemo(() => {
    return ["sampleMessage", "askOxyCustomers", "agents"].includes(
      whatsappInviteType,
    );
  }, [whatsappInviteType]);
  const validateExcelBeforeUpload = (file) => {
    if (file.size > MAX_EXCEL_BYTES) {
      antdMessage.error(
        `Please upload an Excel file below 5MB. Current size: ${formatBytesMB(
          file.size,
        )}MB`,
      );
      return false;
    }
    return true;
  };
  const resetWhatsappFormAll = () => {
    whatsappForm.resetFields();
    setWhatsappImage(null);
    setWhatsappImageList([]);
    setWhatsappInviteType(""); // ← ADD THIS: reset invite type state
  };
  const validateImageBeforeUpload = (file) => {
    if (file.size > MAX_IMAGE_BYTES) {
      Modal.error({
        title: "Image Size Error",
        icon: <ExclamationCircleOutlined />,
        content: `Please upload an image below 1MB. Current size: ${formatBytesMB(
          file.size,
        )}MB`,
        okText: "OK",
      });
      return false;
    }
    return true;
  };
  const resetExcelFormAll = () => {
    excelForm.resetFields();
    setExcelFile(null);
    setExcelImage(null);
    setExcelImageList([]);
    setSelectedOfferName("");
    setExcelInviteType(""); // ← ADD THIS: reset invite type state
  };

  return (
    <AdminPanelLayoutTest>
      <div className=" bg-gradient-to-br via-white p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <Title level={3} className="text-start text-[#008cba]">
            Campaign Management
          </Title>

          <div>
            <Tabs type="card" defaultActiveKey="excel" size="large">
              {/* ------------------- EXCEL TAB ------------------- */}
              <TabPane
                key="excel"
                tab={
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#008cba]">
                      Campaign Through Excel
                    </span>
                  </div>
                }
              >
                <Form
                  form={excelForm}
                  layout="vertical"
                  onFinish={handleExcelPreview}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label={<strong>Invite Type</strong>}
                        name="inviteType"
                        rules={[
                          {
                            required: true,
                            message: "Please select invite type",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select invite type"
                          size="large"
                          onChange={(value) => setExcelInviteType(value)} // ← ADD THIS
                        >
                          <Option value="sampleMessage">Sample Message</Option>
                          <Option value="message">Message</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label={<strong>Offer / Referral</strong>}
                        name="offerId"
                        rules={[
                          {
                            validator: async (_, value) => {
                              const type = excelForm.getFieldValue("type");
                              if (type === "referral") return Promise.resolve();
                              if (!value)
                                return Promise.reject(
                                  new Error("Please select an offer"),
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
                          size="large"
                          loading={offersLoading}
                          showSearch
                          optionFilterProp="label"
                          onChange={(value, option) => {
                            // Referral selected
                            if (value === "referral") {
                              setSelectedOfferName("Referral");
                              excelForm.setFieldsValue({
                                type: "referral",
                                offerId: "referral",
                              });
                              return;
                            }

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
                            offersLoading ? <Spin size="medium" /> : "No offers"
                          }
                        >
                          <Option value="referral" label="referral">
                            Referral
                          </Option>
                          {offers.map((o) => (
                            <Option key={o.id} value={o.id} label={o.offerName}>
                              {o.offerName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Hidden type (backend expects) */}
                  <Form.Item name="type" hidden rules={[{ required: true }]}>
                    <Input size="large" />
                  </Form.Item>

                  <Form.Item
                    label={<strong>Message</strong>}
                    name="message"
                    rules={[
                      { required: true, message: "Please enter message" },
                    ]}
                  >
                    <Input.TextArea
                      rows={6}
                      size="large"
                      placeholder="Enter your message..."
                    />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    {/* Mobile Number optional when NOT "message" */}
                    {excelInviteType !== "message" && (
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item
                          label={<strong>Mobile Number (Optional)</strong>}
                          name="mobileNumber"
                          rules={[
                            {
                              pattern: /^[0-9]*$/,
                              message: "Only numbers allowed",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Enter mobile number"
                          />
                        </Form.Item>
                      </Col>
                    )}

                    {/* Excel file optional when NOT "sampleMessage" */}
                    {excelInviteType !== "sampleMessage" && (
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item
                          label={<strong>Upload Excel File (Optional)</strong>}
                        >
                          <Upload
                            beforeUpload={(file) => {
                              if (!validateExcelBeforeUpload(file))
                                return false;
                              setExcelFile(file);
                              return false;
                            }}
                            accept=".xlsx,.xls"
                            maxCount={1}
                          >
                            <Button size="large" icon={<UploadOutlined />}>
                              Select Excel File
                            </Button>
                          </Upload>
                          {excelFile?.name ? (
                            <Text type="secondary">{excelFile.name}</Text>
                          ) : null}
                        </Form.Item>
                      </Col>
                    )}
                  </Row>

                  <Divider />

                  <Form.Item label={<strong>Upload Image</strong>} required>
                    <Upload
                      fileList={excelImageList}
                      beforeUpload={(file) => {
                        if (!validateImageBeforeUpload(file)) return false;
                        setExcelImage(file);
                        setExcelImageList([file]);
                        return false;
                      }}
                      onRemove={() => {
                        setExcelImage(null);
                        setExcelImageList([]);
                      }}
                      accept="image/*"
                      maxCount={1}
                    >
                      <Button size="large" icon={<UploadOutlined />}>
                        Select Image
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Button
                        onClick={resetExcelFormAll}
                        block
                        style={{ height: 44, borderRadius: 10 }}
                        disabled={excelLoading}
                      >
                        Reset
                      </Button>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={excelLoading}
                        block
                        style={{
                          backgroundColor: "#008cba",
                          borderRadius: 10,
                          height: 44,
                          fontWeight: 600,
                        }}
                      >
                        Preview Excel Campaign
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </TabPane>

              {/* ------------------- WHATSAPP TAB ------------------- */}
              <TabPane
                key="whatsapp"
                tab={
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#1ab39c]">
                      WhatsApp Campaign
                    </span>
                  </div>
                }
              >
                <Form
                  form={whatsappForm}
                  layout="vertical"
                  onFinish={handleWhatsappPreview}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label={<strong>Invite Type</strong>}
                        name="inviteType"
                        rules={[
                          {
                            required: true,
                            message: "Please select invite type",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select invite type"
                          size="large"
                          onChange={(value) => setWhatsappInviteType(value)} // ← ADD THIS (this fixes the dates not appearing)
                        >
                          <Option value="sampleMessage">Sample Message</Option>
                          <Option value="askOxyCustomers">
                            AskOxy Customers
                          </Option>
                          <Option value="kukatpallyCustomer">
                            Kukatpally Customer
                          </Option>
                          <Option value="agents">Agents</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label={<strong>Campaign Name</strong>}
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter campaign name",
                          },
                        ]}
                      >
                        <Input size="large" placeholder="Enter campaign name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label={<strong>Message</strong>}
                    name="message"
                    rules={[
                      { required: true, message: "Please enter message" },
                    ]}
                  >
                    <Input.TextArea
                      rows={6}
                      size="large"
                      placeholder="Enter your WhatsApp message..."
                    />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    {isWhatsappDatesRequired && (
                      <>
                        <Col xs={24} sm={24} md={12} lg={12}>
                          <Form.Item
                            label={<strong>Start Date</strong>}
                            name="startDate"
                            rules={[
                              {
                                required: true,
                                message: "Please select start date",
                              },
                            ]}
                          >
                            <DatePicker
                              size="large"
                              style={{ width: "100%" }}
                              placeholder="Select start date"
                              format="YYYY-MM-DD"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12}>
                          <Form.Item
                            label={<strong>End Date</strong>}
                            name="endDate"
                            rules={[
                              {
                                required: true,
                                message: "Please select end date",
                              },
                            ]}
                          >
                            <DatePicker
                              size="large"
                              style={{ width: "100%" }}
                              placeholder="Select end date"
                              format="YYYY-MM-DD"
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}

                    {whatsappInviteType === "sampleMessage" && (
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item
                          label={<strong>Mobile Number</strong>}
                          name="mobileNumber"
                          rules={[
                            {
                              pattern: /^[0-9]*$/,
                              message: "Only numbers allowed",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Enter mobile number"
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                    )}

                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label={<strong>Limit</strong>}
                        name="limit"
                        rules={[
                          { required: true, message: "Please enter limit" },
                          {
                            pattern: /^[0-9]*$/,
                            message: "Only numbers allowed",
                          },
                        ]}
                      >
                        <Input placeholder="Enter limit" size="large" />
                      </Form.Item>
                    </Col>

                    {whatsappInviteType === "askOxyCustomers" && (
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item
                          label={<strong>Order Count (Optional)</strong>}
                          name="orderCount"
                          rules={[
                            {
                              pattern: /^[0-9]*$/,
                              message: "Only numbers allowed",
                            },
                          ]}
                        >
                          <Input placeholder="Enter order count" size="large" />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>

                  <Divider />

                  <Form.Item label={<strong>Upload Image</strong>} required>
                    <Upload
                      fileList={whatsappImageList}
                      beforeUpload={(file) => {
                        if (!validateImageBeforeUpload(file)) return false;
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
                      <Button size="large" icon={<UploadOutlined />}>
                        Select Image
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Button
                        onClick={resetWhatsappFormAll}
                        block
                        style={{ height: 44, borderRadius: 10 }}
                        disabled={whatsappLoading}
                      >
                        Reset
                      </Button>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={whatsappLoading}
                        block
                        style={{
                          backgroundColor: "#1ab394",
                          borderRadius: 10,
                          height: 44,
                          fontWeight: 600,
                        }}
                      >
                        Preview WhatsApp Campaign
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </TabPane>
            </Tabs>
          </div>
        </div>

        {/* ------------------- PREVIEW MODAL ------------------- */}
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
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <Text strong>Form Type:</Text>{" "}
              <Text>{currentFormType?.toUpperCase()}</Text>
            </div>

            {previewData.inviteType && (
              <div>
                <Text strong>Invite Type:</Text>{" "}
                <Text>{previewData.inviteType}</Text>
              </div>
            )}

            {currentFormType === "excel" && previewData.type && (
              <div>
                <Text strong>Type:</Text> <Text>{previewData.type}</Text>
              </div>
            )}

            {currentFormType === "excel" && previewData.offerName && (
              <div>
                <Text strong>Offer Name:</Text>{" "}
                <Text>{previewData.offerName}</Text>
              </div>
            )}

            {previewData.name && (
              <div>
                <Text strong>Campaign Name:</Text>{" "}
                <Text>{previewData.name}</Text>
              </div>
            )}

            {previewData.message && (
              <div>
                <Text strong>Message:</Text>
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                  {previewData.message}
                </div>
              </div>
            )}

            {previewData.startDate && (
              <div>
                <Text strong>Start Date:</Text>{" "}
                <Text>
                  {previewData.startDate?.format
                    ? previewData.startDate.format("YYYY-MM-DD")
                    : previewData.startDate}
                </Text>
              </div>
            )}

            {previewData.endDate && (
              <div>
                <Text strong>End Date:</Text>{" "}
                <Text>
                  {previewData.endDate?.format
                    ? previewData.endDate.format("YYYY-MM-DD")
                    : previewData.endDate}
                </Text>
              </div>
            )}

            {previewData.limit && (
              <div>
                <Text strong>Limit:</Text> <Text>{previewData.limit}</Text>
              </div>
            )}

            {previewData.mobileNumber && (
              <div>
                <Text strong>Mobile Number:</Text>{" "}
                <Text>{previewData.mobileNumber}</Text>
              </div>
            )}

            {previewData.orderCount && (
              <div>
                <Text strong>Order Count:</Text>{" "}
                <Text>{previewData.orderCount}</Text>
              </div>
            )}

            {previewData.file?.name && (
              <div>
                <Text strong>Excel File:</Text>{" "}
                <Text>{previewData.file.name}</Text>
              </div>
            )}

            {previewData.image && (
              <div>
                <Text strong>Image Preview:</Text>
                <div style={{ marginTop: 8 }}>
                  <img
                    src={URL.createObjectURL(previewData.image)}
                    alt="preview"
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 10,
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default CampaignUpload;
