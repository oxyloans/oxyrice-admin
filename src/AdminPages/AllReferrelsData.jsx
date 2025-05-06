import { useState, useEffect } from "react";
import { Table, Card, Typography, Spin, Alert } from "antd";
import AdminPanelLayoutTest from "./AdminPanel";
import BASE_URL from "./Config";

const { Title, Text } = Typography;

const AllReferralsData = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get last 4 digits of an ID
  const getLastFourDigits = (id) => {
    if (!id) return "N/A";
    return id.slice(-4);
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/reference-service/getallreferaldata`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Add serial number to each referral
        const referralsWithSerial = data.map((referral, index) => ({
          ...referral,
          key: index,
          serialNumber: index + 1,
        }));
        setReferrals(referralsWithSerial);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  // Define columns for the table
  const columns = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
          width: 80,
      align:"center",
    },
    {
      title: "Reference Status",
      dataIndex: "referenceStatus",
        key: "referenceStatus",
      align:"center",
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsappnumber",
      key: "whatsappnumber",
      align:"center",
    },
    {
      title: "Referee ID (Last 4)",
      key: "referee",
      render: (record) => getLastFourDigits(record.referee),
      align:"center",
    },
    {
      title: "Referrer ID (Last 4)",
      key: "referrer",
        render: (record) => getLastFourDigits(record.referrer),
      align:"center",
    },
  ];

  // For mobile view - columns to show
  const mobileColumns = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: 60,
    },
    {
      title: "Status",
      dataIndex: "referenceStatus",
      key: "referenceStatus",
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsappnumber",
      key: "whatsappnumber",
    },
  ];

  if (loading) {
    return (
      <AdminPanelLayoutTest>
        <div className="flex justify-center items-center h-40">
          <Spin size="medium" tip="Loading referrals data..." />
        </div>
      </AdminPanelLayoutTest>
    );
  }

  if (error) {
    return (
      <AdminPanelLayoutTest>
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
        />
      </AdminPanelLayoutTest>
    );
  }

  if (!referrals || referrals.length === 0) {
    return (
      <AdminPanelLayoutTest>
        <Alert
          message="No Data Available"
          description="No referrals data available at the moment."
          type="warning"
          showIcon
        />
      </AdminPanelLayoutTest>
    );
  }

  return (
    <AdminPanelLayoutTest>
      <div className="p-4">
        <Title level={2} className="mb-6">
          All Referrals Data
        </Title>

        {/* Desktop view */}
        <div className="hidden md:block">
          <Table
            dataSource={referrals}
            columns={columns}
            pagination={{ pageSize: 10 }}
            bordered
            className="shadow-md"
          />
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          <Table
            dataSource={referrals}
            columns={mobileColumns}
            pagination={{ pageSize: 5 }}
            bordered
            size="small"
            className="shadow-md"
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-2">
                  <p>
                    <Text strong>Referee ID (Last 4):</Text>{" "}
                    {getLastFourDigits(record.referee)}
                  </p>
                  <p>
                    <Text strong>Referrer ID (Last 4):</Text>{" "}
                    {getLastFourDigits(record.referrer)}
                  </p>
                </div>
              ),
            }}
          />
        </div>

        {/* Alternative mobile view with cards */}
        <div className="md:hidden mt-6 space-y-4">
          {referrals.map((referral) => (
            <Card key={referral.key} size="small" className="shadow-sm">
              <div className="grid grid-cols-2 gap-1">
                <Text strong>S.No:</Text>
                <Text>{referral.serialNumber}</Text>

                <Text strong>Status:</Text>
                <Text>{referral.referenceStatus}</Text>

                <Text strong>WhatsApp:</Text>
                <Text>{referral.whatsappnumber}</Text>

                <Text strong>Referee (Last 4):</Text>
                <Text>{getLastFourDigits(referral.referee)}</Text>

                <Text strong>Referrer (Last 4):</Text>
                <Text>{getLastFourDigits(referral.referrer)}</Text>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default AllReferralsData;
