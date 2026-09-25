import './App.css'

import { useRef, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Camera, Check, ChevronDown, ClipboardCheck,
  FileText, Gauge, LayoutDashboard, Menu, Search, Shield, ShieldAlert, SlidersHorizontal,
  Upload, Users, X, ArrowUpRight, Clock3, CircleHelp, MapPin, CalendarDays, Plus,
} from 'lucide-react'

const reports = [
  { id: 'SIF-2026-0087', title: 'Forklift entered pedestrian movement zone', type: 'Near Miss', hazard: 'Vehicle interaction', sif: 'High', barrier: 'Ineffective', review: 'Needs review', date: '18 Sep 2026' },
  { id: 'SIF-2026-0086', title: 'Unsecured load observed above work area', type: 'Unsafe Condition', hazard: 'Dropped object', sif: 'High', barrier: 'Absent', review: 'In review', date: '17 Sep 2026' },
  { id: 'SIF-2026-0085', title: 'Worker bypassed lockout verification', type: 'Unsafe Act', hazard: 'Stored energy', sif: 'Medium', barrier: 'Bypassed', review: 'Confirmed', date: '15 Sep 2026' },
  { id: 'SIF-2026-0084', title: 'Damaged guardrail at loading dock', type: 'Unsafe Condition', hazard: 'Fall from height', sif: 'Medium', barrier: 'Ineffective', review: 'Confirmed', date: '14 Sep 2026' },
  { id: 'SIF-2026-0083', title: 'Hot work permit missing fire watch', type: 'Near Miss', hazard: 'Fire / explosion', sif: 'High', barrier: 'Absent', review: 'Needs review', date: '12 Sep 2026' },
]

