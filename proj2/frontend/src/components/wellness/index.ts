/**
 * Wellness Components
 *
 * Dual-dimension health tracking components for both mental and physical wellness.
 *
 * Structure:
 * - mental/   - Mental wellness tracking (mood, stress, sleep)
 * - physical/ - Physical wellness tracking (reserved for future)
 * - shared/   - Shared components (goals, charts, progress indicators)
 */

// Mental Wellness Components
export * from './mental';

// Shared Components (used by both mental and physical wellness)
export * from './shared';

// Dashboard Widget
export { WellnessOverviewCard } from './WellnessOverviewCard';

// Physical Wellness Components (Future)
// export * from './physical';
