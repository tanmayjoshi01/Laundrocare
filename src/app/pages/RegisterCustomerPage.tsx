import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, Customer } from '../store';
import { Button } from '../components/ui';
import { ArrowLeft, Phone, Info, Plus, UserPlus } from 'lucide-react';

export default function RegisterCustomerPage() {
  const { customers, setCustomers, customerCategories, showToast, setSelectedCustomer, saveCustomer } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const selectedCategory = customerCategories.find(c => c.id === categoryId);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(phone.trim())) e.phone = 'Enter a valid 10-digit number';
    else if (customers.some(c => c.phone === phone.trim())) e.phone = 'This number is already registered';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const c: Customer = {
      id: `C${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      totalOrders: 0,
      totalSpent: 0,
      pendingDues: 0,
      lastVisit: new Date().toLocaleDateString('en-CA'),
      active: true,
      categoryId: categoryId || undefined,
      notes: notes.trim() || undefined,
    };
    setCustomers(prev => [c, ...prev]);
    await saveCustomer(c);
    setSelectedCustomer(c);
    showToast(`✅ ${c.name} registered successfully!`);
    navigate('/create-order');
  };

  return (
    <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)] bg-[#F8FAFC]">
      <div className="max-w-xl mx-auto">
        {/* Back */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1 as any)} className="w-10 h-10 rounded-[8px] border border-[#E2E8F0] flex items-center justify-center hover:bg-white cursor-pointer">
            <ArrowLeft size={20} className="text-[#64748B]" />
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[24px] text-[#0F172A]" style={{ fontWeight: 700 }}>Add New Customer</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6 lg:p-8">
          {/* Subtitle */}
          <p className="font-['DM_Sans'] text-[14px] text-[#94A3B8] mb-8 text-center">
            Discount will be applied automatically based on category
          </p>

          {/* Full Name */}
          <div className="mb-5">
            <label className="font-['DM_Sans'] text-[15px] text-[#0F172A] mb-2 block" style={{ fontWeight: 600 }}>Full Name</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
              placeholder="Enter customer name"
              className={`w-full h-[56px] px-5 rounded-[10px] border-2 font-['DM_Sans'] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-colors ${errors.name ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}
            />
            {errors.name && <p className="font-['DM_Sans'] text-[13px] text-[#DC2626] mt-1.5">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-5">
            <label className="font-['DM_Sans'] text-[15px] text-[#0F172A] mb-2 block" style={{ fontWeight: 600 }}>Phone Number</label>
            <div className="relative">
              <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(prev => ({ ...prev, phone: undefined })); }}
                placeholder="Enter 10-digit mobile number"
                type="tel"
                inputMode="numeric"
                className={`w-full h-[60px] pl-12 pr-5 rounded-[10px] border-2 font-['JetBrains_Mono'] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-colors ${errors.phone ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}
              />
            </div>
            {errors.phone && <p className="font-['DM_Sans'] text-[13px] text-[#DC2626] mt-1.5">{errors.phone}</p>}
            {phone.length > 0 && phone.length < 10 && !errors.phone && (
              <p className="font-['DM_Sans'] text-[13px] text-[#D97706] mt-1.5">{10 - phone.length} digits remaining</p>
            )}
          </div>

          {/* Address */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <label className="font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 600 }}>Address</label>
              <span className="font-['DM_Sans'] text-[12px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Optional</span>
            </div>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Building name, area (optional)"
              rows={2}
              className="w-full px-5 py-3.5 rounded-[10px] border-2 border-[#E2E8F0] bg-[#F8FAFC] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
            />
          </div>

          {/* Category Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[17px] text-[#0F172A]" style={{ fontWeight: 700 }}>Customer Category</h3>
              <div className="group relative">
                <Info size={16} className="text-[#94A3B8] cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] bg-[#0F172A] text-white text-[12px] font-['DM_Sans'] p-3 rounded-[8px] hidden group-hover:block z-10">
                  Select a category to auto-apply discount on all future orders for this customer
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              {customerCategories.map(cat => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(isSelected ? '' : cat.id)}
                    className={`p-4 rounded-[12px] border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: cat.color, opacity: 0.25 }} />
                    <div className={`font-['DM_Sans'] text-[15px] ${isSelected ? 'text-[#2563EB]' : 'text-[#0F172A]'}`} style={{ fontWeight: 600 }}>
                      {cat.name}
                    </div>
                    {cat.discount > 0 ? (
                      <div className="font-['JetBrains_Mono'] text-[14px] text-[#16A34A] mt-1" style={{ fontWeight: 600 }}>
                        {cat.discount}% discount
                      </div>
                    ) : (
                      <div className="font-['DM_Sans'] text-[13px] text-[#94A3B8] mt-1">No discount</div>
                    )}
                  </button>
                );
              })}

              {/* Add New Category card */}
              <button
                onClick={() => navigate('/settings?tab=categories')}
                className="p-4 rounded-[12px] border-2 border-dashed border-[#CBD5E1] text-left transition-all cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF] flex flex-col items-center justify-center min-h-[110px]"
              >
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-2">
                  <Plus size={20} className="text-[#2563EB]" />
                </div>
                <div className="font-['DM_Sans'] text-[14px] text-[#64748B]" style={{ fontWeight: 500 }}>Add New Category</div>
              </button>
            </div>
          </div>

          {/* Discount Preview */}
          {selectedCategory && (
            <div className={`mb-6 p-4 rounded-[12px] border-2 ${selectedCategory.discount > 0 ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: selectedCategory.color, opacity: 0.2 }} />
                <div>
                  <div className="font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 600 }}>
                    Selected: {selectedCategory.name}
                  </div>
                  {selectedCategory.discount > 0 ? (
                    <div className="font-['DM_Sans'] text-[14px] text-[#16A34A]" style={{ fontWeight: 500 }}>
                      Discount: <span className="font-['JetBrains_Mono']" style={{ fontWeight: 700 }}>{selectedCategory.discount}%</span> will be applied on all orders
                    </div>
                  ) : (
                    <div className="font-['DM_Sans'] text-[14px] text-[#64748B]">No discount will be applied</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <label className="font-['DM_Sans'] text-[15px] text-[#0F172A]" style={{ fontWeight: 600 }}>Notes</label>
              <span className="font-['DM_Sans'] text-[12px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Optional</span>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special notes about this customer (optional)"
              rows={2}
              className="w-full px-5 py-3.5 rounded-[10px] border-2 border-[#E2E8F0] bg-[#F8FAFC] font-['DM_Sans'] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full" onClick={handleSave}>
              <UserPlus size={20} /> Save Customer
            </Button>
            <button
              onClick={() => navigate(-1 as any)}
              className="w-full h-[52px] rounded-[8px] border-2 border-[#E2E8F0] text-[#64748B] font-['DM_Sans'] text-[15px] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}