const nav = [
  ['Dashboard', LayoutDashboard], ['Safety Reports', FileText], ['New Report', Plus],
  ['CCTV Analysis', Camera], ['Evidence Correlation', Activity], ['Safety Review', ClipboardCheck], ['Analytics', BarChart3],
]

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>
}
function SectionTitle({ eyebrow, title, action }) {
  return <div className="section-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>{action}</div>
}
function Kpi({ label, value, change, icon: Icon, tone }) {
  return <Card className="kpi"><div className={`kpi-icon ${tone}`}><Icon size={18}/></div><div className="kpi-copy"><span>{label}</span><strong>{value}</strong><small><ArrowUpRight size={12}/> {change}</small></div></Card>
}
function Status({ value, kind = value.toLowerCase().replaceAll(' ', '-') }) {
  const tone = kind.includes('high') || kind.includes('ineffective') || kind.includes('absent') || kind.includes('review') ? 'high' : kind.includes('medium') || kind.includes('bypass') || kind.includes('partial') ? 'medium' : kind.includes('confirmed') || kind.includes('verified') || kind.includes('present') ? 'low' : 'neutral'
  return <Badge tone={tone}>{value}</Badge>
}
function MiniBars() { return <div className="mini-bars">{[38, 52, 45, 67, 58, 74, 61, 84, 72, 91, 78, 88].map((h, i) => <div key={i} className="bar-wrap"><div className="bar" style={{height:`${h}%`}}/><small>{['O','N','D','J','F','M','A','M','J','J','A','S'][i]}</small></div>)}</div> }
function Donut() { return <div className="donut"><div><strong>128</strong><span>reports</span></div></div> }
function ReportTable({ onOpen }) {
  return <div className="table-scroll"><table><thead><tr><th>Report ID</th><th>Title</th><th>Type</th><th>Hazard</th><th>SIF potential</th><th>Barrier</th><th>Review</th><th>Date</th><th></th></tr></thead><tbody>{reports.map(r => <tr key={r.id} onClick={() => onOpen(r.id)}><td className="mono">{r.id}</td><td className="title-cell">{r.title}</td><td>{r.type}</td><td>{r.hazard}</td><td><Status value={r.sif}/></td><td><Status value={r.barrier}/></td><td><Status value={r.review}/></td><td className="muted">{r.date}</td><td><button className="icon-btn" aria-label={`Open ${r.id}`}><ArrowUpRight size={16}/></button></td></tr>)}</tbody></table></div>
}
function BarrierFlow() {
  const items = [['Hazard','Forklift movement','high'],['Exposure','Worker in movement zone','high'],['Critical barrier','Pedestrian segregation','medium'],['Barrier status','INEFFECTIVE','high'],['Potential consequence','Collision / crush injury','high']]
  return <div className="barrier-flow">{items.map(([label, value, tone], i) => <div className="flow-step" key={label}><span>{label}</span><strong className={tone}>{value}</strong>{i < items.length-1 && <div className="flow-arrow">↓</div>}</div>)}</div>
}
function Analysis({ onNavigate }) {
  return <div className="page-stack page-enter"><div className="breadcrumb">Safety Reports <span>/</span> SIF-2026-0087</div><div className="page-heading"><div><div className="eyebrow">Explainable safety intelligence</div><h1>AI / SIF Analysis</h1><p>Forklift entered pedestrian movement zone <span className="demo-label">DEMO DATA</span></p></div><button className="btn btn-secondary" onClick={() => onNavigate('Safety Review')}><ClipboardCheck size={16}/> Open review</button></div><div className="analysis-hero"><div><span className="eyebrow">SIF potential</span><div className="sif-high"><span className="pulse-dot"/> HIGH</div><p>High-energy hazard with human exposure and an ineffective critical barrier.</p></div><div className="hero-meta"><span>Report ID</span><strong className="mono">SIF-2026-0087</strong><span>Extraction confidence</span><strong>94%</strong><small>Not accident probability</small></div></div><div className="grid-2"><Card><SectionTitle eyebrow="Explainability" title="Why this was classified high"/><div className="equation"><div><ShieldAlert/> High-energy hazard</div><b>+</b><div><Users/> Human exposure</div><b>+</b><div><X/> Critical barrier ineffective</div><b>=</b><strong>HIGH SIF<br/>POTENTIAL</strong></div><p className="callout"><CircleHelp size={15}/> Prototype explainable rule result. Final decisions require Safety Officer review.</p></Card><Card><SectionTitle eyebrow="Extracted entities" title="Safety context"/><div className="entity-grid">{[['Hazard','Worker–Vehicle Interaction'],['Activity','Forklift Movement'],['Energy source','Mobile equipment / vehicle movement'],['Exposure','Worker entered forklift movement zone'],['Unsafe act','Worker entered vehicle movement area'],['Unsafe condition','Pedestrian barricade open']].map(([a,b]) => <div key={a}><span>{a}</span><strong>{b}</strong></div>)}</div></Card></div><div className="grid-2"><Card><SectionTitle eyebrow="Evidence phrases" title="What the report says"/><div className="phrases"><mark>“forklift was reversing”</mark><mark>“worker entered the vehicle movement area”</mark><mark>“pedestrian barricade was open”</mark></div></Card><Card><SectionTitle eyebrow="Recommended controls" title="Actions for review"/><ul className="recommendations">{['Restore effective pedestrian segregation','Prevent unauthorized entry into vehicle movement zone','Verify traffic management controls','Conduct supervisor review'].map(x => <li key={x}><Check size={15}/>{x}</li>)}</ul></Card></div><Card><SectionTitle eyebrow="Barrier intelligence" title="Control path"/><BarrierFlow/></Card><div className="grid-2"><Card><SectionTitle eyebrow="Historical context" title="Similar reports" action={<button className="text-btn" onClick={() => onNavigate('Evidence Correlation')}>View all <ArrowUpRight size={14}/></button>}/>{[['SIF-2025-041','Forklift / pedestrian near miss','87%'],['SIF-2025-119','Vehicle movement segregation failure','79%'],['SIF-2024-286','Loading bay access breach','73%']].map(x => <div className="similar-row" key={x[0]}><div><strong className="mono">{x[0]}</strong><span>{x[1]}</span></div><Badge tone="info">{x[2]} similar</Badge></div>)}<p className="fine-print">Similarity indicates semantic similarity to previous reports, not accident probability.</p></Card><Card><SectionTitle eyebrow="Next evidence step" title="CCTV analysis"/><div className="cctv-teaser"><div className="camera-icon"><Camera size={24}/></div><div><strong>Verify the reported movement event</strong><span>Upload a clip to compare report claims with visual evidence.</span></div><button className="btn btn-primary" onClick={() => onNavigate('CCTV Analysis')}>Open CCTV <ArrowUpRight size={15}/></button></div></Card></div></div>
}
function Dashboard({ onOpen }) {
  return <div className="page-stack page-enter"><div className="page-heading"><div><div className="eyebrow">Monday, 21 September 2026</div><h1>Safety intelligence overview</h1><p>Monitor precursor signals, barrier health, and review workload.</p></div><button type="button" className="btn btn-primary" onClick={() => onOpen("new")}><Plus size={16}/> New report</button></div><div className="kpi-grid"><Kpi label="Total safety reports" value="128" change="12.4% vs last month" icon={FileText} tone="blue"/><Kpi label="High SIF potential" value="12" change="3 require action" icon={ShieldAlert} tone="red"/><Kpi label="Medium SIF potential" value="31" change="8.2% vs last month" icon={AlertTriangle} tone="amber"/><Kpi label="Needs human review" value="9" change="2 new today" icon={ClipboardCheck} tone="purple"/></div><div className="grid-main"><Card><SectionTitle eyebrow="Portfolio signal" title="SIF potential distribution" action={<button className="icon-btn"><SlidersHorizontal size={16}/></button>}/><div className="donut-row"><Donut/><div className="legend"><div><i className="dot red"/><span>High</span><strong>12 <small>9.4%</small></strong></div><div><i className="dot amber"/><span>Medium</span><strong>31 <small>24.2%</small></strong></div><div><i className="dot green"/><span>Low</span><strong>85 <small>66.4%</small></strong></div></div></div></Card><Card><SectionTitle eyebrow="Barrier intelligence" title="Critical barrier failures"/><div className="failure-list">{[['Pedestrian segregation','8 failures','red'],['Energy isolation / LOTO','5 failures','amber'],['Working at height controls','4 failures','amber'],['Hot work permit controls','3 failures','green']].map(x => <div key={x[0]}><span className={`failure-dot ${x[2]}`}/><div><strong>{x[0]}</strong><small>{x[1]}</small></div><span className="failure-line"><i style={{width: x[1][0]*10+'%'}}/></span></div>)}</div></Card></div><div className="grid-main"><Card><SectionTitle eyebrow="Trend" title="Report volume" action={<Badge tone="info">Last 12 months</Badge>}/><MiniBars/></Card><Card><SectionTitle eyebrow="Classification" title="Hazard categories"/><div className="category-list">{[['Vehicle interaction',36,'red'],['Dropped object',24,'amber'],['Stored energy',21,'blue'],['Fall from height',17,'green'],['Other',30,'neutral']].map(x => <div key={x[0]}><div><span>{x[0]}</span><strong>{x[1]}</strong></div><div className="progress"><i className={x[2]} style={{width:`${x[1]*1.7}%`}}/></div></div>)}</div></Card></div><Card><SectionTitle eyebrow="Latest activity" title="Recent safety reports" action={<button className="text-btn" onClick={() => onOpen('reports')}>View all <ArrowUpRight size={14}/></button>}/><ReportTable onOpen={onOpen}/></Card></div>
}
function Reports({ onOpen }) { const [query, setQuery] = useState(''); return <div className="page-stack page-enter"><div className="page-heading"><div><div className="eyebrow">Precursor intelligence</div><h1>Safety reports</h1><p>Review and prioritize reported precursor conditions.</p></div><button className="btn btn-primary" onClick={() => onOpen('new')}><Plus size={16}/> New report</button></div><Card><div className="filters"><label className="search-field"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports, hazards, IDs..."/></label><button className="filter-btn">All report types <ChevronDown size={14}/></button><button className="filter-btn">All SIF levels <ChevronDown size={14}/></button><button className="filter-btn">Review status <ChevronDown size={14}/></button></div><ReportTable onOpen={onOpen}/></Card></div> }
function NewReport({ onAnalyze }) { return <div className="page-stack page-enter"><div className="breadcrumb">Workspace <span>/</span> New report</div><div className="page-heading"><div><div className="eyebrow">Report intake</div><h1>New safety report</h1><p>Capture the context before running explainable analysis.</p></div></div><Card className="form-card"><div className="demo-banner"><Activity size={17}/><div><strong>Demo environment</strong><span>This report will use mock AI analysis. No production data is sent anywhere.</span></div></div><div className="form-grid"><label>Report type<select defaultValue="Near Miss"><option>Near Miss</option><option>Unsafe Act</option><option>Unsafe Condition</option></select></label><label>Report title<input defaultValue="Forklift entered pedestrian movement zone"/></label><label>Activity<input defaultValue="Forklift movement"/></label><label>Location<input defaultValue="North loading bay · Warehouse 02"/></label><label>Date<input type="date" defaultValue="2026-09-18"/></label><label>Time<input type="time" defaultValue="10:42"/></label></div><label className="full-label">Description<textarea defaultValue="Forklift was reversing while a worker entered the vehicle movement area. The pedestrian barricade was open and no effective segregation was present." rows={6}/></label><div className="form-footer"><span><Shield size={15}/> AI-assisted analysis requires human review</span><button className="btn btn-primary btn-large" onClick={onAnalyze}><Activity size={17}/> Analyze report</button></div></Card></div> }

function CCTV({ onNavigate }) {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const acceptedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    'video/mpeg', 'video/mp2t', 'video/x-m4v',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'text/plain'
  ]

  const acceptedExtensions = '.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.mp4,.webm,.mov,.avi,.mkv,.mpeg,.mpg,.m4v,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt'

  const getFileCategory = (file) => {
    if (file.type.startsWith('image/')) return 'Image'
    if (file.type.startsWith('video/')) return 'Video'
    if (file.type === 'application/pdf' || file.name.match(/\.(pdf|doc|docx|xls|xlsx|csv|txt)$/i)) return 'Document'
    return 'File'
  }

  const isSupported = (file) => {
    const extensionSupported = /\.(jpg|jpeg|png|webp|gif|bmp|tif|tiff|mp4|webm|mov|avi|mkv|mpeg|mpg|m4v|pdf|doc|docx|xls|xlsx|csv|txt)$/i.test(file.name)
    return acceptedTypes.includes(file.type) || extensionSupported
  }

  const handleFile = (file) => {
    if (!file) return
    if (!isSupported(file)) {
      window.alert('Unsupported file type. Please select a supported image, video, or document.')
      return
    }
    setSelectedFile(file)
  }

  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const runAnalysis = () => {
    if (!selectedFile) return
    onNavigate('Evidence Correlation')
  }

  const fileCategory = selectedFile ? getFileCategory(selectedFile) : null

  return <div className="page-stack page-enter">
    <div className="page-heading">
      <div>
        <div className="eyebrow">Visual & document evidence</div>
        <h1>CCTV & evidence analysis</h1>
        <p>Upload visual footage, images, or existing safety evidence for processing.</p>
      </div>
    </div>

    <div className="demo-banner">
      <Camera size={17}/>
      <div>
        <strong>Demo analysis — awaiting backend services</strong>
        <span>Images/videos can later use YOLO + ByteTrack + OpenCV. Documents can be routed to the NLP report parser.</span>
      </div>
    </div>

    <div className="grid-2">
      <Card className="upload-card">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedExtensions}
          onChange={handleInputChange}
          style={{display:'none'}}
        />

        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click()
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Upload size={28}/>
          <strong>{selectedFile ? 'File selected' : 'Drop evidence here'}</strong>
          <span>or browse files · Images, videos & documents supported</span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(event) => {
              event.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            Browse files
          </button>
          <small>JPG · PNG · WebP · MP4 · WebM · MOV · AVI · MKV · PDF · DOCX · XLSX · CSV · TXT</small>
        </div>

        {selectedFile ? (
          <div className="file-row">
            <div className="file-icon">
              {fileCategory === 'Image' ? <Camera size={18}/> : fileCategory === 'Video' ? <Camera size={18}/> : <FileText size={18}/>}
            </div>
            <div>
              <strong>{selectedFile.name}</strong>
              <span>{formatFileSize(selectedFile.size)} · {fileCategory}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label="Remove selected file"
              onClick={() => setSelectedFile(null)}
            >
              <X size={16}/>
            </button>
          </div>
        ) : (
          <div className="file-row">
            <div className="file-icon"><Camera size={18}/></div>
            <div>
              <strong>No file selected</strong>
              <span>Select an evidence file to begin.</span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary btn-full"
          disabled={!selectedFile}
          onClick={runAnalysis}
        >
          Analyze selected evidence <Activity size={16}/>
        </button>
      </Card>

      <Card>
        <SectionTitle eyebrow="Processing status" title="Analysis pipeline"/>
        <div className="pipeline">
          {['Uploading','Processing','Detecting / parsing','Evidence analysis','Analysis complete'].map((x,i) => (
            <div className={i===4 ? 'complete' : ''} key={x}>
              <span className="pipeline-dot">{i===4 ? <Check size={12}/> : i+1}</span>
              <strong>{x}</strong>
              {i<4 && <i/>}
            </div>
          ))}
        </div>
        <p className="fine-print">
          File acceptance happens in the frontend. Actual CV/NLP processing will be handled by the FastAPI backend.
        </p>
      </Card>
    </div>

    <Card>
      <SectionTitle
        eyebrow="Supported evidence"
        title="What Sanketra can accept"
        action={<Badge tone="info">Frontend ready</Badge>}
      />
      <div className="detection-grid">
        {[
          ['Images','JPG, JPEG, PNG, WebP, GIF, BMP, TIFF','YOLO / visual evidence'],
          ['Videos','MP4, WebM, MOV, AVI, MKV, MPEG, MPG, M4V','YOLO + ByteTrack + OpenCV'],
          ['Documents','PDF, DOC, DOCX, XLS, XLSX, CSV, TXT','NLP / report parsing'],
        ].map(([type,formats,use]) => (
          <div key={type}>
            <span>{type}</span>
            <strong>{formats}</strong>
            <small>{use}</small>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <SectionTitle eyebrow="Demo evidence frame" title="Restricted zone event" action={<Badge tone="info">Demo result</Badge>}/>
      <div className="evidence-frame">
        <div className="zone-overlay">RESTRICTED ZONE</div>
        <div className="bbox person"><span>PERSON · 0.94</span></div>
        <div className="bbox forklift"><span>FORKLIFT · 0.98</span></div>
        <div className="timestamp">00:12:04 <span>CAM-04 · NORTH LOADING BAY</span></div>
      </div>
      <div className="detection-grid">
        {[['Person detected','YES','green'],['Forklift detected','YES','green'],['Restricted zone entry','YES','red'],['Dwell time','5.2 seconds','amber'],['Event','PERSON_ENTERED_RESTRICTED_ZONE','red']].map(x => <div key={x[0]}><span>{x[0]}</span><strong className={x[2]}>{x[1]}</strong></div>)}
      </div>
    </Card>
  </div>
}

function Correlation({ onNavigate }) { const rows = [['Worker entered restricted zone','Reported','Observed','VERIFIED','green'],['Forklift reversing','Reported','Observed','VERIFIED','green'],['No spotter present','Reported','Not clearly observable','NOT OBSERVABLE','neutral'],['Barricade open','Reported','Partially visible','PARTIALLY VERIFIED','amber']]; return <div className="page-stack page-enter"><div className="page-heading"><div><div className="eyebrow">Multimodal verification</div><h1>Evidence correlation</h1><p>Compare report claims with visual evidence without over-interpreting uncertainty.</p></div><button className="btn btn-primary" onClick={() => onNavigate('Safety Review')}><ClipboardCheck size={16}/> Continue to review</button></div><Card><div className="correlation-head"><div><h3>Report SIF-2026-0087</h3><span>Forklift entered pedestrian movement zone</span></div><Badge tone="info">4 claims evaluated</Badge></div><div className="table-scroll"><table><thead><tr><th>Claim</th><th>Report evidence</th><th>CCTV evidence</th><th>Verification</th></tr></thead><tbody>{rows.map(r => <tr key={r[0]}><td><strong>{r[0]}</strong></td><td><Badge tone="neutral">{r[1]}</Badge></td><td>{r[2]}</td><td><Status value={r[3]} kind={r[4]}/></td></tr>)}</tbody></table></div><p className="callout"><CircleHelp size={15}/> <strong>Not observable does not mean false.</strong> It means the available evidence cannot support or contradict the claim.</p></Card></div> }
function Review({ onConfirm }) { return <div className="page-stack page-enter"><div className="page-heading"><div><div className="eyebrow">Human decision point</div><h1>Safety Officer review</h1><p>Review the AI-assisted evidence before confirming a safety event.</p></div></div><div className="review-alert"><ShieldAlert size={20}/><div><strong>AI-assisted analysis — Human Safety Officer review required.</strong><span>Similarity and confidence scores are decision-support signals, not accident probability.</span></div></div><div className="review-grid"><Card><SectionTitle eyebrow="Review summary" title="SIF-2026-0087"/><div className="review-result"><span>SIF potential</span><strong>HIGH</strong><Status value="Barrier ineffective"/></div><div className="review-list">{[['Hazard','Worker–Vehicle Interaction'],['Exposure','Worker entered movement zone'],['Critical barrier','Pedestrian segregation'],['Evidence sources','Report + CCTV + correlation']].map(x=><div key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong></div>)}</div></Card><Card><SectionTitle eyebrow="Officer decision" title="Record your review"/><label className="full-label">Reviewer name<input defaultValue="A. Sharma · Safety Officer"/></label><label className="full-label">Comments<textarea defaultValue="CCTV evidence supports the reported worker–vehicle interaction. Pedestrian segregation requires immediate restoration and supervisor verification." rows={6}/></label><div className="review-actions"><button className="btn btn-secondary">Request additional review</button><button className="btn btn-primary" onClick={onConfirm}><Check size={16}/> Confirm safety event</button></div></Card></div><Card><SectionTitle eyebrow="Audit trail" title="Review activity"/><div className="timeline">{['Report submitted','AI analysis completed','CCTV analysis completed','Evidence correlated','Human review · current'].map((x,i)=><div key={x} className={i===4?'current':''}><span>{i===4?<Activity size={14}/>:<Check size={14}/>}</span><div><strong>{x}</strong><small>{i===0?'18 Sep 2026 · 10:42':'18 Sep 2026 · '+(10+i)+':'+(42+i*3)}</small></div></div>)}</div></Card></div> }
function FinalEvent({ onNavigate }) { return <div className="success-page page-enter"><div className="success-mark"><Check size={34}/></div><div className="eyebrow">Final safety event</div><h1>Safety event confirmed</h1><p>Human review has been recorded and the event is ready for follow-up.</p><Card><div className="event-grid">{[['Event ID','EVT-2026-0042'],['SIF potential','HIGH'],['Hazard','Worker–Vehicle Interaction'],['Barrier status','INEFFECTIVE'],['Evidence sources','Report · CCTV · Correlation'],['Reviewer','A. Sharma · Safety Officer'],['Timestamp','18 Sep 2026 · 11:08']].map(x=><div key={x[0]}><span>{x[0]}</span><strong className={x[0]==='SIF potential'?'red':''}>{x[1]}</strong></div>)}</div></Card><button className="btn btn-secondary" onClick={() => onNavigate('Dashboard')}>Return to dashboard <ArrowUpRight size={15}/></button></div> }

export default function Page() {
  const [page, setPage] = useState('Dashboard'); const [sidebar, setSidebar] = useState(true)
  const navigate = (next) => setPage(next === 'reports' ? 'Safety Reports' : next === 'new' ? 'New Report' : next.startsWith('SIF-') ? 'AI / SIF Analysis' : next)
  let content
  if(page==='Dashboard') content=<Dashboard onOpen={id => navigate(id==='reports'?'reports':id)}/>
  else if(page==='Safety Reports') content=<Reports onOpen={navigate}/>
  else if(page==='New Report') content=<NewReport onAnalyze={() => navigate('AI / SIF Analysis')}/>
  else if(page==='AI / SIF Analysis') content=<Analysis onNavigate={navigate}/>
  else if(page==='CCTV Analysis') content=<CCTV onNavigate={navigate}/>
  else if(page==='Evidence Correlation') content=<Correlation onNavigate={navigate}/>
  else if(page==='Safety Review') content=<Review onConfirm={() => navigate('Safety Event Confirmed')}/>
  else if(page==='Safety Event Confirmed') content=<FinalEvent onNavigate={navigate}/>
  else content=<Dashboard onOpen={id => navigate(id)}/>
  return <div className="app-shell"><aside className={sidebar?'sidebar':'sidebar collapsed'}><div className="brand"><div className="brand-mark"><Shield size={19}/></div><div><strong>Sanketra</strong><span>Safety Intelligence</span></div></div><nav><div className="nav-label">Workspace</div>{nav.map(([label, Icon])=><button key={label} className={page===label?'active':''} onClick={() => navigate(label)}><Icon size={17}/><span>{label}</span>{label==='Safety Review'&&<i className="nav-count">9</i>}</button>)}</nav><div className="sidebar-footer"><div className="live-dot"/><div><strong>System operational</strong><span>All services nominal</span></div></div></aside><main className="main"><header className="topbar"><button className="menu-btn" onClick={() => setSidebar(!sidebar)}><Menu size={19}/></button><div className="topbar-title">{page}</div><div className="topbar-actions"><label className="top-search"><Search size={16}/><input placeholder="Search workspace"/></label><button className="icon-btn notification"><Bell size={18}/><i/></button><div className="profile"><div className="avatar">AS</div><div><strong>A. Sharma</strong><span>Safety Officer</span></div><ChevronDown size={14}/></div></div></header><div className="content">{content}</div></main></div>
}
