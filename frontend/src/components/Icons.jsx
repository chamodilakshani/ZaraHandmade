import React from 'react';

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export const CartIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.5 3h2l2.3 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
  </svg>
);

export const PackageIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M21 8.5v7a1 1 0 0 1-.5.9l-8 4.5a1 1 0 0 1-1 0l-8-4.5a1 1 0 0 1-.5-.9v-7a1 1 0 0 1 .5-.9l8-4.5a1 1 0 0 1 1 0l8 4.5a1 1 0 0 1 .5.9Z" />
    <path d="M3.3 7.6 12 12.5l8.7-4.9M12 12.5V21.5" />
  </svg>
);

export const SparkleIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const FlowerIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3ZM12 16a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3ZM22 12a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3ZM8 12a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3Z" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const TrashIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-.9 14a2 2 0 0 1-2 1.9H7a2 2 0 0 1-2-1.9L4.1 6h15.8Z" />
  </svg>
);

export const ImagePlaceholderIcon = (props) => (
  <svg {...base} width={props.width || 32} height={props.height || 32} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="9" cy="9" r="1.5" />
    <path d="M21 15l-5.5-5.5a2 2 0 0 0-2.8 0L3 19" />
  </svg>
);

export const ChartIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
);

export const StoreIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6" />
  </svg>
);

export const BagIcon = CartIcon;

export const LogoutIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const CloseIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
