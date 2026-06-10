interface IconProps {
  size?: number
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const GridIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

export const HomeIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </svg>
)

export const BoltIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
  </svg>
)

export const ChatIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3.2A8 8 0 1 1 21 12z" />
    <circle cx="9" cy="12" r="0.5" fill="currentColor" />
    <circle cx="13" cy="12" r="0.5" fill="currentColor" />
    <circle cx="17" cy="12" r="0.5" fill="currentColor" />
  </svg>
)

export const BellIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </svg>
)

export const CartIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.3h7.7a1.5 1.5 0 0 0 1.5-1.2L20 8H6" />
  </svg>
)

export const MenuIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
)

export const EyeIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
)

export const FileIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
)

export const HandshakeIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 11 7 7l5 1 5-1 4 4" />
    <path d="m12 8-3.5 3.5a1.4 1.4 0 0 0 2 2L12 12l3 3a1.4 1.4 0 0 0 2-2" />
    <path d="m15 15-1.5 1.5a1.4 1.4 0 0 1-2 0" />
  </svg>
)

export const BagIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M6 7h12l1 14H5L6 7z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </svg>
)

export const TrashIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

export const PinIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)} fill="currentColor" stroke="none">
    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
  </svg>
)

export const WrenchIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7z" />
  </svg>
)

export const ShieldIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 2 4 5v6c0 5 3.5 9.3 8 11 4.5-1.7 8-6 8-11V5l-8-3z" />
  </svg>
)

export const PlusIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const ChevronRightIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const ChevronLeftIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
)

export const CheckIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <path d="m5 13 4 4L19 7" />
  </svg>
)

export const ImageIcon = ({ size = 30 }: IconProps) => (
  <svg {...base(size)} strokeWidth={1.5}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-4.5-4.5L7 20" />
  </svg>
)

export const CalendarIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </svg>
)
