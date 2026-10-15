import { ChevronRight } from "lucide-react";

export default function SectionTitle({ children, withArrow = false, onClick }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[15px] font-semibold text-white">{children}</h3>
      {withArrow && (
        <button
          onClick={onClick}
          aria-label="See all"
          className="text-muted transition-colors hover:text-white"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}