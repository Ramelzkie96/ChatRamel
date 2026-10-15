// sender: "me" = you, "them" = the other person
export const mockMessages = {
  dm1: [
    { id: 1, sender: "them", text: "Hey! How are you doing? 😊", time: "9:15 AM" },
    { id: 2, sender: "me", text: "I'm good! Just finishing my task.", time: "9:16 AM", seen: true },
    { id: 3, sender: "them", text: "Nice! Are you free later? Maybe we can grab lunch.", time: "9:17 AM" },
    { id: 4, sender: "me", text: "Yeah, I'm free around 1 PM. Where do you want to eat?", time: "9:18 AM", seen: true },
    { id: 5, sender: "them", text: "Let's go to the new ramen shop near the mall? I've been wanting to try it. 😋", time: "9:19 AM" },
    { id: 6, sender: "me", text: "Sounds good! I'll be there. See you later! 👋", time: "9:20 AM", seen: true },
    { id: 7, sender: "them", text: "See you! 😊", time: "9:21 AM" },
  ],
  dm2: [
    { id: 1, sender: "me", text: "Salamat sa help kanina!", time: "9:10 AM", seen: true },
    { id: 2, sender: "them", text: "Thanks bro!", time: "9:12 AM" },
  ],
  dm3: [
    { id: 1, sender: "them", text: "Sent a photo", time: "Yesterday" },
  ],
  dm4: [
    { id: 1, sender: "them", text: "Busy right now", time: "Yesterday" },
  ],
  dm5: [
    { id: 1, sender: "me", text: "Pwede ka mamaya?", time: "Sep 28", seen: true },
    { id: 2, sender: "them", text: "Sounds good!", time: "Sep 28" },
  ],
  g1: [
    { id: 1, sender: "them", text: "Push na ko sa main.", time: "10:02 AM" },
  ],
  g2: [
    { id: 1, sender: "them", text: "Final defense na next week", time: "Yesterday" },
  ],
  g3: [
    { id: 1, sender: "them", text: "Tara valo mamaya?", time: "Sep 27" },
  ],
  g4: [
    { id: 1, sender: "them", text: "Uwi ka na pag may time.", time: "Sep 25" },
  ],
};

// chats that currently show "is typing..."
export const typingChatIds = ["dm1"];