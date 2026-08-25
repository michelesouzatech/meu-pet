import poopImage from '../assets/poop.png'

function PoopIcon({ size = 24, strokeWidth, color, ...props }) {
  return (
    <img
      src={poopImage}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      aria-hidden="true"
      {...props}
    />
  )
}

export default PoopIcon
