import { Calendar } from 'lucide-react';

export function SchedulePage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar size={20} className="text-primary" />
        <h1 className="text-xl font-display font-bold text-text">Schedule</h1>
      </div>
      <div className="p-8 bg-surface rounded-xl border border-border text-center">
        <p className="text-text-secondary text-sm">Schedule view — coming in Phase F3</p>
      </div>
    </div>
  );
}
