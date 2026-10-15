const pic = (seed) => `https://picsum.photos/seed/${seed}/300/300`;

const devMembers = [
  { id: "m1", name: "Ramel Gulane", status: "online", isYou: true },
  { id: "m2", name: "Jessa Santos", status: "online" },
  { id: "m3", name: "Mark Villanueva", status: "online" },
  { id: "m4", name: "Alyssa Rivera", status: "offline", lastSeen: "2h ago" },
  { id: "m5", name: "Daniel Cruz", status: "offline", lastSeen: "5h ago" },
];

export const mockProfiles = {
  dm1: {
    bio: "Good vibes, better days ✨",
    about: [
      { icon: "GraduationCap", text: "Software Engineering Student" },
      { icon: "GraduationCap", text: "BSIT - PIT" },
      { icon: "MapPin", text: "Cebu, Philippines" },
    ],
    files: [{ id: "f1", name: "project-plan.pdf", size: "2.4 MB", date: "Apr 12, 2026" }],
    media: [pic("beach"), pic("city"), pic("coffee"), pic("plant")],
    lastSeen: "Online",
  },
  dm2: {
    bio: "Code. Eat. Sleep. Repeat.",
    about: [
      { icon: "GraduationCap", text: "Web Developer" },
      { icon: "MapPin", text: "Cebu, Philippines" },
    ],
    files: [],
    media: [pic("mountain"), pic("road")],
    lastSeen: "Online",
  },

  // ---- groups ----
  g1: {
    cover: pic("devteam-cover"),
    description: "Our development team workspace. We build, solve, and improve together. 🚀",
    tagline: "Working on great things 💻",
    members: devMembers,
    files: [],
    media: [],
  },
  g2: {
    description: "BSIT classmates group.",
    members: devMembers.slice(0, 4),
  },
  g3: {
    description: "Games, memes, and good times.",
    members: devMembers.slice(0, 3),
  },
  g4: {
    description: "Family group chat.",
    members: devMembers.slice(0, 2),
  },
};

export const defaultProfile = {
  bio: "Hey there! I'm using RamelChat.",
  about: [{ icon: "MapPin", text: "Philippines" }],
  files: [],
  media: [],
  lastSeen: "Recently",
};