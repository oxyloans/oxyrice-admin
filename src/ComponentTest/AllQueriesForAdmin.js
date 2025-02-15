import { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Input,
  Row,
  Col,
  Select,
  Image,
  notification,
  Spin,
  Table,
} from "antd";

import { UserSwitchOutlined } from "@ant-design/icons";

import AdminPanelLayoutTest from "./AdminPanelTest.jsx";
const { Option } = Select;
function AllQueries() {
  const [data, setData] = useState([]);
  const [errormsg, setErrormsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState("");
  const [comments_error, setComments_error] = useState(false);
  const [loader, setLoader] = useState(false);
  const [approveLoader, setApproveLoader] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [details, setDetails] = useState("");
  const [statusValue, setStatusValue] = useState("PENDING");
  const [pendingQueries, setPendingQueries] = useState([]);
  const [documentId, setDocumentId] = useState("");
  const [uploadStatus, setUploadStatus] = useState();
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSelectedOption = (event) => {
    setData([]);
    setStatusValue(event.target.value);
  };
  const accesToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  function queriesdisplaygetcall() {
    let data = {
      askOxyOfers: "FREESAMPLE",
      projectType: "ASKOXY",
      queryStatus: statusValue,
    };
    setLoader(true);
    axios
      .post(
        `https://meta.oxyglobal.tech/api/writetous-service/getAllQueries`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accesToken}`,
          },
        }
      )
      .then((response) => {
        setLoader(false);
        setData(response.data);
      })
      .catch((error) => {
        setLoader(false);
        notification.error({
          message: "Error",
          description: error.response?.data?.error || "An error occurred", // Correctly accessing error properties
        });
      });
  }

  useEffect(() => {
    queriesdisplaygetcall();
  }, [statusValue]);

  const approvefunc = (value) => {
    if (comments === "" || comments === null) {
      setComments_error("Please enter your Comments");
      return;
    }

    const data = {
      adminDocumentId: documentId || "",
      comments: comments,
      email: details.email,
      id: details.id,
      mobileNumber: details.mobileNumber,
      projectType: "OXYRICE",
      query: details.query,
      queryStatus: value,
      resolvedBy: "admin",
      resolvedOn: "",
      status: "",
      userDocumentId: "",
      userId: details.userId,
    };

    setApproveLoader(true);
    axios
      .post(
        `https://meta.oxyglobal.tech/api/writetous-service/saveData`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accesToken}`,
          },
        }
      )
      .then(() => {
        setApproveLoader(false);
        setShowModal1(false);
        queriesdisplaygetcall();
        setComments("");
        setDocumentId("");
        notification.success({
          message: "Success",
          description: "You have successfully approved the query!",
        });
      })
      .catch((error) => {
        setApproveLoader(false);
        setShowModal1(false);
        notification.error({
          message: "Error",
          description: error.response?.data.error || "An error occurred",
        });
      });
  };

  const handleOpenModal = (item) => {
    setDetails(item);
    setImageUrl(item.userQueryDocumentStatus?.filePath || null);
    setShowModal1(true);
  };

  const handlePdfOpen = (url) => {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };
  const handleCloseModal = () => {
    setShowModal1(false);
  };
  const handleFileChange = (e, userId) => {
    console.log(userId);
    const file = e.target.files[0];
    if (!file) {
      notification.warning({
        message: "No File Selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    setUploadStatus("loading");
    setFileName(file.name);

    // Prepare form data
    const formData = new FormData();
    formData.append("multiPart", file);
    formData.append("fileType", "kyc");

    // API call
    axios
      .post(
        `https://meta.oxyglobal.tech/api/writetous-service/uploadQueryScreenShot?userId=${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accesToken}`, // Fix: Use correct header name for token
          },
        }
      )
      .then((response) => {
        setDocumentId(response.data.id);
        notification.success({
          message: "Success",
          description: "You have successfully uploaded the document.",
        });
        setUploadStatus("uploaded");
      })
      .catch((error) => {
        notification.error({
          message: "Error",
          description:
            error.response?.data?.error || "An error occurred during upload.",
        });
        setUploadStatus("failed");
      });
  };

  const handleImageOrPdf = (url) => {
    if (url.endsWith(".pdf")) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(viewerUrl, "_blank");
    } else if (
      [".png", ".jpg", ".jpeg"].some((ext) => url.toLowerCase().endsWith(ext))
    ) {
      const imgWindow = window.open(url, "_blank");
      if (imgWindow) {
        imgWindow.document.write(
          '<img src="' + url + '" style="width:100%; height:auto;" />'
        );
      }
    }
  };

  return (
    <div>
      <AdminPanelLayoutTest>
        <div className="page-header">
          <Row>
            <Col span={24}>
              <h2 className="text-xl font-bold">Queries Rised by Users</h2>
              {/* <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active">AllUserQueries</li>
            </ul> */}
              <br />
            </Col>
          </Row>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={6}>
                    <Select
                      className="form-control"
                      value={statusValue}
                      onChange={(value) => setStatusValue(value)}
                      style={{ width: "100%" }}
                    >
                      <Select.Option value="CANCELLED">CANCELLED</Select.Option>
                      <Select.Option value="COMPLETED">COMPLETED</Select.Option>
                      <Select.Option value="PENDING">PENDING</Select.Option>
                    </Select>
                  </Col>
                </Row>

                <Table
                  className="mt-4"
                  loading={loader}
                  dataSource={data}
                  rowKey="id"
                  pagination={false}
                  bordered
                  scroll={{ x: "100%" }}
                >
                  <Table.Column
                    title="S.no"
                    dataIndex="id"
                    render={(text, record, index) => index + 1}
                  />
                  <Table.Column
                    title="User Info"
                    render={(item) => (
                      <div>
                        <strong>Name :</strong> {item.name} <br />
                        <strong>Mobile Number :</strong> {item.mobileNumber}{" "}
                        <br />
                        <strong>Ticket Id :</strong> {item.randomTicketId}{" "}
                        <br />
                        <strong>Created on :</strong>{" "}
                        {item.createdAt?.substring(0, 10)}
                      </div>
                    )}
                  />
                  <Table.Column title="User Query" dataIndex="query" />
                  {statusValue === "CANCELLED" && (
                    <Table.Column
                      title="User Cancelled Reason"
                      dataIndex="comments"
                    />
                  )}
                  {statusValue === "COMPLETED" && (
                    <Table.Column
                      title="Admin Comments"
                      render={(item) => (
                        <div>
                          {item.comments}
                          <br />
                          <strong>Resolved On:</strong>{" "}
                          {item?.resolvedOn?.substring(0, 10)}
                        </div>
                      )}
                    />
                  )}
                  <Table.Column
                    title="Admin & User Replies"
                    render={(item) =>
                      item.userPendingQueries.length > 0
                        ? item.userPendingQueries.map((pendingData, index) => (
                            <div key={index}>
                              <strong
                                style={{
                                  color:
                                    pendingData.resolvedBy === "admin"
                                      ? "green"
                                      : "red",
                                }}
                              >
                                {pendingData.resolvedBy}:
                              </strong>
                              <br />
                              <strong>Comments:</strong>{" "}
                              {pendingData.pendingComments}
                              <br />
                              <strong>Resolved On:</strong>{" "}
                              {pendingData.resolvedOn?.substring(0, 10)}
                              <br />
                              {pendingData.adminFileName && (
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleImageOrPdf(pendingData.adminFilePath);
                                  }}
                                >
                                  {pendingData.adminFileName}
                                </a>
                              )}
                            </div>
                          ))
                        : null
                    }
                  />
                  {statusValue === "PENDING" && (
                    <Table.Column
                      title="Uploaded File"
                      align="center"
                      // Set a fixed width for the column
                      render={(item) => (
                        <Button
                          type="primary"
                          onClick={() => handleOpenModal(item)}
                          style={{
                            marginRight: "8px",
                            backgroundColor: "#1C84C6",
                            color: "white",
                          }} // item can be passed if needed
                        >
                          {"Pending"}
                        </Button>
                      )}
                    />
                  )}
                </Table>
              </div>
            </div>
          </div>
        </div>
        <Modal
          visible={showModal1}
          onCancel={handleCloseModal}
          footer={null}
          centered
          title="Review Documents"
        >
          {/* Display Image or PDF Link */}
        
          {imageUrl && (
            <>
              <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Review Image:{" "}
              </p>

              {imageUrl.endsWith(".pdf") ? (
                <p style={{ marginBottom: "15px" }}>
                  <strong>File:</strong> {imageUrl.split("/").pop()}{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePdfOpen(imageUrl);
                    }}
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    (Click here to view)
                  </a>
                </p>
              ) : (
                <div style={{ marginBottom: "15px" }}>
                  <Image
                    src={imageUrl}
                    style={{
                      height: 300,
                      width: 300,
                      borderRadius: "4px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    preview={false}
                  />
                </div>
              )}
            </>
          )}

          {/* File Upload and Comments for PENDING Status */}
          {details.queryStatus === "PENDING" && (
            <>
              <div className="mb-4">
                <label htmlFor="fileUpload" style={{ fontWeight: "bold" }}>
                  Upload Document:{" "}
                </label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleFileChange(e, details.userId)}
                  style={{ marginBottom: "16px" }}
                />
                {uploadStatus !== "loading" && fileName && (
                  <p>Selected file: {fileName}</p>
                )}
              </div>

              <Col xs={24} sm={24}>
                <textarea
                  className={`form-control ml-0 mb-4 ${comments_error ? "border-danger" : ""}`}
                  placeholder="Admin Comments"
                  style={{
                    width: "100%",
                    height: "120px",
                    borderRadius: "4px",
                    border: "1px solid #dcdcdc",
                    paddingLeft: "10px", // Add left padding
                  }}
                  rows={4}
                  onChange={(e) => {
                    setComments(e.target.value);
                    setComments_error(false);
                  }}
                />
                {comments_error && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    Please enter Comments
                  </p>
                )}
              </Col>
            </>
          )}

          {/* Footer Buttons */}
          <div style={{ textAlign: "right" }}>
            {details.queryStatus === "PENDING" && (
              <>
                {approveLoader ? (
                  <Spin />
                ) : (
                  <>
                    <Button
                      onClick={() => approvefunc("PENDING")}
                      style={{
                        marginRight: "8px",
                        backgroundColor: "#1C84C6",
                        color: "white",
                      }}
                    >
                      Pending
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => approvefunc("COMPLETED")}
                      style={{
                        marginRight: "8px",
                        backgroundColor: "#04AA6D",
                        color: "white",
                      }}
                    >
                      Approved
                    </Button>
                  </>
                )}
              </>
            )}
            <Button
              type="default"
              onClick={handleCloseModal}
              style={{
                marginRight: "8px",
              }}
            >
              Close
            </Button>
          </div>
        </Modal>
      </AdminPanelLayoutTest>
    </div>
  );
}

export default AllQueries;
