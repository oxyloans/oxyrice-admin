import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import CompaniesLayout from "../Components/CompaniesLayout";

const CAMPAIGNS_API = `${BASE_URL}/marketing-service/campgin/getAllCampaignDetails`;

const COMMENTS_API_BASE = `${BASE_URL}/marketing-service/campgin/getcampainlikesandcommentsbycamapignid`;

const HIDE_COMMENT_API_BASE = `${BASE_URL}/marketing-service/campgin/hide-comments`;

const getAuthHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
};

export default function CampaignsWithComments() {
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [commentsMap, setCommentsMap] = useState({});

  const [openCampaignId, setOpenCampaignId] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const res = await axios.get(CAMPAIGNS_API, {
        headers: getAuthHeaders(),
      });
      setCampaigns(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Campaigns fetch error:", err);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const fetchCommentsByCampaignId = async (campaignId) => {
    if (commentsMap[campaignId]?.data) return;

    setCommentsMap((prev) => ({
      ...prev,
      [campaignId]: { loading: true, error: null, data: null },
    }));

    try {
      const url = `${COMMENTS_API_BASE}?campaignId=${encodeURIComponent(
        campaignId
      )}`;

      const res = await axios.get(url, {
        headers: getAuthHeaders(),
      });

      setCommentsMap((prev) => ({
        ...prev,
        [campaignId]: { loading: false, error: null, data: res.data },
      }));
    } catch (err) {
      console.error("Comments fetch error:", err);
      setCommentsMap((prev) => ({
        ...prev,
        [campaignId]: {
          loading: false,
          error: "Failed to load comments",
          data: null,
        },
      }));
    }
  };

  const onOpenCampaign = async (campaignId) => {
    if (openCampaignId === campaignId) {
      setOpenCampaignId(null);
      return;
    }
    setOpenCampaignId(campaignId);
    await fetchCommentsByCampaignId(campaignId);
  };

  const hideComment = async ({ id, type, campaignId, mainCommentId }) => {
    try {
      const url = `${HIDE_COMMENT_API_BASE}?id=${encodeURIComponent(
        id
      )}&type=${encodeURIComponent(type)}`;

      await axios.patch(url, null, { headers: getAuthHeaders() });

      setCommentsMap((prev) => {
        const entry = prev[campaignId];
        if (!entry?.data) return prev;

        const cloned = structuredClone(entry.data);

        if (type === "MAINCOMMENT") {
          cloned.subComments = (cloned.subComments || []).filter(
            (mc) => mc.mainCommentId !== id
          );
        }

        if (type === "SUBCOMMENT") {
          cloned.subComments = (cloned.subComments || []).map((mc) => {
            if (mc.mainCommentId !== mainCommentId) return mc;
            return {
              ...mc,
              subComments: (mc.subComments || []).filter(
                (sc) => sc.subCommentId !== id
              ),
            };
          });
        }

        return {
          ...prev,
          [campaignId]: { ...entry, data: cloned },
        };
      });
    } catch (err) {
      console.error("Hide comment error:", err);

      try {
        const url = `${HIDE_COMMENT_API_BASE}?id=${encodeURIComponent(
          id
        )}&type=${encodeURIComponent(type)}`;
        await axios.patch(url, null, { headers: getAuthHeaders() });

        setCommentsMap((prev) => {
          const entry = prev[campaignId];
          if (!entry?.data) return prev;

          const cloned = structuredClone(entry.data);

          if (type === "MAINCOMMENT") {
            cloned.subComments = (cloned.subComments || []).filter(
              (mc) => mc.mainCommentId !== id
            );
          }

          if (type === "SUBCOMMENT") {
            cloned.subComments = (cloned.subComments || []).map((mc) => {
              if (mc.mainCommentId !== mainCommentId) return mc;
              return {
                ...mc,
                subComments: (mc.subComments || []).filter(
                  (sc) => sc.subCommentId !== id
                ),
              };
            });
          }

          return {
            ...prev,
            [campaignId]: { ...entry, data: cloned },
          };
        });
      } catch (e2) {
        console.error("Hide comment POST fallback also failed:", e2);
        alert("Hide comment failed (check method / auth / CORS)");
      }
    }
  };

  return (
    <CompaniesLayout>
      <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 12 }}>Campaigns</h2>

        {loadingCampaigns ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns found</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {campaigns.map((c) => {
              const firstImg = c?.imageUrls?.[0]?.imageUrl;
              const isOpen = openCampaignId === c.campaignId;
              const commentsEntry = commentsMap[c.campaignId];

              return (
                <div
                  key={c.campaignId}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ width: 140, flexShrink: 0 }}>
                      {firstImg ? (
                        <img
                          src={firstImg}
                          alt="campaign"
                          style={{
                            width: "100%",
                            height: 90,
                            objectFit: "cover",
                            borderRadius: 10,
                            border: "1px solid #eee",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 90,
                            borderRadius: 10,
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6b7280",
                            fontSize: 12,
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>
                        {c.campaignType}
                      </div>
                      {c.campaignDescription && (
                        <div style={{ color: "#374151", fontSize: 14 }}>
                          {String(c.campaignDescription).slice(0, 200)}
                          {String(c.campaignDescription).length > 200
                            ? "..."
                            : ""}
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => onOpenCampaign(c.campaignId)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: "#111827",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          {isOpen ? "Close" : "Open"} Comments
                        </button>

                        <span style={{ color: "#6b7280", fontSize: 13 }}>
                          Added by: <b>{c.campaignTypeAddBy || "-"}</b>
                        </span>

                        <span style={{ color: "#6b7280", fontSize: 13 }}>
                          Type: <b>{c.campainInputType || "-"}</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ✅ COMMENTS SECTION */}
                  {isOpen && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px dashed #e5e7eb",
                      }}
                    >
                      {commentsEntry?.loading ? (
                        <p>Loading comments...</p>
                      ) : commentsEntry?.error ? (
                        <p style={{ color: "red" }}>{commentsEntry.error}</p>
                      ) : commentsEntry?.data ? (
                        <CommentsView
                          data={commentsEntry.data}
                          campaignId={c.campaignId}
                          hideComment={hideComment}
                        />
                      ) : (
                        <p style={{ color: "#6b7280" }}>
                          No comments loaded (click Open again to retry)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CompaniesLayout>
  );
}

function CommentsView({ data, campaignId, hideComment }) {
  const likesCount = data?.likesTotalCount ?? 0;
  const likeStatus = data?.likeStatus ?? "";
  const mainComments = data?.subComments || [];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>Likes: {likesCount}</div>
        <div style={{ color: "#6b7280", fontSize: 13 }}>
          Like status: {likeStatus}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Comments</div>

        {mainComments.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No comments</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {mainComments.map((mc) => (
              <div
                key={mc.mainCommentId}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                  background: "#fafafa",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {mc.mainComment || "(no text)"}
                  </div>

                  <button
                    onClick={() =>
                      hideComment({
                        id: mc.mainCommentId,
                        type: "MAINCOMMENT",
                        campaignId,
                      })
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: "1px solid #ef4444",
                      background: "#fff",
                      color: "#ef4444",
                      cursor: "pointer",
                      height: 32,
                    }}
                  >
                    Hide
                  </button>
                </div>

                {/* SUB COMMENTS */}
                <div style={{ marginTop: 8, paddingLeft: 12 }}>
                  {(mc.subComments || []).length === 0 ? (
                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                      No replies
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {(mc.subComments || []).map((sc) => (
                        <div
                          key={sc.subCommentId}
                          style={{
                            borderLeft: "3px solid #e5e7eb",
                            paddingLeft: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div style={{ color: "#111827" }}>
                            {sc.comment || "(no text)"}
                          </div>

                          <button
                            onClick={() =>
                              hideComment({
                                id: sc.subCommentId,
                                type: "SUBCOMMENT",
                                campaignId,
                                mainCommentId: mc.mainCommentId,
                              })
                            }
                            style={{
                              padding: "5px 10px",
                              borderRadius: 10,
                              border: "1px solid #ef4444",
                              background: "#fff",
                              color: "#ef4444",
                              cursor: "pointer",
                              height: 30,
                              flexShrink: 0,
                            }}
                          >
                            Hide
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
