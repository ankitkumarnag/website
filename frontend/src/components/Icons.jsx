const iconPaths = {
  report: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      <path d="m15 5 3 3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.7 2.7L16.5 9" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18" />
      <path d="M6 21V5l6-3 6 3v16" />
      <path d="M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4" />
    </>
  ),
  hardhat: (
    <>
      <path d="M3 18h18" />
      <path d="M5 18v-3a7 7 0 0 1 14 0v3" />
      <path d="M9 15V8M15 15V8" />
    </>
  ),
  tools: (
    <>
      <path d="m14.7 6.3 3-3a4.2 4.2 0 0 0 2.1 5.8l-7.4 7.4-3-3 7.4-7.4" />
      <path d="m5 3 4 4-2 2-4-4Z" />
      <path d="m6 14-3 3 4 4 3-3" />
    </>
  ),
};

function Icon({ name, size = 22, className = "" }) {
  return (
    <svg
      className={className}
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
      {iconPaths[name]}
    </svg>
  );
}

export default Icon;
