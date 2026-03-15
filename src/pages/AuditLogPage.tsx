import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { DateTime } from 'luxon';
import { useAuditLogs, getAuditExportUrl } from '../hooks/api/useAudit';
import { useLocations } from '../hooks/api/useLocations';

interface OutletCtx {
  selectedLocationId: string | null;
}

const ENTITY_TYPES = ['', 'shift', 'shift_assignment', 'schedule', 'swap_request', 'user', 'invitation'];

export function AuditLogPage() {
  const { selectedLocationId: _selectedLocationId } = useOutletContext<OutletCtx>();
  const { data: locations } = useLocations();

  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState(() =>
    DateTime.now().minus({ weeks: 2 }).toISODate()!,
  );
  const [endDate, setEndDate] = useState(() =>
    DateTime.now().plus({ days: 1 }).toISODate()!,
  );
  const [locationFilter, setLocationFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs, isLoading } = useAuditLogs({
    entityType: entityType || undefined,
    startDate,
    endDate,
    locationId: locationFilter || undefined,
    limit: 100,
  });

  function handleExport() {
    const token = localStorage.getItem('shiftsync-token');
    const url = getAuditExportUrl(startDate, endDate, locationFilter || undefined);
    // Open in new tab with auth header via fetch + blob download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `audit-log-${startDate}-to-${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-primary" />
          <h1 className="text-xl font-display font-bold text-text">Audit Log</h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg
                     text-xs font-medium text-text-secondary hover:bg-surface-hover
                     transition-colors press-effect"
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                     focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === '' ? 'All Types' : t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>

        {locations && (
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                       focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                       focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-text-secondary">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                       focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Entries */}
      {!isLoading && logs && logs.length === 0 && (
        <div className="text-center py-12">
          <FileText size={32} className="text-text-secondary/30 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No audit entries found</p>
        </div>
      )}

      <div className="space-y-1.5">
        {logs?.map((log) => {
          const isExpanded = expandedId === log.id;
          return (
            <div key={log.id} className="bg-surface rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono text-text-secondary/60 shrink-0">
                    {DateTime.fromISO(log.performed_at).toFormat('MMM d, h:mm a')}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-surface-alt rounded text-text-secondary capitalize shrink-0">
                    {log.entity_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-text truncate">
                    <span className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                    {log.notes && (
                      <span className="text-text-secondary ml-1.5">— {log.notes}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs text-text-secondary hidden sm:inline">
                    {log.performer_first_name} {log.performer_last_name}
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 border-t border-border pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Performer</p>
                      <p className="text-xs text-text">{log.performer_first_name} {log.performer_last_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Entity ID</p>
                      <p className="text-xs text-text font-mono">{log.entity_id}</p>
                    </div>
                    {log.before_state && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Before</p>
                        <pre className="text-[10px] text-text-secondary bg-surface-alt rounded-lg p-2 overflow-x-auto">
                          {JSON.stringify(log.before_state, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.after_state && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">After</p>
                        <pre className="text-[10px] text-text-secondary bg-surface-alt rounded-lg p-2 overflow-x-auto">
                          {JSON.stringify(log.after_state, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
