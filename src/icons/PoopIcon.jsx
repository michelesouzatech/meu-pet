function PoopIcon({ size = 24, strokeWidth = 2, color = 'currentColor', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 21
           C4.5 21 3.5 19.8 3.5 18.3
           C3.5 17.1 4.3 16.1 5.4 15.7
           C4.7 15.1 4.3 14.2 4.3 13.3
           C4.3 11.9 5.3 10.8 6.6 10.6
           C6.2 10.1 6 9.5 6 8.9
           C6 7.4 7.1 6.2 8.5 6
           C8.3 5.1 8.9 4.2 9.8 3.8
           C10.4 3.1 11.3 2.8 12 2.8
           C12.7 2.8 13.6 3.1 14.2 3.8
           C15.1 4.2 15.7 5.1 15.5 6
           C16.9 6.2 18 7.4 18 8.9
           C18 9.5 17.8 10.1 17.4 10.6
           C18.7 10.8 19.7 11.9 19.7 13.3
           C19.7 14.2 19.3 15.1 18.6 15.7
           C19.7 16.1 20.5 17.1 20.5 18.3
           C20.5 19.8 19.5 21 18 21
           Z"
      />
      <path d="M9.3 13.5c.5-.4 1.1-.4 1.6 0" />
      <path d="M13.1 13.5c.5-.4 1.1-.4 1.6 0" />
      <ellipse cx="12" cy="16.3" rx="0.6" ry="0.8" />
    </svg>
  )
}

export default PoopIcon
