import { useState, useEffect, useRef } from "react";

const COLORS = [
  { dot: "#3B82F6", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  { dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  { dot: "#F59E0B", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  { dot: "#8B5CF6", bg: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  { dot: "#EF4444", bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA" },
  { dot: "#EC4899", bg: "#FDF2F8", text: "#831843", border: "#FBCFE8" },
];

function dstr(off = 0) {
  const d = new Date();
  d.setDate(d.getDate() + off);
  return d.toISOString().split("T")[0];
}

function fdate(ds) {
  if (!ds) return "";
  if (ds === dstr(0)) return "Today";
  if (ds === dstr(1)) return "Tomorrow";
  if (ds === dstr(-1)) return "Yesterday";
  const d = new Date(ds + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const INIT_PROJECTS = [
  { id: "p1", name: "Website redesign", c: 0 },
  { id: "p2", name: "Q3 planning", c: 1 },
  { id: "p3", name: "Personal", c: 2 },
];

const INIT_TASKS = [
  { id: "t1", title: "Finalize homepage wireframes", project: "p1", pri: "high", date: dstr(0), done: false, notes: "" },
  { id: "t2", title: "Review copy deck with team", project: "p1", pri: "med", date: dstr(0), done: false, notes: "" },
  { id: "t3", title: "Set OKRs for Q3", project: "p2", pri: "high", date: dstr(1), done: false, notes: "" },
  { id: "t4", title: "Schedule stakeholder review", project: "p2", pri: "med", date: dstr(2), done: false, notes: "" },
  { id: "t5", title: "Book dentist appointment", project: "p3", pri: "low", date: dstr(3), done: false, notes: "" },
  { id: "t6", title: "Draft project timeline", project: "p1", pri: "med", date: dstr(-1), done: true, notes: "" },
  { id: "t7", title: "Weekly team sync prep", project: "p2", pri: "med", date: dstr(1), done: false, notes: "" },
  { id: "t8", title: "Update component library", project: "p1", pri: "low", date: dstr(4), done: false, notes: "" },
];

function PriDot({ pri }) {
  const c = pri === "high" ? "#EF4444" : pri === "med" ? "#F59E0B" : "#10B981";
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block", flexShrink: 0 }} />;
}

function TaskCard({ task, projects, onToggle, onClick, showProject = true }) {
  const p = projects.find(p => p.id === task.project);
  const cl = p ? COLORS[p.c % COLORS.length] : null;
  const late = !task.done && task.date && task.date < dstr(0);
  return (
    <div onClick={onClick} style={{
      background: "#fff", border: "1px solid #F1F5F9", borderRadius: 10,
      padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
      cursor: "pointer", transition: "border-color .15s, box-shadow .15s",
      marginBottom: 5,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#F1F5F9"; e.currentTarget.style.boxShadow = "none"; }}>
      <div onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        style={{ width: 17, height: 17, borderRadius: "50%", border: task.done ? "none" : "1.5px solid #CBD5E1", background: task.done ? "#10B981" : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
        {task.done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <PriDot pri={task.pri} />
      <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: task.done ? "#94A3B8" : "#1E293B", textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {task.date && <span style={{ fontSize: 11, color: late ? "#EF4444" : "#94A3B8" }}>{fdate(task.date)}</span>}
        {showProject && cl && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: cl.bg, color: cl.text, fontWeight: 500, border: `1px solid ${cl.border}` }}>{p.name}</span>}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,.4)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)"
    }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 360, maxWidth: "94vw", boxShadow: "0 20px 60px rgba(0,0,0,.15)", border: "1px solid #F1F5F9" }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [view, setView] = useState("today");
  const [sub, setSub] = useState("list");
  const [activeProj, setActiveProj] = useState(null);
  const [modal, setModal] = useState(null); // {type:'task'|'project', id?}
  const [qi, setQi] = useState("");
  const [qp, setQp] = useState("");
  const [qpri, setQpri] = useState("med");
  const [qd, setQd] = useState(dstr(0));
  const [aiInput, setAiInput] = useState("");
  const [aiResp, setAiResp] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [mName, setMName] = useState("");

  const gp = id => projects.find(p => p.id === id);
  const cl = p => p ? COLORS[p.c % COLORS.length] : null;

  function toggleDone(id) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function quickAdd() {
    if (!qi.trim()) return;
    setTasks(ts => [...ts, {
      id: "t" + Date.now(), title: qi.trim(),
      project: qp || projects[0]?.id || "",
      pri: qpri, date: qd || dstr(0), done: false, notes: ""
    }]);
    setQi("");
  }

  function svt(v) {
    setView(v); setActiveProj(null);
  }

  function openProj(id) {
    setView("project"); setActiveProj(id);
  }

  async function runAI() {
    const q = aiInput.trim();
    const prompt = q || "Help me prioritize my tasks and decide what to focus on today.";
    if (!q) { setAiInput(""); }
    setAiLoading(true); setAiResp("");
    const sum = tasks.filter(t => !t.done).map(t => `"${t.title}" (${gp(t.project)?.name || "no project"}, due ${t.date || "no date"}, ${t.pri} priority)`).join("; ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `You are a concise productivity coach. The user's open tasks: ${sum}. Question: "${prompt}". Reply in 2-3 practical sentences. Be specific about task names.` }]
        })
      });
      const data = await res.json();
      setAiResp(data.content?.find(b => b.type === "text")?.text || "No response.");
    } catch { setAiResp("Couldn't reach AI. Try again."); }
    setAiLoading(false); setAiInput("");
  }

  function saveTask() {
    if (!editTask?.title?.trim()) return;
    if (editTask.id) {
      setTasks(ts => ts.map(t => t.id === editTask.id ? editTask : t));
    } else {
      setTasks(ts => [...ts, { ...editTask, id: "t" + Date.now(), done: false }]);
    }
    setModal(null); setEditTask(null);
  }

  function deleteTask(id) {
    setTasks(ts => ts.filter(t => t.id !== id));
    setModal(null); setEditTask(null);
  }

  function saveProject() {
    if (!mName.trim()) return;
    setProjects(ps => [...ps, { id: "p" + Date.now(), name: mName.trim(), c: ps.length }]);
    setModal(null); setMName("");
  }

  function openTaskModal(id) {
    if (id) {
      setEditTask({ ...tasks.find(t => t.id === id) });
    } else {
      setEditTask({ title: "", project: activeProj || projects[0]?.id || "", pri: "med", date: dstr(0), notes: "" });
    }
    setModal({ type: "task", id });
  }

  const viewTitle = view === "today" ? "Today" : view === "week" ? "This week" : view === "overview" ? "Big picture" : (gp(activeProj)?.name || "Project");

  // --- Renders ---
  function renderToday() {
    const ov = tasks.filter(t => !t.done && t.date && t.date < dstr(0));
    const due = tasks.filter(t => !t.done && t.date === dstr(0));
    const done = tasks.filter(t => t.done && t.date === dstr(0));
    if (sub === "board") return renderBoard(tasks.filter(t => t.date === dstr(0) || (!t.done && t.date < dstr(0))));
    return (
      <div>
        {ov.length > 0 && <><div style={sHead}><span style={{ color: "#EF4444" }}>⚠ Overdue ({ov.length})</span></div>{ov.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
        {due.length > 0 && <><div style={sHead}>Due today ({due.length})</div>{due.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
        {done.length > 0 && <><div style={{ ...sHead, color: "#94A3B8" }}>Completed ({done.length})</div>{done.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
        {!ov.length && !due.length && !done.length && <div style={empty}><div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>Nothing scheduled for today</div>}
      </div>
    );
  }

  function renderProject() {
    const todo = tasks.filter(t => t.project === activeProj && !t.done);
    const done = tasks.filter(t => t.project === activeProj && t.done);
    if (sub === "board") return renderBoard(tasks.filter(t => t.project === activeProj));
    return (
      <div>
        {todo.length > 0 && <><div style={sHead}>Tasks ({todo.length})</div>{todo.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} showProject={false} />)}</>}
        {done.length > 0 && <><div style={{ ...sHead, color: "#94A3B8" }}>Done ({done.length})</div>{done.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} showProject={false} />)}</>}
        {!tasks.filter(t => t.project === activeProj).length && <div style={empty}><div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>No tasks yet — add one above</div>}
      </div>
    );
  }

  function renderWeek() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const cols = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - today.getDay() + i);
      const ds = d.toISOString().split("T")[0];
      const dt = tasks.filter(t => t.date === ds);
      const isT = ds === dstr(0);
      return (
        <div key={i} style={{ background: isT ? "#fff" : "#F8FAFC", border: isT ? "1px solid #CBD5E1" : "1px solid #F1F5F9", borderRadius: 10, padding: "10px 8px", minHeight: 110 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", marginBottom: 3 }}>{days[i]}</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: isT ? "#3B82F6" : "#1E293B" }}>{d.getDate()}</div>
          {dt.map(t => {
            const p = gp(t.project); const c = p ? COLORS[p.c % COLORS.length] : { bg: "#F8FAFC", text: "#475569" };
            return <div key={t.id} onClick={() => openTaskModal(t.id)} style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, marginBottom: 3, background: c.bg, color: c.text, cursor: "pointer", lineHeight: 1.4, wordBreak: "break-word" }} title={t.title}>{t.title.length > 18 ? t.title.slice(0, 16) + "…" : t.title}</div>;
          })}
        </div>
      );
    });
    const upcoming = tasks.filter(t => !t.done && t.date > dstr(6) && t.date <= dstr(14));
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 7, marginBottom: 20 }}>{cols}</div>
        {upcoming.length > 0 && <><div style={sHead}>Upcoming — next 2 weeks</div>{upcoming.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
      </div>
    );
  }

  function renderOverview() {
    const total = tasks.length, done = tasks.filter(t => t.done).length;
    const late = tasks.filter(t => !t.done && t.date < dstr(0)).length;
    const today = tasks.filter(t => t.date === dstr(0) && !t.done).length;
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 12 }}>PROJECT PROGRESS</div>
            {projects.map(p => {
              const pt = tasks.filter(t => t.project === p.id);
              const pd = pt.filter(t => t.done).length;
              const pct = pt.length ? Math.round(pd / pt.length * 100) : 0;
              const c = COLORS[p.c % COLORS.length];
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <div style={{ width: 70, height: 4, background: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c.dot, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 28, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 12 }}>AT A GLANCE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["#1E293B", total - done, "Open tasks"], ["#10B981", done, "Completed"], ["#EF4444", late, "Overdue"], ["#3B82F6", today, "Due today"]].map(([color, num, label]) => (
                <div key={label} style={{ background: "#fff", borderRadius: 8, padding: "9px 11px" }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color }}>{num}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {projects.map(p => {
          const pt = tasks.filter(t => t.project === p.id && !t.done);
          if (!pt.length) return null;
          const c = COLORS[p.c % COLORS.length];
          return (
            <div key={p.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0 8px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{p.name}</span>
              </div>
              {pt.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} showProject={false} />)}
            </div>
          );
        })}
      </div>
    );
  }

  function renderBoard(taskList) {
    const cols = [
      { l: "To do", f: t => !t.done && t.date !== dstr(0) },
      { l: "Today", f: t => !t.done && t.date === dstr(0) },
      { l: "Done", f: t => t.done },
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {cols.map(col => {
          const ct = taskList.filter(col.f);
          return (
            <div key={col.l} style={{ background: "#F8FAFC", borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>{col.l} <span style={{ color: "#CBD5E1" }}>({ct.length})</span></div>
              {ct.map(t => {
                const p = gp(t.project); const c = p ? COLORS[p.c % COLORS.length] : null;
                return (
                  <div key={t.id} onClick={() => openTaskModal(t.id)} style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 8, padding: "8px 10px", marginBottom: 6, cursor: "pointer", fontSize: 12, lineHeight: 1.5 }}>
                    {t.title}
                    {c && <div><span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: c.bg, color: c.text, marginTop: 4, display: "inline-block" }}>{p.name}</span></div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  const sHead = { fontSize: 11, fontWeight: 600, color: "#94A3B8", margin: "4px 0 8px", letterSpacing: "0.3px" };
  const empty = { textAlign: "center", padding: "40px 20px", color: "#94A3B8", fontSize: 13 };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1E293B", background: "#F8FAFC", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ background: "#fff", borderRight: "1px solid #F1F5F9", display: "flex", flexDirection: "column", padding: "16px 0" }}>
          <div style={{ padding: "0 16px 14px", fontSize: 15, fontWeight: 600, borderBottom: "1px solid #F1F5F9", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, color: "#0F172A" }}>
            <div style={{ width: 26, height: 26, background: "#3B82F6", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" /><rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".6" /><rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".6" /><rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" /></svg>
            </div>
            Focus
          </div>
          {[
            { id: "today", icon: "☀", label: "Today" },
            { id: "week", icon: "📅", label: "This week" },
            { id: "overview", icon: "◎", label: "Big picture" },
          ].map(({ id, icon, label }) => (
            <div key={id} onClick={() => svt(id)} style={{ padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: view === id ? "#1E293B" : "#64748B", fontWeight: view === id ? 600 : 400, background: view === id ? "#F8FAFC" : "transparent", borderRight: view === id ? "2px solid #3B82F6" : "2px solid transparent" }}>
              <span style={{ fontSize: 14 }}>{icon}</span>{label}
            </div>
          ))}
          <div style={{ padding: "14px 16px 6px", fontSize: 10, fontWeight: 700, color: "#CBD5E1", letterSpacing: "0.8px" }}>PROJECTS</div>
          {projects.map(p => {
            const c = COLORS[p.c % COLORS.length];
            const active = view === "project" && activeProj === p.id;
            return (
              <div key={p.id} onClick={() => openProj(p.id)} style={{ padding: "7px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: active ? "#1E293B" : "#64748B", fontWeight: active ? 600 : 400, background: active ? "#F8FAFC" : "transparent", borderRight: active ? `2px solid ${c.dot}` : "2px solid transparent" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
                {p.name}
              </div>
            );
          })}
          <button onClick={() => { setMName(""); setModal({ type: "project" }); }} style={{ margin: "10px 16px 0", padding: "7px 10px", fontSize: 12, border: "1px dashed #CBD5E1", borderRadius: 8, cursor: "pointer", color: "#94A3B8", background: "transparent", textAlign: "left", display: "flex", alignItems: "center", gap: 5 }}>
            + New project
          </button>
        </div>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Topbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#fff" }}>
            <div style={{ fontSize: 16, fontWeight: 600, flex: 1, color: "#0F172A" }}>{viewTitle}</div>
            <div style={{ display: "flex", gap: 3, background: "#F8FAFC", borderRadius: 8, padding: 3 }}>
              {[["list", "≡ List"], ["board", "⊞ Board"]].map(([v, l]) => (
                <button key={v} onClick={() => setSub(v)} style={{ padding: "4px 10px", fontSize: 12, border: sub === v ? "1px solid #E2E8F0" : "none", background: sub === v ? "#fff" : "transparent", borderRadius: 6, cursor: "pointer", color: sub === v ? "#1E293B" : "#64748B", fontWeight: sub === v ? 500 : 400 }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Quick capture */}
          <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderBottom: "1px solid #F1F5F9", background: "#fff", flexWrap: "wrap", alignItems: "center" }}>
            <input value={qi} onChange={e => setQi(e.target.value)} onKeyDown={e => e.key === "Enter" && quickAdd()} placeholder="Quick capture — type a task and hit Enter" style={{ flex: 1, minWidth: 180, padding: "8px 12px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", color: "#1E293B" }} />
            <select value={qp} onChange={e => setQp(e.target.value)} style={{ padding: "7px 9px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, color: "#64748B", background: "#fff" }}>
              <option value="">Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={qpri} onChange={e => setQpri(e.target.value)} style={{ padding: "7px 9px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, color: "#64748B", background: "#fff" }}>
              <option value="high">High</option>
              <option value="med">Medium</option>
              <option value="low">Low</option>
            </select>
            <input type="date" value={qd} onChange={e => setQd(e.target.value)} style={{ padding: "7px 9px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, color: "#64748B", background: "#fff" }} />
            <button onClick={quickAdd} style={{ padding: "7px 14px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", background: "#fff", color: "#1E293B", fontWeight: 500 }}>+ Add</button>
          </div>

          {/* AI response */}
          {(aiResp || aiLoading) && (
            <div style={{ margin: "0 20px", marginTop: 12, padding: "12px 14px", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, fontSize: 13, color: "#0C4A6E", lineHeight: 1.7 }}>
              <span style={{ fontSize: 14, marginRight: 7 }}>✦</span>
              {aiLoading ? "Thinking…" : aiResp}
              {aiResp && <button onClick={() => setAiResp("")} style={{ marginLeft: 10, fontSize: 11, border: "none", background: "transparent", cursor: "pointer", color: "#7DD3FC" }}>×</button>}
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {view === "today" && renderToday()}
            {view === "week" && renderWeek()}
            {view === "overview" && renderOverview()}
            {view === "project" && renderProject()}
          </div>

          {/* AI bar */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", background: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 16, color: "#94A3B8" }}>✦</span>
            <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && runAI()} placeholder="Ask AI: what should I focus on? reschedule overdue tasks? summarize my week…" style={{ flex: 1, padding: "8px 12px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", color: "#1E293B" }} />
            <button onClick={runAI} disabled={aiLoading} style={{ padding: "8px 14px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
              {aiLoading ? "…" : "Ask ↗"}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "project" && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>New project</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5 }}>Name</label>
            <input autoFocus value={mName} onChange={e => setMName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveProject()} placeholder="Project name" style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setModal(null)} style={{ padding: "7px 14px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", background: "#fff", color: "#64748B" }}>Cancel</button>
            <button onClick={saveProject} style={{ padding: "7px 14px", fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500 }}>Create</button>
          </div>
        </Modal>
      )}

      {modal?.type === "task" && editTask && (
        <Modal onClose={() => { setModal(null); setEditTask(null); }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{modal.id ? "Edit task" : "New task"}</div>
          {[
            ["Title", <input key="t" autoFocus value={editTask.title} onChange={e => setEditTask(et => ({ ...et, title: e.target.value }))} style={inp} />],
            ["Project", <select key="p" value={editTask.project} onChange={e => setEditTask(et => ({ ...et, project: e.target.value }))} style={inp}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>],
            ["Due date", <input key="d" type="date" value={editTask.date} onChange={e => setEditTask(et => ({ ...et, date: e.target.value }))} style={inp} />],
            ["Priority", <select key="pr" value={editTask.pri} onChange={e => setEditTask(et => ({ ...et, pri: e.target.value }))} style={inp}><option value="high">High</option><option value="med">Medium</option><option value="low">Low</option></select>],
            ["Notes", <textarea key="n" value={editTask.notes} onChange={e => setEditTask(et => ({ ...et, notes: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />],
          ].map(([label, el]) => (
            <div key={label} style={{ marginBottom: 11 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5 }}>{label}</label>
              {el}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            {modal.id && <button onClick={() => deleteTask(modal.id)} style={{ padding: "7px 14px", fontSize: 13, border: "1px solid #FCA5A5", borderRadius: 8, cursor: "pointer", background: "#FEF2F2", color: "#EF4444", marginRight: "auto" }}>Delete</button>}
            <button onClick={() => { setModal(null); setEditTask(null); }} style={{ padding: "7px 14px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", background: "#fff", color: "#64748B" }}>Cancel</button>
            <button onClick={saveTask} style={{ padding: "7px 14px", fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500 }}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const inp = { width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", fontFamily: "inherit", color: "#1E293B", boxSizing: "border-box" };
