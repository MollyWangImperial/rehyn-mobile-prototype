import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ChevronRight, Database, ExternalLink, FileText, RotateCcw, ShieldCheck, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";

type SettingsPage = "menu" | "terms" | "privacy" | "data";

const sections = [
  { id: "terms", title: "Terms & conditions", description: "About using this prototype", icon: FileText },
  { id: "privacy", title: "Privacy", description: "How your information is handled", icon: ShieldCheck },
  { id: "data", title: "Your data", description: "What is saved and how to clear it", icon: Database },
] as const;

export function AccountSettings({ open, onOpenChange, triggerRef }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const [page, setPage] = useState<SettingsPage>("menu");
  const [confirmReset, setConfirmReset] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const title = page === "menu" ? "Account & settings" : sections.find(section => section.id === page)!.title;

  useEffect(() => {
    if (!open) return;
    bodyRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [open, page]);

  useEffect(() => {
    if (confirmReset) confirmationRef.current?.focus();
  }, [confirmReset]);

  const navigate = (next: SettingsPage) => {
    setPage(next);
    setConfirmReset(false);
  };

  return <Dialog.Root open={open} onOpenChange={next => {
    onOpenChange(next);
    if (!next) navigate("menu");
  }}>
    {/* Render inside the device so the dialog and its focus trap stay in the phone. */}
    <Dialog.Content className="rehyn-settings" aria-describedby="settings-description"
      onOpenAutoFocus={event => { event.preventDefault(); headingRef.current?.focus(); }}
      onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus({ preventScroll: true }); }}>
      <div className="rehyn-settings-toolbar">
        {page !== "menu" ? <Button variant="ghost" className="rehyn-settings-back" onClick={() => navigate("menu")}><ArrowLeft aria-hidden="true" /> Settings</Button> : <span className="rehyn-eyebrow">Your space</span>}
        <Dialog.Close asChild><Button variant="ghost" size="icon" className="rehyn-settings-close" aria-label="Close account and settings"><X aria-hidden="true" /></Button></Dialog.Close>
      </div>
      <div className="rehyn-settings-body" ref={bodyRef}>
        <Dialog.Title className="rehyn-settings-title" ref={headingRef} tabIndex={-1}>{title}</Dialog.Title>
        <Dialog.Description id="settings-description" className="rehyn-settings-description">
          {page === "menu" ? "Your profile, privacy and data." : "Prototype information"}
        </Dialog.Description>

        {page === "menu" && <>
          <section className="rehyn-settings-profile" aria-label="Demo profile">
            <span className="rehyn-settings-avatar" aria-hidden="true"><UserRound /></span>
            <div><strong>Molly</strong><span>Demo profile</span></div>
          </section>
          <div className="rehyn-settings-links">
            {sections.map(section => <Button key={section.id} variant="ghost" className="rehyn-settings-row" onClick={() => navigate(section.id)}>
              <section.icon aria-hidden="true" />
              <span><strong>{section.title}</strong><small>{section.description}</small></span>
              <ChevronRight aria-hidden="true" />
            </Button>)}
          </div>
          <p className="rehyn-settings-footnote">You’re exploring the Rehyn prototype. These sections explain this demo; full service terms and a privacy policy have not been added yet.</p>
        </>}

        {page === "terms" && <div className="rehyn-settings-copy">
          <section><h3>A preview to explore</h3><p>Rehyn is an interactive design prototype. The profile, progress, medals and past entries use sample content.</p></section>
          <section><h3>Demonstration support</h3><p>Alira uses scripted replies. There is no live care team, account service or medical advice behind this demo.</p></section>
          <section><h3>Try it with sample information</h3><p>Please use made-up details when exploring the journal and chat.</p></section>
          <p className="rehyn-settings-notice">Full terms & conditions for a live Rehyn service have not been added. This page is prototype information.</p>
        </div>}

        {page === "privacy" && <div className="rehyn-settings-copy">
          <section><h3>Your entries stay in this demo</h3><p>Journal text, mood selections and Alira messages are held in temporary memory in this page. They are not sent to a Rehyn account or care team.</p></section>
          <section><h3>Loading the website</h3><p>This site connects to Render for hosting and Google Fonts for its typefaces. Those services handle the requests needed to load the page.</p>
            <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">Render privacy policy <ExternalLink aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
            <a href="https://fonts.google.com/faq" target="_blank" rel="noopener noreferrer">Google Fonts information <ExternalLink aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          </section>
          <section><h3>Read aloud</h3><p>If you choose Read aloud, your browser or device provides the voice. Its own privacy settings apply.</p></section>
          <p className="rehyn-settings-notice">This describes the current prototype. A full Rehyn privacy policy has not been added yet.</p>
        </div>}

        {page === "data" && <div className="rehyn-settings-copy">
          <section><h3>Saved for this visit</h3><p>Your entries, messages and choices last for this page session. Reloading the page starts again with the sample content.</p></section>
          <section><h3>No account to manage yet</h3><p>This prototype does not create a real account or store your entries in a Rehyn database.</p></section>
          <section><h3>Start fresh</h3><p>Resetting clears your current demo entries and messages, then returns you to Home. It does not change any records held by the website’s hosting provider.</p></section>
          {confirmReset ? <div className="rehyn-settings-confirm" ref={confirmationRef} tabIndex={-1} role="group" aria-labelledby="reset-demo-title" aria-describedby="reset-demo-description">
            <h3 id="reset-demo-title">Reset this demo session?</h3>
            <p id="reset-demo-description">Your current entries and messages will be cleared.</p>
            <Button className="rehyn-action w-full" onClick={() => window.location.reload()}>Reset and return Home</Button>
            <Button variant="outline" className="rehyn-action w-full" onClick={() => { setConfirmReset(false); requestAnimationFrame(() => resetRef.current?.focus()); }}>Keep this session</Button>
          </div> : <Button ref={resetRef} variant="outline" className="rehyn-action rehyn-settings-reset" onClick={() => setConfirmReset(true)}><RotateCcw aria-hidden="true" /> Reset demo session</Button>}
        </div>}
      </div>
    </Dialog.Content>
  </Dialog.Root>;
}
