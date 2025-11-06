import { useState, useMemo } from 'react';
import { ConverterData } from '../types';
import { calculateExposureFromOdds, round2 } from '../utils/calculations';

interface ConverterToolProps {
  teamAName: string;
  teamBName: string;
  onAddToLedger: (data: ConverterData) => void;
}

export default function ConverterTool({
  teamAName,
  teamBName,
  onAddToLedger,
}: ConverterToolProps) {
  const [name, setName] = useState('');
  const [stake, setStake] = useState(0);
  const [odds, setOdds] = useState(0);
  const [side, setSide] = useState<'A' | 'B'>('A');
  const [sharePercent, setSharePercent] = useState(0);

  const exposures = useMemo(() => {
    if (stake > 0 && odds > 0) {
      const { exposureA, exposureB } = calculateExposureFromOdds(stake, odds, side);
      return { exposureA: round2(exposureA), exposureB: round2(exposureB) };
    }
    return { exposureA: null, exposureB: null };
  }, [stake, odds, side]);

  const handleAddToLedger = () => {
    if (exposures.exposureA === null || exposures.exposureB === null) {
      return;
    }
    onAddToLedger({
      name,
      stake,
      odds,
      side,
      sharePercent,
      exposureA: exposures.exposureA,
      exposureB: exposures.exposureB,
    });
    setName('');
    setStake(0);
    setOdds(0);
    setSide('A');
    setSharePercent(0);
  };

  const handleClear = () => {
    setName('');
    setStake(0);
    setOdds(0);
    setSide('A');
    setSharePercent(0);
  };

  return (
    <div className="space-y-4">
      <h3 className="opacity-90 m-0 mb-4 text-sm font-semibold">Quick Converter (Customer BACK bet)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="converter-name" className="label">Customer name</label>
          <input
            id="converter-name"
            type="text"
            className="input-field"
            placeholder="DK1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="converter-stake" className="label">Stake</label>
          <input
            id="converter-stake"
            type="number"
            step="0.01"
            className="input-field input-number"
            placeholder="10000"
            value={stake || ''}
            onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label htmlFor="converter-odds" className="label">Odds (decimal)</label>
          <input
            id="converter-odds"
            type="number"
            step="0.01"
            className="input-field input-number"
            placeholder="1.95"
            value={odds || ''}
            onChange={(e) => setOdds(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="flex gap-4 items-center pt-2">
        <span className="opacity-85 text-sm font-medium">Bet on:</span>
        <label htmlFor="converter-side-a" className="flex items-center gap-2 cursor-pointer">
          <input
            id="converter-side-a"
            type="radio"
            name="convSide"
            checked={side === 'A'}
            onChange={() => setSide('A')}
            className="cursor-pointer"
          />
          <span className="text-sm">{teamAName}</span>
        </label>
        <label htmlFor="converter-side-b" className="flex items-center gap-2 cursor-pointer">
          <input
            id="converter-side-b"
            type="radio"
            name="convSide"
            checked={side === 'B'}
            onChange={() => setSide('B')}
            className="cursor-pointer"
          />
          <span className="text-sm">{teamBName}</span>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div>
          <label htmlFor="converter-share" className="label">My Share %</label>
          <input
            id="converter-share"
            type="number"
            step="0.01"
            className="input-field input-number"
            placeholder="20"
            value={sharePercent || ''}
            onChange={(e) => setSharePercent(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label htmlFor="converter-exposure-a" className="label">Exposure on {teamAName} (auto)</label>
          <input
            id="converter-exposure-a"
            type="number"
            step="0.01"
            className="input-field input-number bg-[#2a2a2a] opacity-90"
            placeholder="-9500"
            readOnly
            value={exposures.exposureA || ''}
          />
        </div>
        <div>
          <label htmlFor="converter-exposure-b" className="label">Exposure on {teamBName} (auto)</label>
          <input
            id="converter-exposure-b"
            type="number"
            step="0.01"
            className="input-field input-number bg-[#2a2a2a] opacity-90"
            placeholder="10000"
            readOnly
            value={exposures.exposureB || ''}
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn btn-add" onClick={handleAddToLedger}>
          ➕ Add to Ledger
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          Clear
        </button>
      </div>
      <div className="opacity-75 text-xs pt-2 border-t border-line">
        Formula (bookmaker view): selected side exposure = <strong>-stake × (odds−1)</strong>, other side ={' '}
        <strong>+stake</strong>.
      </div>
    </div>
  );
}
