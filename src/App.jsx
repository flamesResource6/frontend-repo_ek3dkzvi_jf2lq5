import { useEffect, useState } from 'react'

// Fallback to live backend URL if env is not provided
const DEFAULT_BACKEND = 'https://ta-01k9q6mragsbpxqfhsmjsq3d3p-8000.wo-h636j8e6d9bkee4f8adbiz86u.w.modal.host'
const API_BASE = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND

function AttendanceCard({ item }) {
  const pct = parseFloat(item.percetage)
  const color = pct >= 90 ? 'bg-green-100 text-green-800' : pct >= 80 ? 'bg-emerald-100 text-emerald-800' : pct >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">{item.code} • {item.category} • Slot {item.slot}</div>
          <div className="font-semibold text-slate-900">{item.title}</div>
          <div className="text-sm text-slate-600">{item.faculty}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${color}`}>{item.percetage}%</div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
        <div className="bg-slate-50 rounded-lg py-2"><div className="text-slate-400">Held</div><div className="font-medium">{item.conducted}</div></div>
        <div className="bg-slate-50 rounded-lg py-2"><div className="text-slate-400">Absent</div><div className="font-medium">{item.absent}</div></div>
        <div className="bg-slate-50 rounded-lg py-2"><div className="text-slate-400">Margin</div><div className="font-medium">{item.margin}</div></div>
        <div className="bg-slate-50 rounded-lg py-2"><div className="text-slate-400">Present</div><div className="font-medium">{item.conducted - item.absent}</div></div>
      </div>
    </div>
  )
}

function MarksCard({ item }) {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">{item.code} • {item.type}</div>
          <div className="font-semibold text-slate-900">{item.name}</div>
        </div>
        <div className="text-slate-700 font-medium">{item.total || '—'}</div>
      </div>
      {item.marks?.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {item.marks.map((m, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-2">
              <div className="text-xs text-slate-500">{m.name}</div>
              <div className="font-medium">{m.mark} / {m.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimetableView({ data }) {
  const days = ['Mon','Tue','Wed','Thu','Fri']
  return (
    <div className="space-y-4">
      {days.map((d, i) => (
        <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="font-semibold text-slate-800 mb-3">{d}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(data?.[i] || {}).map(([time, slot], idx) => (
              <div key={idx} className="rounded-lg border p-3 bg-slate-50">
                <div className="text-xs text-slate-500">{time}</div>
                <div className="font-medium">{slot.title}</div>
                <div className="text-xs text-slate-600">{slot.code} • {slot.room} • {slot.category}</div>
              </div>
            ))}
            {Object.keys(data?.[i]||{}).length===0 && (
              <div className="text-slate-400">No classes</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Tabs({ active, setActive }) {
  const tabs = ['Overview','Attendance','Marks','Timetable','Profile']
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map(t => (
        <button key={t} onClick={() => setActive(t)} className={`px-4 py-2 rounded-full border transition ${active===t? 'bg-slate-900 text-white border-slate-900':'bg-white text-slate-700 hover:bg-slate-50'}`}>{t}</button>
      ))}
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('Overview')
  const [attendance, setAttendance] = useState([])
  const [marks, setMarks] = useState([])
  const [timetable, setTimetable] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [a, m, t, u] = await Promise.all([
          fetch(`${API_BASE}/attendance`).then(r=>r.json()),
          fetch(`${API_BASE}/marks`).then(r=>r.json()),
          fetch(`${API_BASE}/timetable`).then(r=>r.json()),
          fetch(`${API_BASE}/user`).then(r=>r.json())
        ])
        setAttendance(Array.isArray(a) ? a : [])
        setMarks(Array.isArray(m) ? m : [])
        setTimetable(t?.data ? t.data : (t || {}))
        setUser(u && Object.keys(u).length ? u : null)
      } catch (e) {
        console.error(e)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen grid place-items-center text-slate-600">Loading…</div>

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Academic Tracker</div>
          <div className="text-sm text-slate-600">{user?.name} • {user?.roll}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}
        <Tabs active={active} setActive={setActive} />

        {active === 'Overview' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-slate-700 font-semibold">Attendance snapshot</div>
              {attendance.slice(0,3).map((i,idx)=> <AttendanceCard key={idx} item={i} />)}
              {attendance.length===0 && <div className="text-slate-500">No attendance yet.</div>}
            </div>
            <div className="space-y-3">
              <div className="text-slate-700 font-semibold">Recent marks</div>
              {marks.slice(0,3).map((i,idx)=> <MarksCard key={idx} item={i} />)}
              {marks.length===0 && <div className="text-slate-500">No marks yet.</div>}
            </div>
          </div>
        )}

        {active === 'Attendance' && (
          <div className="grid md:grid-cols-2 gap-4">
            {attendance.map((i,idx)=> <AttendanceCard key={idx} item={i} />)}
            {attendance.length===0 && <div className="text-slate-500">No attendance to show.</div>}
          </div>
        )}

        {active === 'Marks' && (
          <div className="grid md:grid-cols-2 gap-4">
            {marks.map((i,idx)=> <MarksCard key={idx} item={i} />)}
            {marks.length===0 && <div className="text-slate-500">No marks to show.</div>}
          </div>
        )}

        {active === 'Timetable' && (
          <TimetableView data={timetable} />
        )}

        {active === 'Profile' && user && (
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(user).map(([k,v]) => (
              <div key={k} className="bg-white border rounded-xl p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{k}</div>
                <div className="font-medium text-slate-800">{v}</div>
              </div>
            ))}
          </div>
        )}
        {active === 'Profile' && !user && (
          <div className="text-slate-500">No profile loaded.</div>
        )}
      </main>
    </div>
  )
}
