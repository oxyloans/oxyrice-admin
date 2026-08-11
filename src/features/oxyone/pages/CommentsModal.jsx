import { Button, Empty, Input, Modal, Select, Spin, Tag } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const RESPONSE_OPTIONS = [
  { value: "FRIENDLY",     label: "Friendly" },
  { value: "POLITE",       label: "Polite" },
  { value: "COOL",         label: "Cool" },
  { value: "BUSY",         label: "Busy" },
  { value: "NOTCONNECTED", label: "Not Connected" },
  { value: "RUDE",         label: "Rude" },
  { value: "OUTOFSERVICE", label: "Out of Service" },
];

const CALLING_TYPE_OPTIONS = [
  { value: "RICE",  label: "Rice" },
  { value: "GOLD",  label: "Gold" },
  { value: "OTHER", label: "Other" },
];

/* Shared HelpDesk comments modal, fully controlled by a `useAdminComments()` hook instance.
   Pass `readOnly` to hide the "Add New Comment" form and just show what's on file. */
export default function CommentsModal({ c, readOnly = false }) {
  const {
    commentsOpen, selectedUser, comments, commentsLoading, commentsError,
    newComment, setNewComment,
    newCallerName, setNewCallerName,
    newBehaviour, setNewBehaviour,
    newCallingType, setNewCallingType,
    otherCallingType, setOtherCallingType,
    newIsActive, setNewIsActive,
    submitLoading, submitError,
    closeModal, submitComment, fetchComments,
  } = c;

  const sortedComments = [...comments].sort((a, b) => new Date(b.commentsCreatedDate) - new Date(a.commentsCreatedDate));
  const latestComment = sortedComments[0];

  return (
    <Modal
      open={commentsOpen}
      onCancel={closeModal}
      footer={null}
      title={<span className="text-base font-black text-slate-900">HelpDesk Comments</span>}
      width={560}
      styles={{ body: { paddingTop: 12, maxHeight: "75vh", overflowY: "auto" } }}
    >
      {selectedUser && submitLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spin size="large" />
          <span className="text-xs text-slate-400 font-medium">Submitting...</span>
        </div>
      )}
      {selectedUser && !submitLoading && (
        <div className="flex flex-col gap-4">

          {/* ── Recent Comments ── */}
          <div className="flex flex-col gap-2">
            <div className="text-sm font-black text-slate-900">Recent Comments</div>

            {commentsLoading && (
              <div className="flex items-center justify-center gap-2 py-8">
                <Spin size="default" />
                <span className="text-xs text-slate-400 font-medium">Loading comments...</span>
              </div>
            )}

            {!commentsLoading && commentsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl flex flex-col items-center gap-2 py-6 px-4">
                <span className="text-xl">⚠️</span>
                <span className="text-xs text-red-500 font-medium">{commentsError}</span>
                <Button size="small" onClick={() => fetchComments(selectedUser.userId)} style={{ borderRadius: 6, fontWeight: 600, fontSize: 11 }}>Retry</Button>
              </div>
            )}

            {!commentsLoading && !commentsError && !latestComment && (
              <Empty description={<span className="text-xs text-slate-400">No comments yet for this user</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: "16px 0" }} />
            )}

            {!commentsLoading && !commentsError && latestComment && (
              <div className="border border-slate-200 rounded-xl p-3 flex flex-col gap-2 bg-slate-50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full grid place-items-center flex-shrink-0 text-[11px] font-black text-white"
                      style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                      {(latestComment.commentsUpdateBy || "A")[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-black text-slate-800">{latestComment.commentsUpdateBy || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {latestComment.customerBehaviour && (
                      <Tag color="blue" style={{ borderRadius: 20, fontWeight: 700, fontSize: 10, border: "none", padding: "0 8px", margin: 0 }}>
                        <PhoneOutlined style={{ marginRight: 3 }} />{latestComment.customerBehaviour}
                      </Tag>
                    )}
                    <Tag color={latestComment.isActive ? "green" : "red"} style={{ borderRadius: 20, fontWeight: 700, fontSize: 10, border: "none", padding: "0 8px", margin: 0 }}>
                      {latestComment.isActive ? "Active" : "Inactive"}
                    </Tag>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {latestComment.commentsCreatedDate ? dayjs(latestComment.commentsCreatedDate).format("DD MMM YYYY") : "—"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  {latestComment.adminComments || <span className="text-slate-300 italic">No comment text</span>}
                </div>
                {latestComment.superAdminComments && (
                  <div className="text-[11px] text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                    <span className="font-black">Super Admin: </span>{latestComment.superAdminComments}
                  </div>
                )}
              </div>
            )}
          </div>

          {readOnly ? (
            <div className="flex justify-end">
              <Button onClick={closeModal} style={{ borderRadius: 8, fontWeight: 600, fontSize: 12, height: 36 }}>
                Close
              </Button>
            </div>
          ) : (
            /* ── Add New Comment Form ── */
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600">Called By <span className="text-red-400">*</span></label>
                <Input
                  value={newCallerName}
                  onChange={(e) => setNewCallerName(e.target.value)}
                  placeholder="Enter caller's name..."
                  size="middle"
                  style={{ borderRadius: 7, fontSize: 12 }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">User Response</label>
                  <Select
                    value={newBehaviour}
                    onChange={setNewBehaviour}
                    placeholder="Select a response"
                    allowClear
                    size="middle"
                    style={{ width: "100%", fontSize: 12 }}
                    options={RESPONSE_OPTIONS}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Calling Type</label>
                  <Select
                    value={newCallingType}
                    onChange={(v) => { setNewCallingType(v); if (v !== "OTHER") setOtherCallingType(""); }}
                    placeholder="Select a calling type"
                    allowClear
                    size="middle"
                    style={{ width: "100%", fontSize: 12 }}
                    options={CALLING_TYPE_OPTIONS}
                  />
                  {newCallingType === "OTHER" && (
                    <Input
                      value={otherCallingType}
                      onChange={(e) => setOtherCallingType(e.target.value)}
                      placeholder="Specify calling type..."
                      size="middle"
                      style={{ borderRadius: 7, fontSize: 12, marginTop: 4 }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">User Active (Yes / No)</label>
                  <Select
                    value={newIsActive}
                    onChange={setNewIsActive}
                    placeholder="Select"
                    allowClear
                    size="middle"
                    style={{ width: "100%", fontSize: 12 }}
                    options={[
                      { value: true,  label: "Yes" },
                      { value: false, label: "No" },
                    ]}
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <span className="text-[11px] font-bold text-slate-600">Current Status:</span>
                  <Tag color={latestComment ? (latestComment.isActive ? "green" : "red") : "default"} style={{ borderRadius: 20, fontWeight: 700, fontSize: 11, border: "none", padding: "1px 10px", margin: 0 }}>
                    {latestComment ? (latestComment.isActive ? "Active" : "Inactive") : "—"}
                  </Tag>
                </div>
              </div>

              <Input.TextArea
                rows={3}
                placeholder="Type your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ borderRadius: 8, fontSize: 12, resize: "none" }}
              />

              {submitError && (
                <div className="text-[11px] text-red-500 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</div>
              )}

              <div className="flex justify-end gap-2">
                <Button onClick={closeModal} style={{ borderRadius: 8, fontWeight: 600, fontSize: 12, height: 36 }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={submitLoading}
                  disabled={!newComment.trim() || !newCallerName.trim() || (newCallingType === "OTHER" && !otherCallingType.trim())}
                  onClick={submitComment}
                  style={{ borderRadius: 8, fontWeight: 700, fontSize: 12, background: "linear-gradient(135deg,#059669,#10b981)", border: "none", height: 36, paddingInline: 20 }}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
