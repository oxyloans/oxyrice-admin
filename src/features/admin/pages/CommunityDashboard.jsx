import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  ConfigProvider,
  Empty,
  List,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  CommentOutlined,
  DislikeOutlined,
  EyeOutlined,
  FileTextOutlined,
  LikeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminPanelLayout from "../components/AdminPanelLayout";
import { getCommunityDashboard } from "../api/communityDashboardApi";
import "./CommunityDashboard.css";

const { Paragraph, Text, Title } = Typography;

const number = (value) => Number(value) || 0;
const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Unable to load dashboard";

const metricDefinitions = [
  ["totalQueries", "Total queries", FileTextOutlined, "blue"],
  ["totalComments", "Comments", CommentOutlined, "purple"],
  ["totalViews", "Views", EyeOutlined, "cyan"],
  ["totalLikes", "Likes", LikeOutlined, "green"],
  ["totalDislikes", "Dislikes", DislikeOutlined, "orange"],
  ["totalActiveCategories", "Active categories", TeamOutlined, "teal"],
];

function MetricCard({ definition, data }) {
  const [key, title, Icon, tone] = definition;
  return (
    <Card className={`community-metric-card tone-${tone}`} bordered={false}>
      <div className="community-metric-icon"><Icon /></div>
      <Statistic title={title} value={number(data[key])} />
    </Card>
  );
}

function QueryList({ title, subtitle, items, metric, icon }) {
  return (
    <Card
      className="community-dashboard-panel"
      title={title}
      extra={<Text type="secondary">{subtitle}</Text>}
    >
      {items.length ? (
        <List
          dataSource={items}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={<span className="community-rank">{index + 1}</span>}
                title={
                  <Text ellipsis={{ tooltip: item.question }}>
                    {item.question || "Untitled query"}
                  </Text>
                }
                description={
                  <Space size={6} wrap>
                    {item.categoryName && <Tag>{item.categoryName}</Tag>}
                    <Text type="secondary">
                      {item.userName || "Community member"}
                    </Text>
                  </Space>
                }
              />
              <Tag icon={icon} color="cyan">
                {number(item[metric]).toLocaleString()}
              </Tag>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No activity available"
        />
      )}
    </Card>
  );
}

