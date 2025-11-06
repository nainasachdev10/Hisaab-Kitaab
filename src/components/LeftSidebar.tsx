import { useAppStore } from '../store/appStore';
import { HiOutlineFire, HiOutlinePlus, HiOutlineUserPlus, HiOutlineChartBar, HiOutlineTrophy, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { FaFutbol } from 'react-icons/fa';
import { MdLiveTv } from 'react-icons/md';

export default function LeftSidebar() {
  const matches = useAppStore((state) => state.matches);
  const getLedgerEntriesByMatch = useAppStore((state) => state.getLedgerEntriesByMatch);

  // Get live/completed matches
  const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'completed').slice(0, 3);

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-4">
        {/* Live Matches */}
        <div className="panel">
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
            <MdLiveTv className="w-4 h-4 text-red-400" />
            Live Matches
          </h3>
          {liveMatches.length === 0 ? (
            <div className="text-center py-8">
              <FaFutbol className="w-12 h-12 mx-auto mb-2 text-[#cccccc] opacity-40" />
              <div className="text-xs text-[#cccccc] opacity-60">
                No live matches
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {liveMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333333]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-white line-clamp-1">
                      {match.name}
                    </div>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs flex items-center gap-1">
                      <MdLiveTv className="w-3 h-3" />
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#cccccc] opacity-75 mb-1">{match.teamA}</div>
                    </div>
                    <div className="text-[#cccccc] opacity-50 font-bold">VS</div>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#cccccc] opacity-75 mb-1">{match.teamB}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[#cccccc] opacity-60 flex items-center gap-1">
                    <HiOutlineClipboardDocumentList className="w-3 h-3" />
                    {getLedgerEntriesByMatch(match.id).length} entries
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="panel">
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
            <HiOutlineFire className="w-4 h-4 text-orange-400" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button 
              onClick={() => {
                const event = new CustomEvent('quick-action', { detail: 'new-match' });
                window.dispatchEvent(event);
              }}
              className="w-full btn btn-add btn-sm text-left justify-start flex items-center gap-2"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Create New Match
            </button>
            <button 
              onClick={() => {
                const event = new CustomEvent('quick-action', { detail: 'new-customer' });
                window.dispatchEvent(event);
              }}
              className="w-full btn btn-ghost btn-sm text-left justify-start flex items-center gap-2"
            >
              <HiOutlineUserPlus className="w-4 h-4" />
              Add Customer
            </button>
            <button 
              onClick={() => {
                const event = new CustomEvent('quick-action', { detail: 'analytics' });
                window.dispatchEvent(event);
              }}
              className="w-full btn btn-ghost btn-sm text-left justify-start flex items-center gap-2"
            >
              <HiOutlineChartBar className="w-4 h-4" />
              View Analytics
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="panel">
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
            <HiOutlineChartBar className="w-4 h-4" />
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#cccccc] opacity-75 flex items-center gap-1">
                <HiOutlineTrophy className="w-3 h-3" />
                Total Matches
              </span>
              <span className="text-sm font-bold text-white">{matches.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#cccccc] opacity-75">Active Matches</span>
              <span className="text-sm font-bold text-green-500">
                {matches.filter(m => m.status === 'live' || m.status === 'upcoming').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#cccccc] opacity-75">Settled</span>
              <span className="text-sm font-bold text-blue-400">
                {matches.filter(m => m.status === 'settled').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

