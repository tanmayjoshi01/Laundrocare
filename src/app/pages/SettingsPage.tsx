import { useState } from 'react';
import { useStore, LaundryItem, LaundryService } from '../store';
import { Button } from '../components/ui';
import { Plus, Trash2, Edit, Check, X, Search, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function SettingsPage() {
  const {
    laundryItems, setLaundryItems,
    laundryServices, setLaundryServices,
    pricingList, setPricingList,
    showToast, customerCategories, setCustomerCategories,
    saveCategory, deleteCategory: deleteCategoryInStore,
    saveLaundryItem, deleteLaundryItem,
    saveLaundryService, deleteLaundryService,
    savePricing,
  } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pricing' | 'categories'>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('tab') as any) || 'pricing';
  });

  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');

  const [newSvcLabel, setNewSvcLabel] = useState('');
  const [editingSvc, setEditingSvc] = useState<string | null>(null);
  const [editSvcLabel, setEditSvcLabel] = useState('');

  const [pricingItemId, setPricingItemId] = useState<string | null>(null);
  const [priceSearch, setPriceSearch] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showServices, setShowServices] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDiscount, setNewCatDiscount] = useState(0);
  const [newCatColor, setNewCatColor] = useState('#2563EB');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDiscount, setEditCatDiscount] = useState(0);
  const [editCatColor, setEditCatColor] = useState('');

  const addItem = async () => {
    if (!newItemName.trim()) return;
    const id = `i${Date.now()}`;
    const newItem = { id, name: newItemName.trim() };
    setLaundryItems(prev => [...prev, newItem]);
    await saveLaundryItem(newItem);
    const newEntries = laundryServices.map(s => ({ itemId: id, serviceKey: s.key, price: 0 }));
    setPricingList(prev => [...prev, ...newEntries]);
    setNewItemName('');
    setShowAddItem(false);
    showToast('✅ Item added!');
  };

  const deleteItem = async (id: string) => {
    setLaundryItems(prev => prev.filter(i => i.id !== id));
    await deleteLaundryItem(id);
    setPricingList(prev => prev.filter(p => p.itemId !== id));
    if (pricingItemId === id) setPricingItemId(null);
    showToast('🗑️ Item deleted');
  };

  const startEditItem = (item: LaundryItem) => {
    setEditingItem(item.id);
    setEditItemName(item.name);
  };

  const saveEditItem = async () => {
    if (!editingItem || !editItemName.trim()) return;
    setLaundryItems(prev => prev.map(i => i.id === editingItem ? { ...i, name: editItemName.trim() } : i));
    await saveLaundryItem({ id: editingItem, name: editItemName.trim() });
    setEditingItem(null);
    showToast('✅ Item updated!');
  };

  const addService = async () => {
    if (!newSvcLabel.trim()) return;
    const key = newSvcLabel.trim().toLowerCase().replace(/\s+/g, '');
    const id = `s${Date.now()}`;
    const newSvc = { id, key, label: newSvcLabel.trim() };
    setLaundryServices(prev => [...prev, newSvc]);
    await saveLaundryService(newSvc);
    const newEntries = laundryItems.map(i => ({ itemId: i.id, serviceKey: key, price: 0 }));
    setPricingList(prev => [...prev, ...newEntries]);
    setNewSvcLabel('');
    setShowAddService(false);
    showToast('✅ Service added!');
  };

  const deleteService = async (id: string, key: string) => {
    setLaundryServices(prev => prev.filter(s => s.id !== id));
    await deleteLaundryService(id, key);
    setPricingList(prev => prev.filter(p => p.serviceKey !== key));
    showToast('🗑️ Service deleted');
  };

  const startEditSvc = (svc: LaundryService) => {
    setEditingSvc(svc.id);
    setEditSvcLabel(svc.label);
  };

  const saveEditSvc = async () => {
    if (!editingSvc || !editSvcLabel.trim()) return;
    const oldSvc = laundryServices.find(s => s.id === editingSvc);
    const newKey = editSvcLabel.trim().toLowerCase().replace(/\s+/g, '');
    setLaundryServices(prev => prev.map(s => s.id === editingSvc ? { ...s, key: newKey, label: editSvcLabel.trim() } : s));
    await saveLaundryService({ id: editingSvc, key: newKey, label: editSvcLabel.trim() });
    if (oldSvc && oldSvc.key !== newKey) {
      setPricingList(prev => prev.map(p => p.serviceKey === oldSvc.key ? { ...p, serviceKey: newKey } : p));
    }
    setEditingSvc(null);
    showToast('✅ Service updated!');
  };

  const updatePrice = async (itemId: string, serviceKey: string, price: number) => {
    setPricingList(prev => {
      const exists = prev.find(p => p.itemId === itemId && p.serviceKey === serviceKey);
      if (exists) return prev.map(p => p.itemId === itemId && p.serviceKey === serviceKey ? { ...p, price } : p);
      return [...prev, { itemId, serviceKey, price }];
    });
    await savePricing(itemId, serviceKey, price);
  };

  const getPrice = (itemId: string, serviceKey: string) => {
    return pricingList.find(p => p.itemId === itemId && p.serviceKey === serviceKey)?.price ?? 0;
  };

  const filteredPricingItems = laundryItems.filter(i => i.name.toLowerCase().includes(priceSearch.toLowerCase()));

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const id = `c${Date.now()}`;
    const newCat = { id, name: newCatName.trim(), discount: newCatDiscount, color: newCatColor };
    setCustomerCategories(prev => [...prev, newCat]);
    await saveCategory(newCat);
    setNewCatName(''); setNewCatDiscount(0); setNewCatColor('#2563EB');
    showToast('✅ Category added!');
  };

  const handleDeleteCategory = async (id: string) => {
    setCustomerCategories(prev => prev.filter(c => c.id !== id));
    await deleteCategoryInStore(id);
    showToast('🗑️ Category deleted');
  };

  const startEditCat = (cat: { id: string, name: string, discount: number, color: string }) => {
    setEditingCat(cat.id);
    setEditCatName(cat.name);
    setEditCatDiscount(cat.discount);
    setEditCatColor(cat.color);
  };

  const saveEditCat = async () => {
    if (!editingCat || !editCatName.trim()) return;
    const updatedCat = { id: editingCat, name: editCatName.trim(), discount: editCatDiscount, color: editCatColor };
    setCustomerCategories(prev => prev.map(c => c.id === editingCat ? { ...c, ...updatedCat } : c));
    await saveCategory(updatedCat);
    setEditingCat(null);
    showToast('✅ Category updated!');
  };

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
        {(['pricing', 'categories'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-[52px] px-6 rounded-[8px] font-['DM_Sans'] text-[15px] cursor-pointer transition-all ${tab === t ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'}`}
            style={{ fontWeight: tab === t ? 600 : 400 }}
          >
            {t === 'pricing' ? 'Items, Services & Pricing' : 'Customer Categories'}
          </button>
        ))}
      </div>

      {/* Combined Items, Services & Pricing Tab */}
      {tab === 'pricing' && (
        <div className="space-y-6">
          {/* Manage Services */}
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
            <button
              onClick={() => setShowServices(!showServices)}
              className="w-full flex items-center justify-between p-5 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
            >
              <div className="text-left">
                <h2 className="font-['Plus_Jakarta_Sans'] text-[17px] text-[#0F172A]" style={{ fontWeight: 700 }}>Manage Services</h2>
                <p className="font-['DM_Sans'] text-[13px] text-[#64748B]">{laundryServices.length} services configured</p>
              </div>
              {showServices ? <ChevronUp size={20} className="text-[#94A3B8]" /> : <ChevronDown size={20} className="text-[#94A3B8]" />}
            </button>

            {showServices && (
              <div className="px-5 pb-5 border-t border-[#E2E8F0]">
                <div className="pt-4 space-y-2 mb-4">
                  {laundryServices.map(svc => (
                    <div key={svc.id} className="flex items-center gap-3 p-3 rounded-[10px] border border-[#E2E8F0] hover:border-[#94A3B8] transition-colors">
                      {editingSvc === svc.id ? (
                        <>
                          <input value={editSvcLabel} onChange={e => setEditSvcLabel(e.target.value)} className="flex-1 h-[40px] px-3 rounded-[6px] border border-[#2563EB] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                          <button onClick={saveEditSvc} className="w-9 h-9 rounded-[6px] bg-[#16A34A] text-white flex items-center justify-center cursor-pointer hover:bg-[#15803d]"><Check size={16} /></button>
                          <button onClick={() => setEditingSvc(null)} className="w-9 h-9 rounded-[6px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0]"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 500 }}>{svc.label}</span>
                          <button onClick={() => startEditSvc(svc)} className="w-9 h-9 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center cursor-pointer hover:bg-[#DBEAFE]"><Edit size={16} /></button>
                          <button onClick={() => deleteService(svc.id, svc.key)} className="w-9 h-9 rounded-[6px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {showAddService ? (
                  <div className="flex gap-3 p-4 bg-[#F0FDF4] rounded-[10px] border border-[#BBF7D0]">
                    <input value={newSvcLabel} onChange={e => setNewSvcLabel(e.target.value)} placeholder="Service name (e.g. Steam Press)" className="flex-1 h-[48px] px-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#16A34A]" />
                    <Button variant="success" size="md" onClick={addService}><Check size={18} /> Save</Button>
                    <Button variant="secondary" size="md" onClick={() => setShowAddService(false)}><X size={18} /></Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddService(true)}
                    className="w-full h-[48px] rounded-[8px] border-2 border-dashed border-[#16A34A] text-[#16A34A] font-['DM_Sans'] text-[15px] flex items-center justify-center gap-2 hover:bg-[#F0FDF4] cursor-pointer transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <Plus size={18} /> Add New Service
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Items & Pricing */}
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A]" style={{ fontWeight: 700 }}>Items & Pricing</h2>
              <span className="font-['DM_Sans'] text-[13px] text-[#94A3B8]">{laundryItems.length} items · {laundryServices.length} services</span>
            </div>
            <p className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-5">Tap any item to set its price for each service. Edit or delete items with the buttons.</p>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input value={priceSearch} onChange={e => setPriceSearch(e.target.value)} placeholder="Search items..." className="w-full h-[48px] pl-10 pr-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            </div>

            <div className="space-y-3 mb-5">
              {filteredPricingItems.map(item => (
                <div key={item.id} className={`border rounded-[12px] overflow-hidden transition-colors ${pricingItemId === item.id ? 'border-[#2563EB] bg-[#FAFBFF]' : 'border-[#E2E8F0]'}`}>
                  {editingItem === item.id ? (
                    <div className="flex items-center gap-3 p-4">
                      <input value={editItemName} onChange={e => setEditItemName(e.target.value)} className="flex-1 h-[44px] px-3 rounded-[6px] border-2 border-[#2563EB] font-['DM_Sans'] text-[15px] focus:outline-none" />
                      <button onClick={saveEditItem} className="w-10 h-10 rounded-[8px] bg-[#16A34A] text-white flex items-center justify-center cursor-pointer hover:bg-[#15803d]"><Check size={18} /></button>
                      <button onClick={() => setEditingItem(null)} className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0]"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4">
                      <button
                        onClick={() => setPricingItemId(pricingItemId === item.id ? null : item.id)}
                        className="flex items-center gap-3 flex-1 text-left cursor-pointer min-w-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-['DM_Sans'] text-[16px] text-[#0F172A] truncate" style={{ fontWeight: 600 }}>{item.name}</div>
                          <div className="font-['DM_Sans'] text-[12px] text-[#94A3B8]">
                            {laundryServices.map(s => `${s.label}: ₹${getPrice(item.id, s.key)}`).join(' · ')}
                          </div>
                        </div>
                        {pricingItemId === item.id
                          ? <ChevronUp size={18} className="text-[#2563EB] shrink-0" />
                          : <ChevronDown size={18} className="text-[#94A3B8] shrink-0" />
                        }
                      </button>
                      <button onClick={() => startEditItem(item)} className="w-9 h-9 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center cursor-pointer hover:bg-[#DBEAFE] shrink-0"><Edit size={16} /></button>
                      <button onClick={() => deleteItem(item.id)} className="w-9 h-9 rounded-[6px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2] shrink-0"><Trash2 size={16} /></button>
                    </div>
                  )}

                  {pricingItemId === item.id && editingItem !== item.id && (
                    <div className="px-4 pb-4 border-t border-[#E2E8F0]">
                      <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {laundryServices.map(svc => (
                          <div key={svc.key} className="bg-white rounded-[10px] p-3 border border-[#E2E8F0]">
                            <div className="mb-2">
                              <span className="font-['DM_Sans'] text-[13px] text-[#64748B]" style={{ fontWeight: 500 }}>{svc.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-['JetBrains_Mono'] text-[15px] text-[#64748B]">₹</span>
                              <input
                                type="number"
                                value={getPrice(item.id, svc.key)}
                                onChange={e => updatePrice(item.id, svc.key, Number(e.target.value))}
                                className="w-full h-[40px] px-2 rounded-[6px] border border-[#E2E8F0] font-['JetBrains_Mono'] text-[16px] text-right focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredPricingItems.length === 0 && priceSearch && (
                <p className="text-center py-6 font-['DM_Sans'] text-[14px] text-[#94A3B8]">No items match "{priceSearch}"</p>
              )}
            </div>

            {showAddItem ? (
              <div className="flex gap-3 p-4 bg-[#F0FDF4] rounded-[10px] border border-[#BBF7D0]">
                <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item name (e.g. Towel)" className="flex-1 h-[52px] px-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#16A34A]" />
                <Button variant="success" size="md" onClick={addItem}><Check size={18} /> Save</Button>
                <Button variant="secondary" size="md" onClick={() => { setShowAddItem(false); setNewItemName(''); }}><X size={18} /></Button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddItem(true)}
                className="w-full h-[52px] rounded-[10px] border-2 border-dashed border-[#2563EB] text-[#2563EB] font-['DM_Sans'] text-[15px] flex items-center justify-center gap-2 hover:bg-[#EFF6FF] cursor-pointer transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus size={20} /> Add New Item
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6">
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>Customer Categories</h2>
          <p className="font-['DM_Sans'] text-[14px] text-[#64748B] mb-5">Manage customer categories with discounts and colors.</p>

          <div className="flex gap-3 mb-6 p-4 bg-[#F8FAFC] rounded-[10px] flex-wrap">
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name (e.g. VIP)" className="flex-1 min-w-[180px] h-[48px] px-4 rounded-[8px] border border-[#E2E8F0] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <input value={newCatDiscount} onChange={e => setNewCatDiscount(Number(e.target.value))} placeholder="Discount (%)" className="w-[120px] h-[48px] px-3 rounded-[8px] border border-[#E2E8F0] font-['JetBrains_Mono'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" type="number" />
            <input value={newCatColor} onChange={e => setNewCatColor(e.target.value)} placeholder="Color" className="w-[120px] h-[48px] px-3 rounded-[8px] border border-[#E2E8F0] font-['JetBrains_Mono'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" type="color" />
            <Button variant="success" size="md" onClick={addCategory}><Plus size={18} /> Add Category</Button>
          </div>

          <div className="space-y-2">
            {customerCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[#E2E8F0] hover:border-[#94A3B8] transition-colors">
                {editingCat === cat.id ? (
                  <>
                    <input value={editCatName} onChange={e => setEditCatName(e.target.value)} className="flex-1 h-[40px] px-3 rounded-[6px] border border-[#2563EB] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                    <input value={editCatDiscount} onChange={e => setEditCatDiscount(Number(e.target.value))} placeholder="Discount (%)" className="w-[120px] h-[40px] px-3 rounded-[6px] border border-[#2563EB] font-['JetBrains_Mono'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" type="number" />
                    <input value={editCatColor} onChange={e => setEditCatColor(e.target.value)} placeholder="Color" className="w-[120px] h-[40px] px-3 rounded-[6px] border border-[#2563EB] font-['JetBrains_Mono'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" type="color" />
                    <button onClick={saveEditCat} className="w-9 h-9 rounded-[6px] bg-[#16A34A] text-white flex items-center justify-center cursor-pointer hover:bg-[#15803d]"><Check size={16} /></button>
                    <button onClick={() => setEditingCat(null)} className="w-9 h-9 rounded-[6px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0]"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 font-['DM_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 500 }}>{cat.name}</span>
                    <span className="font-['JetBrains_Mono'] text-[13px] text-[#16A34A] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#BBF7D0]" style={{ fontWeight: 600 }}>{cat.discount}%</span>
                    <button onClick={() => startEditCat(cat)} className="w-9 h-9 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center cursor-pointer hover:bg-[#DBEAFE]"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="w-9 h-9 rounded-[6px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
