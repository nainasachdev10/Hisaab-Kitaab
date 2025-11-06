import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchSchema, MatchFormData } from '../schemas/validation';
import { useAppStore } from '../store/appStore';

interface MatchFormProps {
  onClose: () => void;
}

export default function MatchForm({ onClose }: MatchFormProps) {
  const addMatch = useAppStore((state) => state.addMatch);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
  });

  const onSubmit = (data: MatchFormData) => {
    addMatch({
      name: data.name,
      teamA: data.teamA,
      teamB: data.teamB,
      startTime: data.startTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="panel max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create New Match</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="match-name" className="label">Match / Market name</label>
            <input
              id="match-name"
              type="text"
              className="input-field"
              placeholder="Pakistan vs South Africa - Winner"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-danger text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="match-team-a" className="label">Team A name</label>
              <input
                id="match-team-a"
                type="text"
                className="input-field"
                placeholder="Team A"
                {...register('teamA')}
              />
              {errors.teamA && (
                <p className="text-danger text-xs mt-1">{errors.teamA.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="match-team-b" className="label">Team B name</label>
              <input
                id="match-team-b"
                type="text"
                className="input-field"
                placeholder="Team B"
                {...register('teamB')}
              />
              {errors.teamB && (
                <p className="text-danger text-xs mt-1">{errors.teamB.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-add flex-1">
              Create Match
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

