import { useState } from "react";
import SettingsPanel from "./SettingsPanel";
import AccountPage from "./AccountPage";
import MobileBackBar from "../ui/MobileBackBar";
import useMediaQuery from "../../hooks/useMediaQuery";

const PAGES = { account: AccountPage };

export default function SettingsView({ onExit }) {
  const compact = useMediaQuery("(max-width: 1023px)");
  const [section, setSection] = useState("account");
  const [showPage, setShowPage] = useState(false); // compact screens: list first, then the page
  const Page = PAGES[section];

  if (!compact) {
    return (
      <>
        <SettingsPanel active={section} onSelect={setSection} />
        <Page />
      </>
    );
  }

  return (
    <div className="flex h-dvh min-w-0 flex-1 flex-col bg-app">
      <MobileBackBar
        label={showPage ? "Settings" : "Back to chats"}
        onBack={showPage ? () => setShowPage(false) : onExit}
        // on tablets the sidebar is visible, so "Back to chats" is only needed on phones
        className={showPage ? "" : "md:hidden"}
      />

      {showPage ? (
        <Page />
      ) : (
        <SettingsPanel
          active={section}
          onSelect={(id) => {
            setSection(id);
            setShowPage(true);
          }}
        />
      )}
    </div>
  );
}