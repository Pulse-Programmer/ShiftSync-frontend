export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type UserRole = 'admin' | 'manager' | 'staff';
export type ScheduleStatus = 'draft' | 'published';
export type SwapType = 'swap' | 'drop';
export type SwapStatus = 'pending_peer' | 'pending_manager' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  profilePhotoUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  desired_weekly_hours: number | null;
  phone: string | null;
  is_active: boolean;
  profile_photo_url?: string | null;
  created_at: string;
  skills?: { id: string; name: string }[];
  locations?: { id: string; name: string; timezone: string }[];
}

export interface Location {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  edit_cutoff_hours: number;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Schedule {
  id: string;
  location_id: string;
  week_start: string;
  status: ScheduleStatus;
  published_at: string | null;
  published_by: string | null;
}

export interface Shift {
  id: string;
  schedule_id: string;
  location_id: string;
  start_time: string;
  end_time: string;
  required_skill_id: string | null;
  required_skill_name?: string;
  headcount_needed: number;
  notes: string | null;
  assignments?: ShiftAssignment[];
  location_name?: string;
  location_timezone?: string;
}

export interface ShiftAssignment {
  id: string;
  shift_id: string;
  user_id: string;
  status: 'assigned' | 'removed';
  user_first_name?: string;
  user_last_name?: string;
  assigned_at: string;
}

export interface ConstraintResult {
  constraint: string;
  passed: boolean;
  severity: 'error' | 'warning';
  message: string;
  details: Record<string, unknown>;
  overridable?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  results: ConstraintResult[];
  suggestions?: {
    userId: string;
    userName: string;
    reason: string;
  }[];
}

export interface SwapRequest {
  id: string;
  type: SwapType;
  requester_assignment_id: string;
  target_assignment_id: string | null;
  target_user_id: string | null;
  status: SwapStatus;
  requester_reason: string | null;
  manager_reason: string | null;
  expires_at: string | null;
  created_at: string;
  requester_name?: string;
  target_name?: string;
  shift_start?: string;
  shift_end?: string;
  location_name?: string;
  skill_name?: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface OvertimeSummary {
  id: string;
  first_name: string;
  last_name: string;
  total_hours: number;
  days_worked: number;
}

export interface FairnessReport {
  id: string;
  first_name: string;
  last_name: string;
  desired_weekly_hours: number | null;
  total_hours: number;
  total_shifts: number;
  premium_shifts: number;
  target_hours: number;
}
