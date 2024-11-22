import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelLayout";
import { Row, Col, Button, Table, Modal, message } from "antd";

const DeliveryBoyList = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(initialFormState());
  const [editForm, setEditForm] = useState(initialFormState());
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null); // New state for selected delivery boy
  const accessToken = localStorage.getItem("accessToken");

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
      setLoading(true);
      try {
        const response = await axios.get(
          "https://meta.oxyloans.com/api/erice-service/deliveryboy/list",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        message.success('Data fetched successfully')
        setDeliveryBoys(response.data);
      } catch (error) {
        console.error("Error fetching delivery boys:", error);
        setError("Failed to fetch delivery boys");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryBoys();
  }, [accessToken]);

  // Handle input changes for adding/editing a delivery boy
  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === "add") {
      setAddForm((prevForm) => ({ ...prevForm, [name]: value }));
    } else if (formType === "edit") {
      setEditForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  // Handle adding a new delivery boy
  const handleAddDeliveryBoy = async () => {
    try {
      const response = await axios.post(
        "https://meta.oxyloans.com/api/erice-service/deliveryboy/save",
        addForm,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success('Delivery Boy Added Successfully');
      setDeliveryBoys((prevBoys) => [...prevBoys, response.data]);
      closeAddModal();
    } catch (error) {
      console.error("Failed to add delivery boy", error);
    }
  };

  // Handle editing a delivery boy's details
  const handleEditDeliveryBoy = async () => {
    if (selectedDeliveryBoy) {
      try {
        const response = await axios.patch(
          `https://meta.oxyloans.com/api/erice-service/deliveryboy/update`, // No need to include userId in the URL
          {
           id: selectedDeliveryBoy.userId, // Pass userId in the request body
            ...editForm, // Spread the existing form data to include other fields
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Correct token format
            },
          }
        );
        message.success('Delivery Boy Updated Successfully');
        setDeliveryBoys((prevBoys) =>
          prevBoys.map((boy) =>
            boy.userId === selectedDeliveryBoy.userId ? response.data : boy
          )
        );
        closeAddModal();
      } catch (error) {
        console.error("Failed to edit delivery boy", error);
        message.error("Failed to edit delivery boy");
      }
    }
  };
  
  // Open Edit Modal and populate the selected delivery boy data
  const openEditModal = (deliveryBoy) => {
    setSelectedDeliveryBoy(deliveryBoy);
    setEditForm({
      deliveryBoyName: deliveryBoy.deliveryBoyName,
      deliveryBoyMobile: deliveryBoy.deliveryBoyMobile,
      deliveryBoyEmail: deliveryBoy.deliveryBoyEmail,
      deliveryBoyAltContact: deliveryBoy.deliveryBoyAltContact,
      deliveryBoyAddress: deliveryBoy.deliveryBoyAddress,
      isActive: deliveryBoy.isActive,
    });
    setIsAddModalOpen(true);
  };

  // Close the Add/Update Modal
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedDeliveryBoy(null); // Reset selected delivery boy
  };

  // Table columns definition
  const columns = [
    {
      title: "Name",
      dataIndex: "deliveryBoyName",
      key: "deliveryBoyName",
      align: "center",
    },
    {
      title: "Mobile",
      dataIndex: "deliveryBoyMobile",
      key: "deliveryBoyMobile",
      align: "center",
    },
    // {
    //   title: "Id",
    //   dataIndex: 'userId',
    //   key: "userId",
    //   align: 'center',
    // },
    {
      title: "Email",
      dataIndex: "deliveryBoyEmail",
      key: "deliveryBoyEmail",
      align: "center",
    },
    {
      title: "Alt Contact",
      dataIndex: "deliveryBoyAltContact",
      key: "deliveryBoyAltContact",
      align: "center",
    },
    {
      title: "Address",
      dataIndex: "deliveryBoyAddress",
      key: "deliveryBoyAddress",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (isActive ? "Active" : "Inactive"),
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => openEditModal(record)}>
          Edit
        </Button>
      ),
      align: "center",
    },
  ];

  return (
    <AdminPanelLayout>
      <div className="flex flex-col h-screen">
        <div className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Delivery Boys List</h2>
            <Button type="primary" onClick={() => setIsAddModalOpen(true)}>
              Add Delivery Boy
            </Button>
          </div>

          {/* Ant Design Table */}
          <Table
            columns={columns}
            dataSource={deliveryBoys}
            rowKey="userId"
            loading={loading}
            pagination={{ pageSize: 5 }}
            scroll={{ x: true }}
          />

          {/* Add/Update Delivery Boy Modal */}
          <Modal
            title={selectedDeliveryBoy ? "Edit Delivery Boy" : "Add Delivery Boy"}
            visible={isAddModalOpen}
            onCancel={closeAddModal}
            onOk={selectedDeliveryBoy ? handleEditDeliveryBoy : handleAddDeliveryBoy}
          >
            <form>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="mb-4">
                    <label className="block mb-1">Name:</label>
                    <input
                      type="text"
                      name="deliveryBoyName"
                      value={selectedDeliveryBoy ? editForm.deliveryBoyName : addForm.deliveryBoyName}
                      onChange={(e) => handleFormChange(e, selectedDeliveryBoy ? "edit" : "add")}
                      className="border p-2 w-full"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-4">
                    <label className="block mb-1">Mobile:</label>
                    <input
                      type="text"
                      name="deliveryBoyMobile"
                      value={selectedDeliveryBoy ? editForm.deliveryBoyMobile : addForm.deliveryBoyMobile}
                      onChange={(e) => handleFormChange(e, selectedDeliveryBoy ? "edit" : "add")}
                      className="border p-2 w-full"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-4">
                    <label className="block mb-1">Email:</label>
                    <input
                      type="email"
                      name="deliveryBoyEmail"
                      value={selectedDeliveryBoy ? editForm.deliveryBoyEmail : addForm.deliveryBoyEmail}
                      onChange={(e) => handleFormChange(e, selectedDeliveryBoy ? "edit" : "add")}
                      className="border p-2 w-full"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-4">
                    <label className="block mb-1">Alt Contact:</label>
                    <input
                      type="text"
                      name="deliveryBoyAltContact"
                      value={selectedDeliveryBoy ? editForm.deliveryBoyAltContact : addForm.deliveryBoyAltContact}
                      onChange={(e) => handleFormChange(e, selectedDeliveryBoy ? "edit" : "add")}
                      className="border p-2 w-full"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-4">
                    <label className="block mb-1">Address:</label>
                    <input
                      type="text"
                      name="deliveryBoyAddress"
                      value={selectedDeliveryBoy ? editForm.deliveryBoyAddress : addForm.deliveryBoyAddress}
                      onChange={(e) => handleFormChange(e, selectedDeliveryBoy ? "edit" : "add")}
                      className="border p-2 w-full"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-4">
                    <label className="block mb-1">Status:</label>
                    <select
                      name="isActive"
                      value={selectedDeliveryBoy ? editForm.isActive : addForm.isActive}
                      onChange={(e) => handleFormChange(e, selectedDeliveryBoy ? "edit" : "add")}
                      className="border p-2 w-full"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </Col>
              </Row>
            </form>
          </Modal>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default DeliveryBoyList;