function DashboardContent() {
  const { message } = App.useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getCommunityDashboard();
      setData(response.data?.data || {});
    } catch (requestError) {
      const text = getErrorMessage(requestError);
      setError(text);
      message.error(text);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const categories = useMemo(
    () =>
      (data?.categoryStatistics || []).filter(
        (item) => item.categoryId || item.categoryName,
      ),
    [data],
  );
  const users = useMemo(
    () =>
      (data?.mostActiveUsers || []).filter(
        (item) => item.userId || item.userName,
      ),
    [data],
  );
  const maxCategoryQueries = Math.max(
    1,
    ...categories.map((item) => number(item.totalQueries)),
  );
  const engagementData = [
    { name: "Likes", value: number(data?.totalLikes), color: "#1ab394" },
    { name: "Comments", value: number(data?.totalComments), color: "#7c3aed" },
    { name: "Dislikes", value: number(data?.totalDislikes), color: "#f97316" },
  ];
  const hasEngagement = engagementData.some((item) => item.value > 0);
  const activityData = [
    { name: "Queries", today: number(data?.queriesToday), week: number(data?.queriesThisWeek) },
    { name: "Comments", today: number(data?.commentsToday), week: number(data?.commentsThisWeek) },
    { name: "Views", today: number(data?.viewsToday), week: number(data?.totalViews) },
    { name: "Likes", today: number(data?.likesToday), week: number(data?.totalLikes) },
  ];

  return (
    <main className="community-dashboard-page">
      <div className="community-dashboard-header">
        <div>
          <Title level={2}>Community dashboard</Title>
          <Paragraph>Monitor conversations, engagement, categories, and community activity.</Paragraph>
        </div>
      </div>

      {error && !data && <Alert type="error" showIcon message="Dashboard unavailable" description={error} action={<Button onClick={loadDashboard}>Try again</Button>} />}

      {loading && !data ? <Skeleton active paragraph={{ rows: 12 }} /> : data && (
        <>
          <Row gutter={[16, 16]}>
            {metricDefinitions.map((definition) => (
              <Col xs={12} sm={12} lg={8} xl={4} key={definition[0]}><MetricCard definition={definition} data={data} /></Col>
            ))}
          </Row>

          <Card className="community-activity-card" bordered={false}>
            <div className="community-section-heading"><Title level={4}>Activity snapshot</Title><Text type="secondary">Today and this week</Text></div>
            <Row gutter={[12, 12]}>
              {[
                ["Queries today", data.queriesToday], ["Comments today", data.commentsToday],
                ["Views today", data.viewsToday], ["Likes today", data.likesToday],
                ["Queries this week", data.queriesThisWeek], ["Comments this week", data.commentsThisWeek],
              ].map(([label, value]) => <Col xs={12} md={8} lg={4} key={label}><Statistic title={label} value={number(value)} /></Col>)}
            </Row>
          </Card>

          <Row gutter={[16, 16]} className="community-chart-row">
            <Col xs={24} lg={12}>
              <Card className="community-dashboard-panel community-chart-card" title="Activity comparison" extra={<Text type="secondary">Today vs current totals</Text>}>
                <div className="community-chart" role="img" aria-label="Bar chart comparing today's activity with current totals">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }} />
                      <Legend iconType="circle" />
                      <Bar dataKey="today" name="Today" fill="#008cba" radius={[6, 6, 0, 0]} maxBarSize={34} />
                      <Bar dataKey="week" name="Current total" fill="#1ab394" radius={[6, 6, 0, 0]} maxBarSize={34} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="community-dashboard-panel community-chart-card" title="Engagement mix" extra={<Text type="secondary">Interaction share</Text>}>
                <div className="community-chart community-pie-chart" role="img" aria-label="Donut chart showing likes, comments, and dislikes">
                  {hasEngagement ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={engagementData} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="78%" paddingAngle={3}>
                          {engagementData.map((item) => <Cell key={item.name} fill={item.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="community-chart-empty"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Engagement data will appear here" /></div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="community-detail-section">
            <Col xs={24} xl={8}>
              <QueryList
                title="Most viewed"
                subtitle="Top queries"
                items={data.topViewedQueries || []}
                metric="totalViews"
                icon={<EyeOutlined />}
              />
            </Col>
            <Col xs={24} xl={8}>
              <QueryList
                title="Most liked"
                subtitle="Top queries"
                items={data.topLikedQueries || []}
                metric="totalLikes"
                icon={<LikeOutlined />}
              />
            </Col>
            <Col xs={24} xl={8}>
              <QueryList
                title="Most discussed"
                subtitle="Top queries"
                items={data.topCommentedQueries || []}
                metric="totalComments"
                icon={<CommentOutlined />}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="community-detail-section community-detail-section-last">
            <Col xs={24} lg={14}>
              <Card className="community-dashboard-panel community-performance-card" title="Category performance">
                {categories.length ? (
                  categories.map((item, index) => (
                    <div
                      className="community-progress-row"
                      key={item.categoryId || `${item.categoryName}-${index}`}
                    >
                      <div>
                        <Text strong>{item.categoryName || "Unnamed category"}</Text>
                        <Text type="secondary">
                          {number(item.totalQueries)} queries · {number(item.totalViews)} views
                        </Text>
                      </div>
                      <Progress
                        percent={Math.round(
                          (number(item.totalQueries) / maxCategoryQueries) * 100,
                        )}
                        showInfo={false}
                        strokeColor="#008cba"
                      />
                    </div>
                  ))
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Category activity will appear here"
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card className="community-dashboard-panel community-performance-card" title="Most active members">
                {users.length ? (
                  <List
                    dataSource={users}
                    renderItem={(user, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<span className="community-rank">{index + 1}</span>}
                          title={user.userName || "Community member"}
                          description={`${number(user.totalQueries)} queries · ${number(user.totalComments)} comments`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Member activity will appear here"
                  />
                )}
              </Card>
            </Col>
          </Row>

        </>
      )}
    </main>
  );
}

export default function CommunityDashboard() {
  return <AdminPanelLayout><ConfigProvider theme={{ token: { colorPrimary: "#008cba", colorSuccess: "#1ab394", borderRadius: 12 } }}><App><DashboardContent /></App></ConfigProvider></AdminPanelLayout>;
}
