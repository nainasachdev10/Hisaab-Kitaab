import Header from './components/Header';
import Navigation from './components/Navigation';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';

type Tab = 'ledger' | 'matches' | 'customers' | 'analytics' | 'tools';

function App() {
  const matches = useAppStore((state) => state.matches);
  const currentMatchId = useAppStore((state) => state.currentMatchId);
  const setCurrentMatch = useAppStore((state) => state.setCurrentMatch);
  const syncLedgerEntryNames = useAppStore((state) => state.syncLedgerEntryNames);
  const [activeTab, setActiveTab] = useState<Tab>('ledger');

  // Initialize with default match if none exists
  useEffect(() => {
    if (matches.length === 0) {
      // Create a default match
      useAppStore.getState().addMatch({
        name: 'Pakistan vs South Africa - Winner',
        teamA: 'Pakistan',
        teamB: 'South Africa',
      });
    } else if (!currentMatchId) {
      // Set first match as current if none selected
      setCurrentMatch(matches[0].id);
    }
  }, [matches.length, currentMatchId, setCurrentMatch]);

  // Sync ledger entry names with customer names on app load
  useEffect(() => {
    syncLedgerEntryNames();
  }, [syncLedgerEntryNames]);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = () => {
      // This can be used for programmatic navigation if needed
    };
    const handleQuickAction = (e: CustomEvent<string>) => {
      const action = e.detail;
      // Store the action with a timestamp so components can check it after mounting
      (window as any).__lastQuickAction = action;
      (window as any).__lastQuickActionTime = Date.now();
      // Mark that this action hasn't been processed yet
      (window as any).__quickActionProcessed = false;
      
      if (action === 'new-match') {
        setActiveTab('matches');
        // Dispatch event again after navigation to ensure MatchSelector receives it
        setTimeout(() => {
          // Only dispatch if the action hasn't been processed/canceled
          if ((window as any).__lastQuickAction === 'new-match' && 
              !(window as any).__quickActionProcessed) {
            window.dispatchEvent(new CustomEvent('quick-action', { detail: 'new-match' }));
          }
        }, 200);
      } else if (action === 'new-customer') {
        setActiveTab('customers');
        setTimeout(() => {
          // Only dispatch if the action hasn't been processed/canceled
          if ((window as any).__lastQuickAction === 'new-customer' && 
              !(window as any).__quickActionProcessed) {
            window.dispatchEvent(new CustomEvent('quick-action', { detail: 'new-customer' }));
          }
        }, 200);
      } else if (action === 'analytics') {
        setActiveTab('analytics');
      }
    };
    window.addEventListener('navigate', handleNavigate as EventListener);
    window.addEventListener('quick-action', handleQuickAction as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
      window.removeEventListener('quick-action', handleQuickAction as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 pb-20 md:pb-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <LeftSidebar />
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </main>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

export default App;
