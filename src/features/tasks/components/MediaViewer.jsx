import React from "react";
import { Typography } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";

const { Text } = Typography;

const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  return (
    videoExtensions.some((ext) => url.toLowerCase().includes(ext)) ||
    url.includes("s3")
  );
};

const isImageUrl = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i.test(url);
};

const isPdfUrl = (url) => {
  if (!url) return false;
  return /\.pdf(\?|$)/i.test(url);
};

// Props:
//   text        — plain text content (task.planOftheDay / task.endOftheDay)
//   url         — media URL from new API (newApiEntry.planOfTheDay / endOfTheDay)
//   placeholder — shown when both are empty
const MediaViewer = ({ text, url, placeholder = "—" }) => {
  const hasContent = text || url;

  if (!hasContent)
    return <Text className="text-gray-400 text-sm">{placeholder}</Text>;

  return (
    <>
      {/* Text content */}
      {text && (
        <div className="max-h-32 overflow-y-auto bg-white p-3 rounded-md border border-gray-100">
          <Text className="whitespace-pre-wrap text-gray-700">{text}</Text>
        </div>
      )}

      {/* Media content */}
      {url && isVideoUrl(url) && (
        <div className="mt-3">
          <video
            controls
            className="w-full rounded-lg border border-gray-200"
            style={{ maxHeight: "300px" }}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {url && isImageUrl(url) && (
        <div className="mt-3">
          <img
            src={url}
            alt="media"
            onClick={() => window.open(url, "_blank")}
            className="w-full rounded-lg border border-gray-200"
            style={{ maxHeight: "300px", objectFit: "contain", cursor: "pointer" }}
          />
        </div>
      )}

      {url && isPdfUrl(url) && (
        <div className="mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ff4d4f", display: "flex", alignItems: "center", gap: 6 }}
          >
            <FilePdfOutlined style={{ fontSize: 22 }} />
            <span style={{ fontSize: 13 }}>View PDF</span>
          </a>
        </div>
      )}

      {url && !isVideoUrl(url) && !isImageUrl(url) && !isPdfUrl(url) && (
        <div className="mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#008cba", fontSize: 13, fontWeight: 600 }}
          >
            View File
          </a>
        </div>
      )}
    </>
  );
};

export default MediaViewer;
