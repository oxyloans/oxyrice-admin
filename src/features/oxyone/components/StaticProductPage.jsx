import { ArrowLeftOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Button, Empty } from "antd";
import { useNavigate } from "react-router-dom";

export default function StaticProductPage({ config }) {
  const navigate = useNavigate();

  return (
    <div className="border border-slate-200 bg-white min-h-[420px]">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
        <div>
          <h1 className="m-0 text-lg font-bold text-slate-900">
            {config.title}
          </h1>
          <p className="m-0 mt-1 text-xs text-slate-500">{config.subtitle}</p>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/oxyone")}
        >
          Dashboard
        </Button>
      </div>
      <div className="min-h-[340px] grid place-items-center p-6">
        <Empty
          image={
            <ClockCircleOutlined
              style={{ color: config.color, fontSize: 54 }}
            />
          }
          description={
            <div className="text-center">
              <div className="font-semibold text-slate-700">Page is ready</div>
              <div className="text-xs text-slate-400 mt-1">
                Live data integration will be added when the API is available.
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
