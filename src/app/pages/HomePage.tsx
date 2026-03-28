import { useNavigate } from 'react-router';
import { Button } from '../components/ui';
import logoImg from '../../assets/29314f96b0646ef99b94a47ff8eedab177634f16.png';
import { Phone, MapPin, Clock, ChevronRight } from 'lucide-react';

const heroImg = 'https://images.unsplash.com/photo-1697251162315-f975b77eefc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGxhdW5kcnklMjBjbG90aGVzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NDU4Nzg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

const PRICING_DATA = [
  { item: 'Shirt', wash: 10, iron: 8, dryclean: 40 },
  { item: 'Pant', wash: 15, iron: 10, dryclean: 50 },
  { item: 'Saree', wash: 25, iron: 15, dryclean: 80 },
  { item: 'Blanket', wash: 60, iron: 30, dryclean: 120 },
  { item: 'Kurta', wash: 12, iron: 8, dryclean: 45 },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="LaundroCare" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-[20px] font-['Plus_Jakarta_Sans'] text-[#2563EB]" style={{ fontWeight: 700 }}>LaundroCare</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+919876543210" className="flex items-center gap-2 text-[#0F172A] font-['DM_Sans'] text-[15px]">
              <Phone size={18} className="text-[#2563EB]" /> +91 98765 43210
            </a>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>Admin Login</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-[40px] font-['Plus_Jakarta_Sans'] text-[#0F172A] leading-tight" style={{ fontWeight: 800 }}>
            Professional Laundry,<br />Done Right
          </h1>
          <p className="mt-3 text-[20px] text-[#2563EB] font-['DM_Sans']" style={{ fontWeight: 500 }}>Clean Clothes, Clean Confidence</p>
          <p className="mt-4 text-[16px] text-[#64748B] font-['DM_Sans'] max-w-md">
            Trusted by families in your city. Fast turnaround. Doorstep pickup available.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              📋 View Pricing
            </Button>
            <a href="tel:+919876543210">
              <Button variant="success-outline" size="lg">📞 Call Now</Button>
            </a>
            <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>🔐 Admin Login</Button>
          </div>
        </div>
        <div className="flex justify-center">
          <img src={heroImg} alt="Laundry service" className="rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-h-[400px] object-cover w-full" />
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[28px] font-['Plus_Jakarta_Sans'] text-[#0F172A] text-center" style={{ fontWeight: 700 }}>What We Do</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Washing', desc: 'Deep clean for all fabric types', bg: '#EFF6FF' },
              { title: 'Ironing', desc: 'Crisp and wrinkle-free finish', bg: '#F0FDF4' },
              { title: 'Dry Cleaning', desc: 'For delicate and premium clothes', bg: '#FFFBEB' },
            ].map(s => (
              <div key={s.title} className="rounded-[12px] p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)]" style={{ backgroundColor: s.bg }}>
                <h3 className="text-[20px] font-['Plus_Jakarta_Sans'] text-[#0F172A]" style={{ fontWeight: 700 }}>{s.title}</h3>
                <p className="mt-2 text-[15px] text-[#64748B] font-['DM_Sans']">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-[28px] font-['Plus_Jakarta_Sans'] text-[#0F172A] text-center" style={{ fontWeight: 700 }}>Simple, Transparent Pricing</h2>
        <div className="mt-10 bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2563EB] text-white">
                <th className="text-left p-4 font-['DM_Sans'] text-[15px]">Item</th>
                <th className="text-right p-4 font-['DM_Sans'] text-[15px]">Wash</th>
                <th className="text-right p-4 font-['DM_Sans'] text-[15px]">Iron</th>
                <th className="text-right p-4 font-['DM_Sans'] text-[15px]">Dry Clean</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_DATA.map((row, i) => (
                <tr key={row.item} className={i % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                  <td className="p-4 font-['DM_Sans'] text-[15px] text-[#0F172A]">{row.item}</td>
                  <td className="p-4 text-right font-['JetBrains_Mono'] text-[15px] text-[#0F172A]">₹{row.wash}</td>
                  <td className="p-4 text-right font-['JetBrains_Mono'] text-[15px] text-[#0F172A]">₹{row.iron}</td>
                  <td className="p-4 text-right font-['JetBrains_Mono'] text-[15px] text-[#0F172A]">₹{row.dryclean}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-[14px] text-[#64748B] font-['DM_Sans']">
          Prices may vary for heavy or premium items. Contact us for bulk orders.
        </p>
      </section>

      {/* Contact */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-[28px] font-['Plus_Jakarta_Sans'] text-[#0F172A]" style={{ fontWeight: 700 }}>Contact Us</h2>
            <div className="mt-6 space-y-4 font-['DM_Sans'] text-[15px] text-[#0F172A]">
              <div className="flex items-start gap-3"><MapPin size={20} className="text-[#2563EB] mt-0.5" /> 12, Market Road, Near Bus Stand, City</div>
              <div className="flex items-center gap-3"><Phone size={20} className="text-[#2563EB]" /> +91 98765 43210 / +91 98765 43211</div>
              <div className="flex items-center gap-3"><Clock size={20} className="text-[#2563EB]" /> Mon–Sat: 8:00 AM – 9:00 PM</div>
            </div>
            <div className="mt-6">
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-[52px] px-6 rounded-[8px] bg-[#25D366] text-white hover:bg-[#1ebe57] transition-colors font-['DM_Sans']">
                📱 Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="bg-[#F1F5F9] rounded-[12px] flex items-center justify-center min-h-[280px]">
            <div className="text-center text-[#64748B] font-['DM_Sans']">
              <MapPin size={48} className="mx-auto mb-3 text-[#2563EB]" />
              <p className="text-[15px]">Google Map Placeholder</p>
              <p className="text-[13px]">12, Market Road, City</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-6 text-center font-['DM_Sans'] text-[14px]">
        © 2025 LaundroCare. All rights reserved.
      </footer>
    </div>
  );
}