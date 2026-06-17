import React, { useEffect, useState } from 'react';
import { Input, Spin, Empty, Tag, notification, Table, Button, Modal, Popconfirm } from 'antd';
import {
  ArrowLeftOutlined, SearchOutlined, MailOutlined, PhoneOutlined,
  LinkedinOutlined, EnvironmentOutlined, BankOutlined,
  TeamOutlined, BuildOutlined, ReloadOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchBankEmployees, deleteEmployee } from './api/superadminService';
import { fetchWithAuth } from './auth';
import AddEmployee from './components/AddEmployee';
import CommentModal from './components/CommentModal';

const BASE = 'https://meta.oxyloans.com';

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const avatarColor = (name = '') => {
  const palette = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7', '#be185d'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

const BankEmployees = () => {
  const { bankId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const bankName = state?.bankName || 'Bank';
  const bankLocation = state?.location || '';

  useEffect(() => { loadEmployees(); }, [bankId]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const resp = await fetchBankEmployees(bankId);
      const raw = resp.data;
      setEmployees(Array.isArray(raw) ? raw : raw?.content || raw?.data || []);
    } catch {
      notification.error({ message: 'Error', description: 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  };

  /* ── comment counts ── */
  const fetchOneCommentCount = id => {
    if (commentCounts[id] !== undefined) return;
    fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${id}`)
      .then(r => r.json())
      .then(d => setCommentCounts(prev => ({ ...prev, [id]: Array.isArray(d) ? d.length : 0 })))
      .catch(() => setCommentCounts(prev => ({ ...prev, [id]: 0 })));
  };

  const refreshCount = userId => {
    fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${userId}`)
      .then(r => r.json())
      .then(d => setCommentCounts(prev => ({ ...prev, [userId]: Array.isArray(d) ? d.length : 0 })))
      .catch(() => { });
  };

  /* ── delete handlers ── */
  const handleDeleteEmployee = async (id) => {
    setDeletingId(id);
    try {
      await deleteEmployee(id);
      notification.success({ message: 'Success', description: 'Employee deleted successfully' });
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch {
      notification.error({ message: 'Error', description: 'Failed to delete employee' });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = search
    ? employees.filter(e => {
      const q = search.toLowerCase();
      return (
        (e.name || '').toLowerCase().includes(q) ||
        (e.position || '').toLowerCase().includes(q) ||
        (e.companyName || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.exCompanyName || '').toLowerCase().includes(q) ||
        (e.mobileNumber || '').includes(q)
      );
    })
    : employees;

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 48,
      render: (_, __, i) => (
        <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500 }}>
          {(pagination.current - 1) * pagination.pageSize + i + 1}
        </span>
      ),
    },
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: name => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: avatarColor(name || ''),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
          }}>
            {getInitials(name || '')}
          </div>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{name || '—'}</span>
        </div>
      ),
    },
    {
      title: 'Contact Details',
      key: 'contactDetails',
      width: 260,
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          {/* Email */}
          {record.email ? (
            <a
              href={`mailto:${record.email}`}
              style={{
                fontSize: 12,
                color: '#374151',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MailOutlined
                style={{
                  color: '#9ca3af',
                  fontSize: 11,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {record.email}
              </span>
            </a>
          ) : (
            <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
          )}

          {/* Mobile */}
          {record.mobileNumber && (
            <a
              href={`tel:${record.mobileNumber}`}
              style={{
                fontSize: 12,
                color: '#6b7280',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <PhoneOutlined
                style={{
                  color: '#9ca3af',
                  fontSize: 11,
                  flexShrink: 0,
                }}
              />
              {record.mobileNumber}
            </a>
          )}

          {/* LinkedIn */}
          {record.linkdinUrl && (
            <a
              href={record.linkdinUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12,
                color: '#0a66c2',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LinkedinOutlined
                style={{
                  fontSize: 13,
                }}
              />
              LinkedIn Profile
            </a>
          )}
        </div>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      width: 230,
      sorter: (a, b) => (a.position || '').localeCompare(b.position || ''),
      render: val =>
        val ? (
          <span
            style={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: 1.4,
              color: '#374151',
            }}
          >
            {val}
          </span>
        ) : (
          <span style={{ color: '#d1d5db' }}>—</span>
        ),
    },
    {
      title: 'Company Details',
      key: 'companyDetails',
      width: 220,
      sorter: (a, b) => (a.companyName || '').localeCompare(b.companyName || ''),
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Current Company */}
          {record.companyName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#4f46e5',
                fontWeight: 600,
              }}
            >
              <BuildOutlined
                style={{
                  fontSize: 11,
                  color: '#818cf8',
                  flexShrink: 0,
                }}
              />
              {record.companyName}
            </div>
          ) : (
            <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
          )}

          {/* Ex Company */}
          {record.exCompanyName && (
            <div
              style={{
                fontSize: 12,
                color: '#6b7280',
              }}
            >
              <span style={{ color: '#9ca3af' }}>Ex:</span>{' '}
              {record.exCompanyName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 180,
      render: val => val ? (
        <span style={{ fontSize: 12, color: '#4b5563', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
          <EnvironmentOutlined style={{ color: '#9ca3af', fontSize: 11, marginTop: 1, flexShrink: 0 }} />
          {val}
        </span>
      ) : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => { fetchOneCommentCount(record.id); setSelectedUser({ id: record.id, name: record.name?.trim() }); }}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '5px 10px',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Notes
            {commentCounts[record.id] > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                width: 16, height: 16, borderRadius: '50%',
                background: '#f59e0b', color: '#fff',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,.2)',
              }}>
                {commentCounts[record.id]}
              </span>
            )}
          </button>
          <Popconfirm
            title="Delete Employee"
            description="Are you sure you want to delete this employee?"
            onConfirm={() => handleDeleteEmployee(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === record.id}
              style={{ borderRadius: 8, fontSize: 11, padding: '3px 8px' }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',sans-serif", padding: '24px 20px' }}>

      {/* ── Compact top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>


          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BankOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{bankName}</div>
              {bankLocation && (
                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  <EnvironmentOutlined style={{ fontSize: 10 }} /> {bankLocation}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: '#f0f4ff', color: '#4f46e5',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, fontWeight: 600, border: '1px solid #e0e7ff',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <TeamOutlined /> {loading ? '…' : employees.length} Employees
          </span>
          <button
            onClick={() => navigate('/superadmin/banks')}
            onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '1px solid #e0e7ff',
              borderRadius: 8, padding: '7px 14px',
              color: '#4f46e5', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'background .15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back to Banks
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #e8edf2',
        overflow: 'hidden',
      }}>
        {/* Search inside card header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #f0f2f5', gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
            Employee Directory
            <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 13 }}>
              ({filtered.length} {search ? 'matching' : 'total'})
            </span>
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Input
              placeholder="Search by name, position, company, email…"
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 280, borderRadius: 8, fontSize: 13 }}
            />
            <Button
              type="primary"
              onClick={() => setIsAddEmployeeOpen(true)}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
                border: 'none',
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              + Add Employee
            </Button>
          </div>
        </div>

        <Table
          rowKey={r => r.id || r.email || Math.random()}
          loading={loading}
          dataSource={filtered}
          columns={columns}
          scroll={{ x: 1300 }}
          rowClassName={(_, i) => i % 2 === 0 ? 'be-even' : 'be-odd'}
          onChange={pag => setPagination({ current: pag.current, pageSize: pag.pageSize })}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filtered.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => (
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                Showing <strong>{range[0]}–{range[1]}</strong> of <strong>{total}</strong>
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <Empty
                style={{ padding: '48px 0' }}
                description={
                  search
                    ? <span style={{ color: '#6b7280' }}>No results for "<strong>{search}</strong>"</span>
                    : <span style={{ color: '#6b7280' }}>No employees found</span>
                }
              />
            ),
          }}
          style={{ fontSize: 13 }}
        />
      </div>

      <Modal 
        title="Add Bank Employee" 
        open={isAddEmployeeOpen} 
        onCancel={() => setIsAddEmployeeOpen(false)} 
        footer={null} 
        destroyOnClose
      >
        <AddEmployee 
          isModal 
          entityType="BANK" 
          companyId={bankId} 
          onSuccess={() => { 
            setIsAddEmployeeOpen(false); 
            loadEmployees(); 
          }} 
        />
      </Modal>

      {selectedUser && (
        <CommentModal
          userId={selectedUser.id}
          userName={selectedUser.name}
          dataType="Employee"
          onClose={() => { refreshCount(selectedUser.id); setSelectedUser(null); }}
        />
      )}

      <style>{`
        .be-even td { background: #ffffff !important; }
        .be-odd  td { background: #fafbfc !important; }
        .ant-table-row:hover td { background: #f0f4ff !important; }
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #374151 !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1.5px solid #e8edf2 !important;
          white-space: nowrap;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 12px 14px !important;
          vertical-align: middle;
        }
        .ant-pagination { padding: 14px 20px !important; border-top: 1px solid #f0f2f5; margin: 0 !important; }
        .ant-table-cell-fix-left { background: inherit !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default BankEmployees;