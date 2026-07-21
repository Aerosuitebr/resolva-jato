import { getSession } from '@/lib/auth';
import type { AgendaEvent } from './types';

const STORAGE_PREFIX = 'resolva-jato-agenda';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

function repairMojibake(value: string) {
  return value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã /g, 'à')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã©/g, 'é')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã´/g, 'ô')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã/g, 'Á')
    .replace(/Ã€/g, 'À')
    .replace(/Ã‚/g, 'Â')
    .replace(/Ãƒ/g, 'Ã')
    .replace(/Ã‰/g, 'É')
    .replace(/ÃŠ/g, 'Ê')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ã”/g, 'Ô')
    .replace(/Ã•/g, 'Õ')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‡/g, 'Ç')
    .replace(/Â·/g, '·')
    .replace(/Âº/g, 'º')
    .replace(/Âª/g, 'ª');
}

function normalizeEvent(event: AgendaEvent): AgendaEvent {
  return {
    ...event,
    title: repairMojibake(event.title ?? ''),
    client: repairMojibake(event.client ?? ''),
    location: repairMojibake(event.location ?? ''),
    notes: repairMojibake(event.notes ?? ''),
    alertMinutes: Number.isFinite(event.alertMinutes) ? event.alertMinutes : 30,
    priority: event.priority ?? 'normal',
    status: event.status ?? 'confirmed'
  };
}

function eventSignature(event: AgendaEvent) {
  return [
    event.title.trim().toLowerCase(),
    event.client.trim().toLowerCase(),
    event.date,
    event.startTime,
    event.endTime,
    event.location.trim().toLowerCase(),
    event.notes.trim().toLowerCase()
  ].join('|');
}

function uniqueEvents(events: AgendaEvent[]) {
  const seen = new Set<string>();
  return events.filter((event) => {
    const signature = eventSignature(event);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

export function listAgendaEvents(): AgendaEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AgendaEvent[];
    if (!Array.isArray(parsed)) return [];
    return uniqueEvents(parsed.map(normalizeEvent)).sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  } catch {
    return [];
  }
}

export function saveAgendaEvent(event: AgendaEvent) {
  if (typeof window === 'undefined') return event;
  const events = listAgendaEvents();
  const next = normalizeEvent({ ...event, updatedAt: new Date().toISOString() });
  const index = events.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? events.map((item, i) => (i === index ? next : item)) : [...events, next];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  return next;
}

export function saveAgendaEvents(events: AgendaEvent[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(), JSON.stringify(uniqueEvents(events.map(normalizeEvent))));
}

export function deleteAgendaEvent(eventId: string) {
  if (typeof window === 'undefined') return;
  saveAgendaEvents(listAgendaEvents().filter((item) => item.id !== eventId));
}
