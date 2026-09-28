import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ChevronRight, Database, FileText, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEGAL_VERSION, LEGAL_EFFECTIVE_DATE, TERMS_INTRO, TERMS_SECTIONS, PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/content/legal-content";
import { DATA_SECTIONS } from "@/content/data-permissions";

export type Profile = { name: string; email: string; dateOfBirth: string };
type ProfilePage = "overview" | "personal" | "privacy" | "data" | "terms";
const sections = [
  { id: "personal", title: "Personal information", description: "Your name and contact details", icon: UserRound },
  { id: "privacy", title: "Privacy Notice", description: "How we use your data", icon: ShieldCheck },
  { id: "data", title: "Data and permissions", description: "Your choices and rights", icon: Database },
  { id: "terms", title: "Terms of Use", description: "Using Rehyn safely", icon: FileText },
] as const;
const documents = {
  privacy: { intro: PRIVACY_INTRO, sections: PRIVACY_SECTIONS },
  terms: { intro: TERMS_INTRO, sections: TERMS_SECTIONS },
  data: { intro: "Learn about Rehyn’s data choices, device permissions and your rights.", sections: DATA_SECTIONS },
};

export function MyProfile({ profile, onSave, scrollRef }: {
  profile: Profile;
  onSave: (profile: Profile) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const [page, setPage] = useState<ProfilePage>("overview");
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const title = page === "overview" ? "My Profile" : sections.find(section => section.id === page)!.title;
  const document = page === "privacy" || page === "terms" || page === "data" ? documents[page] : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [page, scrollRef]);
  useEffect(() => {
    if (confirmReset) confirmationRef.current?.focus();
  }, [confirmReset]);

  const navigate = (next: ProfilePage) => {
    setPage(next);
    setSaved(false);
    setConfirmReset(false);
    if (next === "personal") setDraft(profile);
  };

  return <div className="rehyn-panel rehyn-profile">
    <header className="rehyn-profile-header">
      {page === "overview" ? <p className="rehyn-eyebrow">Your space</p> : <Button variant="ghost" className="rehyn-profile-back" onClick={() => navigate("overview")}><ArrowLeft aria-hidden="true" /> My Profile</Button>}
      <h1 className="rehyn-title" ref={headingRef} tabIndex={-1}>{title}</h1>
    </header>

    {page === "overview" && <>
      <section className="rehyn-profile-card" aria-label="Demo profile">
        <span className="rehyn-profile-avatar" aria-hidden="true"><UserRound /></span>
        <div><strong>{profile.name}</strong><span>Demo profile</span></div>
      </section>
      <div className="rehyn-profile-links">
        {sections.map(section => <Button key={section.id} variant="ghost" className="rehyn-profile-row" onClick={() => navigate(section.id)}>
          <section.icon aria-hidden="true" />
          <span><strong>{section.title}</strong><small>{section.description}</small></span>
          <ChevronRight aria-hidden="true" />
        </Button>)}
      </div>
      <section className="rehyn-profile-session" aria-labelledby="demo-session-heading">
        <h2 id="demo-session-heading">About this demo</h2>
        <p>Profile details, journal entries and Alira messages stay in this page session. Reloading clears them. Please use sample information.</p>
        {confirmReset ? <div className="rehyn-profile-confirm" ref={confirmationRef} tabIndex={-1} role="group" aria-labelledby="reset-demo-title" aria-describedby="reset-demo-description">
          <h3 id="reset-demo-title">Reset this demo session?</h3>
          <p id="reset-demo-description">Your current profile edits, entries and messages will be cleared.</p>
          <Button className="rehyn-action w-full" onClick={() => window.location.reload()}>Reset and return Home</Button>
          <Button variant="outline" className="rehyn-action w-full" onClick={() => { setConfirmReset(false); requestAnimationFrame(() => resetRef.current?.focus()); }}>Keep this session</Button>
        </div> : <Button ref={resetRef} variant="outline" className="rehyn-profile-reset" onClick={() => setConfirmReset(true)}><RotateCcw aria-hidden="true" /> Reset demo session</Button>}
      </section>
    </>}

    {page === "personal" && <form className="rehyn-profile-form" onSubmit={event => {
      event.preventDefault();
      const next = { ...draft, name: draft.name.trim(), email: draft.email.trim() };
      if (!next.name) return;
      onSave(next);
      setDraft(next);
      setSaved(true);
    }}>
      <p className="rehyn-profile-note">Use sample details here. Changes are saved for this visit only.</p>
      <label htmlFor="profile-name">Your name<input id="profile-name" name="name" value={draft.name} required maxLength={80} autoComplete="off" onChange={event => { setDraft({ ...draft, name: event.target.value }); setSaved(false); }} /></label>
      <label htmlFor="profile-email">Email <span>(optional)</span><input id="profile-email" name="email" type="email" value={draft.email} maxLength={254} autoComplete="off" placeholder="Not added" onChange={event => { setDraft({ ...draft, email: event.target.value }); setSaved(false); }} /></label>
      <label htmlFor="profile-birth">Date of birth <span>(optional)</span><input id="profile-birth" name="dateOfBirth" type="date" value={draft.dateOfBirth} autoComplete="off" onChange={event => { setDraft({ ...draft, dateOfBirth: event.target.value }); setSaved(false); }} /></label>
      <Button type="submit" className="rehyn-action w-full" disabled={!draft.name.trim()}>Save changes</Button>
      <p className="rehyn-profile-saved" role="status">{saved ? "Your details are saved for this visit." : ""}</p>
    </form>}

    {document && <div className="rehyn-profile-document" key={page}>
      <aside className="rehyn-profile-note">
        <strong>Document preview</strong>
        <p>{page === "data" ? "These describe the Rehyn service. This demo does not record consent, change device permissions or manage a real account." : "Rehyn’s supplied document, shown for reference. The effective date and some details are still to be confirmed."}</p>
      </aside>
      {page !== "data" && <p className="rehyn-legal-version">Version {LEGAL_VERSION}<br />Effective date: {LEGAL_EFFECTIVE_DATE}</p>}
      <p className="rehyn-legal-intro">{document.intro}</p>
      <div className="rehyn-legal-sections">{document.sections.map((section, index) => <details className="rehyn-legal-section" key={section.title} open={index === 0}>
        <summary><h2>{section.title}</h2><ChevronRight aria-hidden="true" /></summary>
        <div className="rehyn-legal-copy">
          {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          {section.bullets && <ul>{section.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul>}
        </div>
      </details>)}</div>
      <Button variant="outline" className="rehyn-profile-back-bottom" onClick={() => navigate("overview")}><ArrowLeft aria-hidden="true" /> Back to My Profile</Button>
    </div>}
  </div>;
}
