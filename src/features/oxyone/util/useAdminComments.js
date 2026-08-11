import { useCallback, useRef, useState } from "react";
import adminApi from "../../../core/config/axiosInstance";

export const ADMIN_COMMENTS_URL        = "https://meta.oxyloans.com/api/user-service/fetchAdminComments";
export const ADMIN_COMMENTS_UPDATE_URL = "https://meta.oxyloans.com/api/user-service/adminUpdateComments";

/* Shared HelpDesk "admin comments" state + API calls, for any table that needs
   an Action / Updated Comments column pair (Interested Users, OxyBricks, ...). */
export function useAdminComments() {
  const [rowComments, setRowComments] = useState({});
  const rowCommentsRef = useRef(rowComments);
  rowCommentsRef.current = rowComments;

  const [commentsOpen, setCommentsOpen]       = useState(false);
  const [selectedUser, setSelectedUser]       = useState(null);
  const [comments, setComments]               = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError]     = useState("");

  const [newComment, setNewComment]             = useState("");
  const [newCallerName, setNewCallerName]       = useState("");
  const [newBehaviour, setNewBehaviour]         = useState(undefined);
  const [newCallingType, setNewCallingType]     = useState(undefined);
  const [otherCallingType, setOtherCallingType] = useState("");
  const [newIsActive, setNewIsActive]           = useState(undefined);
  const [submitLoading, setSubmitLoading]       = useState(false);
  const [submitError, setSubmitError]           = useState("");

  const fetchComments = useCallback(async (userId) => {
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const res = await adminApi.post(ADMIN_COMMENTS_URL, { userId });
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 500) {
        setComments([]); // backend 500 = no comments yet, treat as empty
      } else {
        setCommentsError("Failed to load comments. Please try again.");
      }
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const openCommentsModal = useCallback((record) => {
    setSelectedUser(record);
    setComments([]);
    setCommentsError("");
    setNewComment("");
    setNewCallerName(localStorage.getItem("admin_userName") || "");
    setNewBehaviour(undefined);
    setNewCallingType(undefined);
    setOtherCallingType("");
    setNewIsActive(undefined);
    setSubmitError("");
    setCommentsOpen(true);
    if (!record.userId) {
      setCommentsError("No user ID available for this record.");
      return;
    }
    fetchComments(record.userId);
  }, [fetchComments]);

  const closeModal = useCallback(() => {
    setCommentsOpen(false);
    setSelectedUser(null);
    setComments([]);
    setNewComment("");
    setSubmitError("");
  }, []);

  const submitComment = useCallback(async () => {
    if (!newComment.trim() || !newCallerName.trim()) return;
    if (newCallingType === "OTHER" && !otherCallingType.trim()) return;
    setSubmitLoading(true);
    setSubmitError("");
    const userId = selectedUser.userId;
    const payload = {
      userId,
      adminComments: newComment.trim(),
      adminUserId: localStorage.getItem("admin_uniquId") || "",
      commentsUpdateBy: newCallerName.trim(),
      customerBehaviour: newBehaviour,
      callingType: newCallingType === "OTHER" ? otherCallingType.trim() : newCallingType,
    };
    if (newIsActive !== undefined) payload.isActive = newIsActive;
    try {
      await adminApi.patch(ADMIN_COMMENTS_UPDATE_URL, payload);
      // invalidate the row-preview cache so the table picks up the new comment
      setRowComments((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setSubmitLoading(false);
      closeModal();
    } catch {
      setSubmitError("Failed to save comment. Please try again.");
      setSubmitLoading(false);
    }
  }, [newComment, newCallerName, newCallingType, otherCallingType, newBehaviour, newIsActive, selectedUser, closeModal]);

  /* Fetch the latest comment preview for any of the given row ids not already cached. */
  const prefetchRowComments = useCallback((ids) => {
    const toFetch = ids.filter((id) => !(id in rowCommentsRef.current));
    if (!toFetch.length) return;
    Promise.allSettled(toFetch.map((id) => adminApi.post(ADMIN_COMMENTS_URL, { userId: id }))).then((results) => {
      setRowComments((prev) => {
        const next = { ...prev };
        toFetch.forEach((id, i) => {
          const r = results[i];
          if (r.status === "fulfilled" && Array.isArray(r.value.data) && r.value.data.length) {
            const sorted = [...r.value.data].sort((a, b) => new Date(b.commentsCreatedDate) - new Date(a.commentsCreatedDate));
            next[id] = sorted[0];
          } else {
            next[id] = null;
          }
        });
        return next;
      });
    });
  }, []);

  return {
    rowComments,
    commentsOpen, selectedUser, comments, commentsLoading, commentsError,
    newComment, setNewComment,
    newCallerName, setNewCallerName,
    newBehaviour, setNewBehaviour,
    newCallingType, setNewCallingType,
    otherCallingType, setOtherCallingType,
    newIsActive, setNewIsActive,
    submitLoading, submitError,
    openCommentsModal, closeModal, submitComment, fetchComments,
    prefetchRowComments,
  };
}
