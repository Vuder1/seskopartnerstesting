function Base({ children, className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  )
}

export function IconDraft(props) {
  return (
    <Base {...props}>
      <path d="M4 20l7-16 3 7 3-4 3 13" />
      <circle cx="7.5" cy="14.5" r="1.4" />
    </Base>
  )
}

export function IconFactory(props) {
  return (
    <Base {...props}>
      <path d="M3 21V11l5 3.5V11l5 3.5V11l5 3.5V21H3z" />
      <path d="M6 21v-4M11 21v-4M16 21v-4" />
      <path d="M18 8V4h2v4" />
    </Base>
  )
}

export function IconTruck(props) {
  return (
    <Base {...props}>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18.5" r="1.6" />
      <circle cx="17.5" cy="18.5" r="1.6" />
    </Base>
  )
}

export function IconWrench(props) {
  return (
    <Base {...props}>
      <path d="M14.7 6.3a4 4 0 00-5.4 4.9L4 16.5V20h3.5l5.3-5.3a4 4 0 004.9-5.4l-2.9 2.9-2.5-.5-.5-2.5z" />
    </Base>
  )
}

export function IconShield(props) {
  return (
    <Base {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </Base>
  )
}

export function IconAward(props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5" />
    </Base>
  )
}

export function IconLayers(props) {
  return (
    <Base {...props}>
      <path d="M12 3l8 4-8 4-8-4 8-4z" />
      <path d="M4 12l8 4 8-4M4 16l8 4 8-4" />
    </Base>
  )
}

export function IconFlame(props) {
  return (
    <Base {...props}>
      <path d="M12 3s4 3.5 4 8a4 4 0 01-8 0c0-1.2.6-2 1.2-2.8.2 1 1 1.5 1.6 1 .5-.5.2-1.3-.1-2C10.3 6 12 3 12 3z" />
      <path d="M9 15a3 3 0 106 0" />
    </Base>
  )
}

export function IconHeadset(props) {
  return (
    <Base {...props}>
      <path d="M4 13a8 8 0 0116 0" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v1a3 3 0 01-3 3h-3" />
    </Base>
  )
}

export function IconGlass(props) {
  return (
    <Base {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 4l16 16" />
    </Base>
  )
}
