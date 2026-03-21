import React, { useState, useEffect } from "react";
import { Table, message, Image, Typography } from "antd";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import CompaniesLayout from "../components/CompaniesLayout";
import useAuth from '../../../shared/hooks/useAuth';

const { Title } = Typography;

const BusinessCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  useEffect(() => {
    fetchBusinessCards();
  }, []);

  const fetchBusinessCards = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/bussinesCard`,
      );
      setCards(response.data);
    } catch (error) {
      message.error("Failed to fetch business cards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 80,
      align: "center",
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Business Card Image",
      dataIndex: "businessCardImage",
      key: "businessCardImage",

      align: "center",
      render: (text) =>
        text ? (
          <Image
            src={text}
            alt="Business Card"
            width={60}
            height={60}
        
          />
        ) : (
          "--"
        ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",

      align: "center",
      render: (text) =>
        text ? (
          <Image
            src={text}
            alt="Image"
            width={60}
            height={60}
         
          />
        ) : (
          "--"
        ),
    },
    // {
    //   title: "Name",
    //   dataIndex: "personName",
    //   key: "personName",

    //   align: "center",
    //   render: (text) => text || "--",
    // },
    {
      title: "Business Card Mobile Numbers",
      dataIndex: "mobileNumber",
      key: "mobileNumber",

      align: "center",
      render: (text) => {
        if (!text) return "--";
        const uniqueNumbers = [
          ...new Set(
            text
              .split(",")
              .map((num) => num.trim())
              .filter((num) => num.length === 10 && /^\d{10}$/.test(num)),
          ),
        ];
        return uniqueNumbers.length > 0 ? (
          <div>
            {uniqueNumbers.map((num, i) => (
              <div key={i}>{num}</div>
            ))}
          </div>
        ) : (
          "--"
        );
      },
    },
    {
      title: "Business Card Emails",
      dataIndex: "email",
      key: "email",

      align: "center",
      render: (text) => {
        if (!text) return "--";
        const uniqueEmails = [
          ...new Set(text.split(",").map((email) => email.trim())),
        ];
        return (
          <div>
            {uniqueEmails.map((email, i) => (
              <div key={i}>{email}</div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <CompaniesLayout>
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "24px" }}>
          Business Cards
        </Title>
        <Table
          columns={columns}
          dataSource={cards}
          loading={loading}
          rowKey={(_, index) => index}
          bordered
          scroll={{ x: "100%", y: 400 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: cards.length,
            showTotal: (total) => `Total ${total} items`,
            showSizeChanger: true,
            pageSizeOptions: [50, 70, 90, 100],
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </div>
    </CompaniesLayout>
  );
};

export default BusinessCards;
