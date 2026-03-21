import React, { useState, useEffect } from "react";
import { Table, message, Typography, Image } from "antd";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import CompaniesLayout from "../components/CompaniesLayout";
import useAuth from '../../../shared/hooks/useAuth';

const { Title } = Typography;

const HyseaSummit = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    fetchBusinessCards();
  }, []);

  const fetchBusinessCards = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/hyseaSummit`,
      );
      setCards(response.data.reverse());
    } catch (error) {
      message.error("Failed to fetch Hysea Summit data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
    
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Name",
      dataIndex: "personName",
      key: "personName",
      align: "center",
      render: (text) => text || "--",
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
      align: "center",
      render: (text) => text || "--",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (text) => (text ? <Image src={text} width={50} height={50} /> : "--"),
    },
    {
      title: "Original Image",
      dataIndex: "originalImage",
      key: "originalImage",
      align: "center",
      render: (text) => (text ? <Image src={text} width={50} height={50} /> : "--"),
    },
    {
      title: "Mobile Numbers",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      align: "center",
      render: (text) => (
        <div style={{ wordBreak: "break-all" }}>{text || "--"}</div>
      ),
    },
    {
      title: "Emails",
      dataIndex: "email",
      key: "email",
      align: "center",
      render: (text) => (
        <div style={{ wordBreak: "break-all" }}>{text || "--"}</div>
      ),
    },
  ];

  return (
    <CompaniesLayout>
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "24px" }}>
          Hysea Summit
        </Title>
        <Table
          columns={columns}
          dataSource={cards}
          loading={loading}
          rowKey={(_, index) => index}
          bordered
          scroll={{ x: "100%" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: cards.length,
            showTotal: (total) => `Total ${total} items`,
            showSizeChanger: true,
            pageSizeOptions: [50, 70, 90, 100],
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      </div>
    </CompaniesLayout>
  );
};

export default HyseaSummit;
