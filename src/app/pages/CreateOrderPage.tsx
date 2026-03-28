import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, Customer, OrderItem } from '../store';
import { Button, StatusBadge } from '../components/ui';
import { Search, Plus, Minus, X, User, Package, Check } from 'lucide-react';

export default function CreateOrderPage() {
  const { customers, setCustomers, currentOrderItems, setCurrentOrderItems, selectedCustomer, setSelectedCustomer, showToast, laundryItems, laundryServices, getPricing, getCustomerDues, customerCategories } = useStore();
  const navigate = useNavigate();
  const PRICING = getPricing();
  const SERVICES = laundryServices;
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddr, setNewAddr] = useState('');
  const [selItem, setSelItem] = useState<string | null>(null);
  const [selService, setSelService] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const filteredItems = laundryItems.filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase()));
  const filteredServices = laundryServices.filter(s => s.label.toLowerCase().includes(serviceSearch.toLowerCase()));

  const addCustomer = () => {
    if (!newName || !newPhone) return;
    const c: Customer = { id: `C${Date.now()}`, name: newName, phone: newPhone, address: newAddr, totalOrders: 0, totalSpent: 0, pendingDues: 0, lastVisit: new Date().toLocaleDateString('en-CA'), active: true };
    setCustomers(prev => [c, ...prev]);
    setSelectedCustomer(c);
    setShowAddForm(false);
    setNewName(''); setNewPhone(''); setNewAddr('');
    showToast('✅ Customer added!');
  };

  const addItem = () => {
    if (!selItem || !selService) return;
    const unitPrice = PRICING[selItem]?.[selService] || 0;
    const item: OrderItem = { id: `OI${Date.now()}`, item: selItem, service: selService, qty, unitPrice, notes: notes || undefined };
    setCurrentOrderItems(prev => [...prev, item]);
    setSelItem(null); setSelService(null); setQty(1); setNotes('');
    showToast('✅ Item added!');
  };

  const removeItem = (id: string) => setCurrentOrderItems(prev => prev.filter(i => i.id !== id));
  const total = currentOrderItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  const step1Done = !!selectedCustomer;
  const step2Done = !!selItem;
  const step3Done = !!selService;
  const currentPrice = selItem && selService ? (PRICING[selItem]?.[selService] || 0) : 0;
  const lineTotal = currentPrice * qty;

  function StepBadge({ num, done }: { num: number; done: boolean }) {
    return (
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-['DM_Sans'] mr-2 transition-colors ${done ? 'bg-[#16A34A] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`} style={{ fontWeight: 600 }}>
        {done ? <Check size={14} /> : num}
      </span>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <h1 className="text-[24px] font-['Plus_Jakarta_Sans'] text-[#0F172A] mb-6" style={{ fontWeight: 700 }}>Create New Order</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-6">
        {/* LEFT - Customer */}
        <div className="bg-white rounded-[12px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] self-start">
          <h2 className="text-[16px] font-['Plus_Jakarta_Sans'] text-[#0F172A] mb-4 flex items-center" style={{ fontWeight: 700 }}>
            <StepBadge num={1} done={step1Done} />
            Customer
          </h2>
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by phone..." className="w-full h-[48px] pl-10 pr-4 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
          </div>

          {selectedCustomer ? (
            <div className="border-2 border-[#2563EB] rounded-[8px] p-3 bg-[#EFF6FF] mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 600 }}>{selectedCustomer.name}</div>
                  <div className="font-['JetBrains_Mono'] text-[13px] text-[#64748B]">{selectedCustomer.phone}</div>
                  <div className="text-[13px] text-[#64748B] font-['DM_Sans'] mt-1">{selectedCustomer.totalOrders} orders</div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"><X size={18} /></button>
              </div>
              {selectedCustomer && getCustomerDues(selectedCustomer.id) > 0 && (
                <div className="mt-2 text-[13px] text-[#DC2626] font-['DM_Sans']" style={{ fontWeight: 600 }}>⚠️ Pending dues: ₹{getCustomerDues(selectedCustomer.id)}</div>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto mb-3">
              {filtered.slice(0, 5).map(c => (
                <button key={c.id} onClick={() => setSelectedCustomer(c)} className="w-full text-left p-3 rounded-[8px] border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[13px] font-['DM_Sans']">{c.name[0]}</div>
                    <div>
                      <div className="font-['DM_Sans'] text-[14px] text-[#0F172A]">{c.name}</div>
                      <div className="font-['JetBrains_Mono'] text-[12px] text-[#64748B]">{c.phone}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showAddForm ? (
            <div className="space-y-3 border-t border-[#E2E8F0] pt-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="w-full h-[44px] px-3 rounded-[6px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Phone" className="w-full h-[44px] px-3 rounded-[6px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              <input value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="Address (optional)" className="w-full h-[44px] px-3 rounded-[6px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              <div className="flex gap-2">
                <Button variant="success" size="sm" className="flex-1" onClick={addCustomer}>Save</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="success-outline" size="sm" className="w-full" onClick={() => navigate('/register-customer')}>
              <Plus size={16} /> Add New Customer
            </Button>
          )}
        </div>

        {/* CENTER - Item Builder */}
        <div className="bg-white rounded-[12px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] self-start">
          <h2 className="text-[16px] font-['Plus_Jakarta_Sans'] text-[#0F172A] mb-4 flex items-center" style={{ fontWeight: 700 }}>
            <StepBadge num={2} done={step2Done && step3Done} />
            Add Items
          </h2>

          {/* Item search */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full h-[42px] pl-9 pr-4 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Item grid */}
          <div className="space-y-2 mb-5 max-h-[220px] overflow-y-auto">
            {filteredItems.map(item => {
              const isActive = selItem === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => { setSelItem(item.name); setSelService(null); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-[10px] border-2 transition-all cursor-pointer text-left ${isActive ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#94A3B8] bg-white'}`}
                >
                  <div className={`font-['DM_Sans'] text-[15px] flex-1 ${isActive ? 'text-[#2563EB]' : 'text-[#0F172A]'}`} style={{ fontWeight: isActive ? 600 : 400 }}>{item.name}</div>
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="text-[13px] text-[#94A3B8] font-['DM_Sans'] py-2">No items match your search</p>
            )}
          </div>

          {/* Service selection — list style */}
          {selItem && (
            <div className="mb-5">
              <label className="text-[14px] text-[#64748B] font-['DM_Sans'] mb-2 block">Select Service for <span className="text-[#0F172A]" style={{ fontWeight: 600 }}>{selItem}</span></label>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  placeholder="Search services..."
                  className="w-full h-[42px] pl-9 pr-4 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {filteredServices.map(s => {
                  const price = PRICING[selItem]?.[s.key] || 0;
                  const isActive = selService === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setSelService(s.key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-[10px] border-2 transition-all cursor-pointer text-left ${isActive ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#94A3B8] bg-white'}`}
                    >
                      <div className={`font-['DM_Sans'] text-[15px] flex-1 ${isActive ? 'text-[#2563EB]' : 'text-[#0F172A]'}`} style={{ fontWeight: isActive ? 600 : 400 }}>{s.label}</div>
                      <div className={`font-['JetBrains_Mono'] text-[14px] shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} style={{ fontWeight: 600 }}>₹{price}</div>
                      {isActive && <Check size={18} className="text-[#2563EB] shrink-0" />}
                    </button>
                  );
                })}
                {filteredServices.length === 0 && (
                  <p className="text-[13px] text-[#94A3B8] font-['DM_Sans'] py-2">No services match your search</p>
                )}
              </div>
            </div>
          )}

          {/* Qty + notes */}
          {selItem && selService && (
            <div className="space-y-4">
              <div>
                <label className="text-[14px] text-[#64748B] font-['DM_Sans'] mb-2 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-[52px] h-[52px] rounded-[8px] border-2 border-[#E2E8F0] flex items-center justify-center hover:bg-[#F1F5F9] cursor-pointer"><Minus size={20} /></button>
                  <span className="text-[28px] font-['JetBrains_Mono'] text-[#0F172A] w-12 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-[52px] h-[52px] rounded-[8px] border-2 border-[#2563EB] bg-[#EFF6FF] flex items-center justify-center hover:bg-[#DBEAFE] cursor-pointer text-[#2563EB]"><Plus size={20} /></button>
                </div>
              </div>
              <div>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions (optional)" className="w-full h-[44px] px-4 rounded-[6px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              </div>

              {/* Live summary strip */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div>
                    <div className="font-['DM_Sans'] text-[14px] text-[#0F172A]" style={{ fontWeight: 600 }}>
                      {selItem} — {SERVICES.find(s => s.key === selService)?.label}
                    </div>
                    <div className="font-['DM_Sans'] text-[13px] text-[#64748B]">
                      ₹{currentPrice} × {qty} {qty > 1 ? 'pcs' : 'pc'}
                    </div>
                  </div>
                </div>
                <div className="font-['JetBrains_Mono'] text-[20px] text-[#2563EB] shrink-0" style={{ fontWeight: 700 }}>₹{lineTotal}</div>
              </div>

              <Button variant="primary" size="md" className="w-full" onClick={addItem}>
                + Add to Order
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT - Cart */}
        <div className="bg-white rounded-[12px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] self-start">
          <h2 className="text-[16px] font-['Plus_Jakarta_Sans'] text-[#0F172A] mb-4 flex items-center" style={{ fontWeight: 700 }}>
            <StepBadge num={3} done={currentOrderItems.length > 0} />
            Order Summary
          </h2>
          {currentOrderItems.length === 0 ? (
            <div className="text-center py-10 text-[#94A3B8] font-['DM_Sans']">
              <Package size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-[15px]">No items added yet</p>
              <p className="text-[13px]">Select items from the center panel</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[360px] overflow-y-auto mb-4">
                {currentOrderItems.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex-1 min-w-0">
                      <div className="font-['DM_Sans'] text-[14px] text-[#0F172A]">{i.item}</div>
                      <div className="text-[12px] text-[#64748B] font-['DM_Sans']">{i.service} × {i.qty}</div>
                    </div>
                    <div className="font-['JetBrains_Mono'] text-[14px] text-[#0F172A] mr-2">₹{i.unitPrice * i.qty}</div>
                    <button onClick={() => removeItem(i.id)} className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded cursor-pointer"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E2E8F0] pt-4">
                {/* Category discount preview */}
                {selectedCustomer?.categoryId && (() => {
                  const cat = customerCategories.find(c => c.id === selectedCustomer.categoryId);
                  return cat && cat.discount > 0 ? (
                    <div className="mb-3 px-3 py-2 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0]">
                      <span className="font-['DM_Sans'] text-[13px] text-[#16A34A]" style={{ fontWeight: 600 }}>
                        {cat.name} — {cat.discount}% discount will apply
                      </span>
                    </div>
                  ) : null;
                })()}
                <div className="flex justify-between items-center mb-4">
                  <span className="font-['DM_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 600 }}>Total</span>
                  <span className="font-['JetBrains_Mono'] text-[24px] text-[#0F172A]" style={{ fontWeight: 700 }}>₹{total}</span>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (!selectedCustomer) { showToast('⚠️ Please select a customer first'); return; }
                    navigate('/billing');
                  }}
                >
                  Proceed to Billing →
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}