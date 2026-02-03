import { useState, useEffect } from "react";
import { Table, Typography, Spin, Alert, Input } from "antd";
import AdminPanelLayoutTest from "../components/AdminPanel";
import BASE_URL from "./Config";

const { Title } = Typography;
const { Search } = Input;

const AllReferralsData = () => {
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getLastFourDigits = (id) => {
    if (!id) return "N/A";
    return id.slice(-4);
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/reference-service/getallreferaldata`,
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        const referralsWithSerial = data.map((referral, index) => ({
          ...referral,
          key: index,
          serialNumber: index + 1,
        }));

        setReferrals(referralsWithSerial);
        setFilteredReferrals(referralsWithSerial);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = referrals.filter((item) => {
      const whatsapp = item.whatsappnumber?.toLowerCase() || "";
      const referee = item.referee?.toLowerCase() || "";
      const referrer = item.referrer?.toLowerCase() || "";
      return (
        whatsapp.includes(value.toLowerCase()) ||
        referee.includes(value.toLowerCase()) ||
        referrer.includes(value.toLowerCase())
      );
    });
    setFilteredReferrals(filtered);
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: 80,
      align: "center",
    },
    {
      title: "Reference Status",
      dataIndex: "referenceStatus",
      key: "referenceStatus",
      align: "center",
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsappnumber",
      key: "whatsappnumber",
      align: "center",
    },
    {
      title: "Referee ID (Last 4)",
      key: "referee",
      render: (record) => getLastFourDigits(record.referee),
      align: "center",
    },
    {
      title: "Referrer ID (Last 4)",
      key: "referrer",
      render: (record) => getLastFourDigits(record.referrer),
      align: "center",
    },
  ];

  if (loading) {
    return (
      <AdminPanelLayoutTest>
        <div className="flex justify-center items-center h-40">
          <Spin size="medium" tip="Loading referrals..." />
        </div>
      </AdminPanelLayoutTest>
    );
  }

  if (error) {
    return (
      <AdminPanelLayoutTest>
        <Alert message="Error" description={error} type="error" showIcon />
      </AdminPanelLayoutTest>
    );
  }

  if (!referrals.length) {
    return (
      <AdminPanelLayoutTest>
        <Alert
          message="No Data"
          description="No referral records found."
          type="warning"
          showIcon
        />
      </AdminPanelLayoutTest>
    );
  }

  return (
    <AdminPanelLayoutTest>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Title level={3}>All Referrals Data</Title>
          <Search
            placeholder="Search by WhatsApp / Referrer / Referee"
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          dataSource={filteredReferrals}
          columns={columns}
          pagination={{ pageSize: 50 }}
          bordered
          size="middle"
          className="shadow rounded-md overflow-x-auto"
          scroll={{ x: "max-content" }}
        />
      </div>
    </AdminPanelLayoutTest>
  );
};

export default AllReferralsData;
