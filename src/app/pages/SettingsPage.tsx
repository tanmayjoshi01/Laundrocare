import { useState } from 'react';
import { useStore, LaundryItem, LaundryService } from '../store';
import { Button } from '../components/ui';
import { Plus, Trash2, Edit, Check, X, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function SettingsPage() {
  const { laundryItems, setLaundryItems, laundryServices, setLaundryServices, pricingList, setPricingList, showToast } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'items' | 'services' | 'pricing'>('items');

  // Item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemIcon, setEditItemIcon] = useState('');

  // Service form
  const [newSvcKey, setNewSvcKey] = useState('');
  const [newSvcLabel, setNewSvcLabel] = useState('');
  const [newSvcIcon, setNewSvcIcon] = useState('');
  const [editingSvc, setEditingSvc] = useState<string | null>(null);
  const [editSvcKey, setEditSvcKey] = useState('');
  const [editSvcLabel, setEditSvcLabel] = useState('');
  const [editSvcIcon, setEditSvcIcon] = useState('');

  // Pricing
  const [pricingItemId, setPricingItemId] = useState<string | null>(null);
  const [priceSearch, setPriceSearch] = useState('');

  const addItem = () => {
    if (!newItemName.trim()) return;
    const id = `i${Date.now()}`;
    setLaundryItems(prev => [...prev, { id, name: newItemName.trim(), icon: newItemIcon || '📦' }]);
    // Add default pricing entries for all services
    const newEntries = laundryServices.map(s => ({ itemId: id, serviceKey: s.key, price: 0 }));
    setPricingList(prev => [...prev, ...newEntries]);
    setNewItemName(''); setNewItemIcon('');
    showToast('✅ Item added!');
  };

  const deleteItem = (id: string) => {
    setLaundryItems(prev => prev.filter(i => i.id !== id));
    setPricingList(prev => prev.filter(p => p.itemId !== id));
    showToast('🗑️ Item deleted');
  };

  const startEditItem = (item: LaundryItem) => {
    setEditingItem(item.id);
    setEditItemName(item.name);
    setEditItemIcon(item.icon);
  };

  const saveEditItem = () => {
    if (!editingItem || !editItemName.trim()) return;
    setLaundryItems(prev => prev.map(i => i.id === editingItem ? { ...i, name: editItemName.trim(), icon: editItemIcon || i.icon } : i));
    setEditingItem(null);
    showToast('✅ Item updated!');
  };

  const addService = () => {
    if (!newSvcLabel.trim()) return;
    const key = newSvcKey.trim() || newSvcLabel.trim().toLowerCase().replace(/\s+/g, '');
    const id = `s${Date.now()}`;
    setLaundryServices(prev => [...prev, { id, key, icon: newSvcIcon || '🔧', label: newSvcLabel.trim() }]);
    // Add default pricing entries for all items
    const newEntries = laundryItems.map(i => ({ itemId: i.id, serviceKey: key, price: 0 }));
    setPricingList(prev => [...prev, ...newEntries]);
    setNewSvcKey(''); setNewSvcLabel(''); setNewSvcIcon('');
    showToast('✅ Service added!');
  };

  const deleteService = (id: string, key: string) => {
    setLaundryServices(prev => prev.filter(s => s.id !== id));
    setPricingList(prev => prev.filter(p => p.serviceKey !== key));
    showToast('🗑️ Service deleted');
  };

  const startEditSvc = (svc: LaundryService) => {
    setEditingSvc(svc.id);
    setEditSvcKey(svc.key);
    setEditSvcLabel(svc.label);
    setEditSvcIcon(svc.icon);
  };

  const saveEditSvc = () => {
    if (!editingSvc || !editSvcLabel.trim()) return;
    const oldSvc = laundryServices.find(s => s.id === editingSvc);
    const newKey = editSvcKey.trim() || editSvcLabel.trim().toLowerCase().replace(/\s+/g, '');
    setLaundryServices(prev => prev.map(s => s.id === editingSvc ? { ...s, key: newKey, label: editSvcLabel.trim(), icon: editSvcIcon || s.icon } : s));
    if (oldSvc && oldSvc.key !== newKey) {
      setPricingList(prev => prev.map(p => p.serviceKey === oldSvc.key ? { ...p, serviceKey: newKey } : p));
    }
    setEditingSvc(null);
    showToast('✅ Service updated!');
  };

  const updatePrice = (itemId: string, serviceKey: string, price: number) => {
    setPricingList(prev => {
      const exists = prev.find(p => p.itemId === itemId && p.serviceKey === serviceKey);
      if (exists) return prev.map(p => p.itemId === itemId && p.serviceKey === serviceKey ? { ...p, price } : p);
      return [...prev, { itemId, serviceKey, price }];
    });
  };

  const getPrice = (itemId: string, serviceKey: string) => {
    return pricingList.find(p => p.itemId === itemId && p.serviceKey === serviceKey)?.price ?? 0;
  };

  const filteredPricingItems = laundryItems.filter(i => i.name.toLowerCase().includes(priceSearch.toLowerCase()));

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-[8px] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC] cursor-pointer">
          <ArrowLeft size={20} className="text-[#64748B]" />
        </button>
        <h1 className="text-[24px] font-['Plus_Jakarta_Sans'] text-[#0F172A]" style={{ fontWeight: 700 }}>Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['items', 'services', 'pricing'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-[48px] px-6 rounded-[8px] font-['DM_Sans'] text-[15px] cursor-pointer transition-all ${tab === t ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'}`}
            style={{ fontWeight: tab === t ? 600 : 400 }}
          >
            {t === 'items' ? '📦 Items' : t === 'services' ? '🔧 Services' : '💰 Pricing'}
          </button>
        ))}
      </div>

      {/* Items Tab */}
      {tab === 'items' && (
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>Laundry Items</h2>
          <p className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-5">Add, edit or remove items that customers can select when creating an order.</p>

          {/* Add form */}
          <div className="flex gap-3 mb-6 p-4 bg-[#F8FAFC] rounded-[10px]">
            <input value={newItemIcon} onChange={e => setNewItemIcon(e.target.value)} placeholder="Icon (emoji)" className="w-[80px] h-[48px] px-3 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[18px] text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item name (e.g. Towel)" className="flex-1 h-[48px] px-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <Button variant="success" size="md" onClick={addItem}><Plus size={18} /> Add Item</Button>
          </div>

          {/* Items list */}
          <div className="space-y-2">
            {laundryItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[#E2E8F0] hover:border-[#94A3B8] transition-colors">
                {editingItem === item.id ? (
                  <>
                    <input value={editItemIcon} onChange={e => setEditItemIcon(e.target.value)} className="w-[60px] h-[40px] px-2 rounded-[6px] border border-[#2563EB] font-['DM_Sans'] text-[18px] text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    <input value={editItemName} onChange={e => setEditItemName(e.target.value)} className="flex-1 h-[40px] px-3 rounded-[6px] border border-[#2563EB] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    <button onClick={saveEditItem} className="w-9 h-9 rounded-[6px] bg-[#16A34A] text-white flex items-center justify-center cursor-pointer hover:bg-[#15803d]"><Check size={16} /></button>
                    <button onClick={() => setEditingItem(null)} className="w-9 h-9 rounded-[6px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0]"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="text-[24px] w-10 text-center">{item.icon}</span>
                    <span className="flex-1 font-['DM_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 500 }}>{item.name}</span>
                    <span className="font-['JetBrains_Mono'] text-[12px] text-[#94A3B8]">{item.id}</span>
                    <button onClick={() => startEditItem(item)} className="w-9 h-9 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center cursor-pointer hover:bg-[#DBEAFE]"><Edit size={16} /></button>
                    <button onClick={() => deleteItem(item.id)} className="w-9 h-9 rounded-[6px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>Laundry Services</h2>
          <p className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-5">Manage the types of services your shop offers.</p>

          {/* Add form */}
          <div className="flex gap-3 mb-6 p-4 bg-[#F8FAFC] rounded-[10px] flex-wrap">
            <input value={newSvcIcon} onChange={e => setNewSvcIcon(e.target.value)} placeholder="Icon" className="w-[80px] h-[48px] px-3 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[18px] text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <input value={newSvcLabel} onChange={e => setNewSvcLabel(e.target.value)} placeholder="Service name (e.g. Steam Press)" className="flex-1 min-w-[180px] h-[48px] px-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <input value={newSvcKey} onChange={e => setNewSvcKey(e.target.value)} placeholder="Key (auto)" className="w-[120px] h-[48px] px-3 rounded-[8px] border border-[#E2E8F0] font-['JetBrains_Mono'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <Button variant="success" size="md" onClick={addService}><Plus size={18} /> Add Service</Button>
          </div>

          {/* Services list */}
          <div className="space-y-2">
            {laundryServices.map(svc => (
              <div key={svc.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[#E2E8F0] hover:border-[#94A3B8] transition-colors">
                {editingSvc === svc.id ? (
                  <>
                    <input value={editSvcIcon} onChange={e => setEditSvcIcon(e.target.value)} className="w-[60px] h-[40px] px-2 rounded-[6px] border border-[#2563EB] text-[18px] text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    <input value={editSvcLabel} onChange={e => setEditSvcLabel(e.target.value)} className="flex-1 h-[40px] px-3 rounded-[6px] border border-[#2563EB] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    <input value={editSvcKey} onChange={e => setEditSvcKey(e.target.value)} className="w-[120px] h-[40px] px-3 rounded-[6px] border border-[#2563EB] font-['JetBrains_Mono'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    <button onClick={saveEditSvc} className="w-9 h-9 rounded-[6px] bg-[#16A34A] text-white flex items-center justify-center cursor-pointer hover:bg-[#15803d]"><Check size={16} /></button>
                    <button onClick={() => setEditingSvc(null)} className="w-9 h-9 rounded-[6px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0]"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="text-[24px] w-10 text-center">{svc.icon}</span>
                    <span className="flex-1 font-['DM_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 500 }}>{svc.label}</span>
                    <span className="font-['JetBrains_Mono'] text-[12px] text-[#94A3B8] bg-[#F8FAFC] px-2 py-1 rounded">{svc.key}</span>
                    <button onClick={() => startEditSvc(svc)} className="w-9 h-9 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center cursor-pointer hover:bg-[#DBEAFE]"><Edit size={16} /></button>
                    <button onClick={() => deleteService(svc.id, svc.key)} className="w-9 h-9 rounded-[6px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {tab === 'pricing' && (
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>Pricing Table</h2>
          <p className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-5">Set prices for each item + service combination. Click any item to edit its prices.</p>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={priceSearch} onChange={e => setPriceSearch(e.target.value)} placeholder="Search items..." className="w-full h-[44px] pl-9 pr-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
          </div>

          <div className="space-y-3">
            {filteredPricingItems.map(item => (
              <div key={item.id} className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
                <button
                  onClick={() => setPricingItemId(pricingItemId === item.id ? null : item.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#F8FAFC] cursor-pointer transition-colors text-left"
                >
                  <span className="text-[22px]">{item.icon}</span>
                  <span className="flex-1 font-['DM_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 600 }}>{item.name}</span>
                  <span className="font-['DM_Sans'] text-[13px] text-[#94A3B8]">{pricingItemId === item.id ? '▲ Collapse' : '▼ Edit Prices'}</span>
                </button>
                {pricingItemId === item.id && (
                  <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {laundryServices.map(svc => (
                      <div key={svc.key} className="bg-[#F8FAFC] rounded-[8px] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[16px]">{svc.icon}</span>
                          <span className="font-['DM_Sans'] text-[13px] text-[#64748B]">{svc.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-['JetBrains_Mono'] text-[14px] text-[#64748B]">₹</span>
                          <input
                            type="number"
                            value={getPrice(item.id, svc.key)}
                            onChange={e => updatePrice(item.id, svc.key, Number(e.target.value))}
                            className="w-full h-[36px] px-2 rounded-[6px] border border-[#E2E8F0] font-['JetBrains_Mono'] text-[15px] text-right focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
