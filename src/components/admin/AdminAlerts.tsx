import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Location } from '../../api/types';

interface AdminAlertsProps {
  pendingApprovals: number;
  locations: Location[];
}

export function AdminAlerts({ pendingApprovals, locations }: AdminAlertsProps) {
  const navigate = useNavigate();

  if (pendingApprovals === 0 && locations.length > 0) {
    return (
      <div className="border border-success/30 bg-success/5 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <span className="text-success text-sm font-bold">OK</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">All Systems Nominal</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              No critical alerts across {locations.length} locations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingApprovals > 0 && (
        <div className="border-2 border-warning bg-warning/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 bg-warning text-white">
            <AlertTriangle size={14} />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-warning font-bold uppercase tracking-widest text-[10px] mb-1">
                Action Required
              </h3>
              <h4 className="text-lg font-extrabold text-text tracking-tight">
                {pendingApprovals} Pending Swap/Drop Approval{pendingApprovals !== 1 ? 's' : ''}
              </h4>
              <p className="text-text-secondary mt-1 text-sm">
                Swap and drop requests awaiting manager review across locations.
              </p>
            </div>
            <button
              onClick={() => navigate('/swaps')}
              className="bg-warning text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider
                         hover:bg-warning/90 transition-colors flex items-center gap-2 press-effect"
            >
              Review <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
