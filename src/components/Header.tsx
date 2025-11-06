import { HiOutlineClipboardDocumentList, HiOutlineTrophy, HiOutlineUsers, HiOutlineChartBar, HiOutlineCog6Tooth, HiOutlineUserCircle, HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

type Tab = 'ledger' | 'matches' | 'customers' | 'analytics' | 'tools';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const tabs = [
    { id: 'ledger' as Tab, label: 'Ledger', icon: HiOutlineClipboardDocumentList },
    { id: 'matches' as Tab, label: 'Matches', icon: HiOutlineTrophy },
    { id: 'customers' as Tab, label: 'Customers', icon: HiOutlineUsers },
    { id: 'analytics' as Tab, label: 'Analytics', icon: HiOutlineChartBar },
    { id: 'tools' as Tab, label: 'Tools', icon: HiOutlineCog6Tooth },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`sticky top-0 z-50 bg-[#1a1a1a] border-b transition-all duration-300 ${
        isScrolled ? 'border-[#333333] shadow-xl' : 'border-[#333333] shadow-lg'
      }`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
                BHOLE Co
              </div>
              <div className="hidden sm:block text-xs sm:text-sm text-[#cccccc] opacity-75">
                Hisaab Kitaab
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-1 items-center justify-center gap-1.5 lg:gap-2 px-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`group relative px-3 lg:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 lg:gap-2 ${
                      isActive
                        ? 'bg-[#4a90e2] text-white shadow-md shadow-[#4a90e2]/30 scale-105'
                        : 'bg-[#2a2a2a] text-[#cccccc] border border-[#333333] hover:bg-[#333333] hover:border-[#4a90e2]/50 hover:text-white hover:scale-105'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button & User Area */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-[#2a2a2a] border border-[#333333] hover:bg-[#333333] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <HiOutlineXMark className="w-5 h-5 text-white" />
                ) : (
                  <HiOutlineBars3 className="w-5 h-5 text-white" />
                )}
              </button>

              {/* User Profile */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2a2a2a] border border-[#333333] flex items-center justify-center cursor-pointer hover:bg-[#333333] transition-all hover:scale-105">
                <HiOutlineUserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav 
            className="absolute top-14 left-0 right-0 bg-[#1a1a1a] border-b border-[#333333] shadow-xl animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-[#4a90e2] text-white shadow-md'
                        : 'bg-[#2a2a2a] text-[#cccccc] border border-[#333333] hover:bg-[#333333] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] border-t border-[#333333] shadow-2xl md:hidden safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-0.5 px-0.5 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-[#4a90e2] bg-[#4a90e2]/10'
                    : 'text-[#cccccc] active:text-white active:bg-[#2a2a2a]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium leading-tight ${isActive ? 'text-[#4a90e2]' : 'text-[#999999]'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#4a90e2] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
