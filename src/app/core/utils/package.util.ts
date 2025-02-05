export const PACKAGE_OPTIONS = [
  { id: 'landArrangement', label: 'Land Arrangement' },
  { id: 'tour', label: 'Tour' },
  { id: 'flight', label: 'Flight' },
  { id: 'hotel', label: 'Hotel' }
] as const;

export type PackageOption = typeof PACKAGE_OPTIONS[number]['id']; 