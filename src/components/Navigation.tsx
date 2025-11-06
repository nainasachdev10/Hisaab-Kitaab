import AnalyticsDashboard from './AnalyticsDashboard';
import MatchSelector from './MatchSelector';
import CustomerManager from './CustomerManager';
import LedgerPanel from './LedgerPanel';
import ToolsPage from './ToolsPage';

type Tab = 'ledger' | 'matches' | 'customers' | 'analytics' | 'tools';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="tab-content">
      {activeTab === 'ledger' && <LedgerPanel onNavigateToMatches={() => onTabChange('matches')} />}
      {activeTab === 'matches' && <MatchSelector />}
      {activeTab === 'customers' && <CustomerManager />}
      {activeTab === 'analytics' && <AnalyticsDashboard />}
      {activeTab === 'tools' && <ToolsPage />}
    </div>
  );
}
