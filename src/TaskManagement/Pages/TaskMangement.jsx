import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const API_URL =
    "http://182.18.139.138:9024/api/user-service/write/getAllTaskUpdates";

  const fetchTasks = useCallback(async (status) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(API_URL, { taskStatus: status });
      setTasks(data);
    } catch (err) {
      setError("Failed to fetch tasks");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(statusFilter);
  }, [statusFilter, fetchTasks]);

  const updateTaskStatus = async (taskId, newStatus) => {
    setIsLoading(true);
    try {
      await axios.post(API_URL, { taskStatus: newStatus, id: taskId });
      await fetchTasks(statusFilter);
    } catch (err) {
      setError("Failed to update task");
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

 

  const StatusButton = ({ status, label }) => (
    <button
      className={`px-4 py-2 rounded ${
        statusFilter === status ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
      onClick={() => setStatusFilter(status)}
    >
      {label}
    </button>
    );
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };


  return (
    <TaskAdminPanelLayout>
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Task Management</h1>

        <div className="flex gap-4 mb-4">
          <StatusButton status="PENDING" label="Pending" />
          <StatusButton status="COMPLETED" label="Completed" />
        </div>

        {isLoading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!isLoading && !tasks.length && (
          <p className="text-gray-600">No {statusFilter.toLowerCase()} tasks</p>
        )}

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-lg p-4 bg-white shadow"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold">
                  Plan of the Day: {task.planOftheDay || "Untitled"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.taskStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.taskStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p>
                    <strong>Plan Created At:</strong>{" "}
                    {formatDate(task.planCreatedAt)}
                  </p>

                  {task.planUpdatedAt && (
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {formatDate(task.planUpdatedAt)}
                    </p>
                  )}
                  <p>
                    <strong>Plan Status:</strong> {task.planStatus}
                  </p>
                  <p>
                    <strong>Assigned To:</strong> {task.taskAssignTo}
                  </p>
                  <p>
                    <strong>Updated By:</strong> {task.updatedBy}
                  </p>
                </div>
                {task.endOftheDay && (
                  <div>
                    <p>
                      <strong>End of the Day Summary:</strong>{" "}
                      {task.endOftheDay}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default TaskManagement;
