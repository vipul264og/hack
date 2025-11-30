// src/App.jsx
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "group_project_manager_v1";

const defaultData = {
  projects: [
    {
      id: "p1",
      title: "AI Attendance System",
      description: "Build a face-recognition based attendance system for labs.",
      group: "Group A",
      deadline: "2025-12-20",
      status: "On Track",
      progress: 45,
      milestones: [
        { id: "m1", title: "Requirement Analysis", dueDate: "2025-11-30", completed: true },
        { id: "m2", title: "Model Training", dueDate: "2025-12-10", completed: false },
      ],
      tasks: [
        { id: "t1", text: "Collect sample face dataset", owner: "Vipul", done: true },
        { id: "t2", text: "Design database schema", owner: "Aman", done: false },
        { id: "t3", text: "Build React dashboard UI", owner: "Priya", done: false },
      ],
      submission: { link: "", note: "", submittedAt: null, marks:null, remark:null },  // 🔥 ADDED FIELDS
    },
    {
      id: "p2",
      title: "Smart Farming Dashboard",
      description: "IoT + ML dashboard to monitor soil, weather, and crop health.",
      group: "Group B",
      deadline: "2025-12-25",
      status: "At Risk",
      progress: 20,
      milestones: [{ id: "m1", title: "Sensor Research", dueDate: "2025-12-05", completed: false }],
      tasks: [
        { id: "t1", text: "Finalize tech stack", owner: "Arjun", done: false },
        { id: "t2", text: "Create wireframes", owner: "Neha", done: false },
      ],
      submission: { link: "", note: "", submittedAt: null, marks:null, remark:null }, // 🔥 ADDED FIELDS
    },
  ],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return (!parsed.projects || !Array.isArray(parsed.projects)) ? defaultData : parsed;
  } catch { return defaultData; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function App() {
  const [data, setData] = useState(loadData);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(()=>saveData(data),[data]);

  const handleLogin = (user)=> setCurrentUser(user);
  const handleLogout = ()=> setCurrentUser(null);

  const updateProject = (id, cb)=>{
    setData(prev => {
      const projects = prev.projects.map(p=> p.id===id?cb(p):p);
      return {...prev, projects};
    });
  };

  const createProject = (p)=> setData(prev=>({...prev,projects:[...prev.projects,p]}));

  const value={data,currentUser,updateProject,createProject,handleLogout};

  /* 🔥 LIGHT / DARK THEME */
  const [theme,setTheme]=useState(
    window.matchMedia("(prefers-color-scheme: light)").matches ? "light":"dark"
  );

  useEffect(()=>{ document.documentElement.setAttribute("data-theme",theme); },[theme]);
  const toggleTheme=()=>setTheme(theme==="dark"?"light":"dark");

  return (
    <div className="app-shell">

      {/* 🔥 THEME SWITCH BUTTON ADDED */}
      <button
        style={{position:"fixed",top:"15px",right:"25px",zIndex:999}}
        className="ghost-btn"
        onClick={toggleTheme}
      >
        {theme==="dark"?"☀ Light Mode":"🌙 Dark Mode"}
      </button>

      {!currentUser ? <AuthScreen onLogin={handleLogin}/> :
      <DashboardProvider value={value}><MainLayout/></DashboardProvider>}
    </div>
  );
}

/* ✅ UPDATED: email + password added, rest unchanged */
function AuthScreen({ onLogin }) {
  const [role,setRole]=useState("student");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [group,setGroup]=useState("Group A");
  const [error,setError]=useState("");

  const submit=e=>{
    e.preventDefault();
    if(!name.trim()) return setError("Please enter your name.");
    if(!email.trim()) return setError("Please enter your email.");
    if(!password.trim()) return setError("Please enter your password.");
    if(role==="student"&&!group) return setError("Please select a group.");
    setError("");
    onLogin({
      name:name.trim(),
      email:email.trim(),
      password:password.trim(),
      role,
      group:role==="student"?group:null
    });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ProjectSphere</h1>
          <p>Collaborate. Track. Submit. All in one place.</p>
        </div>

        <div className="role-toggle">
          <button type="button" onClick={()=>setRole("student")} className={role==="student"?"role-btn active":"role-btn"}>Student</button>
          <button type="button" onClick={()=>setRole("teacher")} className={role==="teacher"?"role-btn active":"role-btn"}>Teacher</button>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label className="field"><span>Full Name</span>
            <input value={name} onChange={e=>setName(e.target.value)}/>
          </label>

          <label className="field"><span>Email</span>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
          </label>

          <label className="field"><span>Password</span>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
          </label>

          {role==="student"&&(
            <label className="field"><span>Group</span>
              <select value={group} onChange={e=>setGroup(e.target.value)}>
                <option>Group A</option><option>Group B</option><option>Group C</option>
              </select>
            </label>
          )}

          {error&&<div className="error-chip">{error}</div>}
          <button type="submit" className="primary-btn wide">
            {role==="teacher"?"Enter Teacher Space":"Enter Student Space"}
          </button>
        </form>

        <p className="auth-footnote">FEDF-PS35 • Group Project Manager</p>
      </div>
    </div>
  );
}

const DashboardContext = (function(){
  let val=null;
  return{
    Provider:({children,contextValue})=>(val=contextValue,children),
    use:()=>val
  };
})();

function DashboardProvider({children,value}) {
  return <DashboardContext.Provider contextValue={value}>{children}</DashboardContext.Provider>;
}

function useDashboard(){
  const x=DashboardContext.use();
  if(!x) throw new Error("useDashboard used outside provider");
  return x;
}

function MainLayout(){
  const {currentUser,handleLogout}=useDashboard();
  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-left"><div className="logo-mark">PS</div>
          <div><div className="app-title">ProjectSphere</div>
          <div className="app-subtitle">Student Project Manager</div></div>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">{currentUser.role==="teacher"?"Teacher":currentUser.group}</span>
          </div>
          <button className="ghost-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="main-grid"><Sidebar/><ContentArea/></main>
    </div>
  );
}

