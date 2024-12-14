



import React,{useState,useEffect} from 'react';

import {message,Table,Row,Col,Input,Select,Button,Form,notification,Modal} from 'antd'
import AdminPanelLayout from './AdminPanelLayout';


import axios from 'axios'
const{Option} = Select;

const ItemRequirements = () => {
const [itemsData, setItemsdata] = useState([]);
const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [filteredItems, setFilteredItems] = useState([]);
const [entriesPerPage, setEntriesPerPage] = useState(20);
const [currentPage, setCurrentPage] = useState(1);
const [form] = Form.useForm();
const [isModalVisible, setIsModalVisible] = useState(false)
  const accessToken = localStorage.getItem('accessToken')
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyloans.com/api/erice-service/stock/getStock",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response.data)
      setItemsdata(response.data);
      setFilteredItems(response.data)
      // setFilteredCategories(response.data)
      message.success("Items Stock fectch successfully");
    } catch (error) {
      message.error("Failed to fetch itmes stock");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
 // Handle change in the number of entries per page
 const handleEntriesPerPageChange = (value) => {
  setEntriesPerPage(value);
  setCurrentPage(1);
};



const handleSearchChange = (e) => {
  const value = e.target.value.toLowerCase().trim(); // Normalize and trim input
  setSearchTerm(value);

  if (value) {
    // Filter items based on the search term
    const filtered = itemsData.filter(item =>
      (item.brandName?.toLowerCase().includes(value)) || // Safe access with optional chaining
      (item.BagPrice?.toString().toLowerCase().includes(value)) || 
      (item.ItemQuntity?.toString().toLowerCase().includes(value)) || 
      (item.totalStockAmount?.toString().toLowerCase().includes(value))
    );

    setFilteredItems(filtered); // Update the filtered items
  } else {
    setFilteredItems(itemsData); // Reset to all items when search term is empty
  }
};
  const columns = [
    {
      title: 'S.NO',
      key: 'serialNo',
      render: (text, record, index) => (
        index + 1 + (currentPage - 1) * entriesPerPage
      ),
      align: 'center'
    },
    {
      title: 'Brand Name',
      dataIndex: 'brandName',
      key: 'itemName',
      align: 'center',
    },
    {
      title: 'Store Name',
      dataIndex: 'storeName',
      key: 'categoryName',
      align: 'center',
      responsive: ['md'],
    },
    {
      title: 'ItemQuntity',
      dataIndex: 'itemQuantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'BagPrice',
      dataIndex: 'bagPrice',
      key: 'units',
      align: 'center',
      responsive: ['md'],
    },
    {
      title: 'BagsCount',
      dataIndex: 'bagsCount',
      key: 'itemImage',
      align: 'center',
      
    },
    {
      title: 'Bag Date',
      dataIndex: 'bagsDate',
      key: 'itemImage',
      align: 'center',
      
    }, 
    {
      title: 'BagsRBCount',
      dataIndex: 'bagsReturnBackCount',
      key: 'itemImage',
      align: 'center',
      
    },{
      title: 'Total Stock Amount',
      dataIndex: 'totalStockAmount',
      key: 'itemImage',
      align: 'center',
      
    }
    ,  
    
,    
    
  ];


  const openAddCategoryModal = () => {
    setIsModalVisible(true);
   
    form.resetFields();
  };

  const stockAdd = async (values) => {
    try {
      // Constructing the payload
      const payload = {
        bagsCount: values.bagsCount,
        itemQuantity: values.itemQuantity,
        bagsReturnBackCount: values.bagsReturnBackCount,
        bagsDate: values.bagsDate,
        storeName: values.storeName,
        brandName: values.brandName,
        bagPrice: values.bagPrice,
        totalStockAmount: values.totalStockAmount,
      };
  
      // Correcting the API endpoint URL
      const apiUrl = "https://meta.oxyloans.com/api/erice-service/stock/riceStock";
  
      // Making the POST request
      await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      // Displaying success notification
      notification.success({
        message: "Stock added successfully!",
      });
  
      // Closing the modal and resetting form fields
      setIsModalVisible(false);
      form.resetFields();
  
      // Refresh the data (if applicable)
      fetchCategories();
    } catch (error) {
      // Displaying error notification
      notification.error({
        message: "Failed to add stock",
        description: error.response?.data?.message || error.message,
      });
    }
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
     // Clear selected subscription on modal close
    form.resetFields(); // Reset form fields on cancel
  };
  
  return (
    <div>
    
      <AdminPanelLayout>
      <Row justify="space-between" align="middle" className="mb-4">
<Col>
<h2 className="text-xl font-bold mb-2 sm:mb-0">Item Stock Requirements</h2>
          </Col>
          <Col>
            <Button
              
              
              onClick={openAddCategoryModal}
              style={{
                backgroundColor: '#1C84C6',
                color: 'white',
                marginBottom: '16px',
              }}
            >
              StockAddAdmin
            </Button>
          </Col>
         
        </Row>
        <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          Show{' '}
          <Select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            style={{ width: 70 }}
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>
          {' '}entries 
        </Col>

        <Col>
        Search: {' '}

          <Input
            
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 150 }}
            
          />
        </Col>
      </Row>
        <Table
          dataSource={filteredItems}
          columns={columns}
          pagination={{ pageSize: entriesPerPage, onChange: (page) => setCurrentPage(page) }}
          rowKey="itemId"
          loading={loading}
          scroll={{ x: '100%' }} // Enables horizontal scroll on smaller screens
          bordered
        />
<Modal
  title={"Add Stock Admin"}
  visible={isModalVisible}
  onCancel={handleCancel}
  onOk={() => form.submit()}
>
  <Form form={form} onFinish={stockAdd} layout="vertical">
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Brand Name"
          name="brandName"
          rules={[{ required: true, message: "Please enter brand name" }]}
        >
          <Input placeholder="Enter brand name" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Store Name"
          name="storeName"
          rules={[{ required: true, message: "Please enter store name" }]}
        >
          <Input placeholder="Enter store name" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Bags Count"
          name="bagsCount"
          rules={[{ required: true, message: "Please enter bags count" }]}
        >
          <Input type="number" placeholder="Enter bags count" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Item Quantity"
          name="itemQuantity"
          rules={[{ required: true, message: "Please enter item quantity" }]}
        >
          <Input placeholder="Enter item quantity (e.g., 25kgs)" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Bags Return Back Count"
          name="bagsReturnBackCount"
        >
          <Input type="number" placeholder="Enter return back count (if any)" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Bags Date"
          name="bagsDate"
          rules={[{ required: true, message: "Please enter bags date" }]}
        >
          <Input type="date" placeholder="Select bags date" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Bag Price"
          name="bagPrice"
          rules={[{ required: true, message: "Please enter bag price" }]}
        >
          <Input type="number" placeholder="Enter bag price" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          label="Total Stock Amount"
          name="totalStockAmount"
          rules={[{ required: true, message: "Please enter total stock amount" }]}
        >
          <Input type="number" placeholder="Enter total stock amount" />
        </Form.Item>
      </Col>
    </Row>
  </Form>
</Modal>


      </AdminPanelLayout>
    </div>
  );
  
};

export default ItemRequirements;
