export type NoteColor = 'default' | 'amber' | 'emerald' | 'sky' | 'rose' | 'violet' | 'teal' | 'orange';

export interface Tag {
  id: string;
  name: string;
  color: 'slate' | 'emerald' | 'sky' | 'amber' | 'rose' | 'violet' | 'teal' | 'indigo';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[]; // tag IDs
  isPinned: boolean;
  isFavorite: boolean;
  isTrash: boolean;
  colorTheme: NoteColor;
  createdAt: number;
  updatedAt: number;
}

export type CategoryFilter = 'all' | 'pinned' | 'favorites' | 'trash';

export type SortOption = 'updated-desc' | 'updated-asc' | 'created-desc' | 'title-asc' | 'title-desc';

export type ViewMode = 'list' | 'grid';

export interface FilterState {
  category: CategoryFilter;
  tagId: string | null;
  searchQuery: string;
  sortBy: SortOption;
  viewMode: ViewMode;
}

export const NOTE_COLOR_STYLES: Record<
  NoteColor,
  {
    name: string;
    bgLight: string;
    bgDark: string;
    borderLight: string;
    borderDark: string;
    accentDot: string;
  }
> = {
  default: {
    name: 'Neutral',
    bgLight: 'bg-white',
    bgDark: 'dark:bg-slate-900',
    borderLight: 'border-slate-200/80',
    borderDark: 'dark:border-slate-800',
    accentDot: 'bg-slate-400',
  },
  amber: {
    name: 'Amber Sand',
    bgLight: 'bg-amber-50/60',
    bgDark: 'dark:bg-amber-950/20',
    borderLight: 'border-amber-200/80',
    borderDark: 'dark:border-amber-800/40',
    accentDot: 'bg-amber-500',
  },
  emerald: {
    name: 'Mint Emerald',
    bgLight: 'bg-emerald-50/60',
    bgDark: 'dark:bg-emerald-950/20',
    borderLight: 'border-emerald-200/80',
    borderDark: 'dark:border-emerald-800/40',
    accentDot: 'bg-emerald-500',
  },
  sky: {
    name: 'Sky Breeze',
    bgLight: 'bg-sky-50/60',
    bgDark: 'dark:bg-sky-950/20',
    borderLight: 'border-sky-200/80',
    borderDark: 'dark:border-sky-800/40',
    accentDot: 'bg-sky-500',
  },
  rose: {
    name: 'Rose Blush',
    bgLight: 'bg-rose-50/60',
    bgDark: 'dark:bg-rose-950/20',
    borderLight: 'border-rose-200/80',
    borderDark: 'dark:border-rose-800/40',
    accentDot: 'bg-rose-500',
  },
  violet: {
    name: 'Lavender Mist',
    bgLight: 'bg-violet-50/60',
    bgDark: 'dark:bg-violet-950/20',
    borderLight: 'border-violet-200/80',
    borderDark: 'dark:border-violet-800/40',
    accentDot: 'bg-violet-500',
  },
  teal: {
    name: 'Sage Teal',
    bgLight: 'bg-teal-50/60',
    bgDark: 'dark:bg-teal-950/20',
    borderLight: 'border-teal-200/80',
    borderDark: 'dark:border-teal-800/40',
    accentDot: 'bg-teal-500',
  },
  orange: {
    name: 'Warm Sunset',
    bgLight: 'bg-orange-50/60',
    bgDark: 'dark:bg-orange-950/20',
    borderLight: 'border-orange-200/80',
    borderDark: 'dark:border-orange-800/40',
    accentDot: 'bg-orange-500',
  },
};

export const TAG_COLOR_MAP: Record<
  Tag['color'],
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    ring: string;
  }
> = {
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500',
    ring: 'focus:ring-slate-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    ring: 'focus:ring-emerald-400',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/50',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500',
    ring: 'focus:ring-sky-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    ring: 'focus:ring-amber-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    ring: 'focus:ring-rose-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
    dot: 'bg-violet-500',
    ring: 'focus:ring-violet-400',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/50',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
    ring: 'focus:ring-teal-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
    ring: 'focus:ring-indigo-400',
  },
};