function Sidebar(){
  const{currentUser,data}=useDashboard();
  const total=data.projects.length;

  const myProjects=useMemo(
    ()=>currentUser.role==="teacher"?data.projects:data.projects.filter(p=>p.group===currentUser.group),
    [currentUser,data.projects]
  );

  const avg=myProjects.length?Math.round(myProjects.reduce((a,p)=>a+(p.progress||0),0)/myProjects.length):0;
  const submitted=myProjects.filter(p=>p.submission?.submittedAt).length;

  return(
    <aside className="sidebar">
      <h2>Overview</h2>
      <div className="stat-grid">
        <StatCard label={currentUser.role==="teacher"?"All Projects":"My Projects"} value={myProjects.length} hint={`${total} total`}/>
        <StatCard label="Avg Progress" value={`${avg}%`}/>
        <StatCard label="Submissions" value={submitted}/>
      </div>
      <div className="sidebar-section"><h3>Quick Filters</h3>
        <ul className="pill-list"><li className="pill">On Track</li><li className="pill warning">At Risk</li><li className="pill success">Submitted</li></ul>
      </div>
      <div className="sidebar-section"><h3>Hints</h3>
        <ul className="hint-list">
          <li>Students complete tasks to increase progress.</li>
          <li>Teachers can add projects & milestones.</li>
          <li>Submissions accept GitHub/Drive links.</li>
        </ul>
      </div>
    </aside>
  );
}

function StatCard({label,value,hint}){
  return(
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint&&<div className="stat-hint">{hint}</div>}
    </div>
  );
}

function ContentArea(){
  const{currentUser,data}=useDashboard();
  const [id,setId]=useState(data.projects[0]?.id||null);

  const projects=currentUser.role==="teacher"?data.projects:data.projects.filter(p=>p.group===currentUser.group);

  useEffect(()=>{ if(projects.length&&!projects.find(p=>p.id===id))setId(projects[0].id); },[projects,id]);

  const p=projects.find(x=>x.id===id);

  return(
    <section className="content">
      <div className="content-header">
        <h2>{currentUser.role==="teacher"?"Teacher Dashboard":"Student Workspace"}</h2>
        <span className="chip-outline">{currentUser.role==="teacher"?"Assign, monitor, evaluate":"Plan, collaborate, submit"}</span>
      </div>
      <div className="content-grid">
        <ProjectsList projects={projects} selectedId={id} onSelect={setId}/>
        {p&&<ProjectDetail project={p}/>}
      </div>
    </section>
  );
}

