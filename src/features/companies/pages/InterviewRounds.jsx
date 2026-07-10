import React, { useEffect, useState } from "react";
import { Table, Spin, Empty, Typography, message, Tag, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../core/config/axiosInstance";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";

const { Title } = Typography;

const InterviewRounds = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axiosInstance.get(
          `${BASE_URL}/marketing-service/campgin/interview-rounds/${id}`
        );
        setRounds(res.data?.data || []);
      } catch {
        message.error("Failed to load interview rounds");
      } finally {
        setLoading(false);
      }
    };
    fetchRounds();
  }, [id]);

  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Round Name",
      dataIndex: "roundName",
      key: "roundName",
      align: "center",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Taken By",
      dataIndex: "takenBy",
      key: "takenBy",
      align: "center",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      align: "center",
      render: (v) => v || "—",
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
      align: "center",
      render: (v) => v || "—",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "—"),
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
        <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            Interview Rounds
          </Title>
          <Button
            style={{ background: "#008cba", borderColor: "#008cba", color: "#fff" }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="medium" tip="Loading rounds..." />
          </div>
        ) : rounds.length === 0 ? (
          <Empty description="No interview rounds found." />
        ) : (
          <Table
            columns={columns}
            dataSource={rounds}
            rowKey="id"
            bordered
            pagination={false}
            scroll={{ x: true }}
            className="max-w-7xl mx-auto"
          />
        )}
      </div>
    </CompaniesLayout>
  );
};

export default InterviewRounds;
