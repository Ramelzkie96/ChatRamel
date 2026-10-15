import { Briefcase, GraduationCap, Heart } from "lucide-react";

export const CATEGORIES = [
  { id: "work", label: "Work", icon: Briefcase, badge: "bg-amber-500/15 text-amber-300", circle: "bg-blue-600" },
  { id: "school", label: "School", icon: GraduationCap, badge: "bg-purple-500/15 text-purple-300", circle: "bg-purple-600" },
  { id: "friends", label: "Friends", icon: Heart, badge: "bg-pink-500/15 text-pink-300", circle: "bg-pink-600" },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) ?? null;