function ProjectsList({projects,selectedId,onSelect}){
  const{currentUser,createProject}=useDashboard();
  const [show,setShow]=useState(false),[title,setTitle]=useState(""),[group,setGroup]=useState("Group A"),[deadline,setDeadline]=useState(""),[description,setDescription]=useState("");

  const submit=e=>{
    e.preventDefault();
    if(!title.trim()||!description.trim()||!deadline) return;
    const id=`p_${Date.now()}`;
    createProject({id,title:title.trim(),description:description.trim(),group,deadline,status:"On Track",progress:0,milestones:[],tasks:[],submission:{link:"",note:"",submittedAt:null,marks:null,remark:null}});
    setTitle("");setGroup("Group A");setDeadline("");setDescription("");setShow(false);onSelect(id);
  };

  return(
    <div className="panel">
      <div className="panel-header">
        <div><h3>Projects</h3><p className="muted">{projects.length?"Select to view details.":"No projects yet."}</p></div>
        {currentUser.role==="teacher"&&<button className="primary-btn small" onClick={()=>setShow(!show)}>{show?"Close":"New Project"}</button>}
      </div>

      {currentUser.role==="teacher"&&show&&(
        <form onSubmit={submit} className="new-project-form">
          <label className="field"><span>Title</span><input value={title} onChange={e=>setTitle(e.target.value)}/></label>
          <label className="field"><span>Group</span><select value={group} onChange={e=>setGroup(e.target.value)}><option>Group A</option><option>Group B</option><option>Group C</option></select></label>
          <label className="field"><span>Deadline</span><input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label>
          <label className="field"><span>Description</span><textarea rows="2" value={description} onChange={e=>setDescription(e.target.value)}/></label>
          <button className="primary-btn wide" type="submit">Create Project</button>
        </form>
      )}

      <div className="project-list">
        {projects.map(p=>(
          <ProjectListItem key={p.id} project={p} active={p.id===selectedId} onClick={()=>onSelect(p.id)}/>
        ))}
        {!projects.length&&<div className="empty-state">No projects available</div>}
      </div>
    </div>
  );
}

function ProjectListItem({project,active,onClick}){
  const d=new Date(project.deadline),now=new Date(),diff=Math.ceil((d-now)/(1000*60*60*24));
  const days=project.deadline?(diff<0?"Past deadline":`${diff} days left`):"";
  const cls=project.status==="On Track"?"tag success":project.status==="At Risk"?"tag warning":"tag";

  return(
    <button className={active?"project-item active":"project-item"} onClick={onClick}>
      <div className="project-item-top"><h4>{project.title}</h4><span className={cls}>{project.status}</span></div>
      <div className="project-item-mid"><span className="pill slim">{project.group}</span><span className="deadline-text">{days}</span></div>
      <div className="progress-bar"><div className="progress-fill" style={{width:`${project.progress||0}%`}}/></div>
    </button>
  );
}

