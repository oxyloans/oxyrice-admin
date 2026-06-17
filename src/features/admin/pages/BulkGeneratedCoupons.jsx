import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AdminPanelLayout from "../components/AdminPanelLayout.jsx";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import useAuth from "../../../shared/hooks/useAuth";

const { Title, Text } = Typography;

const SEGMENTS = [
  { label: "Cart Abandoned", value: "CART_ABANDONED", color: "orange" },
  { label: "Churned", value: "CHURNED", color: "red" },
  { label: "Frequent Buyer", value: "FREQUENT_BUYER", color: "green" },
  { label: "Registered No Order", value: "REGISTERED_NO_ORDER", color: "blue" },
];

const segmentColorMap = SEGMENTS.reduce((acc, item) => {
  acc[item.value] = item.color;
  return acc;
}, {});

const segmentLabelMap = SEGMENTS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const formatTitle = (key = "") =>
  key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getTableData = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.coupons)) return payload.coupons;
  if (Array.isArray(payload?.pendingCoupons)) return payload.pendingCoupons;
  return [];
};

const getApprovalStatusColor = (status = "") => {
  const normalizedStatus = String(status).toUpperCase();

  if (normalizedStatus === "APPROVED") return "green";
  if (normalizedStatus === "REJECTED") return "red";
  if (normalizedStatus === "PENDING") return "gold";

  return "default";
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BulkGeneratedCoupons = () => {
  const { accessToken } = useAuth();

  const [bulkGeneratedCoupons, setBulkGeneratedCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSegment, setSelectedSegment] = useState("CART_ABANDONED");
  const [maxCoupons, setMaxCoupons] = useState("");
  const [searchText, setSearchText] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const selectedSegmentLabel =
    segmentLabelMap[selectedSegment] || formatTitle(selectedSegment);

  const filteredCoupons = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return bulkGeneratedCoupons;
    return bulkGeneratedCoupons.filter(
      (item) =>
        String(item.couponCode || "").toLowerCase().includes(q) ||
        String(item.offerId || "").toLowerCase().includes(q)
    );
  }, [bulkGeneratedCoupons, searchText]);

  const fetchBulkGeneratedCoupons = useCallback(
    async (segment = selectedSegment) => {
      if (!segment) {
        setBulkGeneratedCoupons([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await axiosInstance.get(
          `${BASE_URL}/cart-service/agent/campaign/coupons/pending`,
          {
            params: { segment },
          }
        );

        setBulkGeneratedCoupons(getTableData(data));
        setCurrentPage(1);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch pending coupons.";

        setBulkGeneratedCoupons([]);
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [ selectedSegment],
  );

  const generateBulkCoupons = async () => {
    if (!selectedSegment) {
      message.warning("Please select one segment.");
      return;
    }

    const trimmedMaxCoupons = String(maxCoupons).trim();

    if (!trimmedMaxCoupons) {
      message.warning("Please enter max coupons count.");
      return;
    }

    if (!/^\d+$/.test(trimmedMaxCoupons)) {
      message.warning("Only digits are allowed in max coupons.");
      return;
    }

    const maxCouponsNumber = Number(trimmedMaxCoupons);

    if (maxCouponsNumber < 1) {
      message.warning("Max coupons must be minimum 1.");
      return;
    }

    if (maxCouponsNumber > 10000) {
      message.warning("Max coupons cannot be more than 10000.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const { data } = await axiosInstance.post(
        `${BASE_URL}/cart-service/agent/campaign/coupons/bulk-generate`,
        null,
        {
          params: {
            maxCoupons: maxCouponsNumber,
            segment: selectedSegment,
          },
        }
      );

      message.success(data?.message || "Coupons generated successfully.");

      await fetchBulkGeneratedCoupons(selectedSegment);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate coupons.";

      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveReject = async (offerId, type) => {
    const endpoint = type === "approve" ? "approve" : "reject";
    setActionLoading((prev) => ({ ...prev, [offerId]: type }));
    try {
      const { data } = await axiosInstance.post(
        `${BASE_URL}/cart-service/agent/campaign/coupons/${endpoint}`,
        { offerIds: [offerId] },
        { params: { segment: selectedSegment } }
      );
      message.success(data?.message || `${type === "approve" ? "Approved" : "Rejected"} successfully.`);
      await fetchBulkGeneratedCoupons(selectedSegment);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || `Failed to ${type} coupon.`;
      message.error(errorMessage);
    } finally {
      setActionLoading((prev) => { const s = { ...prev }; delete s[offerId]; return s; });
    }
  };

  useEffect(() => {
    fetchBulkGeneratedCoupons(selectedSegment);
  }, [selectedSegment, fetchBulkGeneratedCoupons]);

  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "serialNumber",
        width: 80,
        align: "center",
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Offer ID",
        dataIndex: "offerId",
        key: "offerId",
        align: "center",
        render: (value) =>
          value ? <Tag>#{String(value).slice(-4).toUpperCase()}</Tag> : "-",
      },
      {
        title: "Coupon Code",
        dataIndex: "couponCode",
        key: "couponCode",

        align: "center",
        render: (value) => (
          <Tag color="blue" className="font-semibold">
            {value || "-"}
          </Tag>
        ),
      },
      // {
      //   title: "Title",
      //   dataIndex: "title",
      //   key: "title",
      //   width: 220,
      //   align: "center",
      //   ellipsis: true,
      //   render: (value) => value || "-",
      // },
      // {
      //   title: "Description",
      //   dataIndex: "description",
      //   key: "description",
      //   width: 280,
      //   align: "center",
      //   ellipsis: true,
      //   render: (value) => value || "-",
      // },
      {
        title: "Offer Type",
        dataIndex: "offerType",
        key: "offerType",

        align: "center",
        render: (value) => <Tag color="purple">{value || "-"}</Tag>,
      },
      {
        title: "Approval Status",
        dataIndex: "approvalStatus",
        key: "approvalStatus",
        align: "center",
        render: (value) => (
          <Tag color={getApprovalStatusColor(value)}>{value || "-"}</Tag>
        ),
      },

      {
        title: "Discount Amount",
        dataIndex: "discountAmount",
        key: "discountAmount",
        align: "center",
        render: (value) => (Number(value) > 0 ? `₹${value}` : "-"),
      },
      {
        title: "Discount %",
        dataIndex: "discountPercentage",
        key: "discountPercentage",
        align: "center",
        render: (value) => (Number(value) > 0 ? `${value}%` : "-"),
      },
      {
        title: "Active",
        dataIndex: "isActive",
        key: "isActive",
        align: "center",
        render: (value) => (
          <Tag color={value ? "green" : "red"}>{value ? "Yes" : "No"}</Tag>
        ),
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => {
          const id = record.offerId;
          const status = String(record.approvalStatus || "").toUpperCase();
          if (status === "APPROVED" || status === "REJECTED") return "-";
          return (
            <Space>
              <Popconfirm
                title="Approve this coupon?"
                onConfirm={() => handleApproveReject(id, "approve")}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="middle"
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={actionLoading[id] === "approve"}
                  style={{ background: "#1ab394", borderColor: "#1ab394" }}
                >
                  Approve
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Reject this coupon?"
                onConfirm={() => handleApproveReject(id, "reject")}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="middle"
                  danger
                  icon={<CloseOutlined />}
                  loading={actionLoading[id] === "reject"}
                >
                  Reject
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [currentPage, pageSize, actionLoading],
  );

  return (
    <AdminPanelLayout>
      <div className="p-4 sm:p-6">
        <div className="shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
            <div>
              <Title level={3} className="!mb-1">
                Bulk Generated Coupons
              </Title>
            </div>

            <Space wrap>
              <Input.Search
                placeholder="Search Coupon Code or Offer ID"
                allowClear
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                onSearch={() => setCurrentPage(1)}
                style={{ width: 280 }}
                size="middle"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchText("");
                  fetchBulkGeneratedCoupons(selectedSegment);
                }}
                loading={loading}
                size="middle"
              />
            </Space>
          </div>

          <Card className="mb-4 rounded-xl">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-5">
                <Text strong>Customer Segment</Text>
                <Select
                  size="large"
                  showSearch
                  placeholder="Select Segment"
                  value={selectedSegment}
                  onChange={(value) => {
                    setSelectedSegment(value);
                    setCurrentPage(1);
                  }}
                  optionFilterProp="label"
                  className="mt-2 w-full"
                  options={SEGMENTS.map(({ label, value }) => ({
                    label,
                    value,
                  }))}
                />
              </div>

              <div className="lg:col-span-3">
                <Text strong>Max Coupons</Text>
                <Input
                  size="large"
                  value={maxCoupons}
                  onChange={(event) => {
                    const digitsOnly = event.target.value.replace(/\D/g, "");
                    setMaxCoupons(digitsOnly);
                  }}
                  onKeyDown={(event) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                      "Home",
                      "End",
                    ];

                    if (
                      allowedKeys.includes(event.key) ||
                      ((event.ctrlKey || event.metaKey) &&
                        ["a", "c", "v", "x"].includes(event.key.toLowerCase()))
                    ) {
                      return;
                    }

                    if (!/^[0-9]$/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  onPaste={(event) => {
                    const pastedText = event.clipboardData.getData("text");

                    if (!/^\d+$/.test(pastedText)) {
                      event.preventDefault();
                      message.warning(
                        "Only digits are allowed in max coupons.",
                      );
                    }
                  }}
                  maxLength={5}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="mt-2 w-full"
                  placeholder="Enter max coupons"
                />
              </div>

              <div className="lg:col-span-4">
                <Button
                  size="large"
                  style={{
                    background: "#008cba",
                    borderColor: "#008cba",
                    color: "white",
                  }}
                  onClick={generateBulkCoupons}
                  loading={generating}
                  block
                >
                  Generate Coupons
                </Button>

              </div>
            </div>
          </Card>

          {error && (
            <Alert
              message="Unable to process coupons"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Space wrap>
              <Tag color={segmentColorMap[selectedSegment] || "default"}>
                {selectedSegmentLabel}
              </Tag>
              <Text type="secondary">
                {filteredCoupons.length} of {bulkGeneratedCoupons.length} pending coupon(s) found
              </Text>
            </Space>
          </div>

          <Table
            rowKey={(record, index) =>
              record.couponCode ||
              record.offerId ||
              record.campaignBatchId ||
              `${index}`
            }
            loading={loading || generating}
            dataSource={filteredCoupons}
            columns={columns}
            bordered
            size="middle"
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <Empty description="No pending coupons found for selected segment" />
              ),
            }}
            pagination={{
              current: currentPage,
              pageSize,
              size: "middle",
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} coupons`,
              onChange: (page, size) => {
                if (size !== pageSize) {
                  setCurrentPage(1);
                  setPageSize(size);
                } else {
                  setCurrentPage(page);
                }
              },
            }}
          />
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default BulkGeneratedCoupons;
