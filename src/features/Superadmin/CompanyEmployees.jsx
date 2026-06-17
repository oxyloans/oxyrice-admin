import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Input, Empty, Tag, notification, Table, Button, Modal, Tabs, Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined, SearchOutlined, MailOutlined, PhoneOutlined,
  LinkedinOutlined, EnvironmentOutlined, BuildOutlined,
  TeamOutlined, PlayCircleOutlined, FundProjectionScreenOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  fetchCompanyEmployees, fetchCompanyPresentations,
  fetchCompanyDemos, fetchCompanies,
  deleteEmployee, deleteDemo,
} from './api/superadminService';
import { fetchWithAuth } from './auth';
import AddEmployee from './components/AddEmployee';
import AddPresentation from './components/AddPresentation';
import AddDemo from './components/AddDemo';
import CommentModal from './components/CommentModal';

const BASE = 'https://meta.oxyloans.com';

/* ── helpers ─────────────────────────────────────────────────────────── */
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const avatarColor = (name = '') => {
  const palette = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7', '#be185d'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

const classificationColor = (c = '') => {
  const map = { '1st': 'green', '2nd': 'blue', '3rd': 'orange', '4th': 'red' };
  return map[c] || 'purple';
};

/* ── component ───────────────────────────────────────────────────────── */
export default function CompanyEmployees() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('employees');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [commentCounts, setCommentCounts] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddPresentationOpen, setIsAddPresentationOpen] = useState(false);
  const [isAddDemoOpen, setIsAddDemoOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState(null);

  /* ── data loading ── */
  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchCompanyEmployees(companyId),
      fetchCompanyPresentations(companyId),
      fetchCompanyDemos(companyId),
    ])
      .then(([empRes, presRes, demoRes]) => {
        setEmployees(Array.isArray(empRes.data) ? empRes.data : empRes.data?.content || []);
        setPresentations(Array.isArray(presRes.data) ? presRes.data : []);
        setDemos(Array.isArray(demoRes.data) ? demoRes.data : []);
      })
      .catch(() => notification.error({ message: 'Error', description: 'Failed to load data' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies()
      .then(res => {
        const match = (res.data?.content || []).find(c => c.id === companyId);
        if (match) setCompanyName(match.companyName);
      })
      .catch(() => { });
    loadData();
  }, [companyId]);

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

  const handleDeleteDemo = async (id) => {
    setDeletingId(id);
    try {
      await deleteDemo(companyId, id);
      notification.success({ message: 'Success', description: 'Demo deleted successfully' });
      setDemos(prev => prev.filter(d => d.id !== id));
    } catch {
      notification.error({ message: 'Error', description: 'Failed to delete demo' });
    } finally {
      setDeletingId(null);
    }
  };

  /* ── filtering ── */
  const filtered = search
    ? employees.filter(e => {
      const q = search.toLowerCase();
      return (
        (e.name || '').toLowerCase().includes(q) ||
        (e.position || '').toLowerCase().includes(q) ||
        (e.companyName || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.mobileNumber || '').includes(q)
      );
    })
    : employees;

  /* ── employee columns (no fixed) ── */
  const employeeColumns = [
    {
      title: '#',
      key: 'idx',
      width: 52,
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
      width: 190,
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
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {record.email && (
            <a
              href={`mailto:${record.email}`}
              style={{
                fontSize: 12,
                color: '#374151',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <MailOutlined style={{ color: '#9ca3af', fontSize: 11 }} />
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
          )}

          {record.mobileNumber && (
            <a
              href={`tel:${record.mobileNumber}`}
              style={{
                fontSize: 12,
                color: '#374151',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <PhoneOutlined style={{ color: '#9ca3af', fontSize: 11 }} />
              {record.mobileNumber}
            </a>
          )}

          {record.linkdinUrl && (
            <a
              href={record.linkdinUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12,
                color: '#0a66c2',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <LinkedinOutlined style={{ fontSize: 13 }} />
              LinkedIn Profile
            </a>
          )}

          {!record.email && !record.mobileNumber && !record.linkdinUrl && (
            <span style={{ color: '#d1d5db' }}>—</span>
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
      title: 'Classification',
      dataIndex: 'classification',
      key: 'classification',
      width: 120,
      filters: ['1st', '2nd', '3rd', '4th'].map(v => ({ text: v, value: v })),
      onFilter: (value, record) => record.classification === value,
      render: val => val ? (
        <Tag color={classificationColor(val)} style={{ borderRadius: 6, fontWeight: 700, fontSize: 11, padding: '2px 10px' }}>
          {val}
        </Tag>
      ) : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 160,
      sorter: (a, b) => (a.companyName || '').localeCompare(b.companyName || ''),
      render: val => val ? (
        <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          <BuildOutlined style={{ fontSize: 11, color: '#818cf8', flexShrink: 0 }} />
          {val}
        </span>
      ) : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 190,
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

  /* ── presentation columns ── */
  const presentationColumns = [
    {
      title: '#',
      key: 'idx',
      width: 52,
      render: (_, __, i) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</span>,
    },
    {
      title: 'Presentation Name',
      dataIndex: 'presentationName',
      key: 'presentationName',
      width: 240,
      sorter: (a, b) => (a.presentationName || '').localeCompare(b.presentationName || ''),
      render: val => <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{val || '—'}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: val => val ? <span style={{ fontSize: 12, color: '#6b7280' }}>{val}</span> : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Link',
      dataIndex: 'presentationUrl',
      key: 'presentationUrl',
      width: 100,
      render: val => val ? (
        <a href={val} target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <FundProjectionScreenOutlined /> View
        </a>
      ) : <span style={{ color: '#d1d5db' }}>—</span>,
    },
  ];

  /* ── demo columns ── */
  const demoColumns = [
    {
      title: '#',
      key: 'idx',
      width: 52,
      render: (_, __, i) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'demoDone',
      key: 'demoDone',
      width: 120,
      filters: [{ text: 'Completed', value: true }, { text: 'Pending', value: false }],
      onFilter: (value, record) => record.demoDone === value,
      render: val => (
        <Tag color={val ? 'success' : 'warning'} style={{ borderRadius: 6, fontWeight: 700, fontSize: 11, padding: '2px 10px' }}>
          {val ? 'Completed' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Notes (MOM)',
      dataIndex: 'momNotes',
      key: 'momNotes',
      render: val => val
        ? <span style={{ fontSize: 12, color: '#374151' }}>{val}</span>
        : <span style={{ color: '#d1d5db' }}>—</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button
            size="small"
            onClick={() => { setEditingDemo(record); setIsAddDemoOpen(true); }}
            style={{ borderRadius: 8, fontSize: 12, fontWeight: 600, borderColor: '#4f46e5', color: '#4f46e5' }}
          >
            Update
          </Button>
          <Popconfirm
            title="Delete Demo"
            description="Are you sure you want to delete this demo?"
            onConfirm={() => handleDeleteDemo(record.id)}
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

  /* ── shared table card wrapper ── */
  const TableCard = ({ children }) => (
    <div style={{
      background: '#fff', borderRadius: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
      border: '1px solid #e8edf2', overflow: 'hidden',
    }}>
      {children}
    </div>
  );

  const CardHeader = ({ left, right }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderBottom: '1px solid #f0f2f5', gap: 10, flexWrap: 'wrap',
    }}>
      {left}
      {right}
    </div>
  );

  /* ── tab items ── */
  const tabItems = [
    {
      key: 'employees',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TeamOutlined />
          Employees
          <span style={{
            background: activeTab === 'employees' ? '#eef2ff' : '#f3f4f6',
            color: activeTab === 'employees' ? '#4f46e5' : '#6b7280',
            borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700,
          }}>
            {employees.length}
          </span>
        </span>
      ),
      children: (
        <TableCard>
          <CardHeader
            left={
              <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
                Employee Directory
                <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 13 }}>
                  ({filtered.length} {search ? 'matching' : 'total'})
                </span>
              </span>
            }
            right={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Input
                  placeholder="Search by name, position, email…"
                  prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  allowClear
                  style={{ width: 260, borderRadius: 8, fontSize: 13 }}
                />
                <Button
                  type="primary"
                  onClick={() => setIsAddEmployeeOpen(true)}
                  style={{ borderRadius: 8, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none' }}
                >
                  + Add Employee
                </Button>
              </div>
            }
          />
          <Table
            rowKey={r => r.id || r.email || Math.random()}
            loading={loading}
            dataSource={filtered}
            columns={employeeColumns}
            scroll={{ x: 1400 }}
            rowClassName={(_, i) => i % 2 === 0 ? 'ce-even' : 'ce-odd'}
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
        </TableCard>
      ),
    },
    {
      key: 'presentations',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FundProjectionScreenOutlined />
          Presentations
          <span style={{
            background: activeTab === 'presentations' ? '#eef2ff' : '#f3f4f6',
            color: activeTab === 'presentations' ? '#4f46e5' : '#6b7280',
            borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700,
          }}>
            {presentations.length}
          </span>
        </span>
      ),
      children: (
        <TableCard>
          <CardHeader
            left={
              <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
                Presentations
                <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 13 }}>
                  ({presentations.length} total)
                </span>
              </span>
            }
            right={
              <Button
                type="primary"
                onClick={() => setIsAddPresentationOpen(true)}
                style={{ borderRadius: 8, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none' }}
              >
                + Add Presentation
              </Button>
            }
          />
          <Table
            rowKey={(r, i) => r.id || i}
            loading={loading}
            dataSource={presentations}
            columns={presentationColumns}
            scroll={{ x: 700 }}
            rowClassName={(_, i) => i % 2 === 0 ? 'ce-even' : 'ce-odd'}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            locale={{ emptyText: <Empty style={{ padding: '48px 0' }} description={<span style={{ color: '#6b7280' }}>No presentations found</span>} /> }}
            style={{ fontSize: 13 }}
          />
        </TableCard>
      ),
    },
    {
      key: 'demos',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PlayCircleOutlined />
          Demos
          <span style={{
            background: activeTab === 'demos' ? '#ecfdf5' : '#f3f4f6',
            color: activeTab === 'demos' ? '#059669' : '#6b7280',
            borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700,
          }}>
            {demos.length}
          </span>
        </span>
      ),
      children: (
        <TableCard>
          <CardHeader
            left={
              <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
                Demos
                <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 13 }}>
                  ({demos.length} total)
                </span>
              </span>
            }
            right={
              <Button
                onClick={() => { setEditingDemo(null); setIsAddDemoOpen(true); }}
                style={{ borderRadius: 8, fontWeight: 600, background: 'linear-gradient(135deg,#059669,#0d9488)', color: '#fff', border: 'none' }}
              >
                + Add Demo
              </Button>
            }
          />
          <Table
            rowKey={(r, i) => r.id || i}
            loading={loading}
            dataSource={demos}
            columns={demoColumns}
            scroll={{ x: 700 }}
            rowClassName={(_, i) => i % 2 === 0 ? 'ce-even' : 'ce-odd'}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            locale={{ emptyText: <Empty style={{ padding: '48px 0' }} description={<span style={{ color: '#6b7280' }}>No demos found</span>} /> }}
            style={{ fontSize: 13 }}
          />
        </TableCard>
      ),
    },
  ];

  /* ── render ── */
  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',sans-serif", padding: '24px 20px' }}>

      {/* ── top bar: company info left, back button right ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>

        {/* left: icon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BuildOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {companyName || 'Company'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              Employees · Presentations · Demos
            </div>
          </div>
        </div>

        {/* right: employee count + back */}
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
            onClick={() => navigate('/superadmin/companies')}
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
            <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back to Companies
          </button>
        </div>
      </div>

      {/* ── tabs ── */}
      <Tabs
        activeKey={activeTab}
        onChange={key => { setActiveTab(key); setPagination({ current: 1, pageSize: 20 }); }}
        items={tabItems}
        style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      />

      {/* ── modals ── */}
      <Modal title="Add Employee" open={isAddEmployeeOpen} onCancel={() => setIsAddEmployeeOpen(false)} footer={null} destroyOnClose>
        <AddEmployee isModal companyId={companyId} onSuccess={() => { setIsAddEmployeeOpen(false); loadData(); }} />
      </Modal>

      <Modal title="Add Presentation" open={isAddPresentationOpen} onCancel={() => setIsAddPresentationOpen(false)} footer={null} destroyOnClose>
        <AddPresentation isModal companyId={companyId} onSuccess={() => { setIsAddPresentationOpen(false); loadData(); }} />
      </Modal>

      <Modal title={editingDemo ? 'Update Demo' : 'Add Demo'} open={isAddDemoOpen} onCancel={() => { setIsAddDemoOpen(false); setEditingDemo(null); }} footer={null} destroyOnClose>
        <AddDemo isModal companyId={companyId} initialValues={editingDemo} onSuccess={() => { setIsAddDemoOpen(false); setEditingDemo(null); loadData(); }} />
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
        .ce-even td { background: #ffffff !important; }
        .ce-odd  td { background: #fafbfc !important; }
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
        .ant-tabs-nav { margin-bottom: 16px !important; }
        .ant-tabs-tab { padding: 8px 4px !important; font-size: 13px !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}