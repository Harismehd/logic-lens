export const welcomes = [
  "Logic Lens: Where vibe coding comes to die.",
  "Ready to stop guessing and start knowing?",
  "The compiler is watching. In a good way.",
  "Focus. Precision. Growth. Let's code.",
  "Your best work happens when you understand the 'why'.",
  "Don't just paste it. Trace it.",
  "Yesterday's errors are today's lessons.",
  "3 AM coder detected. Your best work happens now. What are we building?",
  "Another day, another logic bridge built.",
  "Variables are ready. Are you?",
  "The debugger is your friend, but the LLC is your mentor.",
  "One line at a time. Total mastery.",
  "Logic Lens Compiler: Tactical learning, zero vibes.",
  "Level up your mental model today.",
  "Small steps, giant leaps in understanding.",
  "Functions are the building blocks of the future.",
  "Loops don't have to be confusing. Let's conquer them.",
  "Conditional thinking is a superpower.",
  "Precision is the difference between a coder and an engineer.",
  "Ready to refine your syntax?",
  "Growth happens in the red lines.",
  "Green is the goal, but red is the path.",
  "Don't fear the error. Embrace the lesson.",
  "Socratic coding starts now.",
  "Your streak is waiting. Don't break the chain.",
  "Mindful coding, line by line.",
  "Logic Lens is active. Logic verified.",
  "Beyond the boilerplate. Into the logic.",
  "Write code you can explain. Line 1 starts here.",
  "The environment is ready. Your potential is limitless.",
  "Consistency beats intensity. Welcome back.",
  "Coding is a craft. Sharp your tools.",
  "Every syntax error is a chance to learn the rules.",
  "Logic Lens: No shortcuts, only mastery.",
  "Deep work mode: ENGAGED.",
  "Build it right. Build it logic-first.",
  "The compiler doesn't lie. It teaches.",
  "Vibe coding ends at this cursor.",
  "Focus on the flow, the logic will follow.",
  "Ready to build something robust?",
  "Your brain is the real compiler. LLC just helps.",
  "Mastering the basics opens the doors to the advanced.",
  "Logic Lens: Tactical pedagogical feedback engaged.",
  "Stay curious. Stay coding.",
  "One error at a time. Zero frustration.",
  "Welcome back to the forge of logic.",
  "Code with intent. Logic Lens is your guide.",
  "Refine your logic. Expand your mind.",
  "The journey to senior dev starts with understanding the basics.",
  "Logic Lens Compiler: Your partner in growth.",
  "Let's build a masterpiece of logic today."
];

export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "3 AM coder detected. Your best work happens now.";
  if (hour < 12) return "Good morning! Fresh mind, fresh code.";
  if (hour < 17) return "Good afternoon! Power through the logic.";
  if (hour < 21) return "Good evening! Wrapping up with strong code.";
  return "Late night session? Let's make it count.";
};
