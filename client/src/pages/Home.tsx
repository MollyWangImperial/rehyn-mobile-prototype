import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookHeart,
  Bot,
  CalendarCheck,
  ChevronRight,
  CircleHelp,
  CircleAlert,
  Check,
  Hand,
  Headphones,
  Heart,
  Home as HomeIcon,
  Lightbulb,
  LockKeyhole,
  Mic,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Send,
  Sparkles,
  Square,
  Star,
  Volume2,
  Waves,
  X,
} from "lucide-react";

type Page = "home" | "journey" | "alira" | "time";
type JourneyTab = "progress" | "journal" | "medals";
type Mood = { icon: string; label: string; color: string; note: string };
type Message = { id: number; role: "alira" | "molly"; text: string; tone?: "warm" | "concern" };
type MemoryCard = { id: number; symbol: string; matched: boolean };

const CALM_IMAGE = "/manus-storage/rehyn-calm-breathing_599cdb55.jpg";
const HOME_IMAGE = "/manus-storage/rehyn-home-growth_0e200fce.jpg";

const moods: Mood[] = [
  { icon: "☁", label: "Tough", color: "#7D8790", note: "A hard day is still a day you showed up." },
  { icon: "◔", label: "Low", color: "#8098B0", note: "Thank you for checking in with yourself." },
  { icon: "•", label: "Okay", color: "#C9A46B", note: "Okay is a perfectly good place to begin." },
  { icon: "☀", label: "Good", color: "#7BAA85", note: "It is good to notice the lighter moments." },
  { icon: "✦", label: "Great", color: "#C86B4B", note: "Hold on to that feeling for a moment." },
];

const progressPoints = [
  { week: "W1", score: 35 },
  { week: "W2", score: 42 },
  { week: "W3", score: 40 },
  { week: "W4", score: 52 },
  { week: "W5", score: 60 },
  { week: "W6", score: 67 },
];

const journalHistory = ["Okay", "Good", "Low", "Okay", "Great", "Good", "Okay", "Good", "Good", "Okay", "Great", "Good", "Good", "Great"];

const initialMessages: Message[] = [
  { id: 1, role: "alira", text: "Good afternoon, Molly. How can I help today?", tone: "warm" },
];

const quickActions = [
  { label: "Ask a question", icon: CircleHelp, reply: "Of course. Ask me anything about your recovery, your routine, or what to expect." },
  { label: "Raise a concern", icon: Heart, reply: "Thank you for telling me. You do not have to work it out alone. What feels most important right now?" },
  { label: "Lift me up", icon: Sparkles, reply: "You have made room for yourself today — that matters. Tiny steps still take you forward." },
  { label: "Talk it through", icon: BookHeart, reply: "I am here. Take your time. What is sitting heavily with you today?" },
];

const medals = [
  { name: "First voice note", icon: Mic, date: "20 Sep", earned: true, detail: "You made it easier to say what was on your mind." },
  { name: "Asked Alira", icon: Bot, date: "17 Sep", earned: true, detail: "You reached out and asked for support." },
  { name: "Honest day", icon: Heart, date: "20 Sep", earned: true, detail: "You checked in truthfully with yourself." },
  { name: "Five wins", icon: Star, date: "2 more", earned: false, detail: "Save two more small wins to unlock this medal.", progress: 3 / 5 },
  { name: "Steady week", icon: Award, date: "3 of 7", earned: false, detail: "Complete a check-in on three more days this week.", progress: 4 / 7 },
];

const peopleInitial = [
  { name: "Sam", initial: "S", color: "#B8D0BA" },
  { name: "Jess", initial: "J", color: "#EAC8B6" },
  { name: "Mum", initial: "M", color: "#D4CEE9" },
];

const deckSymbols = ["☀", "☀", "✦", "✦", "☘", "☘", "☾", "☾"];
const makeDeck = (): MemoryCard[] =>
  deckSymbols
    .map((symbol, index) => ({ id: index, symbol, matched: false }))
    .sort(() => Math.random() - 0.5);

