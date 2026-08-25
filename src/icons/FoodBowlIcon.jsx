function FoodBowlIcon({ size = 24, strokeWidth = 2, color = 'currentColor', ...props }) {
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
      <path d="M6 10c.3-2.4 1.6-3.6 2.8-2.8.7-1.6 2.3-1.9 3.2-.6.9-1.3 2.5-1 3.2.6 1.2-.8 2.5.4 2.8 2.8" />
      <path d="M5 10h14" />
      <path d="M4.5 10.2c-.3 3 .2 5 2 6.6 1.4 1.2 3.3 1.8 5.5 1.8s4.1-.6 5.5-1.8c1.8-1.6 2.3-3.6 2-6.6" />
      <circle cx="12" cy="14.7" r="1.25" />
      <circle cx="9.9" cy="12.9" r="0.6" />
      <circle cx="10.6" cy="11.5" r="0.6" />
      <circle cx="13.4" cy="11.5" r="0.6" />
      <circle cx="14.1" cy="12.9" r="0.6" />
    </svg>
  )
}

export default FoodBowlIcon
