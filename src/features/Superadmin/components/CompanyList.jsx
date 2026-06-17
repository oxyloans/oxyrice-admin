import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, message, Tag } from 'antd';
import {
  PlusOutlined, TeamOutlined, SearchOutlined, ShopOutlined,
  GlobalOutlined, EnvironmentOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchCompanies } from '../api/superadminService';
import AddCompany from './AddCompany';
import { useSearch } from './SearchContext';

/* ─── helpers ─── */
const highlightText = (text, search) => {
  if (!search || !text) return text;
  const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: '#fff3cd', color: '#92600a', padding: '0 2px', borderRadius: 3, fontWeight: 600 }}>
        {part}
      </mark>
    ) : part
  );
};

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const avatarColor = (name = '') => {
  const colors = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0284c7'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

/* ─── styles ─── */
const S = {
  page: {
    background: '#f5f7fa',
    minHeight: '100vh',
    padding: '24px 16px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1d23',
    margin: 0,
    letterSpacing: '-0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  countBadge: {
    background: '#f5f0ff',
    color: '#7c3aed',
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid #ede9fe',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 0,
  },
  card: {
    background: '#ffffff',
    borderRadius: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
    border: '1px solid #e8edf2',
    overflow: 'hidden',
  },
  tableToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f0f2f5',
    flexWrap: 'wrap',
    gap: 10,
  },
  companyCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  companyAvatar: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  companyName: {
    fontWeight: 600,
    fontSize: 14,
    color: '#1a1d23',
    lineHeight: 1.3,
  },
  viewBtn: {
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid #ede9fe',
    color: '#7c3aed',
    background: '#faf5ff',
    height: 30,
    padding: '0 12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    transition: 'all .15s',
    whiteSpace: 'nowrap',
  },
};

const CompanyList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchValue: searchQuery, setSearchValue: setSearchQuery } = useSearch();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const navigate = useNavigate();

  const loadCompanies = async (page = 0, size = 50) => {
    setLoading(true);
    try {
      const resp = await fetchCompanies(page, size);
      const d = resp.data;
      setData(d?.content || []);
      setPagination(prev => ({
        ...prev,
        total: d?.totalElements || 0,
        current: (d?.number ?? 0) + 1,
      }));
    } catch (e) {
      console.error(e);
      message.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCompanies(); }, []);

  const handleAddSuccess = () => {
    setIsAddOpen(false);
    loadCompanies(pagination.current - 1, pagination.pageSize);
  };

  const handleTableChange = pag => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
    loadCompanies(pag.current - 1, pag.pageSize);
  };

  const filteredData = searchQuery
    ? data.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          (item.companyName || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q) ||
          (item.website || '').toLowerCase().includes(q)
        );
      })
    : data;

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 52,
      responsive: ['md'],
      render: (_, __, i) => (
        <span style={{ color: '#9ca3af', fontWeight: 500, fontSize: 13 }}>
          {(pagination.current - 1) * pagination.pageSize + i + 1}
        </span>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => (a.companyName || '').localeCompare(b.companyName || ''),
      render: (text, record) => (
        <div style={S.companyCell}>
          <div style={{ ...S.companyAvatar, background: avatarColor(text) }}>
            {getInitials(text)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={S.companyName}>{highlightText(text, searchQuery)}</div>
            {record.location && (
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                <EnvironmentOutlined style={{ fontSize: 10 }} />
                {record.location}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      responsive: ['lg'],
      sorter: (a, b) => (a.location || '').localeCompare(b.location || ''),
      render: text => text ? (
        <span style={{ fontSize: 13, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
          <EnvironmentOutlined style={{ color: '#9ca3af', fontSize: 11 }} />
          {highlightText(text, searchQuery)}
        </span>
      ) : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      responsive: ['xl'],
      render: url => url ? (
        <a
          href={url} target="_blank" rel="noreferrer"
          style={{ color: '#7c3aed', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <GlobalOutlined style={{ fontSize: 11 }} />
          {highlightText(url.replace(/^https?:\/\//, ''), searchQuery)}
        </a>
      ) : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      responsive: ['sm'],
      render: val => {
        const active = !val || val === 'ACTIVE';
        return (
          <Tag color={active ? 'green' : 'default'} style={{ borderRadius: 6, fontWeight: 600, fontSize: 11 }}>
            {active ? 'Active' : (val || 'Active')}
          </Tag>
        );
      },
    },
    {
      title: 'Employees',
      key: 'employees',
      width: 120,
      render: (_, record) => (
        <button
          style={S.viewBtn}
          onClick={() => navigate(`/superadmin/companies/${record.id}/employees`, { state: { companyName: record.companyName, location: record.location } })}
          onMouseEnter={e => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#d8b4fe'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.borderColor = '#ede9fe'; }}
        >
          <TeamOutlined style={{ fontSize: 12 }} />
          View Team
        </button>
      ),
    },
  ];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.pageTitle}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShopOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            Companies Management
            <span style={S.countBadge}>{pagination.total}</span>
          </h1>
          <p style={S.pageSubtitle}>Manage and track company presentations, demos, and employees</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button icon={<ReloadOutlined />} onClick={() => loadCompanies()} style={{ borderRadius: 8, fontSize: 13 }}>
            Refresh
          </Button>
          <Button
            type="primary" icon={<PlusOutlined />}
            onClick={() => setIsAddOpen(true)}
            style={{ borderRadius: 8, fontWeight: 600, background: '#7c3aed', borderColor: '#7c3aed', fontSize: 13 }}
          >
            Add Company
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div style={S.card}>
        <div style={S.tableToolbar}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
            All Companies
            <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 13 }}>
              ({filteredData.length} {searchQuery ? 'matching' : 'total'})
            </span>
          </span>
          <Input
            placeholder="Search companies…"
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: 240, borderRadius: 8, fontSize: 13 }}
            allowClear
          />
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredData}
          columns={columns}
          onChange={handleTableChange}
          scroll={{ x: 600 }}
          rowClassName={(_, i) => i % 2 === 0 ? 'cl-row-even' : 'cl-row-odd'}
           onRow={(record) => ({
    onClick: () => {
      navigate(`/superadmin/companies/${record.id}/employees`, {
        state: {
          companyName: record.companyName,
          location: record.location,
        },
      });
    },
    style: { cursor: 'pointer' },
  })}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['25', '50', '100'],
            showTotal: (total, range) => (
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Showing <strong>{range[0]}–{range[1]}</strong> of <strong>{total}</strong> companies
              </span>
            ),
          }}
          style={{ fontSize: 13 }}
        />
      </div>

      <style>{`
        .cl-row-even td { background: #ffffff !important; }
        .cl-row-odd  td { background: #fafbfc !important; }
        .ant-table-row:hover td { background: #f5f0ff !important; cursor: pointer; }
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #374151 !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1.5px solid #e8edf2 !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 13px 16px !important;
          vertical-align: middle;
        }
        .ant-pagination { padding: 14px 20px !important; border-top: 1px solid #f0f2f5; }
        @media (max-width: 576px) {
          .ant-table-tbody > tr > td { padding: 10px 12px !important; }
        }
      `}</style>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <ShopOutlined style={{ color: '#7c3aed' }} /> Add New Company
          </div>
        }
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        footer={null}
        destroyOnClose
        width={520}
      >
        <AddCompany isModal onSuccess={handleAddSuccess} />
      </Modal>
    </div>
  );
};

export default CompanyList;