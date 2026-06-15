import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Tooltip, message } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchBanks } from '../api/superadminService';
import AddBank from './AddBank';
import styles from '../styles/glass.module.css';

const BankList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const navigate = useNavigate();

  const loadBanks = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const resp = await fetchBanks(page, size);
      const d = resp.data;
      setData(d?.content || []);
      setPagination((prev) => ({ ...prev, total: d?.totalElements || 0, current: (d?.number ?? 0) + 1 }));
    } catch (e) {
      console.error(e);
      message.error('Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanks(); }, []);

  const handleAddSuccess = () => {
    setIsAddOpen(false);
    loadBanks((pagination.current - 1), pagination.pageSize);
  };

  const handleTableChange = (pag) => {
    setPagination((prev) => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
    loadBanks(pag.current - 1, pag.pageSize);
  };

  // Client-side search filtering
  const filteredData = searchQuery
    ? data.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          (item.companyName && item.companyName.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.website && item.website.toLowerCase().includes(q))
        );
      })
    : data;

  const columns = [
    { 
      title: 'Bank Name', 
      dataIndex: 'companyName', 
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName)
    },
    { 
      title: 'Location', 
      dataIndex: 'location', 
      key: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location)
    },
    { 
      title: 'Website', 
      dataIndex: 'website', 
      key: 'website', 
      render: (url) => url ? <a href={url} target="_blank" rel="noreferrer">{url}</a> : '—'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<TeamOutlined style={{ color: '#722ed1' }} />}
            onClick={() => navigate(`/superadmin/banks/${record.id}/employees`)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div className={styles.glassCard} style={{ padding: '1.5rem', borderRadius: '16px' }}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 m-0">Banks Management</h2>
          <p className="text-xs text-gray-400 mt-1">Manage and track banking entities and contacts</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Search banks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '220px' }}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 border-none"
          >
            Add Bank
          </Button>
        </div>
      </div>

      <Table 
        rowKey="id" 
        loading={loading} 
        dataSource={filteredData} 
        columns={columns} 
        onChange={handleTableChange}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} banks`,
          pageSizeOptions: ['10', '20', '50'],
        }}
        className="glass-table"
      />

      {/* Add Bank Modal */}
      <Modal
        title="Add New Bank"
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AddBank isModal onSuccess={handleAddSuccess} />
      </Modal>
    </div>
  );
};

export default BankList;
