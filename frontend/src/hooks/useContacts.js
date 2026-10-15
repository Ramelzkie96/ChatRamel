import { useContext } from "react";
import { ContactContext } from "../context/ContactContext";

export default function useContacts() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContacts must be used inside <ContactProvider>");
  return ctx;
}