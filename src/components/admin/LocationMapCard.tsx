import { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { MapPin, Clock, Users } from 'lucide-react';
import { DateTime } from 'luxon';
import { api } from '../../api/client';
import type { Location } from '../../api/types';
import type { OnDutyStaff } from '../../hooks/api/useOnDuty';

const SVG_W = 960;
const SVG_H = 380;

/**
 * Fit-to-data projection: compute bounds from actual locations,
 * add generous padding, then map lat/lng to SVG coordinates.
 */
function buildProjection(locations: { latitude: number; longitude: number }[]) {
  if (locations.length === 0) return { project: () => ({ x: SVG_W / 2, y: SVG_H / 2 }) };

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const l of locations) {
    minLat = Math.min(minLat, l.latitude);
    maxLat = Math.max(maxLat, l.latitude);
    minLng = Math.min(minLng, l.longitude);
    maxLng = Math.max(maxLng, l.longitude);
  }

  // Add padding (30% of range, minimum 2 degrees)
  const latPad = Math.max((maxLat - minLat) * 0.3, 2);
  const lngPad = Math.max((maxLng - minLng) * 0.3, 4);
  minLat -= latPad; maxLat += latPad;
  minLng -= lngPad; maxLng += lngPad;

  const padX = 100;
  const padY = 60;

  return {
    project(lat: number, lng: number) {
      const x = padX + ((lng - minLng) / (maxLng - minLng)) * (SVG_W - padX * 2);
      const y = padY + ((maxLat - lat) / (maxLat - minLat)) * (SVG_H - padY * 2);
      return { x, y };
    },
    // Timezone divider: average longitude between easternmost west-coast and westernmost east-coast
    midLng: (minLng + maxLng) / 2,
    bounds: { minLat, maxLat, minLng, maxLng },
  };
}

/** Detect label collisions and offset overlapping labels */
function computeLabelOffsets(
  positions: { id: string; x: number; y: number }[]
): Map<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> {
  const offsets = new Map<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }>();
  const sorted = [...positions].sort((a, b) => a.x - b.x);

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    let dy = -24;
    let dx = 0;
    let anchor: 'start' | 'middle' | 'end' = 'middle';

    // Check for nearby sibling — offset if within 60px
    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;
      const dist = Math.sqrt((p.x - sorted[j].x) ** 2 + (p.y - sorted[j].y) ** 2);
      if (dist < 60) {
        // Upper location gets label above, lower gets label below
        if (p.y < sorted[j].y) {
          dy = -28;
        } else {
          dy = 24;
        }
        // Offset horizontally too for very close pairs
        if (Math.abs(p.x - sorted[j].x) < 30) {
          dx = p.x < sorted[j].x ? -12 : 12;
          anchor = p.x < sorted[j].x ? 'end' : 'start';
        }
        break;
      }
    }

    offsets.set(p.id, { dx, dy, anchor });
  }
  return offsets;
}

interface LocationMapCardProps {
  locations: Location[];
  onLocationClick?: (locationId: string) => void;
}

