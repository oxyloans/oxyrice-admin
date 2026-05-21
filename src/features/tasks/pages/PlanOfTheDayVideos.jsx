import React, { useState, useEffect, useCallback } from "react";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import { DatePicker, Input, Typography, Spin, Empty, Tag, Avatar, Alert, Button, Tooltip } from "antd";
import { UserOutlined, CalendarOutlined, VideoCameraOutlined, ReloadOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Search } = Input;

const VIDEO_HEIGHT = 280;

const useVideoThumbnail = (url) => {
  const [poster, setPoster] = useState("");
  useEffect(() => {
    if (!url) return;
    const vid = document.createElement("video");
    vid.crossOrigin = "anonymous";
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = "metadata";
    vid.src = url;
    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = vid.videoWidth || 320;
        canvas.height = vid.videoHeight || 180;
        canvas.getContext("2d").drawImage(vid, 0, 0, canvas.width, canvas.height);
        setPoster(canvas.toDataURL("image/jpeg", 0.8));
      } catch {}
    };
    vid.addEventListener("loadedmetadata", () => { vid.currentTime = 1; });
    vid.addEventListener("seeked", onSeeked, { once: true });
    return () => { vid.src = ""; };
  }, [url]);
  return poster;
};

const VideoCell = ({ url, label }) => {
  const poster = useVideoThumbnail(url);
  return (
  <div style={{ flex: 1, minWidth: 0 }}>
    <Text style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>
      {label}
    </Text>
    {url ? (
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster}
        style={{
          width: "100%",
          height: VIDEO_HEIGHT,
          display: "block",
          background: poster ? "transparent" : "#f1f5f9",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          objectFit: "contain",
        }}
      >
        <source src={url} type="video/mp4" />
      </video>
    ) : (
      <div
        style={{
          width: "100%",
          height: VIDEO_HEIGHT,
          borderRadius: 8,
          border: "1.5px dashed #cbd5e1",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <VideoCameraOutlined style={{ color: "#cbd5e1", fontSize: 28 }} />
        <Text style={{ color: "#94a3b8", fontSize: 12 }}>Not submitted</Text>
      </div>
    )}
  </div>
  );
};

const StatCard = ({ label, value, loading }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "10px 12px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", lineHeight: 1 }}>
      {loading ? <Spin size="small" /> : value}
    </div>
    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{label}</div>
  </div>
);

const PlanOfTheDayVideos = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchText, setSearchText] = useState("");

  const fetchData = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const res = await axiosInstance.post(
        `${BASE_URL}/ai-service/agent/planOfTheDayForAdmin`,
        { startDate: formattedDate, endDate: formattedDate },
        { headers: { "Content-Type": "application/json" } }
      );
      const sorted = (Array.isArray(res.data) ? res.data : []).sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      setData(sorted);
    } catch {
      setError("Failed to load data. Please check your connection and try again.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!searchText.trim()) return setFiltered(data);
    const q = searchText.toLowerCase();
    setFiltered(data.filter((d) => (d.name || "").toLowerCase().includes(q)));
  }, [data, searchText]);

  const hasPod = (item) => !!item.planOfTheDay;
  const hasEod = (item) => !!item.endOfTheDay;
  const missingBoth = (item) => !hasPod(item) && !hasEod(item);

  const stats = [
    { label: "Total", value: data.length },
    { label: "POD Submitted", value: data.filter(hasPod).length },
    { label: "EOD Submitted", value: data.filter(hasEod).length },
    { label: "Both Submitted", value: data.filter((d) => hasPod(d) && hasEod(d)).length },
  ];

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: "20px 16px", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1e293b" }}>
              Pod &amp; Eod Videos
            </Title>
            <Text style={{ color: "#94a3b8", fontSize: 13 }}>
              Daily Plan of the Day &amp; End of the Day video submissions
            </Text>
          </div>
          <Tooltip title="Refresh data">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
          </Tooltip>
        </div>

        {/* Error Banner */}
        {error && (
          <Alert
            type="error"
            message={error}
            action={<Button size="small" onClick={fetchData}>Retry</Button>}
            showIcon
            style={{ marginBottom: 16, borderRadius: 10 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* Filters */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarOutlined style={{ color: "#475569" }} />
            <Text style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>Date:</Text>
            <DatePicker
              value={selectedDate}
              onChange={(d) => setSelectedDate(d || dayjs())}
              allowClear={false}
              style={{ height: 32 }}
            />
          </div>
          <Search
            placeholder="Search by name..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={setSearchText}
            style={{ width: 220 }}
          />
          <Text style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>
            {filtered.length} / {data.length} members
          </Text>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} loading={loading} />
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" }}>
            <Spin size="large" />
            <Text style={{ marginTop: 16, color: "#94a3b8" }}>Loading videos...</Text>
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            description={
              <Text style={{ color: "#94a3b8" }}>
                {error
                  ? "Could not load data due to an error"
                  : searchText
                  ? "No results match your search"
                  : "No submissions found for the selected date"}
              </Text>
            }
            style={{ padding: "60px 0" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((item, idx) => (
              <div
                key={item.userId || idx}
                style={{
                  background: "#fff",
                  border: `1px solid ${missingBoth(item) ? "#fca5a5" : "#e2e8f0"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    background: missingBoth(item) ? "#fff7f7" : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar
                      icon={<UserOutlined />}
                      size={32}
                      style={{ background: "#e2e8f0", color: "#475569", flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Text strong style={{ fontSize: 14, color: "#1e293b" }}>
                          {item.name || "Unknown"}
                        </Text>
                        {missingBoth(item) && (
                          <Tooltip title="No submissions for this day">
                            <WarningOutlined style={{ color: "#ef4444", fontSize: 13 }} />
                          </Tooltip>
                        )}
                      </div>
                      <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {item.date || selectedDate.format("YYYY-MM-DD")}
                      </Text>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Tag color={hasPod(item) ? "success" : "error"} style={{ fontSize: 11, margin: 0, borderRadius: 6 }}>
                      {hasPod(item) ? "✓ POD" : "✗ POD"}
                    </Tag>
                    <Tag color={hasEod(item) ? "warning" : "error"} style={{ fontSize: 11, margin: 0, borderRadius: 6 }}>
                      {hasEod(item) ? "✓ EOD" : "✗ EOD"}
                    </Tag>
                  </div>
                </div>

                {/* Videos */}
                <div style={{ display: "flex", gap: 12, padding: 14, flexWrap: "wrap" }}>
                  <VideoCell url={item.planOfTheDay} label="Plan of the Day" />
                  <VideoCell url={item.endOfTheDay} label="End of the Day" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TaskAdminPanelLayout>
  );
};

export default PlanOfTheDayVideos;
