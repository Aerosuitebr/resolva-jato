'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlarmClock,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { getBrazilHolidays } from '@/lib/agenda/holidays';
import { deleteAgendaEvent, listAgendaEvents, saveAgendaEvent } from '@/lib/agenda/storage';
import type { AgendaEvent, AgendaEventPriority, AgendaEventStatus } from '@/lib/agenda/types';
import { performBillableAction } from '@/lib/billing';
import { cn } from '@/lib/utils';

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
const compactDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

const alertOptions = [
  { value: 0, label: 'No horário' },
  { value: 10, label: '10 min antes' },
  { value: 30, label: '30 min antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 dia antes' }
];

const priorityLabels: Record<AgendaEventPriority, string> = {
  normal: 'Normal',
  high: 'Importante',
  critical: 'Urgente'
};

const statusLabels: Record<AgendaEventStatus, string> = {
  confirmed: 'Confirmado',
  tentative: 'A confirmar',
  done: 'Concluído'
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateKey(dateKey: string, time = '00:00') {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function createId() {
  return `agenda_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function createEvent(date = toDateKey(new Date())): AgendaEvent {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: '',
    client: '',
    date,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    notes: '',
    alertMinutes: 30,
    priority: 'normal',
    status: 'confirmed',
    createdAt: now,
    updatedAt: now
  };
}

function buildMonthDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function eventDateTime(event: AgendaEvent) {
  return fromDateKey(event.date, event.startTime);
}

function hasConflict(target: AgendaEvent, events: AgendaEvent[]) {
  const targetStart = fromDateKey(target.date, target.startTime).getTime();
  const targetEnd = fromDateKey(target.date, target.endTime).getTime();
  return events.some((event) => {
    if (event.id === target.id || event.date !== target.date || event.status === 'done') return false;
    const eventStart = fromDateKey(event.date, event.startTime).getTime();
    const eventEnd = fromDateKey(event.date, event.endTime).getTime();
    return targetStart < eventEnd && eventStart < targetEnd;
  });
}

function formatAlert(minutes: number) {
  return alertOptions.find((item) => item.value === minutes)?.label ?? `${minutes} min antes`;
}

export function AgendaApp() {
  const todayKey = toDateKey(new Date());
  const { refresh: refreshAuth } = useAuth();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [demoEvents, setDemoEvents] = useState<AgendaEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [currentMonth, setCurrentMonth] = useState(() => fromDateKey(todayKey));
  const [draft, setDraft] = useState<AgendaEvent>(() => createEvent(todayKey));
  const [query, setQuery] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [notificationState, setNotificationState] = useState<'unsupported' | 'default' | 'granted' | 'denied'>('default');
  const [firedAlerts, setFiredAlerts] = useState<string[]>([]);

  useEffect(() => {
    const stored = listAgendaEvents();
    setEvents(stored);
    if (stored.length > 0) {
      const next = stored.find((item) => item.date >= todayKey) ?? stored[0];
      setSelectedDate(next.date);
      setCurrentMonth(fromDateKey(next.date));
    }
    setNotificationState('Notification' in window ? Notification.permission : 'unsupported');
  }, [todayKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || notificationState !== 'granted') return;
    const timers = events
      .filter((event) => event.status !== 'done')
      .map((event) => {
        const alertId = `${event.id}:${event.updatedAt}`;
        const alertAt = eventDateTime(event).getTime() - event.alertMinutes * 60 * 1000;
        const delay = alertAt - Date.now();
        if (delay < 0 || delay > 2147483647 || firedAlerts.includes(alertId)) return null;
        return window.setTimeout(() => {
          new Notification('Lembrete da agenda', {
            body: `${event.title || 'Compromisso'} às ${event.startTime}${event.client ? ` - ${event.client}` : ''}`,
            tag: event.id
          });
          setFiredAlerts((current) => [...current, alertId]);
        }, delay);
      })
      .filter((timer): timer is number => timer !== null);

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [events, firedAlerts, notificationState]);

  const holidays = useMemo(() => {
    const years = [currentMonth.getFullYear() - 1, currentMonth.getFullYear(), currentMonth.getFullYear() + 1];
    return years.flatMap(getBrazilHolidays);
  }, [currentMonth]);

  const holidaysByDate = useMemo(() => new Map(holidays.map((holiday) => [holiday.date, holiday])), [holidays]);
  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const visibleEvents = demoEvents.length > 0 ? [...events, ...demoEvents] : events;
  const isDemoMode = demoEvents.length > 0;
  const selectedHoliday = holidaysByDate.get(selectedDate);
  const selectedEvents = visibleEvents.filter((event) => event.date === selectedDate);
  const openEvents = visibleEvents.filter((event) => event.status !== 'done');
  const nextEvents = openEvents.filter((event) => event.date >= todayKey).slice(0, 6);
  const overdueEvents = openEvents.filter((event) => `${event.date}T${event.endTime}` < `${todayKey}T00:00`).length;
  const todayEvents = visibleEvents.filter((event) => event.date === todayKey);
  const conflicts = visibleEvents.filter((event) => hasConflict(event, visibleEvents)).length;
  const filteredEvents = visibleEvents.filter((event) => {
    const text = `${event.title} ${event.client} ${event.location} ${event.notes}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  function updateDraft(patch: Partial<AgendaEvent>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setCurrentMonth(fromDateKey(date));
    updateDraft({ date });
  }

  function handleNew(date = selectedDate) {
    setDemoEvents([]);
    setDraft(createEvent(date));
    setSelectedDate(date);
    setCurrentMonth(fromDateKey(date));
    setError('');
  }

  function handleEdit(event: AgendaEvent) {
    setDraft(event);
    setSelectedDate(event.date);
    setCurrentMonth(fromDateKey(event.date));
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!draft.title.trim()) {
      setError('Informe um título para o compromisso.');
      return;
    }
    if (draft.endTime <= draft.startTime) {
      setError('O horário final precisa ser depois do início.');
      return;
    }
    setSaveState('saving');
    try {
      const outcome = await performBillableAction(
        { toolId: 'agenda', artifactId: draft.id, action: 'manual_save' },
        () => saveAgendaEvent({ ...draft, title: draft.title.trim() })
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Faça login e confirme seu e-mail para continuar.');
        return;
      }
      const stored = listAgendaEvents();
      setEvents(stored);
      setDemoEvents((current) => current.filter((event) => event.id !== draft.id));
      const saved = stored.find((event) => event.id === draft.id);
      if (saved) setDraft(saved);
      refreshAuth();
      setSaveState('saved');
    } catch {
      setError('Não foi possível salvar o compromisso.');
    } finally {
      window.setTimeout(() => setSaveState('idle'), 1200);
    }
  }

  function handleDelete(eventId: string) {
    if (demoEvents.some((event) => event.id === eventId)) {
      setDemoEvents((current) => current.filter((event) => event.id !== eventId));
      if (draft.id === eventId) setDraft(createEvent(selectedDate));
      return;
    }
    deleteAgendaEvent(eventId);
    const stored = listAgendaEvents();
    setEvents(stored);
    if (draft.id === eventId) setDraft(createEvent(selectedDate));
  }

  function handleToggleDone(event: AgendaEvent) {
    if (demoEvents.some((item) => item.id === event.id)) {
      const updated = { ...event, status: event.status === 'done' ? 'confirmed' : 'done' } as AgendaEvent;
      setDemoEvents((current) => current.map((item) => (item.id === event.id ? updated : item)));
      if (draft.id === updated.id) setDraft(updated);
      return;
    }
    const updated = saveAgendaEvent({ ...event, status: event.status === 'done' ? 'confirmed' : 'done' });
    setEvents(listAgendaEvents());
    if (draft.id === updated.id) setDraft(updated);
  }

  function handleLoadExample() {
    if (isDemoMode) {
      setDemoEvents([]);
      setDraft(createEvent(selectedDate));
      return;
    }
    const sampleDate = selectedDate >= todayKey ? selectedDate : todayKey;
    const samples: AgendaEvent[] = [
      {
        ...createEvent(sampleDate),
        title: 'Reunião de briefing',
        client: 'Cliente Premium',
        startTime: '10:00',
        endTime: '11:00',
        location: 'Chamada de vídeo',
        notes: 'Confirmar escopo, prazo e responsáveis.',
        priority: 'high'
      },
      {
        ...createEvent(sampleDate),
        title: 'Entrega de documento',
        client: 'Administrativo',
        startTime: '15:30',
        endTime: '16:00',
        alertMinutes: 60,
        location: 'Escritório',
        notes: 'Revisar anexos antes do envio.'
      }
    ];
    setDemoEvents(samples);
    setSelectedDate(sampleDate);
    setCurrentMonth(fromDateKey(sampleDate));
    setDraft(createEvent(sampleDate));
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }
    setNotificationState(await Notification.requestPermission());
  }

  function shiftMonth(amount: number) {
    setCurrentMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + amount, 1);
      const nextKey = toDateKey(next);
      setSelectedDate(nextKey);
      updateDraft({ date: nextKey });
      return next;
    });
  }

  function goToToday() {
    setCurrentMonth(fromDateKey(todayKey));
    setSelectedDate(todayKey);
    updateDraft({ date: todayKey });
  }

  return (
    <AuthGate
      title="Agenda Premium exige cadastro"
      description="Crie sua conta gratuita para salvar compromissos, consultar depois e ativar lembretes no navegador."
    >
      <div className="space-y-5">
        <PageHero
          title="Agenda Premium"
          subtitle="Calendário inteligente com feriados nacionais, compromissos salvos, alertas programáveis e leitura executiva da sua rotina."
          icon={CalendarCheck2}
          actions={
            <>
              <ToolsBackButton size="default" className="border-white/30 bg-white/10 text-white hover:bg-white/20" />
              <Button variant="outline" onClick={handleLoadExample}>
                <Sparkles className="h-4 w-4" />
                {isDemoMode ? 'Sair do exemplo' : 'Exemplo'}
              </Button>
              <Button onClick={() => handleNew()}>
                <Plus className="h-4 w-4" />
                Novo compromisso
              </Button>
            </>
          }
        />

        <section className="grid gap-3 md:grid-cols-4">
          <KpiCard label="Hoje" value={String(todayEvents.length)} detail="compromissos" tone="sky" />
          <KpiCard label="Próximos" value={String(nextEvents.length)} detail="na agenda" tone="emerald" />
          <KpiCard label="Conflitos" value={String(conflicts)} detail="sobrepostos" tone="amber" />
          <KpiCard label="Atrasados" value={String(overdueEvents)} detail="pendentes" tone="rose" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-5">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
                    <Search className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-950">Buscar compromissos</h2>
                    <p className="text-sm text-slate-600">Encontre por cliente, local, título ou observação.</p>
                  </div>
                </div>
                <div className="w-full lg:max-w-md">
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cliente, local, título..." />
                </div>
              </div>
              {query ? (
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEvents.slice(0, 6).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleEdit(event)}
                      className="rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-slate-900">{event.title || 'Sem título'}</span>
                        <span className="text-xs font-semibold text-slate-500">{event.startTime}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{compactDateFormatter.format(fromDateKey(event.date))} - {statusLabels[event.status]}</p>
                    </button>
                  ))}
                  {filteredEvents.length === 0 ? <p className="text-sm text-slate-500">Nada encontrado.</p> : null}
                </div>
              ) : null}
            </article>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wide text-sky-700">Calendário inteligente</p>
                  <h2 className="mt-1 text-xl font-bold capitalize text-slate-950">{monthFormatter.format(currentMonth)}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" aria-label="Mês anterior" onClick={() => shiftMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={goToToday}>
                    Hoje
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Próximo mês" onClick={() => shiftMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-bold tracking-wide text-slate-500">
                {weekDays.map((day) => (
                  <div key={day} className="px-2 py-3">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const dateKey = toDateKey(day);
                  const dayEvents = visibleEvents.filter((event) => event.date === dateKey);
                  const holiday = holidaysByDate.get(dateKey);
                  const isSelected = dateKey === selectedDate;
                  const isToday = dateKey === todayKey;
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => handleSelectDate(dateKey)}
                      className={cn(
                        'min-h-[106px] border-b border-r border-slate-100 p-2 text-left text-slate-800 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300',
                        !isCurrentMonth && 'bg-slate-50/80 text-slate-500',
                        isSelected && 'bg-sky-50 ring-1 ring-inset ring-sky-200',
                        isToday && !isSelected && 'bg-emerald-50/80'
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            'grid h-7 w-7 place-items-center rounded-full text-sm font-bold',
                            isSelected && 'bg-sky-600 text-white',
                            isToday && !isSelected && 'bg-emerald-600 text-white'
                          )}
                        >
                          {day.getDate()}
                        </span>
                        {holiday ? <span className={cn('h-2 w-2 rounded-full', holiday.type === 'national' ? 'bg-rose-500' : 'bg-amber-500')} /> : null}
                      </div>
                      {holiday ? <p className="mt-2 truncate text-[11px] font-semibold text-rose-700">{holiday.name}</p> : null}
                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <span
                            key={event.id}
                            className={cn(
                              'block truncate rounded-md px-2 py-1 text-[11px] font-semibold',
                              event.priority === 'critical' && 'bg-rose-100 text-rose-800',
                              event.priority === 'high' && 'bg-amber-100 text-amber-800',
                              event.priority === 'normal' && 'bg-sky-100 text-sky-800',
                              event.status === 'done' && 'bg-emerald-100 text-emerald-800 line-through'
                            )}
                          >
                            {event.startTime} {event.title || 'Sem título'}
                          </span>
                        ))}
                        {dayEvents.length > 2 ? <span className="text-[11px] font-bold text-slate-500">+{dayEvents.length - 2} itens</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wide text-sky-700">Batimento de agenda</p>
                  <h2 className="text-lg font-bold text-slate-950">{dateFormatter.format(fromDateKey(selectedDate))}</h2>
                </div>
                {selectedHoliday ? <HolidayBadge name={selectedHoliday.name} type={selectedHoliday.type} /> : null}
              </div>

              <div className="mt-4 space-y-3">
                {selectedEvents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    Nenhum compromisso nesta data. Use o painel ao lado para cadastrar um horário.
                  </div>
                ) : (
                  selectedEvents.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      conflict={hasConflict(event, visibleEvents)}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      onToggleDone={() => handleToggleDone(event)}
                    />
                  ))
                )}
              </div>
            </article>
          </div>

          <aside className="space-y-5">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-wide text-sky-700">Compromisso</p>
                  <h2 className="text-lg font-bold text-slate-950">{visibleEvents.some((event) => event.id === draft.id) ? 'Editar horário' : 'Novo horário'}</h2>
                </div>
                <Badge className="bg-slate-100 text-slate-700">{saveState === 'saving' ? 'Salvando' : saveState === 'saved' ? 'Salvo' : 'Rascunho'}</Badge>
              </div>

              <div className="mt-5 space-y-4">
                <Labeled label="Título">
                  <Input value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} placeholder="Ex.: Reunião com cliente" />
                </Labeled>
                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Data">
                    <Input type="date" value={draft.date} onChange={(event) => handleSelectDate(event.target.value)} />
                  </Labeled>
                  <Labeled label="Cliente">
                    <Input value={draft.client} onChange={(event) => updateDraft({ client: event.target.value })} placeholder="Opcional" />
                  </Labeled>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Início">
                    <Input type="time" value={draft.startTime} onChange={(event) => updateDraft({ startTime: event.target.value })} />
                  </Labeled>
                  <Labeled label="Fim">
                    <Input type="time" value={draft.endTime} onChange={(event) => updateDraft({ endTime: event.target.value })} />
                  </Labeled>
                </div>
                <Labeled label="Local">
                  <Input value={draft.location} onChange={(event) => updateDraft({ location: event.target.value })} placeholder="Endereço, telefone ou videochamada" />
                </Labeled>
                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Alerta">
                    <Select value={String(draft.alertMinutes)} onChange={(event) => updateDraft({ alertMinutes: Number(event.target.value) })} className="w-full">
                      {alertOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  </Labeled>
                  <Labeled label="Prioridade">
                    <Select value={draft.priority} onChange={(event) => updateDraft({ priority: event.target.value as AgendaEventPriority })} className="w-full">
                      <option value="normal">Normal</option>
                      <option value="high">Importante</option>
                      <option value="critical">Urgente</option>
                    </Select>
                  </Labeled>
                </div>
                <Labeled label="Status">
                  <Select value={draft.status} onChange={(event) => updateDraft({ status: event.target.value as AgendaEventStatus })} className="w-full">
                    <option value="confirmed">Confirmado</option>
                    <option value="tentative">A confirmar</option>
                    <option value="done">Concluído</option>
                  </Select>
                </Labeled>
                <Labeled label="Observações">
                  <Textarea value={draft.notes} onChange={(event) => updateDraft({ notes: event.target.value })} placeholder="Detalhes importantes, documentos, contato ou pauta." />
                </Labeled>

                {hasConflict(draft, visibleEvents) ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                    Existe outro compromisso nesse intervalo.
                  </div>
                ) : null}
                {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">{error}</div> : null}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSave} disabled={saveState === 'saving'}>
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button variant="outline" className="border-slate-300" onClick={() => handleNew()}>
                    <RotateCcw className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/20 text-sky-200">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold">Alertas inteligentes</h2>
                  <p className="text-sm text-slate-300">Notificações enquanto a agenda estiver aberta.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                {notificationState === 'granted' && 'Alertas ativados neste navegador.'}
                {notificationState === 'denied' && 'O navegador bloqueou notificações. Libere nas configurações do site.'}
                {notificationState === 'unsupported' && 'Este navegador não oferece notificações.'}
                {notificationState === 'default' && 'Ative para receber avisos antes dos compromissos.'}
              </div>
              {notificationState === 'default' ? (
                <Button className="mt-4 w-full bg-white text-slate-950 hover:bg-slate-100" onClick={requestNotificationPermission}>
                  <AlarmClock className="h-4 w-4" />
                  Ativar alertas
                </Button>
              ) : null}
            </article>

          </aside>
        </section>
      </div>
    </AuthGate>
  );
}

function KpiCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'sky' | 'emerald' | 'amber' | 'rose' }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className="mt-4 flex min-h-12 items-center justify-between gap-3">
        <span className="leading-none text-4xl font-extrabold text-slate-950">{value}</span>
        <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-bold', tones[tone])}>{detail}</span>
      </div>
    </article>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function HolidayBadge({ name, type }: { name: string; type: 'national' | 'optional' }) {
  return (
    <Badge className={cn(type === 'national' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}>
      {name}
    </Badge>
  );
}

function EventRow({
  event,
  conflict,
  onEdit,
  onDelete,
  onToggleDone
}: {
  event: AgendaEvent;
  conflict: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDone: () => void;
}) {
  return (
    <div className={cn('rounded-2xl border p-4', event.status === 'done' ? 'border-emerald-100 bg-emerald-50' : 'border-slate-200 bg-white')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                event.priority === 'critical' && 'bg-rose-100 text-rose-800',
                event.priority === 'high' && 'bg-amber-100 text-amber-800',
                event.priority === 'normal' && 'bg-sky-100 text-sky-800'
              )}
            >
              {priorityLabels[event.priority]}
            </Badge>
            <Badge className="bg-slate-100 text-slate-700">{statusLabels[event.status]}</Badge>
            {conflict ? <Badge className="bg-amber-100 text-amber-800">Conflito</Badge> : null}
          </div>
          <h3 className="mt-2 truncate text-base font-bold text-slate-950">{event.title || 'Sem título'}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-sky-600" />
              {event.startTime} - {event.endTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-sky-600" />
              {formatAlert(event.alertMinutes)}
            </span>
            {event.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-sky-600" />
                {event.location}
              </span>
            ) : null}
          </div>
          {event.client ? <p className="mt-2 text-sm font-semibold text-slate-700">{event.client}</p> : null}
          {event.notes ? <p className="mt-2 text-sm leading-6 text-slate-600">{event.notes}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="icon" aria-label="Concluir" onClick={onToggleDone}>
            <CheckCircle2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Editar" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="danger" size="icon" aria-label="Excluir" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