function IconButton({ label, children, onClick, active = false }: { label: string; children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button className={`icon-button ${active ? "is-active" : ""}`} type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function AppHeader({ page, onBack }: { page: Page; onBack?: () => void }) {
  const copy = {
    home: { eyebrow: "Your recovery space", title: "Good afternoon, Molly." },
    journey: { eyebrow: "Your recovery, at your pace", title: "Your Journey" },
    alira: { eyebrow: "Your thoughtful space", title: "Alira" },
    time: { eyebrow: "A little room for you", title: "My Time" },
  }[page];

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
      </div>
      {onBack ? <IconButton label="Go back" onClick={onBack}><ArrowLeft size={20} /></IconButton> : <div className="day-chip"><span className="day-dot" />Sun 27</div>}
    </header>
  );
}

function HomePage({ openJourney, openAlira, toast }: { openJourney: () => void; openAlira: () => void; toast: (text: string) => void }) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [stretchStep, setStretchStep] = useState(0);
  const stretchSteps = [
    { title: "Rest your arm", copy: "Place your forearm on a table or cushion. Let your shoulder feel heavy." },
    { title: "Open your hand", copy: "Slowly lengthen your fingers. Only move as far as feels comfortable." },
    { title: "Pause and soften", copy: "Hold for one relaxed breath, then let your hand rest again." },
  ];
  const currentStep = stretchSteps[stretchStep];

  return <>
    <AppHeader page="home" />
    <section className="home-hero-card">
      <div className="home-hero-copy">
        <p className="overline">Next step</p>
        <h2>A gentle start<br />for today.</h2>
        <p>Tell us how you are feeling, and we will find a comfortable next step.</p>
        <button type="button" className="primary-button" onClick={openJourney}>Begin check-in <ArrowRight size={17} /></button>
        <span className="minute-note"><CalendarCheck size={14} /> About 1 minute</span>
      </div>
      <div className="home-growth-art" style={HOME_IMAGE ? { backgroundImage: `url(${HOME_IMAGE})` } : undefined} aria-hidden="true"><i /><i /><i /></div>
      <div className="home-step-line"><span /><span /><span className="active" /></div>
    </section>

    <section className="home-progress-section">
      <div className="section-heading compact"><div><p className="overline">Step 1 of 3</p><h2>Your progress</h2></div><button type="button" className="text-button" onClick={openJourney}>See details <ChevronRight size={16} /></button></div>
      <div className="home-progress-rail">
        <button type="button" onClick={openJourney}><span className="home-stat-icon"><ArrowUpRight size={19} /></span><div><small><i /> Building</small><strong>Reaching</strong><em><b style={{ width: "62%" }} /></em></div></button>
        <button type="button" onClick={openJourney}><span className="home-stat-icon"><Hand size={18} /></span><div><small><i /> Building</small><strong>Hand control</strong><em><b style={{ width: "56%" }} /></em></div></button>
        <button type="button" onClick={openJourney}><span className="home-stat-icon"><Waves size={18} /></span><div><small><i /> Steady</small><strong>Moving about</strong><em><b style={{ width: "72%" }} /></em></div></button>
      </div>
    </section>

    <section className="home-alira-card">
      <div className="home-alira-mark"><Bot size={21} /></div>
      <div><p className="overline">Alira <span>Available to help</span></p><h2>Questions about your plan?</h2><p>I can help make today feel clearer.</p></div>
      <button type="button" onClick={openAlira}>Talk with Alira <ArrowRight size={17} /></button>
      <small><LockKeyhole size={13} /> Your conversations stay private</small>
    </section>

    <section className="home-week-section">
      <div className="section-heading compact"><div><p className="overline">This week</p><h2>One day at a time.</h2></div></div>
      <div className="week-row" aria-label="Weekly check-in progress">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`} className={index < 3 ? "done" : index === 3 ? "today" : ""}><small>{day}</small><i>{index < 3 ? <Check size={13} /> : index === 3 ? "27" : index + 24}</i></span>)}
      </div>
    </section>

    <button type="button" className="activity-card" onClick={() => { setStretchStep(0); setActivityOpen(true); }}>
      <span className="activity-icon"><Hand size={22} /></span><div><p className="overline">Optional activity · 5 min</p><h2>Hand stretch</h2><p>Try a slow, comfortable hand stretch.</p></div><ChevronRight size={20} />
    </button>
    <button type="button" className="safety-link" onClick={() => setSafetyOpen(true)}><CircleAlert size={17} /> Worried about warning signs? <ChevronRight size={17} /></button>

    <AnimatePresence>
      {activityOpen && <motion.div className="activity-overlay" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }}><button type="button" className="close-breath" onClick={() => setActivityOpen(false)} aria-label="Close hand stretch"><X size={22} /></button><div className="activity-overlay-content"><p className="overline">Optional activity · step {stretchStep + 1} of 3</p><div className="hand-orb"><Hand size={55} /></div><h2>{currentStep.title}</h2><p>{currentStep.copy}</p><div className="activity-dots" aria-label={`Step ${stretchStep + 1} of 3`}><i className={stretchStep >= 0 ? "active" : ""} /><i className={stretchStep >= 1 ? "active" : ""} /><i className={stretchStep >= 2 ? "active" : ""} /></div><button type="button" className="primary-button" onClick={() => { if (stretchStep === 2) { setActivityOpen(false); toast("Lovely work — you can come back anytime"); } else setStretchStep((step) => step + 1); }}>{stretchStep === 2 ? "Finish gently" : "Next step"} <ArrowRight size={17} /></button><button type="button" className="text-button" onClick={() => setActivityOpen(false)}>Leave for now</button></div></motion.div>}
      {safetyOpen && <motion.div className="sheet-backdrop safety-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSafetyOpen(false)}><motion.article className="bottom-sheet safety-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="safety-symbol"><CircleAlert size={24} /></div><p className="overline">If something feels wrong</p><h2>Act quickly if you notice sudden changes.</h2><p>If you think you or someone else may be having a stroke, call <strong>999</strong> now. Do not wait for an in-app reply.</p><button type="button" className="primary-button full" onClick={() => setSafetyOpen(false)}>I understand</button></motion.article></motion.div>}
    </AnimatePresence>
  </>;
}

function ProgressView({ selectedPoint, setSelectedPoint, setJourneyTab }: { selectedPoint: number; setSelectedPoint: (value: number) => void; setJourneyTab: (value: JourneyTab) => void }) {
  const point = progressPoints[selectedPoint];
  const coords = progressPoints.map((item, index) => ({
    x: 17 + index * 61.5,
    y: 116 - ((item.score - 30) / 40) * 88,
  }));
  const line = coords.map((item, index) => `${index === 0 ? "M" : "L"}${item.x},${item.y}`).join(" ");
  const area = `${line} L324,126 L17,126 Z`;

  return (
    <div className="tab-panel progress-view">
      <section className="progress-hero">
        <div className="progress-hero-top">
          <div>
            <p className="overline">Your progress</p>
            <h2>Small steps, real change.</h2>
          </div>
          <div className="trend-pill"><ArrowUpRight size={16} /> +18%</div>
        </div>
        <div className="score-row">
          <span className="score-number">{point.score}</span>
          <span className="score-caption">today's recovery score<br />in {point.week}</span>
        </div>
        <div className="chart-wrap" aria-label="Weekly recovery progress chart">
          <svg viewBox="0 0 342 143" role="img" aria-label="Recovery score rises from 35 in week one to 67 in week six">
            <defs>
              <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#B7D5B9" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#B7D5B9" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[29, 63, 97, 126].map((y) => <line key={y} x1="17" x2="324" y1={y} y2={y} className="chart-grid" />)}
            <motion.path d={area} fill="url(#chart-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.15 }} />
            <motion.path d={line} className="chart-line" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
            {coords.map((coord, index) => (
              <g key={index} className="chart-point" role="button" tabIndex={0} aria-label={`${progressPoints[index].week}, score ${progressPoints[index].score}`} onClick={() => setSelectedPoint(index)} onKeyDown={(event) => event.key === "Enter" && setSelectedPoint(index)}>
                <circle cx={coord.x} cy={coord.y} r="12" fill="transparent" />
                <circle cx={coord.x} cy={coord.y} r={selectedPoint === index ? "6" : "4"} className={selectedPoint === index ? "chart-dot selected" : "chart-dot"} />
              </g>
            ))}
          </svg>
          <div className="chart-labels">{progressPoints.map((item) => <span key={item.week}>{item.week}</span>)}</div>
        </div>
        <p className="chart-insight"><Sparkles size={16} /> Your confidence has lifted steadily over the last three weeks.</p>
      </section>

      <section className="metric-row" aria-label="Key recovery indicators">
        <article><span className="metric-label">This week</span><strong>4 <small>sessions</small></strong><span className="metric-foot">one more than last week</span></article>
        <article><span className="metric-label">Daily check-ins</span><strong>6 <small>days</small></strong><span className="metric-foot">a gentle rhythm</span></article>
      </section>

      <section className="wins-section">
        <div className="section-heading"><div><p className="overline">People noticed</p><h2>Progress feels different when it is seen.</h2></div></div>
        <div className="quote-rail">
          <article className="quote-card"><span className="quote-mark">“</span><p>“Molly has been more confident moving around the kitchen this week.”</p><span>— Sam, yesterday</span></article>
          <article className="quote-card pale"><span className="quote-mark">“</span><p>“You kept trying, even when the morning felt slow.”</p><span>— Your therapist, Friday</span></article>
        </div>
        <button type="button" className="text-action" onClick={() => setJourneyTab("medals")}>See what you are working towards <ChevronRight size={17} /></button>
      </section>
    </div>
  );
}

function JournalView({ selectedMood, setSelectedMood, note, setNote, saved, onSave, entryOpen, setEntryOpen }: { selectedMood: Mood | null; setSelectedMood: (mood: Mood) => void; note: string; setNote: (value: string) => void; saved: boolean; onSave: () => void; entryOpen: boolean; setEntryOpen: (value: boolean) => void }) {
  return (
    <div className="tab-panel journal-view">
      <section className="checkin-card">
        <p className="overline">A moment for you</p>
        <h2>How are you feeling today?</h2>
        <p className="subtle-copy">One tap is enough. You can always add more later.</p>
        <div className="mood-grid" role="radiogroup" aria-label="Choose how you are feeling">
          {moods.map((mood) => (
            <button key={mood.label} type="button" className={`mood-choice ${selectedMood?.label === mood.label ? "selected" : ""}`} style={{ "--mood": mood.color } as React.CSSProperties} aria-pressed={selectedMood?.label === mood.label} onClick={() => setSelectedMood(mood)}>
              <span aria-hidden="true">{mood.icon}</span><small>{mood.label}</small>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {selectedMood && (
            <motion.div className="mood-response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><span style={{ background: selectedMood.color }}>{selectedMood.icon}</span><p>{selectedMood.note}</p></motion.div>
          )}
        </AnimatePresence>
        <label className="journal-field"><span>Anything else? <em>Optional</em></span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="A few words, if you want to…" rows={3} /></label>
        <div className="journal-actions"><button type="button" className="secondary-button"><Mic size={18} /> Record voice note</button><button type="button" className="primary-button" onClick={onSave} disabled={!selectedMood}>{saved ? "Saved for today" : "Save check-in"}</button></div>
      </section>

      <section className="mood-history">
        <div className="section-heading compact"><div><p className="overline">The last two weeks</p><h2>Your rhythm</h2></div><span className="legend"><i /> more settled</span></div>
        <div className="history-grid" aria-label="Mood check-in history over the last two weeks">
          {journalHistory.map((item, index) => {
            const mood = moods.find((candidate) => candidate.label === item)!;
            return <span key={index} title={`${item} mood`} className="history-day" style={{ "--history": mood.color } as React.CSSProperties}><b>{mood.icon}</b><small>{index + 1}</small></span>;
          })}
        </div>
      </section>

      <section className="entries-section">
        <div className="section-heading compact"><div><p className="overline">Your words</p><h2>Recent entries</h2></div><button type="button" className="text-button">View all</button></div>
        <div className="entry-list">
          <button type="button" className="journal-entry" onClick={() => setEntryOpen(true)}><span className="entry-date">Yesterday</span><span className="entry-mood">☀ Good</span><p>“The garden felt lovely today…”</p><ChevronRight size={18} /></button>
          <button type="button" className="journal-entry" onClick={() => setEntryOpen(true)}><span className="entry-date">25 Sep</span><span className="entry-mood">• Okay</span><p>“Managed the stairs with Sam nearby.”</p><ChevronRight size={18} /></button>
        </div>
      </section>

      <AnimatePresence>{entryOpen && <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEntryOpen(false)}><motion.article className="bottom-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="sheet-top"><div><p className="overline">Saturday 26 September</p><h2>Good</h2></div><IconButton label="Close entry" onClick={() => setEntryOpen(false)}><X size={19} /></IconButton></div><p>I sat in the garden with a cup of tea. The air felt warm, and I noticed I was smiling without trying.</p><button type="button" className="secondary-button full" onClick={() => setEntryOpen(false)}>Done</button></motion.article></motion.div>}</AnimatePresence>
    </div>
  );
}

function MedalsView({ selected, setSelected }: { selected: number; setSelected: (value: number) => void }) {
  const current = medals[selected];
  return (
    <div className="tab-panel medals-view">
      <section className="medal-summary"><div><p className="overline">Your collection</p><h2>3 medals earned</h2><p>Every small act of care counts.</p></div><div className="medal-sun"><Award size={34} /></div></section>
      <section className="earned-rail" aria-label="Earned medals">
        {medals.filter((medal) => medal.earned).map((medal, index) => { const MedalIcon = medal.icon; return <button key={medal.name} type="button" className={`earned-medal ${selected === index ? "selected" : ""}`} onClick={() => setSelected(index)}><span><MedalIcon size={25} /></span><strong>{medal.name}</strong><small>{medal.date}</small></button>; })}
      </section>
      <motion.section className="medal-detail" layout><div className={`detail-icon ${current.earned ? "earned" : "locked"}`}>{current.earned ? <Award size={22} /> : <LockKeyhole size={21} />}</div><div><p className="overline">{current.earned ? `Earned ${current.date}` : "In progress"}</p><h2>{current.name}</h2><p>{current.detail}</p>{current.progress && <div className="progress-track" aria-label={`${Math.round(current.progress * 100)}% complete`}><i style={{ width: `${current.progress * 100}%` }} /><span>{Math.round(current.progress * 100)}%</span></div>}</div></motion.section>
      <section className="locked-list"><div className="section-heading compact"><div><p className="overline">Keep going</p><h2>Next to unlock</h2></div></div>{medals.filter((medal) => !medal.earned).map((medal, index) => { const MedalIcon = medal.icon; const id = index + 3; return <button type="button" key={medal.name} className={`locked-medal ${selected === id ? "selected" : ""}`} onClick={() => setSelected(id)}><span><MedalIcon size={20} /></span><div><strong>{medal.name}</strong><small>{medal.detail}</small></div><b>{medal.date}</b><ChevronRight size={18} /></button>; })}</section>
    </div>
  );
}

function JourneyPage({ journeyTab, setJourneyTab, toast }: { journeyTab: JourneyTab; setJourneyTab: (tab: JourneyTab) => void; toast: (text: string) => void }) {
  const [selectedPoint, setSelectedPoint] = useState(5);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [selectedMedal, setSelectedMedal] = useState(0);

  const saveCheckIn = () => { setSaved(true); toast("Today’s check-in is saved"); };

  return <>
    <AppHeader page="journey" />
    <div className="segmented-tabs" role="tablist" aria-label="Your Journey sections">
      {(["progress", "journal", "medals"] as JourneyTab[]).map((tab) => <button key={tab} type="button" role="tab" aria-selected={journeyTab === tab} className={journeyTab === tab ? "active" : ""} onClick={() => setJourneyTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</button>)}
    </div>
    <AnimatePresence mode="wait">
      <motion.div key={journeyTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22, ease: "easeOut" }}>
        {journeyTab === "progress" && <ProgressView selectedPoint={selectedPoint} setSelectedPoint={setSelectedPoint} setJourneyTab={setJourneyTab} />}
        {journeyTab === "journal" && <JournalView selectedMood={selectedMood} setSelectedMood={setSelectedMood} note={note} setNote={setNote} saved={saved} onSave={saveCheckIn} entryOpen={entryOpen} setEntryOpen={setEntryOpen} />}
        {journeyTab === "medals" && <MedalsView selected={selectedMedal} setSelected={setSelectedMedal} />}
      </motion.div>
    </AnimatePresence>
  </>;
}

function AliraPage({ toast }: { toast: (text: string) => void }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [showSafety, setShowSafety] = useState(false);

  const replyAfter = (text: string, tone: Message["tone"] = "warm") => {
    setTyping(true);
    window.setTimeout(() => { setMessages((current) => [...current, { id: Date.now(), role: "alira", text, tone }]); setTyping(false); }, 650);
  };
  const chooseQuickAction = (label: string, reply: string) => {
    setStarted(true);
    setMessages((current) => [...current, { id: Date.now(), role: "molly", text: label }]);
    replyAfter(reply, label === "Raise a concern" ? "concern" : "warm");
  };
  const sendMessage = () => {
    const clean = draft.trim(); if (!clean) return;
    setStarted(true); setMessages((current) => [...current, { id: Date.now(), role: "molly", text: clean }]); setDraft("");
    replyAfter("Thank you for sharing that with me. I am listening. Would it help to take this one small piece at a time?");
  };
  const readAloud = (message: Message) => {
    setSpeaking(message.id);
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(message.text); utterance.rate = 0.9; utterance.onend = () => setSpeaking(null); window.speechSynthesis.speak(utterance);
  };
  const toggleVoice = () => {
    if (listening) { setListening(false); setDraft("I would like to talk about today."); toast("Voice note added to your message"); return; }
    setListening(true);
    const Recognition = (window as typeof window & { webkitSpeechRecognition?: new () => { start: () => void; stop: () => void; onresult: (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void; onend: () => void } }).webkitSpeechRecognition;
    if (Recognition) { const recognition = new Recognition(); recognition.onresult = (event) => setDraft(event.results[0][0].transcript); recognition.onend = () => setListening(false); recognition.start(); }
  };

  return <>
    <AppHeader page="alira" />
    <section className="alira-shell">
      {!started && <motion.div className="alira-welcome" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="alira-orb"><Bot size={26} /></div><h2>Good afternoon, Molly.</h2><p>How can I help today?</p><div className="quick-actions">{quickActions.map((action) => { const ActionIcon = action.icon; return <button type="button" key={action.label} onClick={() => chooseQuickAction(action.label, action.reply)}><span><ActionIcon size={19} /></span>{action.label}<ChevronRight size={18} /></button>; })}</div><p className="privacy-note"><LockKeyhole size={14} /> This is a private space. Your care team only sees concerns you choose to share.</p></motion.div>}
      {started && <div className="conversation" aria-live="polite"><div className="conversation-head"><div className="alira-avatar"><Bot size={19} /></div><div><strong>Alira</strong><span><i /> Here with you</span></div><IconButton label="More options"><MoreHorizontal size={20} /></IconButton></div><div className="message-stream">{messages.map((message) => <motion.article key={message.id} className={`message ${message.role} ${message.tone ?? ""}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><p>{message.text}</p>{message.role === "alira" && <button type="button" className={`listen-button ${speaking === message.id ? "speaking" : ""}`} onClick={() => readAloud(message)}><Volume2 size={14} /> {speaking === message.id ? "Reading…" : "Read aloud"}</button>}</motion.article>)}{typing && <div className="typing-indicator" aria-label="Alira is typing"><span /><span /><span /></div>}{messages.some((message) => message.text === "Thank you for telling me. You do not have to work it out alone. What feels most important right now?") && !showSafety && <div className="concern-choices"><p>Choose what fits best, if you want to.</p><button type="button" onClick={() => replyAfter("That sounds worrying. If it feels safe, tell your therapist what changed — they can help you make a plan.", "concern")}>Something changed</button><button type="button" onClick={() => { setShowSafety(true); replyAfter("Your safety matters most. If you think you are having a stroke, call 999 now. You can also ask someone you trust to stay with you.", "concern"); }}>I feel unsafe</button></div>}</div></div>}
    </section>
    <div className="composer-wrap"><div className="composer"><button type="button" className={`voice-button ${listening ? "listening" : ""}`} onClick={toggleVoice} aria-label={listening ? "Stop voice input" : "Start voice input"}>{listening ? <Square size={17} fill="currentColor" /> : <Mic size={18} />}</button><label className="sr-only" htmlFor="alira-input">Message Alira</label><input id="alira-input" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder={listening ? "Listening…" : "Message Alira"} /><button type="button" className="send-button" onClick={sendMessage} aria-label="Send message"><Send size={18} /></button></div><p>Alira supports your care team and is not an emergency service.</p></div>
  </>;
}

