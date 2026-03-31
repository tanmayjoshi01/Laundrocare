import { useNavigate } from 'react-router';
import { Button } from '../components/ui';
import logoImg from '../../assets/29314f96b0646ef99b94a47ff8eedab177634f16.png';
import { Phone, MapPin, Clock, ChevronRight } from 'lucide-react';

import heroImg from '../../assets/29314f96b0646ef99b94a47ff8eedab177634f16.png';


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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between gap-2">

          {/* Logo — left side */}
          <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logoImg} alt="LaundroCare" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover" />
            <span
              className="text-[16px] sm:text-[20px] font-['Plus_Jakarta_Sans'] text-[#2563EB]"
              style={{ fontWeight: 700 }}
            >
              LaundroCare
            </span>
          </div>

          {/* Right side — phone hidden on very small screens */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <a
              href="tel:+919860185009"
              className="hidden sm:flex items-center gap-2 text-[#0F172A] font-['DM_Sans'] text-[14px]"
            >
              <Phone size={16} className="text-[#2563EB]" />
              +91 9860185009
            </a>
            {/* Phone icon only on mobile — no number text */}
            <a
              href="tel:+919860185009"
              className="flex sm:hidden w-9 h-9 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#2563EB]"
            >
              <Phone size={18} />
            </a>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
              <span className="hidden xs:inline">Admin </span>Admin Login
            </Button>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="relative w-full min-h-[400px] py-10 px-6 sm:p-8 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between bg-white rounded-2xl shadow-xl overflow-hidden gap-8">
        
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-[32px] sm:text-[40px] font-['Plus_Jakarta_Sans'] text-[#0F172A] leading-tight" style={{ fontWeight: 800 }}>
            Professional Laundry,<br className="hidden sm:block" />Done Right
          </h1>
          <p className="mt-3 text-[18px] sm:text-[20px] text-[#2563EB] font-['DM_Sans']" style={{ fontWeight: 500 }}>Clean Clothes, Clean Confidence</p>
          <p className="mt-4 text-[15px] sm:text-[16px] text-[#64748B] font-['DM_Sans'] max-w-md mx-auto md:mx-0">
            Trusted by families in your city. Fast turnaround. Doorstep pickup available.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start">
            <Button variant="primary" size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              📋 View Pricing
            </Button>
            <a href="tel:+919860185009" className="w-full sm:w-auto">
              <Button variant="success-outline" size="lg" className="w-full">📞 Call Now</Button>
            </a>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center pb-4 md:pb-0">
          <img src={heroImg} alt="Laundry service" className="rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-[200px] md:max-w-full max-h-[300px] md:max-h-[400px] object-cover" />
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
      <section id="pricing" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-[24px] sm:text-[28px] font-['Plus_Jakarta_Sans'] text-[#0F172A] text-center" style={{ fontWeight: 700 }}>Simple, Transparent Pricing</h2>
        <div className="mt-10 bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)] overflow-x-auto">
          <table className="w-full min-w-[500px]">
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
              <div className="flex items-start gap-3"><MapPin size={20} className="text-[#2563EB] mt-0.5" /> Near effort the gym, Shivaji Nagar, Kolhapur - Ratnagiri Road, Ratnagiri 415612</div>
              <div className="flex items-center gap-3"><Phone size={20} className="text-[#2563EB]" /> +91 9860185009 / +91 9422029929</div>
              <div className="flex items-center gap-3"><Clock size={20} className="text-[#2563EB]" /> Mon–Sat: 8:00 AM – 8:00 PM</div>
            </div>
            <div className="mt-6">
              <a href="https://wa.me/9860185009" target="_blank" style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="#25D366">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
          {/* --- COPY STARTING HERE --- */}
          <div className="w-full h-[450px] rounded-[12px] overflow-hidden shadow-lg border border-gray-100 relative group">

            {/* The Visual Map (The one you already have) */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.0760453303666!2d73.318043675037!3d16.99530438383822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be01604786bdcb5%3A0x1eb03533be70423d!2sYashodeep%20Complex!5e0!3m2!1sen!2sin!4v1740756312456!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"

            ></iframe>

            {/* Floating "Get Directions" Button to show the Blue Line Route */}
            <button
              onClick={() => {
                const destination = "Yashodeep+Complex+Ratnagiri";
                const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
                window.open(url, '_blank');
              }}
              className="absolute bottom-4 right-4 bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
            >
              <span>📍 View Route</span>
            </button>
          </div>
          {/* --- COPY ENDING HERE --- */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-6 text-center font-['DM_Sans'] text-[14px]">
        © 2025 LaundroCare. All rights reserved.
      </footer>
    </div>
  );
}