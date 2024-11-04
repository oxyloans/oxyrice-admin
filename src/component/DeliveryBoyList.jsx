import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelLayout";

const DeliveryBoyList = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBoy, setSelectedBoy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialFormState());
  const [addForm, setAddForm] = useState(initialFormState());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Change this to adjust the number of items per page

  // Initial form state for delivery boys
  function initialFormState() {
    return {
      deliveryBoyName: "",
      deliveryBoyMobile: "",
      deliveryBoyEmail: "",
      deliveryBoyAltContact: "",
      deliveryBoyAddress: "",
      isActive: true,
    };
  }

  // Fetch delivery boys on component mount
  useEffect(() => {
    const fetchDeliveryBoys = async () => {
      const accessToken=localStorage.getItem('accessToken')
      setLoading(true);
      try {
        const response = await axios.get("https://meta.oxyloans.com/api/erice-service/deliveryboy/list",{
          headers:{
            Authorization:`Bearer ${accessToken}`
          }
        });
        setDeliveryBoys(response.data);
      } catch (err) {
        setError("Failed to fetch delivery boys");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryBoys();
  }, []);

  // Update delivery boy status
  const updateStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus; // Toggle status
      await axios.patch(`https://meta.oxyloans.com/api/erice-service/deliveryboy/status`, {
        id,
        isActive: newStatus,
      });
      setDeliveryBoys((prevBoys) =>
        prevBoys.map((boy) => (boy.id === id ? { ...boy, isActive: newStatus } : boy))
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Handle edit button click
  const handleEdit = async (id) => {
    try {
      const response = await axios.post(
        `https://meta.oxyloans.com/api/erice-service/deliveryboy/deliveryBoyDataBasedOnId`, 
        { id }
      );
      setSelectedBoy(response.data);
      setEditForm(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch delivery boy details", error);
    }
  };

  // Handle input changes for editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Update delivery boy details
  const handleUpdate = async () => {
    try {
      await axios.patch(`https://meta.oxyloans.com/api/erice-service/deliveryboy/update`, editForm);
      setDeliveryBoys((prevBoys) =>
        prevBoys.map((boy) => (boy.id === selectedBoy.id ? { ...boy, ...editForm } : boy))
      );
      closeModal();
    } catch (error) {
      console.error("Failed to update delivery boy details", error);
    }
  };

  // Close edit modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    resetEditForm();
  };

  // Close add modal and reset form
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetAddForm();
  };

  // Reset edit form to initial state
  const resetEditForm = () => {
    setEditForm(initialFormState());
  };

  // Reset add form to initial state
  const resetAddForm = () => {
    setAddForm(initialFormState());
  };

  // Handle input changes for adding
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Add new delivery boy
  const handleAddDeliveryBoy = async () => {
    try {
      const response = await axios.post(
        "https://meta.oxyloans.com/api/erice-service/deliveryboy/save",
        addForm
      );
      setDeliveryBoys((prevBoys) => [...prevBoys, response.data]);
      closeAddModal();
    } catch (error) {
      console.error("Failed to add delivery boy", error);
    }
  };



  // Pagination logic
  const indexOfLastBoy = currentPage * itemsPerPage;
  const indexOfFirstBoy = indexOfLastBoy - itemsPerPage;
  const currentBoys = deliveryBoys.slice(indexOfFirstBoy, indexOfLastBoy);

  const totalPages = Math.ceil(deliveryBoys.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-6 bg-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Delivery Boys List</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Delivery Boy
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-center">Name</th>
                <th className="py-3 px-4 text-center">Mobile</th>
                <th className="py-3 px-4 text-center">Email</th>
                <th className="py-3 px-4 text-center">Alt Contact</th>
                <th className="py-3 px-4 text-center">Address</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentBoys.map((boy) => (
                <tr key={boy.id} className="hover:bg-gray-100 text-sm border-b">
                  <td className="py-2 px-4 text-center">{boy.deliveryBoyName}</td>
                  <td className="py-2 px-4 text-center">{boy.deliveryBoyMobile}</td>
                  <td className="py-2 px-4 text-center">{boy.deliveryBoyEmail}</td>
                  <td className="py-2 px-4 text-center">{boy.deliveryBoyAltContact}</td>
                  <td className="py-2 px-4 text-center">{boy.deliveryBoyAddress}</td>
                  <td className="py-2 px-4 text-center">{boy.isActive ? "Active" : "Inactive"}</td>
                  <td className="py-2 px-4 text-center flex justify-center space-x-2">
                    <button
                      onClick={() => updateStatus(boy.id, boy.isActive)}
                      className={`px-2 py-1 text-white rounded ${boy.isActive ? "bg-red-500" : "bg-green-500"}`}
                    >
                      {boy.isActive ? "De activate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEdit(boy.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4">
          <div>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Modal for editing delivery boy details */}
        {isModalOpen && selectedBoy && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-xl mb-4">Edit Delivery Boy</h3>
              <form>
                <div className="mb-4">
                  <label className="block mb-1">Name:</label>
                  <input
                    type="text"
                    name="deliveryBoyName"
                    value={editForm.deliveryBoyName}
                    onChange={handleChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Mobile:</label>
                  <input
                    type="text"
                    name="deliveryBoyMobile"
                    value={editForm.deliveryBoyMobile}
                    onChange={handleChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Email:</label>
                  <input
                    type="email"
                    name="deliveryBoyEmail"
                    value={editForm.deliveryBoyEmail}
                    onChange={handleChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Alt Contact:</label>
                  <input
                    type="text"
                    name="deliveryBoyAltContact"
                    value={editForm.deliveryBoyAltContact}
                    onChange={handleChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Address:</label>
                  <textarea
                    name="deliveryBoyAddress"
                    value={editForm.deliveryBoyAddress}
                    onChange={handleChange}
                    className="border p-2 w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal for adding a new delivery boy */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-xl mb-4">Add Delivery Boy</h3>
              <form>
                <div className="mb-4">
                  <label className="block mb-1">Name:</label>
                  <input
                    type="text"
                    name="deliveryBoyName"
                    value={addForm.deliveryBoyName}
                    onChange={handleAddChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Mobile:</label>
                  <input
                    type="text"
                    name="deliveryBoyMobile"
                    value={addForm.deliveryBoyMobile}
                    onChange={handleAddChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Email:</label>
                  <input
                    type="email"
                    name="deliveryBoyEmail"
                    value={addForm.deliveryBoyEmail}
                    onChange={handleAddChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Alt Contact:</label>
                  <input
                    type="text"
                    name="deliveryBoyAltContact"
                    value={addForm.deliveryBoyAltContact}
                    onChange={handleAddChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Address:</label>
                  <textarea
                    name="deliveryBoyAddress"
                    value={addForm.deliveryBoyAddress}
                    onChange={handleAddChange}
                    className="border p-2 w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDeliveryBoy}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default DeliveryBoyList;




