import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { fetchCompanyEmployees, fetchCompanyPresentations, fetchCompanyDemos, fetchBanks } from './api/superadminService';
import { fetchWithAuth } from './auth';
import AddEmployee from './components/AddEmployee';
import AddPresentation from './components/AddPresentation';
import AddDemo from './components/AddDemo';
import CommentModal from './components/CommentModal';

const BASE = 'https://meta.oxyloans.com';

const Avatar = ({ name }) => {
  const initials = name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500', 'from-pink-500 to-rose-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0`}>
      {initials}
    </div>
  );
};

export default function BankEmployees() {
  const { bankId } = useParams();
  const navigate = useNavigate();

  const [bankName, setBankName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('employees');
  const [commentCounts, setCommentCounts] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddPresentationOpen, setIsAddPresentationOpen] = useState(false);
  const [isAddDemoOpen, setIsAddDemoOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState(null);

  const fetchOneCommentCount = (id) => {
    if (commentCounts[id] !== undefined) return;
    fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${id}`)
      .then((r) => r.json())
      .then((d) => setCommentCounts((prev) => ({ ...prev, [id]: Array.isArray(d) ? d.length : 0 })))
      .catch(() => setCommentCounts((prev) => ({ ...prev, [id]: 0 })));
  };

  const refreshCount = (userId) => {
    fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${userId}`)
      .then((r) => r.json())
      .then((d) => setCommentCounts((prev) => ({ ...prev, [userId]: Array.isArray(d) ? d.length : 0 })))
      .catch(() => {});
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchCompanyEmployees(bankId),
      fetchCompanyPresentations(bankId),
      fetchCompanyDemos(bankId),
    ])
      .then(([empRes, presRes, demoRes]) => {
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        setPresentations(Array.isArray(presRes.data) ? presRes.data : []);
        setDemos(Array.isArray(demoRes.data) ? demoRes.data : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanks()
      .then((res) => {
        const match = (res.data?.content || []).find((b) => b.id === bankId);
        if (match) setBankName(match.companyName);
      })
      .catch(() => {});
    loadData();
  }, [bankId]);

  const filtered = employees.filter((r) =>
    [r.name, r.position, r.email, r.location, r.mobileNumber]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const tabs = [
    { key: 'employees', label: 'Employees', count: employees.length },
    { key: 'presentations', label: 'Presentations', count: presentations.length },
    { key: 'demos', label: 'Demos', count: demos.length },
  ];

  const openUpdateDemo = (demo) => { setEditingDemo(demo); setIsAddDemoOpen(true); };
  const handleDemoModalClose = () => { setIsAddDemoOpen(false); setEditingDemo(null); };

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{bankName || 'Bank'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Employees, presentations and demos</p>
        </div>
        <button onClick={() => navigate('/superadmin/banks')} className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all">
          ← Back to Banks
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${activeTab === tab.key ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <span className="font-semibold text-gray-800 text-sm">
              {filtered.length} <span className="text-gray-400 font-normal">employees</span>
            </span>
            <div className="flex items-center gap-3">
              <div className="relative max-w-xs w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <button onClick={() => setIsAddEmployeeOpen(true)} className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 py-2 rounded-xl shadow-sm transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Employee
              </button>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
            {loading && [...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-24" />)}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <span className="text-4xl mb-3">👥</span>
                <p className="text-sm font-medium">No employees found</p>
              </div>
            )}
            {!loading && filtered.map((r, i) => (
              <div key={r.id} className="group bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <Avatar name={r.name?.trim() || 'U'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-300">#{String(i + 1).padStart(2, '0')}</span>
                          <p className="font-bold text-gray-900 text-sm">{r.name?.trim()}</p>
                          {r.classification && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold">{r.classification}</span>
                          )}
                        </div>
                        {r.position && <p className="text-xs text-gray-400 mt-0.5">{r.position}</p>}
                      </div>
                      <button
                        onClick={() => { fetchOneCommentCount(r.id); setSelectedUser({ id: r.id, name: r.name?.trim() }); }}
                        className="shrink-0 relative inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                        Notes
                        {commentCounts[r.id] > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow">
                            {commentCounts[r.id]}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      {[{ icon: '📍', label: 'Location', value: r.location }, { icon: '📱', label: 'Mobile', value: r.mobileNumber?.trim() }].map(({ icon, label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{icon} {label}</p>
                          <p className="text-xs text-gray-700 font-semibold truncate mt-0.5">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      {r.email && (
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span className="text-xs text-gray-600 truncate max-w-[180px]">{r.email}</span>
                        </div>
                      )}
                      {r.linkdinUrl && (
                        <a href={r.linkdinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1 transition-colors">
                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                          <span className="text-xs text-blue-600 font-medium">LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'presentations' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">{presentations.length} <span className="text-gray-400 font-normal">presentations</span></span>
            <button onClick={() => setIsAddPresentationOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 py-2 rounded-xl shadow-sm transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Presentation
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
            {loading && [...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-20" />)}
            {!loading && presentations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400"><span className="text-4xl mb-3">🖥️</span><p className="text-sm font-medium">No presentations found</p></div>
            )}
            {!loading && presentations.map((p, i) => (
              <div key={p.id || i} className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{p.presentationName || '—'}</p>
                    {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                  </div>
                  {p.presentationUrl && (
                    <a href={p.presentationUrl} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all">View →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'demos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">{demos.length} <span className="text-gray-400 font-normal">demos</span></span>
            <button onClick={() => { setEditingDemo(null); setIsAddDemoOpen(true); }} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-3 py-2 rounded-xl shadow-sm transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Demo
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
            {loading && [...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-20" />)}
            {!loading && demos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400"><span className="text-4xl mb-3">📋</span><p className="text-sm font-medium">No demos found</p></div>
            )}
            {!loading && demos.map((d, i) => (
              <div key={d.id || i} className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="font-bold text-gray-900 text-sm">Demo #{String(i + 1).padStart(2, '0')}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${d.demoDone ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {d.demoDone ? 'Completed' : 'Pending'}
                    </span>
                    <button onClick={() => openUpdateDemo(d)} className="text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-all">Update</button>
                  </div>
                </div>
                {d.momNotes && <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 mt-1">{d.momNotes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal title="Add Employee" open={isAddEmployeeOpen} onCancel={() => setIsAddEmployeeOpen(false)} footer={null} destroyOnClose>
        <AddEmployee isModal companyId={bankId} entityType="BANK" onSuccess={() => { setIsAddEmployeeOpen(false); loadData(); }} />
      </Modal>

      <Modal title="Add Presentation" open={isAddPresentationOpen} onCancel={() => setIsAddPresentationOpen(false)} footer={null} destroyOnClose>
        <AddPresentation isModal companyId={bankId} onSuccess={() => { setIsAddPresentationOpen(false); loadData(); }} />
      </Modal>

      <Modal title={editingDemo ? 'Update Demo' : 'Add Demo'} open={isAddDemoOpen} onCancel={handleDemoModalClose} footer={null} destroyOnClose>
        <AddDemo isModal companyId={bankId} initialValues={editingDemo} onSuccess={() => { handleDemoModalClose(); loadData(); }} />
      </Modal>

      {selectedUser && (
        <CommentModal
          userId={selectedUser.id}
          userName={selectedUser.name}
          dataType="Employee"
          onClose={() => { refreshCount(selectedUser.id); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}
