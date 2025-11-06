import { useAppStore } from '../store/appStore';
import { formatNumber } from '../utils/calculations';
import { HiOutlineUserCircle, HiOutlinePencilSquare, HiOutlineChartBar, HiOutlineTrophy, HiOutlineCurrencyDollar, HiOutlineXMark } from 'react-icons/hi2';
import { useState } from 'react';

export default function RightSidebar() {
  const matches = useAppStore((state) => state.matches);
  const settlements = useAppStore((state) => state.settlements);
  const ledgerEntries = useAppStore((state) => state.ledgerEntries);
  const customers = useAppStore((state) => state.customers);
  const currentMatchId = useAppStore((state) => state.currentMatchId);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Calculate stats
  const totalProfitLoss = settlements.reduce((sum, s) => sum + s.netProfit, 0);
  const totalEntries = ledgerEntries.length;
  const totalCustomers = customers.length;

  const currentMatch = matches.find(m => m.id === currentMatchId);

  return (
    <aside className="w-80 shrink-0 hidden xl:block">
      <div className="sticky top-20 space-y-4">
        {/* User Profile Card */}
        <div className="panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4a90e2] to-[#2a5a7a] flex items-center justify-center text-white">
                <HiOutlineUserCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="font-bold text-white">Bookmaker</div>
                <div className="text-xs text-[#cccccc] opacity-75">Admin Account</div>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="p-2 rounded-lg hover:bg-[#333333] transition-colors"
              title="Edit Profile"
            >
              <HiOutlinePencilSquare className="w-5 h-5 text-[#cccccc] hover:text-white transition-colors" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333333]">
              <div className="text-xs text-[#cccccc] opacity-75 mb-1 flex items-center gap-1">
                <HiOutlineChartBar className="w-3 h-3" />
                Total Entries
              </div>
              <div className="text-lg font-bold text-white">{totalEntries}</div>
            </div>
            <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333333]">
              <div className="text-xs text-[#cccccc] opacity-75 mb-1 flex items-center gap-1">
                <HiOutlineUserCircle className="w-3 h-3" />
                Customers
              </div>
              <div className="text-lg font-bold text-white">{totalCustomers}</div>
            </div>
          </div>

          {/* Net P&L */}
          <div className={`p-4 rounded-lg border ${
            totalProfitLoss >= 0 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="text-xs text-[#cccccc] opacity-75 mb-1 flex items-center gap-1">
              <HiOutlineCurrencyDollar className="w-3 h-3" />
              Net Profit/Loss
            </div>
            <div className={`text-2xl font-bold ${
              totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-400'
            }`}>
              {formatNumber(totalProfitLoss)}
            </div>
          </div>
        </div>

        {/* Current Match Info */}
        {currentMatch && (
          <div className="panel">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
              <HiOutlineTrophy className="w-4 h-4" />
              Current Match
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[#cccccc] opacity-75 mb-1">Match Name</div>
                <div className="text-sm font-semibold text-white">{currentMatch.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-[#1a1a1a] rounded-lg border border-[#333333] text-center">
                  <div className="text-xs text-[#cccccc] opacity-75 mb-1">Team A</div>
                  <div className="text-sm font-semibold text-white">{currentMatch.teamA}</div>
                </div>
                <div className="text-[#cccccc] opacity-50 font-bold">VS</div>
                <div className="flex-1 p-2 bg-[#1a1a1a] rounded-lg border border-[#333333] text-center">
                  <div className="text-xs text-[#cccccc] opacity-75 mb-1">Team B</div>
                  <div className="text-sm font-semibold text-white">{currentMatch.teamB}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#333333]">
                <span className="text-xs text-[#cccccc] opacity-75">Status</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  currentMatch.status === 'live' ? 'bg-red-500/20 text-red-400' :
                  currentMatch.status === 'settled' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {currentMatch.status.charAt(0).toUpperCase() + currentMatch.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Settlements */}
        {settlements.length > 0 && (
          <div className="panel">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
              <HiOutlineCurrencyDollar className="w-4 h-4" />
              Recent Settlements
            </h3>
            <div className="space-y-2">
              {settlements.slice(0, 3).map((settlement) => {
                const match = matches.find(m => m.id === settlement.matchId);
                return (
                  <div
                    key={settlement.id}
                    className="p-2 bg-[#1a1a1a] rounded-lg border border-[#333333]"
                  >
                    <div className="text-xs font-semibold text-white mb-1">
                      {match?.name || 'Unknown Match'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#cccccc] opacity-75">
                        {settlement.winningSide === 'A' ? match?.teamA : match?.teamB}
                      </span>
                      <span className={`text-xs font-bold ${
                        settlement.netProfit >= 0 ? 'text-green-500' : 'text-red-400'
                      }`}>
                        {formatNumber(settlement.netProfit)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div 
            className="panel max-w-md w-full animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="btn btn-ghost btn-sm px-2"
                title="Close"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="label">Name</label>
                <input
                  id="profile-name"
                  type="text"
                  className="input-field"
                  placeholder="Bookmaker"
                  defaultValue="Bookmaker"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="label">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  className="input-field"
                  placeholder="admin@bholeco.com"
                />
              </div>

              <div>
                <label htmlFor="profile-phone" className="label">Phone</label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="input-field"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label htmlFor="profile-role" className="label">Role</label>
                <input
                  id="profile-role"
                  type="text"
                  className="input-field"
                  placeholder="Admin Account"
                  defaultValue="Admin Account"
                  readOnly
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="btn btn-add flex-1"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

