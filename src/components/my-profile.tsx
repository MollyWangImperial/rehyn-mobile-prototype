import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ChevronRight, Database, FileText, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEGAL_VERSION, LEGAL_EFFECTIVE_DATE, TERMS_INTRO, TERMS_SECTIONS, PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/content/legal-content";
import { DATA_SECTIONS } from "@/content/data-permissions";

export type Profile = { name: string; email: string; dateOfBirth: string };
type BirthDate = { day: string; month: string; year: string };
const birthDateParts = (value: string): BirthDate => {
  const [year = "", month = "", day = ""] = value.split("-");
  return { day, month, year };
};
function birthDateValue({ day, month, year }: BirthDate): string | null {
  if (!day && !month && !year) return "";
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year) || Number(year) < 1000) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day) || date > new Date()) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
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
  const [birthDate, setBirthDate] = useState(() => birthDateParts(profile.dateOfBirth));
  const [birthDateError, setBirthDateError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const birthDayRef = useRef<HTMLInputElement>(null);
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
    if (next === "personal") {
      setDraft(profile);
      setBirthDate(birthDateParts(profile.dateOfBirth));
      setBirthDateError("");
    }
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
      const dateOfBirth = birthDateValue(birthDate);
      if (dateOfBirth === null) {
        setBirthDateError("Enter a valid date of birth in the past using a day, month and four-digit year, or leave all three fields blank.");
        setSaved(false);
        birthDayRef.current?.focus();
        return;
      }
      const next = { ...draft, name: draft.name.trim(), email: draft.email.trim(), dateOfBirth };
      if (!next.name) return;
      onSave(next);
      setDraft(next);
      setSaved(true);
    }}>
      <p className="rehyn-profile-note">Use sample details here. Changes are saved for this visit only.</p>
      <label htmlFor="profile-name">Your name<input id="profile-name" name="name" value={draft.name} required maxLength={80} autoComplete="off" onChange={event => { setDraft({ ...draft, name: event.target.value }); setSaved(false); }} /></label>
      <label htmlFor="profile-email">Email <span>(optional)</span><input id="profile-email" name="email" type="email" value={draft.email} maxLength={254} autoComplete="off" placeholder="Not added" onChange={event => { setDraft({ ...draft, email: event.target.value }); setSaved(false); }} /></label>
      <fieldset id="profile-birth" className="rehyn-birth-date" lang="en">
        <legend>Date of birth <span>(optional)</span></legend>
        <div className="rehyn-birth-fields">
          {([{ key: "day", label: "Day", placeholder: "DD", length: 2 }, { key: "month", label: "Month", placeholder: "MM", length: 2 }, { key: "year", label: "Year", placeholder: "YYYY", length: 4 }] as const).map(field => <label key={field.key} htmlFor={`profile-birth-${field.key}`}>
            {field.label}
            <input id={`profile-birth-${field.key}`} ref={field.key === "day" ? birthDayRef : undefined} name={`birth-${field.key}`} type="text" inputMode="numeric" maxLength={field.length} autoComplete="off" placeholder={field.placeholder} value={birthDate[field.key]} aria-invalid={!!birthDateError} aria-describedby={birthDateError ? "profile-birth-error" : undefined} onChange={event => {
              setBirthDate({ ...birthDate, [field.key]: event.target.value.replace(/\D/g, "") });
              setBirthDateError("");
              setSaved(false);
            }} />
          </label>)}
        </div>
        {birthDateError && <p id="profile-birth-error" className="rehyn-birth-error" role="alert">{birthDateError}</p>}
      </fieldset>
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
