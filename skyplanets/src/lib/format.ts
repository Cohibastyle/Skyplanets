import type { VisibilityState } from './types';

export function formatTime(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatMagnitude(mag: number | null): string {
  if (mag === null || Number.isNaN(mag)) return '—';
  return mag.toFixed(1);
}

export const visibilityLabel: Record<VisibilityState, string> = {
  visible: 'Visible now',
  low: 'Low on horizon',
  hidden: 'Not in view',
};

export const visibilityColor: Record<VisibilityState, string> = {
  visible: '#34c759',
  low: '#ff9f0a',
  hidden: '#8e8e93',
};

/** Brand-ish accent color per planet for the glyph. */
export const planetColor: Record<string, string> = {
  Mercury: '#9b8f86',
  Venus: '#e3b778',
  Mars: '#d8593b',
  Jupiter: '#d8a368',
  Saturn: '#e2c87d',
  Uranus: '#7fc6cf',
  Neptune: '#4f6bd8',
};
