import { useState } from "react";
import SettingsPanel from "./SettingsPanel";
import AccountPage from "./AccountPage";

const PAGES = { account: AccountPage };

export default function SettingsView() {
  const [section, setSection] = useState("account");
  const Page = PAGES[section];

  return (
    <>
      <SettingsPanel active={section} onSelect={setSection} />
      <Page />
    </>
  );
}