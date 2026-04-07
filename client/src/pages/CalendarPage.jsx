import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarEvents } from '../api';
import { useToast } from '../context/ToastContext';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCalendarEvents({ month: current.month, year: current.year });
      setEvents(res.data.data);
    } catch { addToast('Failed to load calendar events', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [current]);

  const prev = () => setCurrent(c => c.month === 1 ? { month:12, year:c.year-1 } : { month:c.month-1, year:c.year });
  const next = () => setCurrent(c => c.month === 12 ? { month:1, year:c.year+1 } : { month:c.month+1, year:c.year });

  // Build calendar grid
  const firstDay = new Date(current.year, current.month - 1, 1).getDay();
  const daysInMonth = new Date(current.year, current.month, 0).getDate();
  const daysInPrev = new Date(current.year, current.month - 1, 0).getDate();

  const cells = [];
  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, other: true });
  // Current month
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, other: false });
  // Next month padding
  let next_day = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next_day++, other: true });

  const today = new Date();
  const isToday = (d) => !d.other && d.day === today.getDate() && current.month === today.getMonth()+1 && current.year === today.getFullYear();

  const eventsForDay = (d) => {
    if (d.other) return [];
    const dateStr = `${current.year}-${String(current.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`;
    return events.filter(e => e.scheduled_date && e.scheduled_date.startsWith(dateStr));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="text-muted">{events.length} scheduled events this month</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-secondary btn-icon" onClick={prev}><ChevronLeft size={16} /></button>
          <span style={{ fontWeight:600, fontSize:15, minWidth:140, textAlign:'center' }}>
            {MONTHS[current.month-1]} {current.year}
          </span>
          <button className="btn btn-secondary btn-icon" onClick={next}><ChevronRight size={16} /></button>
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* Legend */}
          <div style={{ display:'flex', gap:16, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-secondary)' }}>
              <span style={{ width:10, height:10, borderRadius:2, background:'var(--green-bg)', border:'1px solid var(--green)', display:'inline-block' }} />
              Preventive
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-secondary)' }}>
              <span style={{ width:10, height:10, borderRadius:2, background:'var(--yellow-bg)', border:'1px solid var(--yellow)', display:'inline-block' }} />
              Corrective
            </div>
          </div>

          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div className="calendar-grid">
              {DAYS.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
              {cells.map((cell, i) => {
                const dayEvents = eventsForDay(cell);
                return (
                  <div key={i} className={`calendar-day ${cell.other?'other-month':''} ${isToday(cell)?'today':''}`}>
                    <div className="day-num">{cell.day}</div>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        className={`cal-event ${ev.type}`}
                        title={`${ev.subject} — ${ev.equipment_name || 'No equipment'} (${ev.assigned_name || 'Unassigned'})`}
                      >
                        {ev.subject}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>+{dayEvents.length-3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event List */}
          {events.length > 0 && (
            <div className="card" style={{ marginTop:20 }}>
              <div className="card-header">
                <span className="card-title">All Events — {MONTHS[current.month-1]} {current.year}</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Subject</th><th>Equipment</th><th>Type</th><th>Priority</th><th>Assigned To</th><th>Stage</th></tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id}>
                        <td className="text-muted text-sm">{ev.scheduled_date?.slice(0,10)}</td>
                        <td style={{ fontWeight:500 }}>{ev.subject}</td>
                        <td className="text-muted">{ev.equipment_name||'—'}</td>
                        <td><span className={`badge badge-${ev.type}`}>{ev.type}</span></td>
                        <td><span className={`badge badge-${ev.priority}`}>{ev.priority}</span></td>
                        <td className="text-muted">{ev.assigned_name||'—'}</td>
                        <td><span className={`badge badge-${ev.stage}`}>{ev.stage?.replace('_',' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
