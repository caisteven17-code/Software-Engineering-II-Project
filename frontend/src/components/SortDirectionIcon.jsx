function SortDirectionIcon({ direction }) {
  return (
    <span className="sort-direction-icon" aria-hidden="true">
      <svg
        className="sort-direction-svg"
        viewBox="0 0 28 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className={`sort-direction-glyph ${direction === 'asc' ? 'active' : ''}`}>
          <path d="M20 21V5" />
          <path d="M15.5 9.5L20 5L24.5 9.5" />
        </g>
        <g className={`sort-direction-glyph ${direction === 'desc' ? 'active' : ''}`}>
          <path d="M8 3V19" />
          <path d="M3.5 14.5L8 19L12.5 14.5" />
        </g>
      </svg>
    </span>
  )
}

export default SortDirectionIcon
