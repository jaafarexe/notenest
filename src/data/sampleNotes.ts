import { Note, Tag } from '../types/note';

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-work', name: 'Work', color: 'indigo' },
  { id: 'tag-personal', name: 'Personal', color: 'emerald' },
  { id: 'tag-ideas', name: 'Ideas', color: 'amber' },
  { id: 'tag-recipes', name: 'Recipes', color: 'rose' },
  { id: 'tag-books', name: 'Reading', color: 'violet' },
  { id: 'tag-dev', name: 'Tech & Dev', color: 'sky' },
];

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: '👋 Welcome to NoteNest - Quick Start Guide',
    content: `# Welcome to NoteNest!

NoteNest is your fast, distraction-free smart notebook designed for deep work and everyday notes. Everything is saved automatically and preserved in your browser.

### Key Highlights & Shortcuts:
- **Instant Search:** Press \`/\` or \`Ctrl+K\` anywhere to search across titles and note contents.
- **New Note:** Hit \`Ctrl+N\` (or \`Cmd+N\` on Mac) to start writing right away.
- **Pinning:** Click the pin icon to keep high-priority notes at the top.
- **Color Accents:** Pick an accent tone to give visual warmth to cards.
- **Tag Management:** Add color-coded tags to organize by projects, habits, or domains.

### Interactive Checklists:
- [x] Create your first custom note
- [x] Try switching between List and Grid layouts
- [ ] Experiment with markdown headings and quotes
- [ ] Export your notes backup via the bottom Settings menu

> "Simplicity is the prerequisite for reliability." — Edsger W. Dijkstra
`,
    tags: ['tag-personal'],
    isPinned: true,
    isFavorite: true,
    isTrash: false,
    colorTheme: 'sky',
    createdAt: now - 3 * day,
    updatedAt: now - 12 * 60 * 1000,
  },
  {
    id: 'note-roadmap',
    title: '🚀 Q4 Product Launch & Architecture Checklist',
    content: `## Project Horizon: Sprint Deliverables

### Milestones Overview
| Target Date | Deliverable | Status |
| :--- | :--- | :--- |
| Nov 04 | Core Engine Refactoring | In Review |
| Nov 12 | End-to-End Test Suite | Planned |
| Nov 20 | Customer Beta Rollout | Scheduled |

### Essential Tasks:
- [x] Finalize database indexing strategy for latency $\\le 20\\text{ms}$
- [x] Complete security audit for client-side storage boundaries
- [ ] Implement automated regression test pipeline
- [ ] Prepare onboarding walk-through documentation
- [ ] Conduct performance stress tests with 10k items

### Architecture Notes:
All real-time state remains optimistic with synchronous fallback to local storage. Avoid blocking main thread during JSON serialization.
`,
    tags: ['tag-work', 'tag-dev'],
    isPinned: true,
    isFavorite: false,
    isTrash: false,
    colorTheme: 'default',
    createdAt: now - 2 * day,
    updatedAt: now - 45 * 60 * 1000,
  },
  {
    id: 'note-recipe',
    title: '🌿 Artisanal Sourdough Master Formula',
    content: `# Country Sourdough Loaf (78% Hydration)

A rustic hearth loaf with an open crumb, blistered crust, and mild tangy profile.

### Ingredients:
- **Bread Flour (Unbleached):** 450g
- **Whole Wheat Flour:** 50g
- **Water (room temp ~24°C):** 390g
- **Active Sourdough Starter (100% hydration):** 100g
- **Fine Sea Salt:** 10g

### Baker's Schedule:
1. **Autolyse (09:00):** Combine flours and 370g water. Rest 45 minutes.
2. **Incorporate (09:45):** Add starter, remaining 20g water, and salt. Slap and fold for 5 mins.
3. **Bulk Fermentation:** Perform 4 sets of stretch-and-folds spaced 30 minutes apart.
4. **Pre-shape & Bench Rest:** 20 minutes under a damp linen cloth.
5. **Final Shape & Cold Proof:** Transfer into floured banneton; refrigerate 12–16 hours.
6. **Bake:** Preheat Dutch oven to 245°C (475°F). Bake 20 mins with lid on, then 22 mins lid off until deep amber mahogany crust.
`,
    tags: ['tag-recipes', 'tag-personal'],
    isPinned: false,
    isFavorite: true,
    isTrash: false,
    colorTheme: 'amber',
    createdAt: now - 5 * day,
    updatedAt: now - 3 * hour,
  },
  {
    id: 'note-brainstorm',
    title: '💡 Spatial Audio & Interaction Ideas',
    content: `# Explorations in Micro-Interactions

Thoughts gathered while observing friction in everyday multi-device setups:

### 1. Velocity-Aware Gestures
- Instead of fixed animation curves, measure touch/pointer release speed to determine inertia.
- Natural decay gives interfaces physical weight without feeling sluggish.

### 2. Ambient Focus Modes
- Dim periphery UI elements after 4 seconds of uninterrupted keyboard typing.
- Single keystroke immediately restores toolbars and sidebars.

### 3. Tactile Sound Design
- Very subtle synthetic click on checklist toggle (\`15ms\` sine pop at 480Hz).
- Audio cues should be strictly opt-in and respect system audio muting.
`,
    tags: ['tag-ideas', 'tag-dev'],
    isPinned: false,
    isFavorite: false,
    isTrash: false,
    colorTheme: 'violet',
    createdAt: now - 6 * day,
    updatedAt: now - 18 * hour,
  },
  {
    id: 'note-books',
    title: '📚 Book Summary: Atomic Habits by James Clear',
    content: `# Notes & Takeaways: Atomic Habits

### The 4 Laws of Behavior Change:
1. **Make it Obvious (Cue):** Design your environment. Place visual cues in clear line of sight.
2. **Make it Attractive (Craving):** Bundle temptations with necessities (Premack's principle).
3. **Make it Easy (Response):** Reduce friction. Follow the 2-minute rule to get started.
4. **Make it Satisfying (Reward):** Immediate reinforcement cements the loop.

> "You do not rise to the level of your goals. You fall to the level of your systems."

### Action Commitments for November:
- [x] Read 15 pages immediately after morning espresso
- [x] Lay out running gear the night before
- [ ] Practice coding drills for 25 minutes before checking email
`,
    tags: ['tag-books', 'tag-personal'],
    isPinned: false,
    isFavorite: true,
    isTrash: false,
    colorTheme: 'emerald',
    createdAt: now - 8 * day,
    updatedAt: now - 2 * day,
  },
  {
    id: 'note-meeting',
    title: '⚡ Architecture Sync: Zero-Lag Storage Pattern',
    content: `# Technical Notes & Decisions

**Attendees:** Sarah M., David K., Jaafar, Elena R.

### Context:
Evaluating state persistence strategies when dealing with high frequency keystrokes without UI hitching.

### Agreed Architecture:
\`\`\`typescript
// Debounced persistence pipeline
function useDebouncedSync<T>(value: T, delayMs: number = 300) {
  useEffect(() => {
    const handler = setTimeout(() => {
      saveToStorage(STORAGE_KEY, value);
    }, delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);
}
\`\`\`

### Decisions:
- Avoid saving on every single character stroke directly to sync disk.
- Debounce storage writes by 300ms while keeping React state 100% instant.
- Add an explicit \`beforeunload\` flush to ensure zero lost keystrokes on tab close.
`,
    tags: ['tag-work', 'tag-dev'],
    isPinned: false,
    isFavorite: false,
    isTrash: false,
    colorTheme: 'teal',
    createdAt: now - 10 * day,
    updatedAt: now - 3 * day,
  },
];
