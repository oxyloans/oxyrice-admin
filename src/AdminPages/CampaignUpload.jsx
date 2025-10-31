// import React, { useState } from "react";
// import {
//   Form,
//   Input,
//   Select,
//   Upload,
//   Button,
//   message as antdMessage,
//   Card,
//   Typography,
// } from "antd";
// import {
//   UploadOutlined,
//   FileExcelOutlined,
//   MessageOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import BASE_URL from "./Config";
// import AdminPanelLayoutTest from "./AdminPanel";

// const { Option } = Select;
// const { Title } = Typography;

// const CampaignUpload = () => {
//   // Shared states if needed, but separate for each form
//   const [excelLoading, setExcelLoading] = useState(false);
//   const [whatsappLoading, setWhatsappLoading] = useState(false);

//   const [excelForm] = Form.useForm();
//   const [whatsappForm] = Form.useForm();

//   // Excel Form States
//   const [excelFile, setExcelFile] = useState(null);
//   const [excelImage, setExcelImage] = useState(null);
//   const [excelInviteType, setExcelInviteType] = useState("");

//   // WhatsApp Form States
//   const [whatsappImage, setWhatsappImage] = useState(null);
//   const [whatsappInviteType, setWhatsappInviteType] = useState("");

//   // 🔹 Excel Submit Handler
//   const handleExcelSubmit = async (values) => {
//     const { message, mobileNumber, orderCount } = values;

//     if (!excelImage || !message || !excelInviteType) {
//       antdMessage.warning(
//         "Please fill all required fields and upload the image."
//       );
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", excelImage);
//     if (excelFile) formData.append("file", excelFile);

//     const params = {
//       inviteType: excelInviteType,
//       message,
//       ...(mobileNumber && { mobileNumber }),
//       ...(orderCount && { orderCount }),
//     };

//     try {
//       setExcelLoading(true);
//       const response = await axios.post(
//         `${BASE_URL}/order-service/campaignThroughExcel`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           params,
//         }
//       );

//       console.log("✅ Excel API Response:", response.data);
//       antdMessage.success("🎉 Excel Campaign uploaded successfully!");
//       excelForm.resetFields();
//       setExcelFile(null);
//       setExcelImage(null);
//       setExcelInviteType("");
//     } catch (error) {
//       console.error("❌ Excel Upload failed:", error);
//       antdMessage.error(
//         "Excel Upload failed. Please check the console for details."
//       );
//     } finally {
//       setExcelLoading(false);
//     }
//   };

//   // 🔹 WhatsApp Submit Handler
//   const handleWhatsappSubmit = async (values) => {
//     const { message, mobileNumber, orderCount } = values;

//     if (!whatsappImage || !message || !whatsappInviteType) {
//       antdMessage.warning(
//         "Please fill all required fields and upload the image."
//       );
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", whatsappImage);

//     const params = {
//       inviteType: whatsappInviteType,
//       message,
//       ...(mobileNumber && { mobileNumber }),
//       ...(orderCount && { orderCount }),
//     };

//     try {
//       setWhatsappLoading(true);
//       const response = await axios.post(
//         `${BASE_URL}/order-service/whatsAppcampaign`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           params,
//         }
//       );

//       console.log("✅ WhatsApp API Response:", response.data);
//       antdMessage.success("🎉 WhatsApp Campaign uploaded successfully!");
//       whatsappForm.resetFields();
//       setWhatsappImage(null);
//       setWhatsappInviteType("");
//     } catch (error) {
//       console.error("❌ WhatsApp Upload failed:", error);
//       antdMessage.error(
//         "WhatsApp Upload failed. Please check the console for details."
//       );
//     } finally {
//       setWhatsappLoading(false);
//     }
//   };

//   // 🔹 Excel Upload Handlers
//   const handleExcelFileUpload = (file) => {
//     setExcelFile(file);
//     return false;
//   };

//   const handleExcelImageUpload = (file) => {
//     setExcelImage(file);
//     return false;
//   };

//   // 🔹 WhatsApp Image Upload Handler
//   const handleWhatsappImageUpload = (file) => {
//     setWhatsappImage(file);
//     return false;
//   };

//   return (
//     <AdminPanelLayoutTest>
//       <div className="min-h-screen bg-gradient-to-br via-white p-6 sm:p-10">
//         <div className="max-w-7xl mx-auto">
//           <Title level={2} className="text-start mb-4 text-gray-800">
//             Campaign Management 
//           </Title>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* 🟢 Left Side: Excel Campaign */}
//             <Card
//               title={
//                 <div className="flex items-center gap-2">
//                   <FileExcelOutlined className="text-white text-xl" />
//                   <span className="text-white font-semibold">
//                     Campaign Through Excel
//                   </span>
//                 </div>
//               }
//               className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
//               headStyle={{
//                 background: "#008cba",
//                 color: "white",
//                 borderRadius: "8px 8px 0 0",
//               }}
//               bodyStyle={{ padding: "24px" }}
//             >
//               <Form
//                 form={excelForm}
//                 layout="vertical"
//                 onFinish={handleExcelSubmit}
//               >
//                 {/* Invite Type */}
//                 <Form.Item
//                   label={
//                     <span className="font-medium text-gray-700">
//                       Invite Type <span className="text-red-500">*</span>
//                     </span>
//                   }
//                   name="inviteType"
//                   rules={[
//                     { required: true, message: "Please select invite type" },
//                   ]}
//                 >
//                   <Select
//                     placeholder="Select invite type"
//                     onChange={setExcelInviteType}
//                     className="rounded-lg"
//                   >
//                     <Option value="sampleMessage">Sample Message</Option>
//                     <Option value="message">Message</Option>
//                   </Select>
//                 </Form.Item>