function BreathOverlay({ duration, onClose }: { duration: number; onClose: () => void }) {
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const seconds = duration * 60 - tick;
  const cycle = tick % 10;
  const inhale = cycle < 4;
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTick((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => { if (seconds <= 0) setRunning(false); }, [seconds]);
  const time = `${Math.max(0, Math.floor(seconds / 60))}:${String(Math.max(0, seconds % 60)).padStart(2, "0")}`;
  return <motion.div className="breath-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button type="button" className="close-breath" onClick={onClose} aria-label="Close breathing exercise"><X size={22} /></button><div className="breath-content"><p className="overline">A quiet moment</p><div className={`breath-orb ${running && inhale ? "inhaling" : "exhaling"}`}><span>{running ? (inhale ? "Breathe in" : "Breathe out") : "Well done"}</span><small>{running ? time : "You made space for yourself."}</small></div><h2>{running ? (inhale ? "Let your breath arrive." : "Let your shoulders soften.") : "That was enough for now."}</h2><button type="button" className="breath-control" onClick={() => setRunning((current) => !current)}>{running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Continue</>}</button></div></motion.div>;
}

function DailySpark({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>(() => makeDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [pairs, setPairs] = useState(0);
  const flip = (card: MemoryCard) => {
    if (card.matched || flipped.includes(card.id) || flipped.length === 2) return;
    const next = [...flipped, card.id]; setFlipped(next);
    if (next.length === 2) { setTurns((value) => value + 1); const chosen = cards.filter((item) => next.includes(item.id)); window.setTimeout(() => { if (chosen[0].symbol === chosen[1].symbol) { setCards((current) => current.map((item) => next.includes(item.id) ? { ...item, matched: true } : item)); setPairs((value) => value + 1); } setFlipped([]); }, 520); }
  };
  const restart = () => { setCards(makeDeck()); setFlipped([]); setTurns(0); setPairs(0); };
  return <motion.div className="game-overlay" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}><div className="game-top"><button type="button" onClick={onClose}><ArrowLeft size={20} /> My Time</button><button type="button" className="text-button" onClick={restart}>New game</button></div><div className="game-title"><p className="overline">Daily Spark</p><h2>A little lightness.</h2><p>There is no rush. Find each friendly pair.</p></div><div className="game-stats"><span><b>{pairs}</b> / 4 pairs</span><span><b>{turns}</b> turns</span></div><div className="memory-grid">{cards.map((card) => { const show = flipped.includes(card.id) || card.matched; return <button key={card.id} type="button" className={`memory-card ${show ? "flipped" : ""} ${card.matched ? "matched" : ""}`} onClick={() => flip(card)} aria-label={show ? `Card ${card.symbol}` : "Turn over card"}><span className="memory-inner"><i className="memory-front">✦</i><i className="memory-back">{card.symbol}</i></span></button>; })}</div><AnimatePresence>{pairs === 4 && <motion.div className="game-win" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}><Sparkles size={26} /><h3>You found every pair.</h3><p>Lovely. Come back whenever you fancy a little spark.</p><button type="button" className="primary-button" onClick={restart}>Play again</button></motion.div>}</AnimatePresence></motion.div>;
}

function MyTimePage({ toast }: { toast: (text: string) => void }) {
  const [duration, setDuration] = useState(1);
  const [breathing, setBreathing] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [people, setPeople] = useState(peopleInitial);
  const [sound, setSound] = useState<number | null>(null);
  const addPerson = () => { if (!people.some((person) => person.name === "Ria")) { setPeople((current) => [...current, { name: "Ria", initial: "R", color: "#E8DAAE" }]); toast("Ria has been added to Your People"); } else toast("Ria is already in Your People"); };
  return <>
    <AppHeader page="time" />
    <div className="my-time-page">
      <section className="breathing-card" style={{ backgroundImage: `linear-gradient(130deg, rgba(245,242,235,0.96), rgba(245,242,235,0.72)), url(${CALM_IMAGE})` }}><div className="breath-card-header"><span className="breath-label"><Waves size={16} /> Breathing</span><span>Just for now</span></div><div className="breath-preview"><div className="preview-orb"><i /><i /><i /></div><div><h2>Make room to breathe.</h2><p>Follow a slow, steady rhythm.</p></div></div><div className="duration-picker" aria-label="Breathing duration">{[1, 3, 5].map((option) => <button type="button" key={option} className={duration === option ? "selected" : ""} onClick={() => setDuration(option)}>{option} min</button>)}</div><button type="button" className="primary-button breath-start" onClick={() => setBreathing(true)}><Play size={18} fill="currentColor" /> Start breathing</button></section>
      <section className="spark-card"><div><p className="overline">Daily Spark</p><h2>Find a little joy.</h2><p>An easy, untimed game to brighten the day.</p><button type="button" className="secondary-button" onClick={() => setGameOpen(true)}><Play size={17} fill="currentColor" /> Play now</button></div><div className="spark-preview" aria-hidden="true"><span>☀</span><span>✦</span><span>☾</span><span>☘</span></div></section>
      <section className="people-section"><div className="section-heading compact"><div><p className="overline">Your people</p><h2>You are not doing this alone.</h2></div><button type="button" className="add-person" onClick={addPerson}><Plus size={17} /> Add</button></div><div className="people-row">{people.map((person) => <div key={person.name} className="person"><span style={{ background: person.color }}>{person.initial}</span><small>{person.name}</small></div>)}</div></section>
      <section className="sounds-section"><div className="section-heading compact"><div><p className="overline">Sounds to rest by</p><h2>Quiet companions</h2></div><Headphones size={20} /></div>{["Gentle rain", "Shoreline hush"].map((name, index) => <button key={name} type="button" className={`sound-row ${sound === index ? "playing" : ""}`} onClick={() => setSound(sound === index ? null : index)}><span className="sound-icon">{sound === index ? <Waves size={19} /> : <Play size={17} fill="currentColor" />}</span><div><strong>{name}</strong><small>{sound === index ? "Playing softly" : "A calm two-minute pause"}</small></div><span className="sound-bars"><i /><i /><i /><i /></span></button>)}</section>
    </div>
    <AnimatePresence>{breathing && <BreathOverlay duration={duration} onClose={() => setBreathing(false)} />}{gameOpen && <DailySpark onClose={() => setGameOpen(false)} />}</AnimatePresence>
  </>;
}

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [journeyTab, setJourneyTab] = useState<JourneyTab>("progress");
  const [toastMessage, setToastMessage] = useState("");
  const pageContent = useMemo(() => ({ home: <HomePage openJourney={() => { setJourneyTab("journal"); setPage("journey"); }} openAlira={() => setPage("alira")} toast={setToastMessage} />, journey: <JourneyPage journeyTab={journeyTab} setJourneyTab={setJourneyTab} toast={setToastMessage} />, alira: <AliraPage toast={setToastMessage} />, time: <MyTimePage toast={setToastMessage} /> }), [journeyTab]);
  useEffect(() => { document.querySelector(".rehyn-app")?.scrollTo({ top: 0, behavior: "auto" }); }, [page]);
  useEffect(() => { if (!toastMessage) return; const timer = window.setTimeout(() => setToastMessage(""), 2600); return () => window.clearTimeout(timer); }, [toastMessage]);

  return <div className="prototype-stage"><div className="iphone-frame"><div className="iphone-screen"><div className="iphone-island" aria-hidden="true"><i /></div><main className="rehyn-app"><div className="app-top-line" /><AnimatePresence mode="wait"><motion.div key={page} className="page-content" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.24, ease: "easeOut" }}>{pageContent[page]}</motion.div></AnimatePresence><nav className="bottom-nav" aria-label="Main navigation">{[{ id: "home" as Page, label: "Home", icon: HomeIcon }, { id: "journey" as Page, label: "Journey", icon: BookHeart }, { id: "alira" as Page, label: "Alira", icon: Bot }, { id: "time" as Page, label: "My Time", icon: Heart }].map((item) => { const ItemIcon = item.icon; return <button type="button" key={item.id} aria-current={page === item.id ? "page" : undefined} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}><ItemIcon size={21} strokeWidth={page === item.id ? 2.4 : 1.9} /><span>{item.label}</span></button>; })}</nav><AnimatePresence>{toastMessage && <motion.div className="app-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><Sparkles size={16} /> {toastMessage}</motion.div>}</AnimatePresence></main><div className="iphone-home-indicator" aria-hidden="true" /></div></div></div>;
}
