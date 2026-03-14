import { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowDown,
  Check,
  X,
  Clock,
  MapPin,
  XCircle,
} from 'lucide-react';
import { formatInTimezone } from '../../utils/date';
import type { SwapRequestResponse } from '../../hooks/api/useSwaps';
import type { UserRole } from '../../api/types';

interface SwapRequestCardProps {
  swap: SwapRequestResponse;
  userRole: UserRole;
  userId: string;
  onAccept?: (id: string) => void;
  onApprove?: (id: string, reason?: string) => void;
  onReject?: (id: string, reason: string) => void;
  onCancel?: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  pending_peer: 'bg-info/15 text-info',
  pending_manager: 'bg-warning/15 text-warning',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-error/15 text-error',
  cancelled: 'bg-text-secondary/15 text-text-secondary',
  expired: 'bg-text-secondary/15 text-text-secondary',
};

const statusLabels: Record<string, string> = {
  pending_peer: 'Awaiting Peer',
  pending_manager: 'Awaiting Manager',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export function SwapRequestCard({
  swap,
  userRole,
  userId: _userId,
  onAccept,
  onApprove,
  onReject,
  onCancel,
}: SwapRequestCardProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const isSwap = swap.type === 'swap';
  const isPending = swap.status === 'pending_peer' || swap.status === 'pending_manager';
  // Can the current user take action?
  const canAcceptAsPeer = swap.status === 'pending_peer' && swap.target_user_id === null;
  const canApproveAsManager =
    swap.status === 'pending_manager' && (userRole === 'admin' || userRole === 'manager');
  const canCancel = isPending; // requester can cancel (backend validates ownership)

  return (
    <div className="p-4 bg-surface rounded-xl border border-border card-hover">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isSwap ? 'bg-info/10' : 'bg-warning/10'}`}>
            {isSwap ? (
              <ArrowLeftRight size={14} className="text-info" />
            ) : (
              <ArrowDown size={14} className="text-warning" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">
              {isSwap ? 'Shift Swap' : 'Shift Drop'}
            </p>
            <p className="text-xs text-text-secondary">
              {swap.requester_first} {swap.requester_last}
              {isSwap && swap.target_first && (
                <> &harr; {swap.target_first} {swap.target_last}</>
              )}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[swap.status] ?? ''}`}>
          {statusLabels[swap.status] ?? swap.status}
        </span>
      </div>

      {/* Shift details */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatInTimezone(swap.shift_start, swap.timezone, 'EEE, MMM d')} &middot;{' '}
          {formatInTimezone(swap.shift_start, swap.timezone)} –{' '}
          {formatInTimezone(swap.shift_end, swap.timezone)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {swap.location_name}
        </span>
        {swap.skill_name && (
          <span className="capitalize">{swap.skill_name}</span>
        )}
      </div>

      {/* Reason */}
      {swap.requester_reason && (
        <p className="text-xs text-text-secondary italic mb-3">
          &ldquo;{swap.requester_reason}&rdquo;
        </p>
      )}

      {/* Expiry warning */}
      {swap.expires_at && isPending && (
        <p className="text-xs text-warning mb-3">
          Expires {formatInTimezone(swap.expires_at, swap.timezone, 'EEE MMM d, h:mm a')}
        </p>
      )}

      {/* Manager rejection reason */}
      {swap.status === 'rejected' && swap.manager_reason && (
        <div className="flex items-start gap-2 p-2 bg-error/5 rounded-lg mb-3">
          <XCircle size={12} className="text-error shrink-0 mt-0.5" />
          <p className="text-xs text-error">{swap.manager_reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {canAcceptAsPeer && onAccept && (
          <button
            onClick={() => onAccept(swap.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg
                       text-xs font-semibold hover:bg-success/90 transition-colors press-effect"
          >
            <Check size={12} /> Accept
          </button>
        )}

        {canApproveAsManager && onApprove && !showRejectInput && (
          <>
            <button
              onClick={() => onApprove(swap.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg
                         text-xs font-semibold hover:bg-success/90 transition-colors press-effect"
            >
              <Check size={12} /> Approve
            </button>
            <button
              onClick={() => setShowRejectInput(true)}
              className="flex items-center gap-1 px-3 py-1.5 border border-error/30 text-error rounded-lg
                         text-xs font-semibold hover:bg-error/10 transition-colors press-effect"
            >
              <X size={12} /> Reject
            </button>
          </>
        )}

        {showRejectInput && onReject && (
          <div className="w-full flex gap-2">
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                         placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <button
              onClick={() => {
                if (rejectReason.trim()) {
                  onReject(swap.id, rejectReason);
                }
              }}
              disabled={!rejectReason.trim()}
              className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-semibold
                         disabled:opacity-50 hover:bg-error/90 press-effect"
            >
              Confirm
            </button>
            <button
              onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
              className="px-2 py-1.5 text-text-secondary hover:text-text text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(swap.id)}
            className="flex items-center gap-1 px-3 py-1.5 border border-border text-text-secondary rounded-lg
                       text-xs font-medium hover:bg-surface-hover transition-colors press-effect"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
}