//                 {/* Message */}
//                 <Form.Item
//                   label={
//                     <span className="font-medium text-gray-700">
//                       Message <span className="text-red-500">*</span>
//                     </span>
//                   }
//                   name="message"
//                   rules={[{ required: true, message: "Please enter message" }]}
//                 >
//                   <Input.TextArea
//                     rows={3}
//                     placeholder="Enter your message..."
//                     allowClear
//                     className="rounded-lg"
//                   />
//                 </Form.Item>

//                 {/* Mobile Number */}
//                 {excelInviteType !== "message" && (
//                   <Form.Item
//                     label={
//                       <span className="font-medium text-gray-700">
//                         Mobile Number (Optional)
//                       </span>
//                     }
//                     name="mobileNumber"
//                     rules={[
//                       {
//                         pattern: /^[0-9]*$/,
//                         message: "Please enter a valid number",
//                       },
//                     ]}
//                   >
//                     <Input
//                       placeholder="Enter mobile number"
//                       maxLength={15}
//                       className="rounded-lg"
//                     />
//                   </Form.Item>
//                 )}

//                 {/* Excel Upload */}
//                 {excelInviteType !== "sampleMessage" && (
//                   <Form.Item
//                     label={
//                       <span className="font-medium text-gray-700">
//                         Upload Excel File (Optional)
//                       </span>
//                     }
//                   >
//                     <Upload
//                       beforeUpload={handleExcelFileUpload}
//                       accept=".xlsx,.xls"
//                       maxCount={1}
//                       listType="picture"
//                       className="w-full"
//                     >
//                       <Button
//                         icon={<UploadOutlined />}
//                         block
//                         className="rounded-lg bg-blue-50 border-blue-200"
//                       >
//                         Select Excel File
//                       </Button>
//                     </Upload>
//                   </Form.Item>
//                 )}

//                 {/* Image Upload */}
//                 <Form.Item
//                   label={
//                     <span className="font-medium text-gray-700">
//                       Upload Image <span className="text-red-500">*</span>
//                     </span>
//                   }
//                   required
//                 >
//                   <Upload
//                     beforeUpload={handleExcelImageUpload}
//                     accept="image/*"
//                     maxCount={1}
//                     listType="picture"
//                   >
//                     <Button
//                       icon={<UploadOutlined />}
//                       block
//                       className="rounded-lg bg-blue-50 border-blue-200"
//                     >
//                       Select Image
//                     </Button>
//                   </Upload>
//                 </Form.Item>

//                 {/* Submit */}
//                 <Form.Item className="text-right mt-6">
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     loading={excelLoading}
//                     block
//                     className="rounded-xl h-12 font-semibold text-white"
//                     style={{
//                       background:
//                         "#008cba",
//                     }}
//                   >
//                     {excelLoading ? "Uploading..." : "Submit Excel Campaign"}
//                   </Button>
//                 </Form.Item>
//               </Form>
//             </Card>

//             {/* 🟡 Right Side: WhatsApp Campaign */}
//             <Card
//               title={
//                 <div className="flex items-center gap-2">
//                   <MessageOutlined className="text-white text-xl" />
//                   <span className="text-white font-semibold">
//                     WhatsApp Campaign
//                   </span>
//                 </div>
//               }
//               className="border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
//               headStyle={{
//                 background: "#1ab394",
//                 color: "white",
//                 borderRadius: "8px 8px 0 0",
//               }}
//               bodyStyle={{ padding: "24px" }}
//             >
//               <Form
//                 form={whatsappForm}
//                 layout="vertical"
//                 onFinish={handleWhatsappSubmit}
//               >
//                 {/* Invite Type */}
//                 <Form.Item
//                   label={
//                     <span className="font-medium text-gray-700">
//                       Invite Type <span className="text-red-500">*</span>
//                     </span>
//                   }
//                   name="inviteType"
//                   rules={[
//                     { required: true, message: "Please select invite type" },
//                   ]}
//                 >
//                   <Select
//                     placeholder="Select invite type"
//                     onChange={setWhatsappInviteType}
//                     className="rounded-lg"
//                   >
//                     <Option value="sampleMessage">Sample Message</Option>
//                     <Option value="askOxyCustomers">AskOxy Customers</Option>
//                     <Option value="agents">Agents</Option>
//                   </Select>
//                 </Form.Item>

