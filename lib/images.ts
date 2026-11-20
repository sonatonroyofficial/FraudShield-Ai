const u = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
export const IMG = {
  lake: (w?: number) => u("photo-1506905925346-21bda4d32df4", w),
  mist: (w?: number) => u("photo-1511884642898-4c92249e20b6", w),
  forest: (w?: number) => u("photo-1441974231531-c6227db76b6e", w),
  alps: (w?: number) => u("photo-1470071459604-3b5ec3a7fe05", w),
  leaves: (w?: number) => u("photo-1518173946687-a4c8892bbd9f", w),
  phone: (w?: number) => u("photo-1512941937669-90a1b58e7e9c", w),
  team: (w?: number) => u("photo-1557804506-669a67965ba0", w),
  work: (w?: number) => u("photo-1531482615713-2afd69097998", w),
  field: (w?: number) => u("photo-1500530855697-b586d89ba3ee", w),
};
