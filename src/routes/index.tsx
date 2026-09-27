import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Award, BookHeart, Bot, Check, ChevronRight, CircleAlert, Hand, Heart, Home, LockKeyhole, Mic, Pause, Play, Plus, Send, Sparkles, Volume2, Waves, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Rehyn — Your recovery space" },
    { name: "description", content: "A calm, accessible prototype for recovery check-ins, your journey, Alira, and moments for yourself." },
    { property: "og:title", content: "Rehyn — Your recovery space" },
    { property: "og:description", content: "A calm, accessible prototype for recovery check-ins, your journey, Alira, and moments for yourself." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Rehyn,
});

type Page = "home" | "journey" | "alira" | "time";
type JourneyTab = "progress" | "journal" | "medals";
type Overlay = "stretch" | "safety" | "breathing" | "game" | "entry" | null;
type Message = { id: number; role: "alira" | "molly"; text: string };
const moods = [
  { label: "Tough", symbol: "☁", note: "A hard day is still a day you showed up." },
  { label: "Low", symbol: "◔", note: "Thank you for checking in with yourself." },
  { label: "Okay", symbol: "•", note: "Okay is a perfectly good place to begin." },
  { label: "Good", symbol: "☀", note: "It is good to notice the lighter moments." },
  { label: "Great", symbol: "✦", note: "Hold on to that feeling for a moment." },
];
const progress = [
  { label: "Reaching", score: 62, icon: ArrowRight, status: "Building" },
  { label: "Hand control", score: 56, icon: Hand, status: "Building" },
  { label: "Moving about", score: 72, icon: Waves, status: "Steady" },
];
const weeks = [35, 42, 40, 52, 60, 67];
const medalItems = [
  { name: "First voice note", date: "20 Sep", icon: Mic, detail: "You made it easier to say what was on your mind.", earned: true },
  { name: "Asked Alira", date: "17 Sep", icon: Bot, detail: "You reached out and asked for support.", earned: true },
  { name: "Honest day", date: "20 Sep", icon: Heart, detail: "You checked in truthfully with yourself.", earned: true },
  { name: "Five wins", date: "2 more", icon: Sparkles, detail: "Save two more small wins to unlock this medal.", earned: false },
  { name: "Steady week", date: "3 of 7", icon: Award, detail: "Complete a check-in on three more days this week.", earned: false },
];
const quickActions = [
  { label: "Ask a question", reply: "Of course. Ask me anything about your recovery, your routine, or what to expect." },
  { label: "Raise a concern", reply: "Thank you for telling me. You do not have to work it out alone. What feels most important right now?" },
  { label: "Lift me up", reply: "You have made room for yourself today — that matters. Tiny steps still take you forward." },
  { label: "Talk it through", reply: "I am here. Take your time. What is sitting heavily with you today?" },
];
const stretchSteps = [
  { title: "Rest your arm", text: "Place your forearm on a table or cushion. Let your shoulder feel heavy." },
  { title: "Open your hand", text: "Slowly lengthen your fingers. Only move as far as feels comfortable." },
  { title: "Pause and soften", text: "Hold for one relaxed breath, then let your hand rest again." },
];
const symbols = ["☀", "☀", "✦", "✦", "☘", "☘", "☾", "☾"];
const makeDeck = () => symbols.map((symbol, id) => ({ symbol, id, matched: false })).sort(() => Math.random() - .5);

function IconAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <Button variant="ghost" size="icon" aria-label={label} title={label} onClick={onClick} className="h-11 w-11 shrink-0 rounded-md"><Icon className="!size-5" /></Button>;
}
function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="rehyn-section-head"><div>{eyebrow && <p className="rehyn-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>;
}
function Rehyn() {
  const [page, setPage] = useState<Page>("home");
  const [tab, setTab] = useState<JourneyTab>("progress");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [selectedMedal, setSelectedMedal] = useState(0);
  const [stretchStep, setStretchStep] = useState(0);
  const [duration, setDuration] = useState(1);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [people, setPeople] = useState(["Sam", "Jess", "Mum"]);
  const [sound, setSound] = useState<number | null>(null);
  const [deck, setDeck] = useState(makeDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "alira", text: "Good afternoon, Molly. How can I help today?" }]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [toast, setToast] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageEnd = useRef<HTMLDivElement>(null);
  const isConversation = messages.length > 1;
  const matchedPairs = deck.filter(card => card.matched).length / 2;
  const concernRaised = messages.some(message => message.text === quickActions.find(action => action.label === "Raise a concern")?.reply);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [page, tab]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2800); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (overlay !== "breathing" || !running || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [overlay, running, seconds]);
  useEffect(() => { if (isConversation) messageEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, typing, isConversation]);
  const go = (next: Page, nextTab?: JourneyTab) => { if (nextTab) setTab(nextTab); setPage(next); setOverlay(null); };
  const beginBreathing = () => { setSeconds(duration * 60); setRunning(true); setOverlay("breathing"); };
  const reply = (text: string) => {
    setTyping(true);
    window.setTimeout(() => { setMessages(current => [...current, { id: Date.now() + Math.random(), role: "alira", text }]); setTyping(false); }, 650);
  };
  const send = (text: string, response?: string) => {
    const clean = text.trim(); if (!clean) return;
    setMessages(current => [...current, { id: Date.now() + Math.random(), role: "molly", text: clean }]);
    setDraft(""); reply(response ?? "Thank you for sharing that with me. I am listening. Would it help to take this one small piece at a time?");
  };
  const readAloud = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(text); speech.rate = .9; window.speechSynthesis.speak(speech);
  };
  const flipCard = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || deck.find(card => card.id === id)?.matched) return;
    const next = [...flipped, id]; setFlipped(next);
    if (next.length === 2) {
      setTurns(value => value + 1);
      window.setTimeout(() => {
        const first = deck.find(card => card.id === next[0]); const second = deck.find(card => card.id === next[1]);
        if (first && second && first.symbol === second.symbol) setDeck(current => current.map(card => next.includes(card.id) ? { ...card, matched: true } : card));
        setFlipped([]);
      }, 650);
    }
  };
  const resetGame = () => { setDeck(makeDeck()); setFlipped([]); setTurns(0); };
  const header = {
    home: ["Your recovery space", "Good afternoon, Molly."],
    journey: ["Your recovery, at your pace", "Your Journey"],
    alira: ["Your thoughtful space", "Alira"],
    time: ["A little room for you", "My Time"],
  }[page];
  return <div className="rehyn-stage"><div className="rehyn-device"><div className="rehyn-screen">
    <div className="rehyn-island" aria-hidden="true" /><div className="rehyn-status" aria-hidden="true"><span>9:41</span><span className="rehyn-status-icons">●●● <span className="rehyn-battery" /></span></div>
    <main className="rehyn-scroll" ref={scrollRef}>
      <header className="flex items-start justify-between gap-2"><div><p className="rehyn-eyebrow">{header[0]}</p><h1 className="rehyn-title">{header[1]}</h1></div>{page === "home" ? <span className="mt-1 shrink-0 rounded-md bg-card px-2 py-2 text-xs font-bold text-muted-foreground">Sun 27</span> : null}</header>
      {page === "home" && <div className="rehyn-panel">
        <section className="rehyn-hero"><span className="rehyn-hero-art" aria-hidden="true" /><p className="rehyn-eyebrow">Next step</p><h2 className="rehyn-subtitle mt-3 max-w-[210px]">A gentle start<br />for today.</h2><p className="rehyn-copy mt-3 max-w-[250px]">Tell us how you are feeling, and we will find a comfortable next step.</p><Button className="rehyn-action mt-5 w-full" onClick={() => go("journey", "journal")}>Begin check-in <ArrowRight /></Button><p className="mt-3 text-center text-xs font-semibold text-muted-foreground">About 1 minute</p></section>
        <section className="rehyn-section"><SectionTitle eyebrow="Step 1 of 3" title="Your progress" action={<Button variant="link" className="h-11 px-0 text-primary" onClick={() => go("journey", "progress")}>See details <ChevronRight /></Button>} /><div className="rehyn-progress-row">{progress.map(item => <Button key={item.label} variant="ghost" className="rehyn-progress-item rehyn-glass h-auto flex-col items-start justify-start whitespace-normal hover:bg-card" onClick={() => go("journey", "progress")}><item.icon className="!size-5 text-primary" /><strong>{item.label}</strong><div className="w-full"><div className="rehyn-meter"><i style={{ width: `${item.score}%` }} /></div><small className="mt-2 block">{item.status}</small></div></Button>)}</div></section>
        <section className="rehyn-section rehyn-glass p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-sage text-primary"><Bot /></span><div><p className="rehyn-eyebrow">Alira · Available to help</p><h2 className="mt-1 font-display text-xl font-semibold leading-tight">Questions about your plan?</h2></div></div><p className="rehyn-copy mt-3">I can help make today feel clearer.</p><Button variant="secondary" className="rehyn-action mt-4 w-full justify-between px-4" onClick={() => go("alira")}>Talk with Alira <ArrowRight /></Button><p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3" /> Your conversations stay private</p></section>
        <section className="rehyn-section"><SectionTitle eyebrow="This week" title="One day at a time." /><div className="rehyn-week" aria-label="Weekly check-in progress">{["M","T","W","T","F","S","S"].map((day,index) => <span className={index < 3 ? "done" : index === 3 ? "today" : ""} key={index}>{day}<b>{index < 3 ? <Check className="size-4" /> : index === 3 ? "27" : index + 24}</b></span>)}</div></section>
        <Button variant="ghost" className="rehyn-section rehyn-glass flex h-auto min-h-24 w-full items-center justify-start gap-4 whitespace-normal p-4 text-left hover:bg-card" onClick={() => { setStretchStep(0); setOverlay("stretch"); }}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-warm text-accent"><Hand /></span><span className="min-w-0 flex-1"><span className="rehyn-eyebrow block text-warm-foreground">Optional activity · 5 min</span><strong className="mt-1 block font-display text-xl">Hand stretch</strong><span className="mt-1 block text-sm font-normal text-muted-foreground">Try a slow, comfortable hand stretch.</span></span><ChevronRight className="!size-5 shrink-0" /></Button>
        <Button variant="ghost" className="mt-4 h-auto min-h-12 w-full min-w-0 justify-start gap-2 whitespace-normal px-3 py-3 text-left text-sm font-bold leading-snug text-warm-foreground hover:bg-warm hover:text-warm-foreground" onClick={() => setOverlay("safety")}><CircleAlert className="!size-5 shrink-0" /> <span className="min-w-0 flex-1">Worried about warning signs?</span> <ChevronRight className="ml-auto shrink-0" /></Button>
      </div>}
      {page === "journey" && <div><div className="rehyn-tabs" role="tablist" aria-label="Your Journey sections">{(["progress","journal","medals"] as JourneyTab[]).map(item => <Button variant="ghost" role="tab" aria-selected={tab === item} key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item.charAt(0).toUpperCase() + item.slice(1)}</Button>)}</div>
        {tab === "progress" && <div className="rehyn-panel"><section className="rehyn-section rehyn-glass p-5"><p className="rehyn-eyebrow">Your progress</p><div className="mt-2 flex items-start justify-between gap-2"><h2 className="rehyn-subtitle max-w-[210px]">Small steps, real change.</h2><span className="rounded-md bg-sage px-2 py-1 text-sm font-bold text-primary">+18%</span></div><div className="mt-5 flex items-end gap-3"><strong className="font-display text-6xl font-semibold leading-none">{weeks[selectedWeek] ?? weeks[0]}</strong><span className="pb-1 text-sm leading-snug text-muted-foreground">today's recovery score<br />in W{selectedWeek + 1}</span></div><svg className="rehyn-chart mt-4" viewBox="0 0 320 140" role="img" aria-label="Recovery score rises from 35 in week one to 67 in week six"><line x1="10" x2="310" y1="30" y2="30"/><line x1="10" x2="310" y1="75" y2="75"/><line x1="10" x2="310" y1="120" y2="120"/><path d={weeks.map((value,index) => `${index ? "L" : "M"}${20 + index*56} ${120 - (value-30)*2.45}`).join(" ")} />{weeks.map((value,index) => <circle key={index} cx={20 + index*56} cy={120 - (value-30)*2.45} r={index === selectedWeek ? 7 : 5} />)}</svg><div className="grid grid-cols-6 gap-1">{weeks.map((value,index) => <Button key={index} variant="ghost" aria-label={`Week ${index+1}, score ${value}`} className={`h-11 px-0 text-xs ${index === selectedWeek ? "text-primary underline" : "text-muted-foreground"}`} onClick={() => setSelectedWeek(index)}>W{index+1}</Button>)}</div><p className="rehyn-copy mt-4 border-t border-border pt-4 text-sm">Your confidence has lifted steadily over the last three weeks.</p></section>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rehyn-glass p-4"><p className="text-sm text-muted-foreground">This week</p><strong className="mt-2 block font-display text-3xl">4 <small className="font-sans text-sm">sessions</small></strong><p className="mt-2 text-xs text-primary">one more than last week</p></div><div className="rehyn-glass p-4"><p className="text-sm text-muted-foreground">Daily check-ins</p><strong className="mt-2 block font-display text-3xl">6 <small className="font-sans text-sm">days</small></strong><p className="mt-2 text-xs text-primary">a gentle rhythm</p></div></div>
          <section className="rehyn-section"><SectionTitle eyebrow="People noticed" title="Progress feels different when it is seen." /><div className="space-y-3"><blockquote className="rehyn-glass m-0 p-4 font-display text-lg">“Molly has been more confident moving around the kitchen this week.”<footer className="mt-3 font-sans text-xs text-muted-foreground">— Sam, yesterday</footer></blockquote><blockquote className="rehyn-glass m-0 p-4 font-display text-lg">“You kept trying, even when the morning felt slow.”<footer className="mt-3 font-sans text-xs text-muted-foreground">— Your therapist, Friday</footer></blockquote></div><Button variant="link" className="mt-3 h-auto min-h-11 w-full min-w-0 justify-start whitespace-normal px-0 py-2 text-left leading-snug text-primary" onClick={() => setTab("medals")}><span className="min-w-0 flex-1">See what you are working towards</span> <ChevronRight className="shrink-0" /></Button></section></div>}
        {tab === "journal" && <div className="rehyn-panel"><section className="rehyn-section rehyn-glass p-5"><p className="rehyn-eyebrow">A moment for you</p><h2 className="rehyn-subtitle mt-2">How are you feeling today?</h2><p className="rehyn-copy mt-2">One tap is enough. You can always add more later.</p><div className="rehyn-mood-grid" role="group" aria-label="Choose how you are feeling">{moods.map(mood => <Button key={mood.label} variant="ghost" aria-pressed={selectedMood === mood.label} className={selectedMood === mood.label ? "active" : ""} onClick={() => { setSelectedMood(mood.label); setSaved(false); }}><span aria-hidden="true">{mood.symbol}</span>{mood.label}</Button>)}</div>{selectedMood && <p aria-live="polite" className="mt-5 rounded-md bg-sage p-3 text-sm leading-relaxed text-sage-foreground">{moods.find(item => item.label === selectedMood)?.note}</p>}<label className="mt-6 block text-sm font-bold">Anything else? <span className="font-normal text-muted-foreground">Optional</span><textarea className="rehyn-input mt-2" rows={3} placeholder="A few words, if you want to…" value={note} onChange={event => { setNote(event.target.value); setSaved(false); }} /></label><Button className="rehyn-action mt-4 w-full" disabled={!selectedMood || saved} onClick={() => { setSaved(true); setToast("Today’s check-in is saved"); }}>{saved ? "Saved for today" : "Save check-in"}</Button></section>
          <section className="rehyn-section"><SectionTitle eyebrow="The last two weeks" title="Your rhythm" /><div className="grid grid-cols-7 gap-2">{["Okay","Good","Low","Okay","Great","Good","Okay","Good","Good","Okay","Great","Good","Good","Great"].map((label,index) => <div key={index} className="grid h-11 place-items-center rounded-md bg-sage text-primary" title={label}><span className="text-lg leading-none">{moods.find(item => item.label === label)?.symbol}</span></div>)}</div></section>
          <section className="rehyn-section"><SectionTitle eyebrow="Your words" title="Recent entries" />{["The garden felt lovely today…","Managed the stairs with Sam nearby."].map((text,index) => <Button variant="ghost" key={text} className="flex h-auto min-h-16 w-full justify-between border-b border-border px-0 text-left hover:bg-muted" onClick={() => setOverlay("entry")}><span><small className="block text-xs text-muted-foreground">{index ? "25 Sep · Okay" : "Yesterday · Good"}</small><span className="mt-1 block text-sm font-normal">“{text}”</span></span><ChevronRight /></Button>)}</section></div>}
        {tab === "medals" && <div className="rehyn-panel"><section className="rehyn-section rounded-md bg-warm p-5"><p className="rehyn-eyebrow text-warm-foreground">Your collection</p><h2 className="rehyn-subtitle mt-2">3 medals earned</h2><p className="rehyn-copy mt-2">Every small act of care counts.</p></section><section className="rehyn-section"><SectionTitle title="Earned medals" /><div className="grid grid-cols-3 gap-2">{medalItems.slice(0,3).map((item,index) => <Button key={item.name} variant="ghost" className={`rehyn-glass h-32 flex-col whitespace-normal p-2 text-center text-xs ${selectedMedal === index ? "border-primary" : ""}`} onClick={() => setSelectedMedal(index)}><item.icon className="!size-7 text-accent" /><strong>{item.name}</strong><small className="text-muted-foreground">{item.date}</small></Button>)}</div></section><section aria-live="polite" className="rehyn-section rounded-md bg-sage p-5"><p className="rehyn-eyebrow">{medalItems[selectedMedal]?.earned ? `Earned ${medalItems[selectedMedal]?.date}` : "In progress"}</p><h2 className="rehyn-subtitle mt-2">{medalItems[selectedMedal]?.name}</h2><p className="rehyn-copy mt-2">{medalItems[selectedMedal]?.detail}</p></section><section className="rehyn-section"><SectionTitle eyebrow="Keep going" title="Next to unlock" />{medalItems.slice(3).map((item,index) => <Button key={item.name} variant="ghost" className="rehyn-glass mb-3 flex h-auto min-h-20 w-full items-center justify-start gap-3 whitespace-normal p-3 text-left" onClick={() => setSelectedMedal(index+3)}><item.icon className="!size-6 shrink-0 text-muted-foreground" /><span className="flex-1"><strong className="block text-sm">{item.name}</strong><span className="mt-1 block text-xs font-normal text-muted-foreground">{item.detail}</span></span><ChevronRight /></Button>)}</section></div>}
      </div>}
      {page === "alira" && <div className="rehyn-panel"><section className="rehyn-section"><div className="grid h-14 w-14 place-items-center rounded-md bg-primary text-primary-foreground"><Bot /></div><h2 className="rehyn-subtitle mt-5">Good afternoon, Molly.</h2><p className="rehyn-copy mt-2">How can I help today?</p></section>{!isConversation && <div className="mt-7 space-y-3">{quickActions.map(action => <Button key={action.label} variant="ghost" className="rehyn-glass flex h-16 w-full justify-between px-4 text-left text-base" onClick={() => send(action.label, action.reply)}>{action.label}<ChevronRight /></Button>)}<p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted-foreground"><LockKeyhole className="mt-0.5 size-4 shrink-0" />This is a private space. Your care team only sees concerns you choose to share.</p></div>}{isConversation && <div className="mt-6 grid gap-3" aria-live="polite">{messages.map(message => <div key={message.id} className={`rehyn-message ${message.role}`}><p className="m-0">{message.text}</p>{message.role === "alira" && <Button variant="link" className="mt-1 h-9 px-0 text-xs text-primary" onClick={() => readAloud(message.text)}><Volume2 /> Read aloud</Button>}</div>)}{typing && <div className="rehyn-message alira">…</div>}{concernRaised && <div className="grid gap-2"><p className="text-sm text-muted-foreground">Choose what fits best, if you want to.</p><Button variant="outline" className="min-h-12 justify-start whitespace-normal text-left" onClick={() => send("Something changed", "That sounds worrying. If it feels safe, tell your therapist what changed — they can help you make a plan.")}>Something changed</Button><Button variant="outline" className="min-h-12 justify-start" onClick={() => send("I feel unsafe", "Your safety matters most. If you think you are having a stroke, call 999 now. You can also ask someone you trust to stay with you.")}>I feel unsafe</Button></div>}<div ref={messageEnd} /></div>}<form className="rehyn-composer mt-6" onSubmit={event => { event.preventDefault(); send(draft); }}><input aria-label="Message Alira" placeholder="Message Alira" value={draft} onChange={event => setDraft(event.target.value)} /><IconAction icon={Send} label="Send message" onClick={() => send(draft)} /></form><p className="text-center text-xs leading-relaxed text-muted-foreground">Alira supports your care team and is not an emergency service.</p></div>}
      {page === "time" && <div className="rehyn-panel"><section className="rehyn-section rounded-md bg-sage p-5"><p className="rehyn-eyebrow">Breathing · Just for now</p><h2 className="rehyn-subtitle mt-5">Make room to breathe.</h2><p className="rehyn-copy mt-2">Follow a slow, steady rhythm.</p><div className="mt-5 flex gap-2" aria-label="Breathing duration">{[1,3,5].map(value => <Button key={value} variant={duration === value ? "default" : "outline"} className="h-11 min-w-16" onClick={() => setDuration(value)}>{value} min</Button>)}</div><Button className="rehyn-action mt-5 w-full" onClick={beginBreathing}><Play /> Start breathing</Button></section><section className="rehyn-section rounded-md bg-warm p-5"><p className="rehyn-eyebrow text-warm-foreground">Daily Spark</p><h2 className="rehyn-subtitle mt-2">Find a little joy.</h2><p className="rehyn-copy mt-2">An easy, untimed game to brighten the day.</p><Button variant="outline" className="rehyn-action mt-5" onClick={() => { resetGame(); setOverlay("game"); }}><Play /> Play now</Button></section><section className="rehyn-section"><SectionTitle eyebrow="Your people" title="You are not doing this alone." action={<Button variant="ghost" className="h-11 text-primary" onClick={() => { if (!people.includes("Ria")) { setPeople(current => [...current,"Ria"]); setToast("Ria has been added to Your People"); } else setToast("Ria is already in Your People"); }}><Plus /> Add</Button>} /><div className="flex gap-5">{people.map((person,index) => <div key={person} className="grid justify-items-center gap-2"><span className={`grid h-12 w-12 place-items-center rounded-full font-bold ${index % 2 ? "bg-warm text-warm-foreground" : "bg-sage text-sage-foreground"}`}>{person[0]}</span><span className="text-sm">{person}</span></div>)}</div></section><section className="rehyn-section"><SectionTitle eyebrow="Sounds to rest by" title="Quiet companions" />{["Gentle rain","Shoreline hush"].map((name,index) => <Button key={name} variant="ghost" className="flex h-16 w-full justify-start gap-3 rounded-md border-t border-border px-2 text-left text-foreground transition-colors hover:bg-sage/50 hover:text-foreground" onClick={() => setSound(sound === index ? null : index)}><span className="grid h-10 w-10 place-items-center rounded-md bg-sage text-primary">{sound === index ? <Pause /> : <Play />}</span><span><strong className="block text-sm">{name}</strong><small className="text-xs text-muted-foreground">{sound === index ? "Playing softly" : "A calm two-minute pause"}</small></span></Button>)}</section></div>}
    </main>
    <nav className="rehyn-nav" aria-label="Main navigation">{([{ id: "home", label: "Home", icon: Home },{ id: "journey", label: "Journey", icon: BookHeart },{ id: "alira", label: "Alira", icon: Bot },{ id: "time", label: "My Time", icon: Heart }] as const).map(item => <Button variant="ghost" key={item.id} aria-current={page === item.id ? "page" : undefined} className={page === item.id ? "active" : ""} onClick={() => go(item.id)}><item.icon /><span>{item.label}</span></Button>)}</nav>
    <div className="rehyn-homebar" aria-hidden="true" />
    {toast && <div role="status" className="absolute bottom-24 left-5 right-5 z-30 rounded-md bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">{toast}</div>}
    {overlay === "safety" && <div className="rehyn-scrim" onClick={() => setOverlay(null)}><section className="rehyn-sheet" role="dialog" aria-modal="true" aria-label="Warning signs" onClick={event => event.stopPropagation()}><CircleAlert className="size-8 text-destructive" /><p className="rehyn-eyebrow mt-4 text-warm-foreground">If something feels wrong</p><h2 className="rehyn-subtitle mt-2">Act quickly if you notice sudden changes.</h2><p className="rehyn-copy mt-4">If you think you or someone else may be having a stroke, call <strong>999</strong> now. Do not wait for an in-app reply.</p><Button className="rehyn-action mt-6 w-full" onClick={() => setOverlay(null)}>I understand</Button></section></div>}
    {overlay === "entry" && <div className="rehyn-scrim" onClick={() => setOverlay(null)}><section className="rehyn-sheet" role="dialog" aria-modal="true" aria-label="Journal entry" onClick={event => event.stopPropagation()}><p className="rehyn-eyebrow">Saturday 26 September</p><h2 className="rehyn-subtitle mt-2">Good</h2><p className="rehyn-copy mt-5">I sat in the garden with a cup of tea. The air felt warm, and I noticed I was smiling without trying.</p><Button variant="outline" className="rehyn-action mt-6 w-full" onClick={() => setOverlay(null)}>Done</Button></section></div>}
    {overlay === "stretch" && <div className="rehyn-overlay" role="dialog" aria-modal="true" aria-label="Hand stretch"><IconAction icon={X} label="Close hand stretch" onClick={() => setOverlay(null)} /><div className="mt-20 text-center"><p className="rehyn-eyebrow">Optional activity · step {stretchStep+1} of 3</p><div className="rehyn-orb text-primary"><Hand className="size-14" /></div><h2 className="rehyn-subtitle">{stretchSteps[stretchStep]?.title}</h2><p className="rehyn-copy mt-4">{stretchSteps[stretchStep]?.text}</p><div className="mt-8 flex justify-center gap-2">{stretchSteps.map((_, index) => <span key={index} className={`h-2 w-2 rounded-full ${index <= stretchStep ? "bg-primary" : "bg-secondary"}`} />)}</div><Button className="rehyn-action mt-7 w-full" onClick={() => { if (stretchStep < 2) setStretchStep(value => value+1); else { setOverlay(null); setToast("Lovely work — you can come back anytime"); } }}>{stretchStep < 2 ? "Next step" : "Finish gently"} <ArrowRight /></Button><Button variant="link" className="mt-3 h-11 text-primary" onClick={() => setOverlay(null)}>Leave for now</Button></div></div>}
    {overlay === "breathing" && <div className="rehyn-overlay" role="dialog" aria-modal="true" aria-label="Breathing exercise"><IconAction icon={X} label="Close breathing exercise" onClick={() => setOverlay(null)} /><div className="mt-16 text-center"><p className="rehyn-eyebrow">A quiet moment</p><div className={`rehyn-orb ${seconds > 0 && running ? (seconds % 10 > 5 ? "in" : "out") : ""}`}><strong className="font-display text-xl">{seconds <= 0 ? "Well done" : seconds % 10 > 5 ? "Breathe in" : "Breathe out"}</strong><small className="mt-2 text-sm text-muted-foreground">{seconds <= 0 ? "You made space for yourself." : `${Math.floor(seconds/60)}:${String(seconds % 60).padStart(2,"0")}`}</small></div><h2 className="rehyn-subtitle">{seconds <= 0 ? "That was enough for now." : seconds % 10 > 5 ? "Let your breath arrive." : "Let your shoulders soften."}</h2>{seconds > 0 && <Button variant="outline" className="rehyn-action mt-7" onClick={() => setRunning(value => !value)}>{running ? <><Pause /> Pause</> : <><Play /> Continue</>}</Button>}</div></div>}
    {overlay === "game" && <div className="rehyn-overlay" role="dialog" aria-modal="true" aria-label="Daily Spark game"><div className="flex items-center justify-between"><Button variant="ghost" className="h-11 px-0" onClick={() => setOverlay(null)}><ArrowLeft /> My Time</Button><Button variant="link" className="h-11 text-primary" onClick={resetGame}>New game</Button></div><p className="rehyn-eyebrow mt-10">Daily Spark</p><h2 className="rehyn-title">A little lightness.</h2><p className="rehyn-copy mt-3">There is no rush. Find each friendly pair.</p><div className="mt-6 flex justify-between text-sm font-bold text-muted-foreground"><span>{matchedPairs} / 4 pairs</span><span>{turns} turns</span></div><div className="rehyn-memory">{deck.map(card => { const reveal = flipped.includes(card.id) || card.matched; return <Button key={card.id} variant="ghost" className={reveal ? "revealed" : ""} aria-label={reveal ? `Card ${card.symbol}` : "Turn over card"} onClick={() => flipCard(card.id)}>{reveal ? card.symbol : "✦"}</Button>; })}</div>{matchedPairs === 4 && <div className="mt-7 rounded-md bg-sage p-5 text-center"><Sparkles className="mx-auto text-primary" /><h3 className="mt-2 font-display text-xl">You found every pair.</h3><p className="rehyn-copy mt-2">Lovely. Come back whenever you fancy a little spark.</p><Button className="rehyn-action mt-5" onClick={resetGame}>Play again</Button></div>}</div>}
  </div></div></div>;
}