export function LocationMapCard({ locations, onLocationClick }: LocationMapCardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const onDutyQueries = useQueries({
    queries: locations.map((loc) => ({
      queryKey: ['on-duty', loc.id],
      queryFn: () => api.get<OnDutyStaff[]>(`/locations/${loc.id}/on-duty`),
      refetchInterval: 60_000,
    })),
  });

  const staffQueries = useQueries({
    queries: locations.map((loc) => ({
      queryKey: ['location-staff', loc.id],
      queryFn: () => api.get<{ id: string }[]>(`/locations/${loc.id}/staff`),
    })),
  });

  const onDutyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    locations.forEach((loc, i) => {
      counts.set(loc.id, onDutyQueries[i]?.data?.length ?? 0);
    });
    return counts;
  }, [locations, onDutyQueries]);

  const staffCounts = useMemo(() => {
    const counts = new Map<string, number>();
    locations.forEach((loc, i) => {
      counts.set(loc.id, staffQueries[i]?.data?.length ?? 0);
    });
    return counts;
  }, [locations, staffQueries]);

  const timezoneGroups = useMemo(() => {
    const groups = new Map<string, Location[]>();
    for (const loc of locations) {
      if (!groups.has(loc.timezone)) groups.set(loc.timezone, []);
      groups.get(loc.timezone)!.push(loc);
    }
    return groups;
  }, [locations]);

  const mappable = locations.filter((l) => l.latitude != null && l.longitude != null);

  const { project, midLng, bounds } = useMemo(
    () => buildProjection(mappable.map((l) => ({ latitude: l.latitude!, longitude: l.longitude! }))),
    [mappable]
  );

  const positions = useMemo(
    () => mappable.map((l) => ({ id: l.id, ...project(l.latitude!, l.longitude!) })),
    [mappable, project]
  );

  const labelOffsets = useMemo(() => computeLabelOffsets(positions), [positions]);

  // City region labels — one label per timezone cluster, positioned below all dots
  const cityLabels = useMemo(() => {
    const clusters = new Map<string, { x: number; y: number }[]>();
    for (const loc of mappable) {
      const tz = loc.timezone;
      if (!clusters.has(tz)) clusters.set(tz, []);
      clusters.get(tz)!.push(project(loc.latitude!, loc.longitude!));
    }
    const tzNames: Record<string, string> = {
      'America/New_York': 'NEW YORK',
      'America/Los_Angeles': 'CALIFORNIA',
    };
    return [...clusters.entries()].map(([tz, pts]) => {
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const maxY = Math.max(...pts.map((p) => p.y));
      return { label: tzNames[tz] ?? tz, cx, cy: maxY + 50 };
    });
  }, [mappable, project]);

  // Timezone divider x-coordinate
  const dividerX = useMemo(() => {
    if (!midLng || !bounds) return null;
    return project((bounds.minLat + bounds.maxLat) / 2, midLng).x;
  }, [midLng, bounds, project]);

  return (
    <div className="border border-border bg-surface overflow-hidden mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-text-secondary" />
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            Location Network
          </h2>
        </div>
        <div className="flex gap-4">
          {[...timezoneGroups.entries()].map(([tz, locs]) => {
            const now = DateTime.now().setZone(tz);
            return (
              <div key={tz} className="flex items-center gap-1.5">
                <Clock size={10} className="text-text-secondary" />
                <span className="text-[10px] text-text-secondary font-medium">
                  {now.toFormat('ZZZZ')} · {now.toFormat('h:mm a')} · {locs.length} loc{locs.length !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" style={{ maxHeight: 340 }}>
          <defs>
            <style>{`
              @keyframes map-ping {
                0% { r: 8; opacity: 0.7; }
                100% { r: 28; opacity: 0; }
              }
              .map-ping { animation: map-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
              .map-ping-delay { animation: map-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; animation-delay: 1s; }
            `}</style>
          </defs>

          {/* Subtle dot grid */}
          {Array.from({ length: 24 }).map((_, col) =>
            Array.from({ length: 10 }).map((_, row) => (
              <circle
                key={`dot-${col}-${row}`}
                cx={40 + col * ((SVG_W - 80) / 23)}
                cy={30 + row * ((SVG_H - 60) / 9)}
                r={0.8}
                fill="rgb(var(--color-text-secondary-rgb))"
                fillOpacity={0.12}
              />
            ))
          )}

          {/* Timezone divider */}
          {dividerX && (
            <>
              <line
                x1={dividerX} y1={20} x2={dividerX} y2={SVG_H - 20}
                stroke="rgb(var(--color-border-rgb))"
                strokeOpacity={0.25}
                strokeWidth={1}
                strokeDasharray="6 4"
              />
              <text
                x={dividerX - 12} y={SVG_H - 10}
                textAnchor="end"
                fill="rgb(var(--color-text-secondary-rgb))"
                fillOpacity={0.3}
                fontSize={9}
                fontWeight={600}
                fontFamily="var(--font-body)"
                letterSpacing="0.1em"
              >
                PACIFIC
              </text>
              <text
                x={dividerX + 12} y={SVG_H - 10}
                textAnchor="start"
                fill="rgb(var(--color-text-secondary-rgb))"
                fillOpacity={0.3}
                fontSize={9}
                fontWeight={600}
                fontFamily="var(--font-body)"
                letterSpacing="0.1em"
              >
                EASTERN
              </text>
            </>
          )}

          {/* City region labels */}
          {cityLabels.map(({ label, cx, cy }) => (
            <text
              key={label}
              x={cx}
              y={cy}
              textAnchor="middle"
              fill="rgb(var(--color-text-secondary-rgb))"
              fillOpacity={0.15}
              fontSize={13}
              fontWeight={700}
              fontFamily="var(--font-display)"
              letterSpacing="0.2em"
            >
              {label}
            </text>
          ))}

          {/* Connection lines between same-timezone locations */}
          {[...timezoneGroups.values()].map((locs) =>
            locs
              .filter((l) => l.latitude != null && l.longitude != null)
              .flatMap((locA, i, arr) =>
                arr.slice(i + 1).map((locB) => {
                  const a = project(locA.latitude!, locA.longitude!);
                  const b = project(locB.latitude!, locB.longitude!);
                  return (
                    <line
                      key={`conn-${locA.id}-${locB.id}`}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="rgb(var(--color-primary-rgb))"
                      strokeOpacity={0.18}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                    />
                  );
                })
              )
          )}

          {/* Location markers */}
          {mappable.map((loc) => {
            const { x, y } = project(loc.latitude!, loc.longitude!);
            const dutyCount = onDutyCounts.get(loc.id) ?? 0;
            const totalStaff = staffCounts.get(loc.id) ?? 0;
            const isHovered = hoveredId === loc.id;
            const isActive = dutyCount > 0;
            const shortName = loc.name.replace('Coastal Eats ', '');
            const offset = labelOffsets.get(loc.id) ?? { dx: 0, dy: -24, anchor: 'middle' };
            const badgeLabel = isActive ? String(dutyCount) : String(totalStaff);
            const badgeWidth = badgeLabel.length > 1 ? 28 : 24;

            return (
              <g
                key={loc.id}
                onMouseEnter={() => setHoveredId(loc.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onLocationClick?.(loc.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse rings */}
                {isActive && (
                  <>
                    <circle cx={x} cy={y} className="map-ping" fill="none" stroke="rgb(var(--color-success-rgb))" strokeWidth={1.5} />
                    <circle cx={x} cy={y} className="map-ping-delay" fill="none" stroke="rgb(var(--color-success-rgb))" strokeWidth={1} />
                  </>
                )}

                {/* Hit area */}
                <circle cx={x} cy={y} r={24} fill="transparent" />

                {/* Outer glow */}
                <circle
                  cx={x} cy={y}
                  r={isHovered ? 18 : 14}
                  fill={isActive ? 'rgb(var(--color-success-rgb))' : 'rgb(var(--color-text-secondary-rgb))'}
                  fillOpacity={isHovered ? 0.18 : 0.08}
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Dot */}
                <circle
                  cx={x} cy={y}
                  r={isHovered ? 7 : 5.5}
                  fill={isActive ? 'rgb(var(--color-success-rgb))' : 'rgb(var(--color-text-secondary-rgb))'}
                  stroke="rgb(var(--color-surface-rgb))"
                  strokeWidth={2.5}
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Location name label */}
                <text
                  x={x + offset.dx}
                  y={y + offset.dy}
                  textAnchor={offset.anchor}
                  fill="rgb(var(--color-text-rgb))"
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="var(--font-display)"
                  style={{ opacity: isHovered ? 1 : 0.8, transition: 'opacity 0.2s' }}
                >
                  {shortName}
                </text>

                {/* Staff badge — green with on-duty count, or muted with total staff */}
                <g>
                  <rect
                    x={x + 10} y={y - 11}
                    width={badgeWidth} height={17} rx={8.5}
                    fill={isActive ? 'rgb(var(--color-success-rgb))' : 'rgb(var(--color-text-secondary-rgb))'}
                    fillOpacity={isActive ? 1 : 0.25}
                  />
                  <text
                    x={x + 10 + badgeWidth / 2} y={y + 1}
                    textAnchor="middle"
                    fill={isActive ? 'white' : 'rgb(var(--color-text-secondary-rgb))'}
                    fontSize={10} fontWeight={700}
                  >
                    {badgeLabel}
                  </text>
                </g>

                {/* Hover tooltip */}
                {isHovered && (
                  <foreignObject
                    x={x - 110} y={y + 30}
                    width={220} height={72}
                    style={{ overflow: 'visible', pointerEvents: 'none' }}
                  >
                    <div className="bg-surface border border-border rounded-lg shadow-lg p-3 text-center">
                      <p className="text-xs font-bold text-text">{loc.name}</p>
                      {loc.address && (
                        <p className="text-[10px] text-text-secondary mt-0.5">{loc.address}</p>
                      )}
                      <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className="text-[10px] text-text-secondary">
                          <Users size={10} className="inline mr-0.5 align-[-1px]" />{totalStaff} staff
                        </span>
                        <span className={`text-[10px] font-semibold ${dutyCount > 0 ? 'text-success' : 'text-text-secondary'}`}>
                          {dutyCount > 0 ? `${dutyCount} on duty` : 'None on duty'}
                        </span>
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