//                 {/* Message */}
//                 <Form.Item
//                   label={
//                     <span className="font-medium text-gray-700">
//                       Message <span className="text-red-500">*</span>
//                     </span>
//                   }
//                   name="message"
//                   rules={[{ required: true, message: "Please enter message" }]}
//                 >
//                   <Input.TextArea
//                     rows={3}
//                     placeholder="Enter message..."
//                     allowClear
//                     className="rounded-lg"
//                   />
//                 </Form.Item>

//                 {/* Mobile Number */}
//                 {whatsappInviteType === "sampleMessage" && (
//                   <Form.Item
//                     label={
//                       <span className="font-medium text-gray-700">
//                         Mobile Number <span className="text-red-500">*</span>
//                       </span>
//                     }
//                     name="mobileNumber"
//                     rules={[
//                       { required: true, message: "Please enter mobile number" },
//                       {
//                         pattern: /^[0-9]*$/,
//                         message: "Please enter a valid number",
//                       },
//                     ]}
//                   >
//                     <Input
//                       placeholder="Enter mobile number"
//                       maxLength={15}
//                       className="rounded-lg"
//                     />
//                   </Form.Item>
//                 )}

//                 {/* Order Count */}
//                 {whatsappInviteType === "askOxyCustomers" && (
//                   <Form.Item
//                     label={
//                       <span className="font-medium text-gray-700">
//                         Order Count <span className="text-red-500">*</span>
//                       </span>
//                     }
//                     name="orderCount"
//                     rules={[
//                       { required: true, message: "Please enter order count" },
//                       { pattern: /^[0-9]*$/, message: "Must be a number" },
//                     ]}
//                   >
//                     <Input
//                       placeholder="Enter order count"
//                       className="rounded-lg"
//                     />
//                   </Form.Item>
//                 )}

//                 {/* Image Upload */}
//                 <Form.Item
//                   label={
//                     <span className="font-medium text-gray-700">
//                       Upload Image <span className="text-red-500">*</span>
//                     </span>
//                   }
//                   required
//                 >
//                   <Upload
//                     beforeUpload={handleWhatsappImageUpload}
//                     accept="image/*"
//                     maxCount={1}
//                     listType="picture"
//                   >
//                     <Button
//                       icon={<UploadOutlined />}
//                       block
//                       className="rounded-lg bg-green-50 border-green-200"
//                     >
//                       Select Image
//                     </Button>
//                   </Upload>
//                 </Form.Item>

//                 {/* Submit */}
//                 <Form.Item className="text-right mt-6">
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     loading={whatsappLoading}
//                     block
//                     className="rounded-xl h-12 font-semibold text-white"
//                     style={{
//                       background:
//                         "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//                     }}
//                   >
//                     {whatsappLoading
//                       ? "Uploading..."
//                       : "Submit WhatsApp Campaign"}
//                   </Button>
//                 </Form.Item>
//               </Form>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </AdminPanelLayoutTest>
//   );
// };

// export default CampaignUpload;
import React, { useState } from "react";
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

const CampaignUpload = () => {
  const [excelLoading, setExcelLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [currentFormType, setCurrentFormType] = useState("");

  const [excelForm] = Form.useForm();
  const [whatsappForm] = Form.useForm();

  const [excelFile, setExcelFile] = useState(null);
  const [excelImage, setExcelImage] = useState(null);
  const [excelInviteType, setExcelInviteType] = useState("");

  const [whatsappImage, setWhatsappImage] = useState(null);
  const [whatsappInviteType, setWhatsappInviteType] = useState("");

  const handleExcelPreview = (values) => {
    if (!excelImage || !values.message || !excelInviteType) {
      antdMessage.warning(
        "Please fill all required fields and upload the image."
      );
      return;
    }
    setPreviewData({
      ...values,
      inviteType: excelInviteType,
      image: excelImage,
      file: excelFile,
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

      const params = {
        inviteType: values.inviteType,
        message: values.message,
        ...(values.mobileNumber && { mobileNumber: values.mobileNumber }),
        ...(values.orderCount && { orderCount: values.orderCount }),
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
        setExcelInviteType("");
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
        ...(values.orderCount && { orderCount: values.orderCount }),
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
                    rows={3}
                    placeholder="Enter your message..."
                  />
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
                    beforeUpload={(file) => {
                      setExcelImage(file);
                      return false;
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
                    <Option value="agents">Agents</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Message"
                  name="message"
                  rules={[{ required: true, message: "Please enter message" }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter your message..."
                  />
                </Form.Item>

                {whatsappInviteType === "sampleMessage" && (
                  <Form.Item
                    label="Mobile Number"
                    name="mobileNumber"
                    rules={[
                      { required: true, message: "Please enter mobile number" },
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter mobile number" />
                  </Form.Item>
                )}

                {whatsappInviteType === "askOxyCustomers" && (
                  <Form.Item
                    label="Order Count"
                    name="orderCount"
                    rules={[
                      { required: true, message: "Please enter order count" },
                      { pattern: /^[0-9]*$/, message: "Only numbers allowed" },
                    ]}
                  >
                    <Input placeholder="Enter order count" />
                  </Form.Item>
                )}

                <Form.Item label="Upload Image" required>
                  <Upload
                    beforeUpload={(file) => {
                      setWhatsappImage(file);
                      return false;
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
