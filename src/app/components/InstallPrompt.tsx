import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (isInStandaloneMode) {
      setIsInstalled(true)
      return
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    if (ios) {
      // Show iOS instructions after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
    } else {
      // Android: listen for browser install prompt
      const handler = (e: Event) => {
        e.preventDefault()
        setInstallPrompt(e as BeforeInstallPromptEvent)
        setShowBanner(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
        setIsInstalled(true)
      }
      setInstallPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showBanner || isInstalled) return null

  // iOS instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[9998] p-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <div className="bg-white rounded-[16px] shadow-[0_-4px_24px_rgba(0,0,0,0.15)] border border-[#E2E8F0] p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[12px] bg-[#2563EB] flex items-center justify-center text-[24px]">
                🧺
              </div>
              <div>
                <div className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 700 }}>
                  Install LaundroCare
                </div>
                <div className="font-['DM_Sans'] text-[12px] text-[#64748B]">
                  Add to home screen for app experience
                </div>
              </div>
            </div>
            <button onClick={handleDismiss} className="w-8 h-8 flex items-center justify-center text-[#94A3B8] cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <div className="bg-[#F8FAFC] rounded-[10px] p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] flex items-center justify-center shrink-0" style={{ fontWeight: 700 }}>1</span>
              <span className="font-['DM_Sans'] text-[13px] text-[#0F172A]">Tap the <strong>Share</strong> button at the bottom of Safari</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] flex items-center justify-center shrink-0" style={{ fontWeight: 700 }}>2</span>
              <span className="font-['DM_Sans'] text-[13px] text-[#0F172A]">Scroll down and tap <strong>"Add to Home Screen"</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] flex items-center justify-center shrink-0" style={{ fontWeight: 700 }}>3</span>
              <span className="font-['DM_Sans'] text-[13px] text-[#0F172A]">Tap <strong>"Add"</strong> — app icon appears on home screen</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Android install banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] p-4">
      <div className="bg-white rounded-[16px] shadow-[0_-4px_24px_rgba(0,0,0,0.15)] border border-[#E2E8F0] p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#2563EB] flex items-center justify-center text-[24px] shrink-0">
            🧺
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#0F172A]" style={{ fontWeight: 700 }}>
              Install LaundroCare
            </div>
            <div className="font-['DM_Sans'] text-[12px] text-[#64748B]">
              Add to home screen — works like a real app
            </div>
          </div>
          <button onClick={handleDismiss} className="w-8 h-8 flex items-center justify-center text-[#94A3B8] cursor-pointer shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDismiss}
            className="flex-1 h-[48px] rounded-[10px] border border-[#E2E8F0] font-['DM_Sans'] text-[14px] text-[#64748B] cursor-pointer hover:bg-[#F8FAFC] transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 h-[48px] rounded-[10px] bg-[#2563EB] text-white font-['DM_Sans'] text-[14px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#1d4ed8] transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Download size={16} />
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}
