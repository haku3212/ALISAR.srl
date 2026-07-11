const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2',
  bus: 'M5 3h14a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1Zm-1 8h16M7.5 15.5h.01M16.5 15.5h.01M8 19l-1.5 2.5M16 19l1.5 2.5',
  incomes: 'M12 3v13m0 0 5-5m-5 5-5-5M4 21h16',
  expenses: 'M12 16V3m0 0 5 5m-5-5-5 5M4 21h16',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-4h.01',
  budget: 'M4 7h16a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12v3m1 6h3',
  calendar: 'M7 3v3m10-3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  history: 'M4 6h16M4 12h16M4 18h10',
  chart: 'M4 21V10m6 11V3m6 18v-8m4 8H2',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.15-1.5l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L14.5 2h-5l-.35 2.5a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .5.05 1 .15 1.5l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5L9.5 22h5l.35-2.5a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6c.1-.5.15-1 .15-1.5Z',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 6l3 3',
  trash: 'M4 7h16M9 7V4h6v3m-8.5 0 1 13h9l1-13M10 11v6m4-6v6',
  check: 'M4 12.5 9.5 18 20 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  download: 'M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 21h16',
  wallet: 'M3 7a2 2 0 0 1 2-2h13v4h3v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm15 7h.01',
  alert: 'M12 9v5m0 3h.01M10.3 4 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z',
  save: 'M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 0v6h8V3M7 21v-7h10v7'
};

export function Icon({ name, size = 18 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name] ?? PATHS.home} />
    </svg>
  );
}
