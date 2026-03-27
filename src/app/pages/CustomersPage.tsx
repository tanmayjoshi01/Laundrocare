import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, Customer } from '../store';
import { Button, StatusBadge } from '../components/ui';
import { Search, Plus, Edit, MessageCircle, User, AlertTriangle, Check, X } from 'lucide-react';

export default function CustomersPage() {
  const { customers, setCustomers, orders, showToast, getCustomerDues } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddr, setNewAddr] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddr, setEditAddr] = useState('');
  const [editActive, setEditActive] = useState(true);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const custOrders = selected ? orders.filter(o => o.customerId === selected.id) : [];

  const addCustomer = () => {
    if (!newName || !newPhone) return;
    const c: Customer = { id: `C${Date.now()}`, name: newName, phone: newPhone, address: newAddr, totalOrders: 0, totalSpent: 0, pendingDues: 0, lastVisit: '2026-03-27', active: true };
    setCustomers(prev => [c, ...prev]);
    setSelected(c);
    setShowAdd(false);
    setNewName(''); setNewPhone(''); setNewAddr('');
    showToast('✅ Customer added!');
  };

  const startEdit = () => {
    if (!selected) return;
    setEditName(selected.name);
    setEditPhone(selected.phone);
    setEditAddr(selected.address);
    setEditActive(selected.active);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!selected || !editName || !editPhone) return;
    const updated = { ...selected, name: editName, phone: editPhone, address: editAddr, active: editActive };
    setCustomers(prev => prev.map(c => c.id === selected.id ? updated : c));
    setSelected(updated);
    setEditing(false);
    showToast('✅ Customer updated!');
  };

  const cancelEdit = () => setEditing(false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-[24px] font-['Plus_Jakarta_Sans'] text-[#0F172A] mb-6" style={{ fontWeight: 700 }}>Customers</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Left - List */}
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-5">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full h-[48px] pl-10 pr-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            </div>
            <Button variant="success" size="sm" onClick={() => setShowAdd(!showAdd)}><Plus size={18} /></Button>
          </div>

          {showAdd && (
            <div className="space-y-2 mb-4 p-3 bg-[#F8FAFC] rounded-[8px]">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="w-full h-[40px] px-3 rounded-[6px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Phone" className="w-full h-[40px] px-3 rounded-[6px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              <input value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="Address" className="w-full h-[40px] px-3 rounded-[6px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              <Button variant="success" size="sm" className="w-full" onClick={addCustomer}>Save Customer</Button>
            </div>
          )}

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left p-3 rounded-[8px] border transition-all cursor-pointer ${selected?.id === c.id ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#94A3B8]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-['DM_Sans'] ${c.active ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}>
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-['DM_Sans'] text-[15px] text-[#0F172A] truncate" style={{ fontWeight: 500 }}>{c.name}</div>
                    <div className="font-['JetBrains_Mono'] text-[12px] text-[#64748B]">{c.phone}</div>
                  </div>
                  <div className="text-[12px] text-[#94A3B8] font-['DM_Sans']">{c.lastVisit}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right - Detail */}
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
          {!selected ? (
            <div className="text-center py-16 text-[#94A3B8] font-['DM_Sans']">
              <User size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-[16px]">Select a customer</p>
              <p className="text-[14px]">Click on a customer to view details</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-['DM_Sans'] ${selected.active ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}>
                    {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  {editing ? (
                    <div className="space-y-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" className="w-full h-[38px] px-3 rounded-[6px] border border-[#2563EB] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                      <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone" className="w-full h-[38px] px-3 rounded-[6px] border border-[#2563EB] font-['JetBrains_Mono'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                      <input value={editAddr} onChange={e => setEditAddr(e.target.value)} placeholder="Address" className="w-full h-[38px] px-3 rounded-[6px] border border-[#2563EB] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">Status:</span>
                        <button onClick={() => setEditActive(true)} className={`h-[32px] px-3 rounded-[6px] font-['DM_Sans'] text-[13px] cursor-pointer ${editActive ? 'bg-[#16A34A] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B]'}`}>Active</button>
                        <button onClick={() => setEditActive(false)} className={`h-[32px] px-3 rounded-[6px] font-['DM_Sans'] text-[13px] cursor-pointer ${!editActive ? 'bg-[#DC2626] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B]'}`}>Inactive</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="font-['Plus_Jakarta_Sans'] text-[20px] text-[#0F172A]" style={{ fontWeight: 700 }}>{selected.name}</h2>
                      <div className="font-['JetBrains_Mono'] text-[14px] text-[#64748B]">{selected.phone}</div>
                      {selected.address && <div className="font-['DM_Sans'] text-[14px] text-[#64748B]">{selected.address}</div>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button variant="success" size="sm" onClick={saveEdit}><Check size={16} /> Save</Button>
                      <Button variant="secondary" size="sm" onClick={cancelEdit}><X size={16} /> Cancel</Button>
                    </>
                  ) : (
                    <>
                      <a href={`https://wa.me/91${selected.phone}`} target="_blank" rel="noopener noreferrer" className="h-[48px] px-4 rounded-[8px] bg-[#25D366] text-white flex items-center gap-2 hover:bg-[#1ebe57] font-['DM_Sans'] text-[14px]">📱 WhatsApp</a>
                      <Button variant="secondary" size="sm" onClick={startEdit}><Edit size={16} /> Edit</Button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#F8FAFC] rounded-[8px] p-4 text-center">
                  <div className="font-['JetBrains_Mono'] text-[22px] text-[#2563EB]">{selected.totalOrders}</div>
                  <div className="font-['DM_Sans'] text-[13px] text-[#64748B]">Total Orders</div>
                </div>
                <div className="bg-[#F8FAFC] rounded-[8px] p-4 text-center">
                  <div className="font-['JetBrains_Mono'] text-[22px] text-[#0F172A]">₹{selected.totalSpent}</div>
                  <div className="font-['DM_Sans'] text-[13px] text-[#64748B]">Total Spent</div>
                </div>
                <div className="bg-[#F8FAFC] rounded-[8px] p-4 text-center">
                  <div className="font-['JetBrains_Mono'] text-[22px] text-[#DC2626]">₹{getCustomerDues(selected.id)}</div>
                  <div className="font-['DM_Sans'] text-[13px] text-[#64748B]">Pending Dues</div>
                </div>
              </div>

              {!selected.active && (
                <div className="flex items-center gap-3 p-4 bg-[#FEF3C7] rounded-[8px] mb-6">
                  <AlertTriangle size={20} className="text-[#D97706]" />
                  <span className="font-['DM_Sans'] text-[14px] text-[#92400E]">Not visited in 30+ days — Send a reminder?</span>
                  <a href={`https://wa.me/91${selected.phone}?text=${encodeURIComponent(`Hi ${selected.name}, we miss you at LaundroCare! Visit us for fresh, clean clothes.`)}`} target="_blank" rel="noopener noreferrer" className="ml-auto h-[36px] px-4 rounded-[6px] bg-[#25D366] text-white text-[13px] flex items-center font-['DM_Sans'] hover:bg-[#1ebe57]">Send Reminder</a>
                </div>
              )}

              {/* Order History */}
              <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#0F172A] mb-3" style={{ fontWeight: 700 }}>Order History</h3>
              {custOrders.length === 0 ? (
                <p className="text-[#94A3B8] font-['DM_Sans'] text-[14px] py-4">No orders yet</p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {custOrders.map(o => (
                    <button
                      key={o.id}
                      onClick={() => navigate(`/orders?highlight=${o.id}`)}
                      className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-['JetBrains_Mono'] text-[14px] text-[#2563EB]">#{o.id}</span>
                        <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">{o.createdAt}</span>
                        <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">{o.items.map(i => `${i.item}×${i.qty}`).join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-['JetBrains_Mono'] text-[15px] text-[#0F172A]">₹{o.total}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}