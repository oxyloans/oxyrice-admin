import React, { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Empty,
  Button,
  Typography,
  message,
  Modal,
  Select,
  Input,
  Divider,
  DatePicker,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../core/config/axiosInstance";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";
import { Form } from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title, Text } = Typography;
const { Option } = Select;

const GetAllJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination (server-side)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Search
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFiltered, setDateFiltered] = useState(false);
  const [dateCount, setDateCount] = useState(0);

  // Cover letter modal
  const [openCover, setOpenCover] = useState(false);
  const [coverText, setCoverText] = useState("");

  // Resume modal
  const [resumeModal, setResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");

  // Round modal
  const [roundModal, setRoundModal] = useState(false);
  const [roundJobId, setRoundJobId] = useState(null);
  const [roundLoading, setRoundLoading] = useState(false);
  const [roundForm] = Form.useForm();

  const openRoundModal = (id) => {
    setRoundJobId(id);
    roundForm.resetFields();
    setRoundModal(true);
  };

  const submitRound = async (values) => {
    setRoundLoading(true);
    try {
      await axiosInstance.patch(
        `${BASE_URL}/marketing-service/campgin/job-applications/rounds`,
        { ...values, jobAppliedId: roundJobId }
      );
      message.success("Round added successfully");
      setRoundModal(false);
    } catch {
      message.error("Failed to add round");
    } finally {
      setRoundLoading(false);
    }
  };

  // Job detail modal
  const [jobDetailModal, setJobDetailModal] = useState(false);
  const [jobDetail, setJobDetail] = useState(null);

  // Result modal
  const [resultModal, setResultModal] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchJobs(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const fetchJobs = async (pg = 0, size = 20) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `${BASE_URL}/marketing-service/campgin/getuserandallusersappliedjobs?page=${pg}&size=${size}`
      );
      const data = res.data;
      const list = data?.content || [];
      setJobs(list);
      setFilteredJobs(list);
      setTotalElements(data?.totalElements || 0);
      setPage(data?.number ?? pg);
      setPageSize(data?.size ?? size);
    } catch (error) {
      console.error(error);
      message.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const [searchCount, setSearchCount] = useState(0);
  const [searchFiltered, setSearchFiltered] = useState(false);
  const [clientPage, setClientPage] = useState(1);

  const handleSearch = async (text) => {
    const val = (text || "").trim();
    if (!val) {
      setSearchFiltered(false);
      setSearchCount(0);
      // restore paginated list
      fetchJobs(0, pageSize);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/marketing-service/campgin/searchAppliedJobs?search=${encodeURIComponent(val)}`
      );
      const list = res.data?.data || [];
      setFilteredJobs(list);
      setSearchCount(res.data?.count ?? list.length);
      setSearchFiltered(true);
      setClientPage(1);
    } catch {
      message.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchByDate = async (start, end) => {
    if (!start || !end) return;
    setDateFiltered(true);
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/marketing-service/campgin/searchAppliedJobsByDate?startDate=${start.format("YYYY-MM-DD")}&endDate=${end.format("YYYY-MM-DD")}`
      );
      const list = res.data?.data || [];
      setJobs(list);
      setFilteredJobs(list);
      setTotalElements(list.length);
      setDateCount(res.data?.count ?? list.length);
      setClientPage(1);
    } catch {
      message.error("Failed to fetch jobs by date");
    } finally {
      setLoading(false);
    }
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDateFiltered(false);
    setDateCount(0);
    setSearchFiltered(false);
    setSearchCount(0);
    setSearchText("");
    fetchJobs(0, pageSize);
  };

  const openCoverLetter = (text) => {
    setCoverText(text || "");
    setOpenCover(true);
  };

  const openViewResult = async (atsScoreViewerId) => {
    if (!atsScoreViewerId) {
      message.warning("No exam result available for this applicant.");
      return;
    }
    setResultData(null);
    setResultModal(true);
    setResultLoading(true);
    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/marketing-service/campgin/answers-info-of-applied-job?atsScoreViewerId=${atsScoreViewerId}`
      );
      if (res.data?.success) {
        setResultData(res.data.data);
      } else {
        message.error("Failed to load result");
        setResultModal(false);
      }
    } catch {
      message.error("Error fetching result");
      setResultModal(false);
    } finally {
      setResultLoading(false);
    }
  };

  const isSearchActive = searchFiltered || dateFiltered;

  const columns = [
    // {
    //   title: "S.NO",
    //   key: "serial",
    //   align: "center",
     
    //   render: (_text, _record, index) =>
    //     isSearchActive
    //       ? (clientPage - 1) * pageSize + index + 1
    //       : page * pageSize + index + 1,
    // },
    {
      title: "Name",
      dataIndex: "userName",
      key: "userName",
      align: "center",
     
      render: (v) => v ,
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      align: "center",
      
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      align: "center",
      render: (v) => v ,
    },
    {
      title: "Cover Letter",
      dataIndex: "coverLetter",
      key: "coverLetter",
      align: "center",
      responsive: ["md"],
      render: (text) => (
        <Button size="small" icon={<FileTextOutlined />} onClick={() => openCoverLetter(text)}>
          View
        </Button>
      ),
    },
    {
      title: "Notice Period",
      dataIndex: "noticePeriod",
      key: "noticePeriod",
      align: "center",
      render: (v) => v ,
    },
    {
      title: "Resume",
      dataIndex: "resumeUrl",
      key: "resumeUrl",
      align: "center",
      render: (url) =>
        url ? (
          <Button
            size="small"
            style={{ color: "#1677ff", borderColor: "#1677ff" }}
            onClick={() => { setResumeUrl(""); setTimeout(() => { setResumeUrl(url); setResumeModal(true); }, 0); }}
          >
            View Resume
          </Button>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Applied Date",
      dataIndex: "appliedAt",
      key: "appliedAt",
      align: "center",
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt),
      defaultSortOrder: "descend",
    },
    {
      title: "View Result",
      key: "viewResult",
      align: "center",
      render: (_, record) => (
        <Button
          size="small"
          icon={<TrophyOutlined />}
          style={{ background: "#1ab394", borderColor: "#1ab394", color: "#fff" }}
          onClick={() => openViewResult(record.atsScoreViewerId)}
        >
          Result
        </Button>
      ),
    },
    {
      title: "Rounds",
      key: "actions",
      align: "center",
  
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "row", gap: 6, justifyContent: "center", flexWrap: "nowrap" }}>
          <Button
            size="small"
            style={{ background: "#008cba", borderColor: "#008cba", color: "#fff", whiteSpace: "nowrap" }}
            onClick={() => openRoundModal(record.id)}
          >
            Add
          </Button>
          <Button
            size="small"
            style={{ background: "#f0ad4e", borderColor: "#f0ad4e", color: "#fff", whiteSpace: "nowrap" }}
            onClick={() => navigate(`/admin/interview-rounds/${record.id}`)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            All Users Applied Jobs
          </Title>
          <Button
            style={{ backgroundColor: "#008cba", color: "#f7f7f7", borderColor: "#008cba" }}
            icon={<PlusOutlined />}
            href="/admin/jobsmanage"
          >
            Add Job
          </Button>
        </div>

        <div
          className="max-w-7xl mx-auto"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Show</span>
            <Select
              value={pageSize}
              onChange={(value) => { setPageSize(value); setPage(0); }}
              style={{ width: 110 }}
            >
              {[10, 20, 30, 40].map((num) => (
                <Option key={num} value={num}>{num}</Option>
              ))}
            </Select>
            <span>entries</span>
          </div>

          <Space wrap>
            <DatePicker
              placeholder="Start date"
              value={startDate}
              onChange={(date) => {
                setStartDate(date);
                if (!date) clearDateFilter();
                else if (endDate) fetchByDate(date, endDate);
              }}
              allowClear
              style={{ width: 140 }}
            />
            <DatePicker
              placeholder="End date"
              value={endDate}
              disabledDate={(d) => startDate && d.isBefore(startDate, "day")}
              onChange={(date) => {
                setEndDate(date);
                if (!date) clearDateFilter();
                else if (startDate) fetchByDate(startDate, date);
              }}
              allowClear
              style={{ width: 140 }}
            />
            <Input
              placeholder="Search by name,title,mobile number"
              value={searchText}
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => {
                const value = e.target.value;
                setSearchText(value);
                handleSearch(value);
              }}
              style={{ width: 280 }}
            />
          </Space>
        </div>

       
        {/* {dateFiltered && (
          <div
            className="max-w-7xl mx-auto"
            style={{ marginBottom: 14 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid #e8e8e8",
                background: "#fafafa",
              }}
            >
              <span style={{ fontSize: 12, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Applications found
              </span>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#262626" }}>{dateCount}</span>
             
            </div>
          </div>
        )} */}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="medium" tip="Loading jobs..." />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Empty description="No jobs found." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredJobs}
            rowKey="id"
            loading={loading}
            pagination={
              isSearchActive
                ? {
                    current: clientPage,
                    pageSize: pageSize,
                    total: filteredJobs.length,
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} jobs`,
                    onChange: (p) => setClientPage(p),
                  }
                : {
                    current: page + 1,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: false,
                 
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} jobs`,
                    onChange: (newPage) => setPage(newPage - 1),
                  }
            }
            scroll={{ x: true }}
            bordered
            className="max-w-7xl mx-auto"
          />
        )}

        {/* Add Round Modal */}
        <Modal
          title="Add Interview Round"
          open={roundModal}
          onCancel={() => setRoundModal(false)}
          onOk={() => roundForm.submit()}
          okText="Submit"
          confirmLoading={roundLoading}
        >
          <Form form={roundForm} layout="vertical" onFinish={submitRound}>
            <Form.Item name="roundName" label="Round Name" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. HR Round" />
            </Form.Item>
            <Form.Item name="takenBy" label="Taken By" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="Interviewer name" />
            </Form.Item>
            <Form.Item name="score" label="Score">
              <Input placeholder="e.g. 8/10" />
            </Form.Item>
            <Form.Item name="comments" label="Comments">
              <Input.TextArea rows={3} placeholder="Any comments..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Resume Modal */}
        <Modal
          title="Resume"
          open={resumeModal}
          onCancel={() => { setResumeModal(false); setResumeUrl(""); }}
          footer={[<Button key="close" onClick={() => { setResumeModal(false); setResumeUrl(""); }}>Close</Button>]}
          width={860}
          styles={{ body: { padding: 0, height: "75vh" } }}
        >
          <iframe
            key={resumeUrl}
            src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
            title="Resume"
            width="100%"
            height="100%"
            style={{ border: "none", minHeight: "70vh" }}
          />
        </Modal>

        {/* Cover Letter Modal */}
        <Modal
          title="Cover Letter"
          open={openCover}
          onCancel={() => setOpenCover(false)}
          footer={[<Button key="close" onClick={() => setOpenCover(false)}>Close</Button>]}
        >
          <div className="max-h-[50vh] overflow-auto whitespace-pre-wrap text-sm text-slate-700">
            {coverText || "N/A"}
          </div>
        </Modal>

        {/* View Result Modal */}
        <Modal
          title={
            <Space>
              <TrophyOutlined style={{ color: "#1ab394" }} />
              <span>Exam Result</span>
            </Space>
          }
          open={resultModal}
          onCancel={() => { setResultModal(false); setResultData(null); }}
          footer={[<Button key="close" onClick={() => { setResultModal(false); setResultData(null); }}>Close</Button>]}
          width={780}
        >
          {resultLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin tip="Loading result..." />
            </div>
          ) : resultData ? (
            <ResultView data={resultData} />
          ) : null}
        </Modal>
      </div>
    </CompaniesLayout>
  );
};

// ── Result View Component ──────────────────────────────────────────────────────
const ResultView = ({ data }) => {
  const { examAttempt, atsHistory, isEligible } = data;

  const correctCount = examAttempt?.examQuestions?.filter((q) => {
    const correct = (q.openAiAnswer || []).sort().join(",").toUpperCase();
    const user = (q.userAnswer || "").toUpperCase().split(",").map((a) => a.trim()).sort().join(",");
    return correct === user;
  }).length ?? 0;

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Summary strip */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #e8e8e8",
        }}
      >
        {[
          { label: "Score", value: `${examAttempt?.score ?? "—"} / ${examAttempt?.totalQuestions ?? "—"}` },
          { label: "Percentage", value: examAttempt?.percentage != null ? `${examAttempt.percentage}%` : "—" },
          { label: "Correct", value: `${correctCount} / ${examAttempt?.totalQuestions ?? "—"}` },
          { label: "Eligible", value: isEligible ? "Yes" : "No" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: "12px 16px",
              textAlign: "center",
              borderRight: i < 3 ? "1px solid #e8e8e8" : "none",
              background: i % 2 === 0 ? "#fafafa" : "#fff",
            }}
          >
            <div style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#262626" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ATS History */}
      {atsHistory?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>Exam History</Text>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            {atsHistory.map((h) => (
              <span
                key={h.id}
                style={{
                  fontSize: 12,
                  padding: "2px 10px",
                  borderRadius: 4,
                  border: "1px solid #d9d9d9",
                  background: "#fafafa",
                  color: "#595959",
                }}
              >
                {h.candidateExamStatus} &mdash; {dayjs(h.createdAt).format("DD MMM YYYY, hh:mm A")}
              </span>
            ))}
          </div>
        </div>
      )}

      <Divider style={{ margin: "12px 0" }} />

      {/* Questions */}
      <div style={{ maxHeight: 440, overflowY: "auto", paddingRight: 4 }}>
        {(examAttempt?.examQuestions || []).map((q, idx) => {
          const correctAnswers = (q.openAiAnswer || []).map((a) => a.toUpperCase());
          const userAnswers = (q.userAnswer || "").toUpperCase().split(",").map((a) => a.trim());
          const isCorrect = correctAnswers.sort().join(",") === userAnswers.sort().join(",");

          return (
            <div
              key={idx}
              style={{
                marginBottom: 12,
                padding: "12px 14px",
                borderRadius: 6,
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderLeft: `3px solid ${isCorrect ? "#52c41a" : "#ff4d4f"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: "#262626", flex: 1, paddingRight: 8 }}>
                  Q{idx + 1}. {q.question}
                </Text>
                {isCorrect
                  ? <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 15, flexShrink: 0 }} />
                  : <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 15, flexShrink: 0 }} />}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                {(q.options || []).map((opt, oi) => {
                  const letter = opt.charAt(0).toUpperCase();
                  const isUserPick = userAnswers.includes(letter);
                  const isCorrectPick = correctAnswers.includes(letter);
                  const isWrongPick = isUserPick && !isCorrectPick;
                  return (
                    <div
                      key={oi}
                      style={{
                        fontSize: 12,
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: `1px solid ${isCorrectPick ? "#52c41a" : isWrongPick ? "#ff4d4f" : "#e8e8e8"}`,
                        background: isCorrectPick ? "#f6ffed" : isWrongPick ? "#fff2f0" : "#fafafa",
                        color: "#262626",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {isCorrectPick && <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 11 }} />}
                      {isWrongPick && <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 11 }} />}
                      {opt}
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 12, color: "#595959", display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span>
                  <span style={{ color: "#8c8c8c" }}>Your answer: </span>
                  <span style={{ fontWeight: 600, color: isCorrect ? "#52c41a" : "#ff4d4f" }}>
                    {q.userAnswer || "—"}
                  </span>
                </span>
                <span>
                  <span style={{ color: "#8c8c8c" }}>Correct: </span>
                  <span style={{ fontWeight: 600, color: "#262626" }}>{(q.openAiAnswer || []).join(", ")}</span>
                </span>
                <span style={{ color: "#8c8c8c", textTransform: "capitalize" }}>{q.questionType}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GetAllJobs;
