import { useState } from 'react';
import { ArrowLeftRight, Inbox, ArrowDownCircle } from 'lucide-react';
import { ErrorState } from '../components/ui/ErrorState';
import { useAuth } from '../hooks/useAuth';
import {
  useSwapRequests,
  useAvailableShifts,
  useAcceptSwap,
  useApproveSwap,
  useRejectSwap,
  useCancelSwap,
  usePickupShift,
} from '../hooks/api/useSwaps';
import { SwapRequestCard } from '../components/swaps/SwapRequestCard';
import { AvailableShiftCard } from '../components/swaps/AvailableShiftCard';

type Tab = 'requests' | 'available';

export function SwapsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('requests');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: swaps, isLoading: swapsLoading, error: swapsError, refetch: refetchSwaps } = useSwapRequests(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const { data: available, isLoading: availableLoading, error: availableError, refetch: refetchAvailable } = useAvailableShifts();

  const acceptSwap = useAcceptSwap();
  const approveSwap = useApproveSwap();
  const rejectSwap = useRejectSwap();
  const cancelSwap = useCancelSwap();
  const pickupShift = usePickupShift();

  if (!user) return null;

  const isStaff = user.role === 'staff';
  const isManager = user.role === 'manager' || user.role === 'admin';

  const pendingCount = swaps?.filter(
    (s) => s.status === 'pending_peer' || s.status === 'pending_manager',
  ).length ?? 0;

  const tabs = [
    { id: 'requests' as Tab, label: isManager ? 'Approval Queue' : 'My Requests', icon: ArrowLeftRight },
    { id: 'available' as Tab, label: 'Available Shifts', icon: ArrowDownCircle },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ArrowLeftRight size={20} className="text-primary" />
        <h1 className="text-xl font-display font-bold text-text">Swaps & Coverage</h1>
        {pendingCount > 0 && (
          <span className="bg-warning/15 text-warning text-xs font-semibold px-2 py-0.5 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-alt rounded-xl mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-medium transition-colors duration-fast
                       ${tab === t.id
                         ? 'bg-surface text-text shadow-sm'
                         : 'text-text-secondary hover:text-text'
                       }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {tab === 'requests' && (
        <>
          {/* Status filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {['', 'pending_peer', 'pending_manager', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                           transition-colors press-effect
                           ${statusFilter === status
                             ? 'bg-primary text-text-inverse'
                             : 'bg-surface border border-border text-text-secondary hover:text-text'
                           }`}
              >
                {status === ''
                  ? 'All'
                  : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          {swapsLoading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!swapsLoading && swapsError && (
            <ErrorState message="Failed to load swap requests" onRetry={() => refetchSwaps()} />
          )}

          {!swapsLoading && !swapsError && swaps && swaps.length === 0 && (
            <div className="text-center py-12">
              <Inbox size={32} className="text-text-secondary/30 mx-auto mb-3" />
              <p className="text-sm text-text-secondary">No swap requests found</p>
            </div>
          )}

          <div className="space-y-3 animate-stagger">
            {swaps?.map((swap) => (
              <SwapRequestCard
                key={swap.id}
                swap={swap}
                userRole={user.role}
                userId={user.id}
                onAccept={isStaff ? (id) => acceptSwap.mutate(id) : undefined}
                onApprove={
                  isManager
                    ? (id, reason) => approveSwap.mutate({ swapId: id, reason })
                    : undefined
                }
                onReject={
                  isManager
                    ? (id, reason) => rejectSwap.mutate({ swapId: id, reason })
                    : undefined
                }
                onCancel={(id) => cancelSwap.mutate(id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Available Shifts Tab */}
      {tab === 'available' && (
        <>
          {availableLoading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!availableLoading && availableError && (
            <ErrorState message="Failed to load available shifts" onRetry={() => refetchAvailable()} />
          )}

          {!availableLoading && !availableError && available && available.length === 0 && (
            <div className="text-center py-12">
              <Inbox size={32} className="text-text-secondary/30 mx-auto mb-3" />
              <p className="text-sm text-text-secondary">No shifts available for pickup</p>
              <p className="text-xs text-text-secondary/70 mt-1">
                Dropped shifts you're qualified for will appear here
              </p>
            </div>
          )}

          <div className="space-y-3 animate-stagger">
            {available?.map((shift) => (
              <AvailableShiftCard
                key={shift.swap_request_id}
                shift={shift}
                onPickup={(id) => pickupShift.mutate(id)}
                isPending={pickupShift.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