function ProjectDetail({project}){
  const{currentUser,updateProject}=useDashboard();

  const toggleTask=id=>{
    updateProject(project.id,p=>{
      const t=p.tasks.map(x=>x.id===id?{...x,done:!x.done}:x);
      const done=t.filter(x=>x.done).length,prog=t.length?Math.round((done/t.length)*100):p.progress;
      return{...p,tasks:t,progress:prog};
    });
  };
  const toggleMilestone=id=>updateProject(project.id,p=>({...p,milestones:p.milestones.map(x=>x.id===id?{...x,completed:!x.completed}:x)}));

  const[task,setTask]=useState(""),[owner,setOwner]=useState("");
  const add=e=>{
    e.preventDefault();if(!task.trim())return;
    updateProject(project.id,p=>({...p,tasks:[...p.tasks,{id:`t_${Date.now()}`,text:task.trim(),owner:owner.trim()||"Unassigned",done:false}]}));
    setTask("");setOwner("");
  };

  const[mt,setMt]=useState(""),[md,setMd]=useState("");
  const addM=e=>{
    e.preventDefault();if(!mt.trim()||!md)return;
    updateProject(project.id,p=>({...p,milestones:[...p.milestones,{id:`m_${Date.now()}`,title:mt.trim(),dueDate:md,completed:false}]}));
    setMt("");setMd("");
  };

  const[l,setL]=useState(project.submission?.link||""),[n,setN]=useState(project.submission?.note||""),[loading,setLoad]=useState(false);

  useEffect(()=>{ setL(project.submission?.link||""); setN(project.submission?.note||""); },[project.id]);

  const submit=e=>{
    e.preventDefault();if(!l.trim())return;setLoad(true);
    setTimeout(()=>{
      updateProject(project.id,p=>({...p,status:"Submitted",submission:{...p.submission,link:l.trim(),note:n.trim(),submittedAt:new Date().toISOString()}}));
      setLoad(false);
    },300);
  };

  return(
    <div className="panel">
      <div className="panel-header">
        <div><h3>{project.title}</h3><p className="muted">{project.description}</p></div>
        <div className="detail-tags"><span className="pill slim">{project.group}</span><span className="tag">Deadline: {project.deadline}</span></div>
      </div>

      <div className="detail-grid">

        {/* TASKS */}
        <section className="detail-section">
          <div className="detail-section-header"><h4>Tasks</h4></div>
          <ul className="list">
            {project.tasks.map(t=>(
              <li key={t.id} className="list-item">
                <label className="checkbox-row">
                  <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)}/>
                  <span className={t.done?"task-done":""}>{t.text}</span>
                </label><span className="pill slim">{t.owner}</span>
              </li>
            ))}
            {!project.tasks.length&&<li className="empty-row">No tasks yet</li>}
          </ul>
          <form onSubmit={add} className="inline-form">
            <input value={task} onChange={e=>setTask(e.target.value)} placeholder="New task"/>
            <input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="Owner"/>
            <button className="ghost-btn">Add</button>
          </form>
        </section>

        {/* MILESTONES */}
        <section className="detail-section">
          <div className="detail-section-header"><h4>Milestones</h4></div>
          <ul className="list">
            {project.milestones.map(m=>(
              <li key={m.id} className="list-item">
                <label className="checkbox-row">
                  <input type="checkbox" checked={m.completed} onChange={()=>toggleMilestone(m.id)}/>
                  <span className={m.completed?"task-done":""}>{m.title}</span>
                </label><span className="deadline-text">Due: {m.dueDate}</span>
              </li>
            ))}
            {!project.milestones.length&&<li className="empty-row">No milestones</li>}
          </ul>
          {currentUser.role==="teacher"&&(
            <form onSubmit={addM} className="inline-form">
              <input value={mt} onChange={e=>setMt(e.target.value)} placeholder="Milestone"/>
              <input type="date" value={md} onChange={e=>setMd(e.target.value)}/>
              <button className="ghost-btn">Add</button>
            </form>
          )}
        </section>
      </div>

      {/* SUBMISSION */}
      <section className="detail-section submission-section">
        <div className="detail-section-header">
          <div><h4>Final Submission</h4></div>
          {project.submission?.submittedAt && (
            <span className="tag success">Submitted on {new Date(project.submission.submittedAt).toLocaleString()}</span>
          )}
        </div>

        {/* 🔥 Teacher View (Read + Grade Option) */}
        {currentUser.role==="teacher"&&(
          <div className="submission-display-box">
            <p><strong>Link:</strong> {project.submission?.link||"Not submitted"}</p>
            <p><strong>Note:</strong> {project.submission?.note||"No note"}</p>
            <p><strong>Marks:</strong> {project.submission?.marks??"Not graded"}</p>
            <p><strong>Remark:</strong> {project.submission?.remark??"No remark"}</p>
          </div>
        )}

        {/* 🔥 Teacher Marks Entry (ADDED) */}
        {currentUser.role==="teacher" && project.submission?.submittedAt && (
          <form onSubmit={(e)=>{
            e.preventDefault();
            const marks=e.target.marks.value, remark=e.target.remark.value;
            updateProject(project.id,p=>({...p,submission:{...p.submission,marks,remark}}));
            alert("✔ Evaluation saved");
          }} className="submission-form">
            <label className="field">
              <span>Marks (out of 100)</span>
              <input name="marks" type="number" min="0" max="100" defaultValue={project.submission?.marks||""}/>
            </label>
            <label className="field">
              <span>Teacher Remark</span>
              <textarea name="remark" rows="2" defaultValue={project.submission?.remark||""}/>
            </label>
            <button className="primary-btn">Save Evaluation</button>
          </form>
        )}

        {/* 🔥 Student Submit Work */}
        {currentUser.role==="student"&&(
          <form onSubmit={submit} className="submission-form">
            <label className="field"><span>Project Link</span>
              <input value={l} onChange={e=>setL(e.target.value)}/>
            </label>
            <label className="field"><span>Note</span>
              <textarea rows="2" value={n} onChange={e=>setN(e.target.value)}/>
            </label>
            <div className="submission-actions">
              <div className="progress-pill"><span>Progress</span><strong>{project.progress}%</strong></div>
              <button className="primary-btn" disabled={loading}>{loading?"Submitting...":"Submit Work"}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default App;
