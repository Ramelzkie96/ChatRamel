import { GraduationCap, MapPin, Mail } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";

const ICONS = { GraduationCap, MapPin, Mail };

export default function AboutSection({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-line px-6 py-5">
      <SectionTitle>About</SectionTitle>
      <ul className="flex flex-col gap-3.5">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] || MapPin;
          return (
            <li key={i} className="flex items-center gap-3 text-[15px] text-gray-200">
              <Icon size={19} strokeWidth={1.8} className="shrink-0 text-gray-300" />
              <span>{item.text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}