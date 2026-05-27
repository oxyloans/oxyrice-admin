import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Steps,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  GiftOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import AdminPanelLayout from "../components/AdminPanelLayout";
import {
  SEGMENT_OPTIONS,
  approveOffers,
  bulkGenerateCampaign,
  fetchPendingOffers,
  enrichImageMapForOffers,
  fetchProductImageMap,
  fetchSegmentPreview,
  fetchPromptSupplement,
  formatCartApiError,
  savePromptSupplement,
  lookupImage,
  mergeImageMaps,
  rejectOffers,
  resolveItemImageUrl,
  seedImageMapFromOffers,
} from "../api/agentCampaignApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PAGE_BG = { background: "#f0f2f5", minHeight: "100%", padding: "16px 20px 32px" };
const DEFAULT_PAGE_SIZE = 5;

const statusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "processing";
  }
};

const formatCurrency = (value) =>
  value != null && !Number.isNaN(Number(value))
    ? `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const offerKey = (offer) => offer.comboOfferId || offer.id;

const formatOfferDate = (value) =>
  value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "—";

const ComboProductThumb = ({ component, imageUrl }) => {
  const src = imageUrl || resolveItemImageUrl(component?.imageUrl);
  const name = component?.itemName || "Product";
  const [imgError, setImgError] = React.useState(false);
  const showImg = Boolean(src && !imgError);

  return (
    <div
      style={{
        flex: "0 0 auto",
        width: 108,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          margin: "0 auto 8px",
          borderRadius: 10,
          border: "1px solid #e8e8e8",
          background: "#fff",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {showImg ? (
          <Image
            src={src}
            alt={name}
            width={88}
            height={88}
            style={{ objectFit: "contain", display: "block" }}
            preview={{ mask: "Zoom" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <ShoppingOutlined style={{ fontSize: 28, color: "#bfbfbf" }} />
        )}
      </div>
      <Text
        strong
        style={{
          fontSize: 12,
          display: "block",
          lineHeight: 1.3,
          maxWidth: 108,
        }}
        ellipsis={{ tooltip: name }}
      >
        {name}
      </Text>
      <Text type="secondary" style={{ fontSize: 11 }}>
        Qty {component?.quantity ?? 1}
      </Text>
      <Text style={{ fontSize: 11, color: "#389e0d", display: "block" }}>
        {formatCurrency(component?.unitPrice)}
      </Text>
    </div>
  );
};

const AgentCampaignOffers = () => {
  const [form] = Form.useForm();
  const [segment, setSegment] = useState("FREQUENT_BUYER");
  const [maxOffers, setMaxOffers] = useState(8);
  const [preview, setPreview] = useState(null);
  const [campaignMeta, setCampaignMeta] = useState(null);
  const [offers, setOffers] = useState([]);
  const [imageMap, setImageMap] = useState(new Map());
  const [imagesLoading, setImagesLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [promptSupplement, setPromptSupplement] = useState("");
  const [promptUpdatedAt, setPromptUpdatedAt] = useState(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);
  /** Step 1 complete — manager saved prompt at least once (required before bulk generate). */
  const [promptStepComplete, setPromptStepComplete] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [dateSort, setDateSort] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [segmentStatus, setSegmentStatus] = useState("PENDING");

  const loadImages = useCallback(async (offerList) => {
    setImagesLoading(true);
    try {
      const fromOffers = seedImageMapFromOffers(offerList, new Map());
      const catalog = await fetchProductImageMap();
      const mergedCatalog = mergeImageMaps(fromOffers, catalog);
      const enriched = offerList?.length
        ? await enrichImageMapForOffers(mergedCatalog, offerList)
        : mergedCatalog;
      setImageMap((prev) => mergeImageMaps(prev, enriched));
    } catch (err) {
      if (offerList?.length) {
        setImageMap((prev) => mergeImageMaps(prev, seedImageMapFromOffers(offerList, new Map())));
      }
      message.warning("Some product images could not be loaded from catalog");
    } finally {
      setImagesLoading(false);
    }
  }, []);

  const loadPending = useCallback(
    async (seg, sort = dateSort) => {
      const target = seg || segment;
      try {
        const pending = await fetchPendingOffers(target, sort, segmentStatus);
        const list = (pending || [])
          .map((o) => ({
            ...o,
            approvalStatus: o.approvalStatus || "PENDING",
          }))
          .filter((o) => (o.approvalStatus || "PENDING") === "PENDING");
        setOffers(list);
        await loadImages(list);
      } catch (err) {
        message.error(formatCartApiError(err) || "Failed to load pending offers");
      }
    },
    [segment, dateSort, segmentStatus, loadImages],
  );

  const loadPromptSupplement = useCallback(async () => {
    setPromptLoading(true);
    try {
      const data = await fetchPromptSupplement();
      setPromptSupplement(data?.supplementText ?? "");
      setPromptUpdatedAt(data?.updatedAt ?? null);
      setPromptStepComplete(!!data?.updatedAt);
    } catch (err) {
      message.error(formatCartApiError(err) || "Failed to load agent prompt");
    } finally {
      setPromptLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromptSupplement();
  }, [loadPromptSupplement]);

  useEffect(() => {
    setImageMap(new Map());
    loadPending(segment, dateSort);
  }, [segment, dateSort, loadPending]);

  const pendingOffersSorted = useMemo(() => {
    const pending = offers.filter(
      (o) => (o.approvalStatus || "PENDING") === "PENDING",
    );
    const sorted = [...pending].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateSort === "asc" ? ta - tb : tb - ta;
    });
    return sorted;
  }, [offers, dateSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [segment, dateSort, pendingOffersSorted.length]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(pendingOffersSorted.length / pageSize) || 1);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [pendingOffersSorted.length, pageSize, currentPage]);

  const paginatedOffers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return pendingOffersSorted.slice(start, start + pageSize);
  }, [pendingOffersSorted, currentPage, pageSize]);

  const resolveImage = (itemId, component) =>
    lookupImage(imageMap, itemId) ||
    resolveItemImageUrl(component?.imageUrl || component?.itemImage);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    const el = document.getElementById("campaign-offers-list-top");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const data = await fetchSegmentPreview(segment);
      setPreview(data);
      message.success("Segment preview loaded");
    } catch (err) {
      message.error(formatCartApiError(err) || "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  const resetPromptFieldForNextCampaign = () => {
    setPromptSupplement("");
    setPromptUpdatedAt(null);
    setPromptStepComplete(false);
  };

  const handleBulkGenerate = async () => {
    if (generating || approvingAll) return;
    if (!promptStepComplete) {
      message.warning("Complete Step 1: save the agent prompt before bulk generating offers.");
      return;
    }
    setGenerating(true);
    try {
      const data = await bulkGenerateCampaign(segment, maxOffers);
      setCampaignMeta(data);
      await loadPending(segment, dateSort);
      setCurrentPage(1);
      resetPromptFieldForNextCampaign();
      if (data.errors?.length) {
        data.errors.forEach((e) => message.warning(e));
      }
      message.success(
        data.message ||
          "Offers generated. Prompt field cleared — submit a new prompt for the next campaign.",
      );
    } catch (err) {
      message.error(formatCartApiError(err) || "Bulk generate failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePromptSupplement = async () => {
    setPromptSaving(true);
    try {
      const data = await savePromptSupplement(promptSupplement);
      setPromptSupplement(data?.supplementText ?? "");
      setPromptUpdatedAt(data?.updatedAt ?? null);
      setPromptStepComplete(true);
      message.success(
        data?.supplementText?.trim()
          ? "Special-day prompt saved. It will be added to the agent chat system prompt."
          : "Cleared. Agent chat will use only the default system prompt.",
      );
    } catch (err) {
      message.error(formatCartApiError(err) || "Failed to save prompt");
    } finally {
      setPromptSaving(false);
    }
  };

  const mergeOfferStatus = (updatedList, status) => {
    const ids = new Set(
      (updatedList || []).map((o) => String(offerKey(o))).filter(Boolean),
    );
    setOffers((prev) =>
      prev.map((o) => {
        const id = String(offerKey(o));
        if (ids.has(id)) {
          return { ...o, approvalStatus: status };
        }
        return o;
      }),
    );
  };

  const handleApprove = async (offer) => {
    if (generating || approvingAll) return;
    const id = offerKey(offer);
    if (!id) return;
    setActionId(id);
    try {
      const data = await approveOffers(segment, [id]);
      mergeOfferStatus(data.approvedOffers || [{ comboOfferId: id }], "APPROVED");
      message.success(data.message || "Offer approved");
    } catch (err) {
      message.error(formatCartApiError(err) || "Approve failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (offer) => {
    if (generating || approvingAll) return;
    const id = offerKey(offer);
    if (!id) return;
    setActionId(id);
    try {
      const data = await rejectOffers(segment, [id]);
      mergeOfferStatus(data.rejectedOffers || [{ comboOfferId: id }], "REJECTED");
      message.success(data.message || "Offer rejected");
    } catch (err) {
      message.error(formatCartApiError(err) || "Reject failed");
    } finally {
      setActionId(null);
    }
  };

  const handleApproveAll = async () => {
    if (generating || approvingAll) return;
    const pendingIds = offers
      .filter((o) => (o.approvalStatus || "PENDING") === "PENDING")
      .map(offerKey)
      .filter(Boolean);
    if (!pendingIds.length) {
      message.info("No pending offers to approve");
      return;
    }
    setApprovingAll(true);
    try {
      const data = await approveOffers(segment, null);
      setOffers((prev) =>
        prev.map((o) =>
          (o.approvalStatus || "PENDING") === "PENDING"
            ? { ...o, approvalStatus: "APPROVED" }
            : o,
        ),
      );
      message.success(data.message || "All pending offers approved");
    } catch (err) {
      message.error(formatCartApiError(err) || "Approve all failed");
    } finally {
      setApprovingAll(false);
    }
  };

  const pendingCount = offers.filter(
    (o) => (o.approvalStatus || "PENDING") === "PENDING",
  ).length;

  const segmentLabel =
    SEGMENT_OPTIONS.find((s) => s.value === segment)?.label || segment;

  return (
    <AdminPanelLayout>
      <div style={PAGE_BG}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Space align="start" style={{ marginBottom: 20, width: "100%" }} wrap>
            <GiftOutlined style={{ fontSize: 32, color: "#1677ff", marginTop: 4 }} />
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ marginBottom: 4 }}>
                AI Campaign Combo Offers
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 720 }}>
                Step 1: save the special-day agent prompt. Step 2: bulk-generate segment offers,
                review, then approve before customers see them in chat and the app.
              </Paragraph>
            </div>
          </Space>

          <Card
            title="Campaign setup"
            bordered={false}
            style={{ marginBottom: 20, borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
          >
            <Steps
              current={promptStepComplete ? 1 : 0}
              style={{ marginBottom: 28, maxWidth: 720 }}
              items={[
                {
                  title: "Save agent prompt",
                  description: "Special-day instructions for chat",
                },
                {
                  title: "Bulk generate offers",
                  description: "Create combos for segment",
                },
              ]}
            />

            {/* ——— Step 1: Prompt (submit first) ——— */}
            <div
              style={{
                padding: "16px 16px 20px",
                background: promptStepComplete ? "#f6ffed" : "#fafafa",
                border: `1px solid ${promptStepComplete ? "#b7eb8f" : "#f0f0f0"}`,
                borderRadius: 8,
              }}
            >
              <Space align="center" style={{ marginBottom: 8 }}>
                <Tag color={promptStepComplete ? "success" : "processing"}>Step 1</Tag>
                <Text strong>Agent prompt (save before generating)</Text>
                {promptStepComplete && <Tag color="success">Saved</Tag>}
              </Space>
              <Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
                Submit once per campaign. While generating offers, this is added to the default agent
                prompt (chat) and tagged on new combos. After bulk generate finishes, it is cleared
                automatically — enter a new prompt for the next campaign.
              </Paragraph>
              <Spin spinning={promptLoading}>
                <TextArea
                  rows={4}
                  placeholder="e.g. Today is Diwali — wish customers a happy festival and mention 10% extra on rice combos until Sunday."
                  value={promptSupplement}
                  onChange={(e) => setPromptSupplement(e.target.value)}
                  maxLength={4000}
                  showCount
                  disabled={promptSaving}
                />
              </Spin>
              <Space style={{ marginTop: 12 }} wrap>
                <Button
                  type="primary"
                  size="large"
                  htmlType="button"
                  icon={<SaveOutlined />}
                  loading={promptSaving}
                  onClick={handleSavePromptSupplement}
                >
                  Submit prompt
                </Button>
                <Button
                  htmlType="button"
                  disabled={promptSaving || promptLoading}
                  onClick={async () => {
                    setPromptSaving(true);
                    try {
                      const data = await savePromptSupplement("");
                      setPromptSupplement("");
                      setPromptUpdatedAt(data?.updatedAt ?? null);
                      setPromptStepComplete(true);
                      message.success("Cleared. Agent chat will use only the default system prompt.");
                    } catch (err) {
                      message.error(formatCartApiError(err) || "Failed to clear prompt");
                    } finally {
                      setPromptSaving(false);
                    }
                  }}
                >
                  Clear &amp; use default only
                </Button>
                {promptUpdatedAt && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Last saved: {formatOfferDate(promptUpdatedAt)}
                  </Text>
                )}
              </Space>
            </div>

            {!promptStepComplete && (
              <Alert
                type="warning"
                showIcon
                style={{ marginTop: 16, borderRadius: 8 }}
                message="Complete Step 1 first"
                description='Click "Submit prompt" above (empty is OK). Then you can bulk-generate offers in Step 2.'
              />
            )}

            <Divider style={{ margin: "24px 0" }} />

            {/* ——— Step 2: Segment + bulk generate ——— */}
            <div
              style={{
                opacity: promptStepComplete ? 1 : 0.55,
                pointerEvents: promptStepComplete ? "auto" : "none",
              }}
            >
              <Space align="center" style={{ marginBottom: 16 }}>
                <Tag color={promptStepComplete ? "processing" : "default"}>Step 2</Tag>
                <Text strong>Generate campaign combo offers</Text>
              </Space>

              <Form form={form} layout="vertical">
                <Row gutter={[20, 8]}>
                  <Col xs={24} md={9}>
                    <Form.Item label="Customer segment" required style={{ marginBottom: 8 }}>
                      <Select
                        size="large"
                        value={segment}
                        onChange={(v) => {
                          setSegment(v);
                          setPreview(null);
                          setCampaignMeta(null);
                        }}
                        options={SEGMENT_OPTIONS.map((s) => ({
                          value: s.value,
                          label: s.label,
                        }))}
                      />
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {SEGMENT_OPTIONS.find((s) => s.value === segment)?.description}
                    </Text>
                  </Col>
                  <Col xs={24} md={9}>
                    <Form.Item label="Status" required style={{ marginBottom: 8 }}>
                      <Select
                        size="large"
                        value={segmentStatus}
                        onChange={(v) => {
                          setSegmentStatus(v);
                          setPreview(null);
                          setCampaignMeta(null);
                        }}
                        options={[{ value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }].map((s) => ({
                          value: s.value,
                          label: s.label,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={5}>
                    <Form.Item
                      label="Offers in batch (1–20)"
                      required
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        size="large"
                        min={1}
                        max={20}
                        value={maxOffers}
                        onChange={(v) => setMaxOffers(v || 8)}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={10}>
                    <Form.Item label="Actions" style={{ marginBottom: 0 }}>
                      <Space wrap size="middle">
                        <Button
                          size="large"
                          htmlType="button"
                          icon={<UserOutlined />}
                          loading={previewLoading}
                          disabled={generating || approvingAll || !promptStepComplete}
                          onClick={handlePreview}
                        >
                          Preview segment
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          htmlType="button"
                          icon={<ThunderboltOutlined />}
                          loading={generating}
                          disabled={approvingAll || !promptStepComplete}
                          onClick={handleBulkGenerate}
                        >
                          Bulk generate
                        </Button>
                        <Button
                          size="large"
                          htmlType="button"
                          icon={<ReloadOutlined />}
                          disabled={generating || approvingAll || !promptStepComplete}
                          onClick={() => loadPending(segment)}
                        >
                          Refresh
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>

            {preview && (
              <Alert
                type="info"
                showIcon
                style={{ marginTop: 16, borderRadius: 8 }}
                message={`${segmentLabel} — segment preview`}
                description={`Users in segment: ${preview.userCount ?? preview.totalUsersInSegment ?? "—"}`}
              />
            )}

            {campaignMeta && (
              <Alert
                type="success"
                showIcon
                style={{ marginTop: 12, borderRadius: 8 }}
                message={campaignMeta.message}
                description={
                  <>
                    Batch offers: {campaignMeta.pendingOffersCreated ?? offers.length}
                    {" · "}
                    Eligible customers: {campaignMeta.totalUsersInSegment ?? "—"}
                  </>
                }
              />
            )}
          </Card>

          <Card
            id="campaign-offers-list-top"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
            title={
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
                <Col>
                  <Text strong style={{ fontSize: 16 }}>
                    Generated offers
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    {pendingCount} pending (all dates)
                  </Text>
                  {imagesLoading && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      (loading images…)
                    </Text>
                  )}
                </Col>
                <Col>
                  <Space wrap>
                    <Text type="secondary">Sort by created:</Text>
                    <Select
                      value={dateSort}
                      onChange={(v) => setDateSort(v)}
                      style={{ width: 200 }}
                      options={[
                        { value: "desc", label: "Newest first (descending)" },
                        { value: "asc", label: "Oldest first (ascending)" },
                      ]}
                    />
                  </Space>
                </Col>
                <Col>
                  <Popconfirm
                    title="Approve all pending offers?"
                    description={`Approve ${pendingCount} offer(s) for ${segmentLabel}? This does not generate new offers.`}
                    okText="Approve all"
                    cancelText="Cancel"
                    disabled={pendingCount === 0 || generating || approvingAll}
                    onConfirm={handleApproveAll}
                  >
                    <Button
                      type="primary"
                      htmlType="button"
                      icon={<CheckOutlined />}
                      disabled={pendingCount === 0 || generating}
                      loading={approvingAll}
                    >
                      Approve all pending
                    </Button>
                  </Popconfirm>
                </Col>
              </Row>
            }
          >
            <Spin spinning={(generating && !actionId) || imagesLoading}>
              {pendingOffersSorted.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No pending offers. Select a segment and run Bulk generate, or change sort/filter."
                />
              ) : (
                <>
                <Row gutter={[20, 20]}>
                  {paginatedOffers.map((offer) => {
                    const id = offerKey(offer);
                    const status = offer.approvalStatus || "PENDING";
                    const isPending = status === "PENDING";
                    const savingsPct =
                      offer.mrpTotal > 0 && offer.savings != null
                        ? Math.round((offer.savings / offer.mrpTotal) * 100)
                        : null;

                    return (
                      <Col xs={24} key={id}>
                        <Card
                          size="small"
                          style={{
                            borderRadius: 10,
                            border: "1px solid #f0f0f0",
                            overflow: "hidden",
                          }}
                          styles={{
                            body: { padding: 0 },
                          }}
                        >
                          <div
                            style={{
                              padding: "16px 20px",
                              background: "linear-gradient(90deg, #fafafa 0%, #fff 100%)",
                              borderBottom: "1px solid #f0f0f0",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 12,
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Space wrap align="center">
                              <Text strong style={{ fontSize: 16 }}>
                                {offer.title || offer.comboCode || "Combo offer"}
                              </Text>
                              <Tag color={statusColor(status)}>{status}</Tag>
                              {offer.comboCode && (
                                <Tag>{offer.comboCode}</Tag>
                              )}
                              <Tag color="default">
                                Created {formatOfferDate(offer.createdAt)}
                              </Tag>
                            </Space>
                            {isPending && (
                              <Space>
                                <Button
                                  type="primary"
                                  htmlType="button"
                                  icon={<CheckOutlined />}
                                  disabled={generating || approvingAll}
                                  loading={actionId === id}
                                  onClick={() => handleApprove(offer)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  danger
                                  htmlType="button"
                                  icon={<CloseOutlined />}
                                  disabled={generating || approvingAll}
                                  loading={actionId === id}
                                  onClick={() => handleReject(offer)}
                                >
                                  Reject
                                </Button>
                              </Space>
                            )}
                          </div>

                          <div style={{ padding: "16px 20px 20px" }}>
                            {offer.description && (
                              <Paragraph
                                type="secondary"
                                style={{ marginBottom: 16, fontSize: 13 }}
                              >
                                {offer.description}
                              </Paragraph>
                            )}

                            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                              <Col xs={12} sm={8} lg={4}>
                                <Statistic
                                  title="Bundle price"
                                  value={offer.bundlePrice ?? 0}
                                  prefix="₹"
                                  precision={2}
                                  valueStyle={{ color: "#1677ff", fontSize: 20 }}
                                />
                              </Col>
                              <Col xs={12} sm={8} lg={4}>
                                <Statistic
                                  title="List total"
                                  value={offer.mrpTotal ?? 0}
                                  prefix="₹"
                                  precision={2}
                                  valueStyle={{ fontSize: 18 }}
                                />
                              </Col>
                              <Col xs={12} sm={8} lg={4}>
                                <Statistic
                                  title="You save"
                                  value={offer.savings ?? 0}
                                  prefix="₹"
                                  precision={2}
                                  valueStyle={{ color: "#52c41a", fontSize: 18 }}
                                />
                              </Col>
                              <Col xs={12} sm={8} lg={4}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Created on
                                </Text>
                                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                                  {formatOfferDate(offer.createdAt)}
                                </div>
                              </Col>
                              <Col xs={12} sm={8} lg={4}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Valid until
                                </Text>
                                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                                  {formatOfferDate(offer.validUntil)}
                                </div>
                                {savingsPct != null && (
                                  <Tag color="green" style={{ marginTop: 8 }}>
                                    ~{savingsPct}% off
                                  </Tag>
                                )}
                              </Col>
                            </Row>

                            <Text
                              strong
                              style={{
                                display: "block",
                                marginBottom: 12,
                                fontSize: 13,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                color: "#8c8c8c",
                              }}
                            >
                              Products in this combo
                            </Text>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                                padding: 16,
                                background: "#fafafa",
                                borderRadius: 10,
                                border: "1px solid #f0f0f0",
                              }}
                            >
                              {(offer.components || []).length === 0 ? (
                                <Text type="secondary">No products listed</Text>
                              ) : (
                                (offer.components || []).map((comp, idx) => (
                                  <ComboProductThumb
                                    key={`${id}-c-${idx}`}
                                    component={comp}
                                    imageUrl={resolveImage(comp.itemId, comp)}
                                  />
                                ))
                              )}
                            </div>

                            <Text type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
                              Segment: {offer.campaignSegment || segment}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
                {offers.length > pageSize && (
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 16,
                      borderTop: "1px solid #f0f0f0",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={pendingOffersSorted.length}
                      showSizeChanger
                      pageSizeOptions={[5, 10, 15, 20]}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} offers`
                      }
                      onChange={handlePageChange}
                      onShowSizeChange={handlePageChange}
                    />
                  </div>
                )}
                </>
              )}
            </Spin>
          </Card>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default AgentCampaignOffers;
