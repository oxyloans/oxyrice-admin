import { useState, useEffect } from "react";
import axios from "axios";

import BASE_URL from "../../../core/config/Config";
import {
  Modal,
  Button,
 
  Row,
  Col,
  Select,
 
 
  Spin,
  Table,
  message,
} from "antd";



import AdminPanelLayoutTest from "../components/AdminPanel.jsx";
const { Option } = Select;
function AllQueries() {
  const [data, setData] = useState([]);

  const [comments, setComments] = useState("");
  const [comments_error, setComments_error] = useState(false);
  const [loader, setLoader] = useState(false);
  const [approveLoader, setApproveLoader] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [details, setDetails] = useState("");
  const [statusValue, setStatusValue] = useState("PENDING");

  const [documentId, setDocumentId] = useState("");
  const [uploadStatus, setUploadStatus] = useState();
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);


  const accesToken = localStorage.getItem("accessToken");
  

  function queriesdisplaygetcall() {
    let data = {
      askOxyOfers: "FREESAMPLE",
      projectType: "ASKOXY",
      queryStatus: statusValue,
    };
    setLoader(true);
    axios
      .post(`${BASE_URL}/user-service/write/getAllQueries`, data, {
        headers: {
          Authorization: `Bearer ${accesToken}`,
        },
      })
      .then((response) => {
        setLoader(false);

        if (Array.isArray(response.data)) {
          // Ensure response.data is an array before filtering
          const filteredData = response.data.filter(
            (item) => item.testUser === false
          );
          setData(filteredData);
        } else {
          setData([]); // Set empty array if response is not valid
          message.warning("Invalid data format received");
        }
      })
      .catch((error) => {
        setLoader(false);
        message.error({
          content: error.response?.data?.error || "An error occurred",
        });
      });
  }

  useEffect(() => {
    queriesdisplaygetcall();
  }, [statusValue]);

  const approvefunc = (value) => {
    setLoading(true);
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
      .post(`${BASE_URL}/user-service/write/saveData`, data, {
        headers: {
          Authorization: `Bearer ${accesToken}`,
        },
      })
      .then(() => {
        setApproveLoader(false);
        setShowModal1(false);
        queriesdisplaygetcall();
        setComments("");
        setDocumentId("");
        message.success("You have successfully approved the query!");
      })
      .catch((error) => {
        setApproveLoader(false);
        setShowModal1(false);
        message.error({
          content: error.response?.data?.error || "An error occurred",
        });
      })
      .finally(() => {
        setLoading(false);
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
  const handleFileChange = async (e, userId) => {
    console.log("User ID:", userId);
    const file = e.target.files[0];

    if (!file) {
      message.warning("Please select a file to upload.");
      return;
    }

    setUploadStatus("loading");
    setFileName(file.name);

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", "kyc");
    formData.append("projectType", "ASKOXY");

    try {
      const response = await axios.post(
        `${BASE_URL}/user-service/write/uploadQueryScreenShot?userId=${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // Ensure accessToken is defined
          },
        }
      );

      setDocumentId(response.data.id);
      message.success("You have successfully uploaded the document.");
      setUploadStatus("uploaded");
    } catch (error) {
      console.error("Upload Error:", error);
      message.error({
        content: error.response?.data?.error || "An error occurred",
      });

      setUploadStatus("failed");
    }
  };

  // const handleImageOrPdf = (url) => {
  //   if (url.endsWith(".pdf")) {
  //     const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  //     window.open(viewerUrl, "_blank");
  //   } else if (
  //     [".png", ".jpg", ".jpeg"].some((ext) => url.toLowerCase().endsWith(ext))
  //   ) {
  //     const imgWindow = window.open(url, "_blank");
  //     if (imgWindow) {
  //       imgWindow.document.write(
  //         '<img src="' + url + '" style="width:80%; height:auto;" />'
  //       );
  //     }
  //   }
  // };
  const handleImageOrPdf = (url) => {
    if (url.endsWith(".pdf")) {
      // Open PDF in Google Docs Viewer for better compatibility
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(viewerUrl, "_blank");
    } else if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(url)) {
      // Open image in a new tab directly
      window.open(url, "_blank");
    } else {
      message.error("Unsupported file format");
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
                                  style={{
                                    color: "#007bff",

                                    fontWeight: "bold",
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
                          loading={loader}
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
          open={showModal1}
          onCancel={handleCloseModal}
          footer={null}
          centered
          title={
            <h2 className="text-lg font-semibold text-gray-800">
              Review Documents
            </h2>
          }
        >
          {imageUrl && (
            <div className="mb-6">
              <p className="font-semibold text-gray-700 mb-3">Review Image:</p>
              {imageUrl.endsWith(".pdf") ? (
                <p className="mb-4 text-gray-700">
                  <strong>File:</strong> {imageUrl.split("/").pop()}{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(imageUrl, "_blank");
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    (Click here to view)
                  </a>
                </p>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Review Document"
                    className="w-72 h-48 rounded-lg shadow-md border border-gray-300 cursor-pointer transition-all hover:scale-105"
                    onClick={() => window.open(imageUrl, "_blank")}
                  />
                  <p
                    className="text-sm text-blue-600 cursor-pointer mt-2 hover:underline"
                    onClick={() => window.open(imageUrl, "_blank")}
                  >
                    (Click to view in full size)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* File Upload & Comments Section */}
          {details.queryStatus === "PENDING" && (
            <div className="mb-6">
              <label
                className="font-semibold text-gray-700"
                htmlFor="fileUpload"
              >
                Upload Document:{" "}
              </label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => handleFileChange(e, details.userId)}
                style={{ marginBottom: "16px" }}
              />
              {uploadStatus !== "loading" && fileName && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Selected file:</strong> {fileName}
                </p>
              )}

              <textarea
                className={`w-full p-3 mt-3 rounded-lg border ${
                  comments_error ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder="Enter Admin Comments"
                rows="3"
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                }}
              />
              {comments_error && (
                <p className="text-red-500 text-sm mt-1">
                  Please enter comments
                </p>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3">
            {details.queryStatus === "PENDING" && (
              <>
                {approveLoader ? (
                  <Spin />
                ) : (
                  <>
                    <Button
                      onClick={() => approvefunc("PENDING")}
                      className="bg-[#04AA6D] text-white hover:bg-[#04AA6F] transition-all"
                    >
                      Pending
                    </Button>
                    <Button
                      onClick={() => approvefunc("COMPLETED")}
                      className="bg-[#008CBA] text-white hover:bg-green-700 transition-all"
                    >
                      Approved
                    </Button>
                    <Button
                      onClick={handleCloseModal}
                      className="bg-gray-500 text-white hover:bg-gray-600 transition-all"
                    >
                      Close
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </Modal>
      </AdminPanelLayoutTest>
    </div>
  );
}

export default AllQueries;
