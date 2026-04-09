@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(0.994 0 0);
  --card-foreground: oklch(0.1957 0.0075 145.2798);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.1957 0.0075 145.2798);
  --primary: oklch(0.5503 0.1847 141.8927);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.5508 0.184 141.6807);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.9684 0.019 140.501);
  --muted-foreground: oklch(0.4943 0.0648 140.9866);
  --accent: oklch(0.9586 0.0057 84.5664);
  --accent-foreground: oklch(0.4612 0.0144 67.4588);
  --destructive: oklch(0.6671 0.2219 33.3554);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.934 0 0);
  --input: oklch(0.928 0 0);
  --ring: oklch(0.5503 0.1847 141.8927);
  --chart-1: oklch(0.6179 0.1311 160.2798);
  --chart-2: oklch(0.6279 0.1984 261.6451);
  --chart-3: oklch(0.7156 0.1573 41.2955);
  --chart-4: oklch(0.742 0.1323 171.483);
  --chart-5: oklch(0.8115 0.1505 79.8678);
  --sidebar: oklch(0.9791 0 0);
  --sidebar-foreground: oklch(0 0 0);
  --sidebar-primary: oklch(0.5503 0.1847 141.8927);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.9051 0.046 142.213);
  --sidebar-accent-foreground: oklch(0.1982 0.064 140.1526);
  --sidebar-border: oklch(0.934 0 0);
  --sidebar-ring: oklch(0.5503 0.1847 141.8927);
  --font-sans: Familjen Grotesk, ui-sans-serif, sans-serif, system-ui;
  --font-serif: Source Serif 4, ui-serif, serif;
  --font-mono: IBM Plex Mono, ui-monospace, monospace;
  --radius: 0.25rem;
  --shadow-x: 0px;
  --shadow-y: 2px;
  --shadow-blur: 7px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.25;
  --shadow-color: #39494c;
  --shadow-2xs: 0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.13);
  --shadow-xs: 0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.13);
  --shadow-sm:
    0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.25),
    0px 1px 2px -1px hsl(189.4737 14.2857% 26.0784% / 0.25);
  --shadow:
    0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.25),
    0px 1px 2px -1px hsl(189.4737 14.2857% 26.0784% / 0.25);
  --shadow-md:
    0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.25),
    0px 2px 4px -1px hsl(189.4737 14.2857% 26.0784% / 0.25);
  --shadow-lg:
    0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.25),
    0px 4px 6px -1px hsl(189.4737 14.2857% 26.0784% / 0.25);
  --shadow-xl:
    0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.25),
    0px 8px 10px -1px hsl(189.4737 14.2857% 26.0784% / 0.25);
  --shadow-2xl: 0px 2px 7px 0px hsl(189.4737 14.2857% 26.0784% / 0.63);
  --tracking-normal: 0em;
  --spacing: 0.23rem;
}

.dark {
  --background: oklch(0 0 0);
  --foreground: oklch(1 0 0);
  --card: oklch(0.209 0 0);
  --card-foreground: oklch(1 0 0);
  --popover: oklch(0.209 0 0);
  --popover-foreground: oklch(1 0 0);
  --primary: oklch(0.5503 0.1847 141.8927);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.5508 0.184 141.6807);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.2557 0.0254 137.9613);
  --muted-foreground: oklch(0.6898 0.017 139.4378);
  --accent: oklch(0.25 0.0072 67.4895);
  --accent-foreground: oklch(0.743 0.0165 67.5709);
  --destructive: oklch(0.4522 0.1589 28.3114);
  --destructive-foreground: oklch(0.9791 0 0);
  --border: oklch(0.2645 0 0);
  --input: oklch(0.2221 0 0);
  --ring: oklch(0.5503 0.1847 141.8927);
  --chart-1: oklch(0.5032 0.1044 160.8293);
  --chart-2: oklch(0.6279 0.1984 261.6451);
  --chart-3: oklch(0.7156 0.1573 41.2955);
  --chart-4: oklch(0.742 0.1323 171.483);
  --chart-5: oklch(0.8115 0.1505 79.8678);
  --sidebar: oklch(0.209 0 0);
  --sidebar-foreground: oklch(1 0 0);
  --sidebar-primary: oklch(0.5503 0.1847 141.8927);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.9051 0.046 142.213);
  --sidebar-accent-foreground: oklch(0.1982 0.064 140.1526);
  --sidebar-border: oklch(0.2645 0 0);
  --sidebar-ring: oklch(0.5503 0.1847 141.8927);
  --font-sans: Familjen Grotesk, ui-sans-serif, sans-serif, system-ui;
  --font-serif: Source Serif 4, ui-serif, serif;
  --font-mono: IBM Plex Mono, ui-monospace, monospace;
  --radius: 0.25rem;
  --shadow-x: 0px;
  --shadow-y: 2px;
  --shadow-blur: 7px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.25;
  --shadow-color: #111315;
  --shadow-2xs: 0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.13);
  --shadow-xs: 0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.13);
  --shadow-sm:
    0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.25),
    0px 1px 2px -1px hsl(210 10.5263% 7.451% / 0.25);
  --shadow:
    0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.25),
    0px 1px 2px -1px hsl(210 10.5263% 7.451% / 0.25);
  --shadow-md:
    0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.25),
    0px 2px 4px -1px hsl(210 10.5263% 7.451% / 0.25);
  --shadow-lg:
    0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.25),
    0px 4px 6px -1px hsl(210 10.5263% 7.451% / 0.25);
  --shadow-xl:
    0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.25),
    0px 8px 10px -1px hsl(210 10.5263% 7.451% / 0.25);
  --shadow-2xl: 0px 2px 7px 0px hsl(210 10.5263% 7.451% / 0.63);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
  --color-gray-100: #fafafa;
  --color-gray-200: #f5f5f5;
  --color-gray-300: #efefef;
  --color-gray-400: #eaeaea;
  --color-gray-500: #e5e5e5;
  --color-gray-600: #b7b7b7;
  --color-gray-700: #898989;
  --color-gray-800: #5c5c5c;
  --color-gray-900: #2e2e2e;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }

  html {
    @apply font-sans;
  }
}

@layer components {
  /* PROFILE_CARD */
  .profile-card {
    @apply relative w-100 h-auto overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300;
    @apply hover:-translate-y-1 hover:shadow-xl;
    @apply max-w-90;
  }

  .profile-card__status-strip {
    @apply absolute top-0 w-full h-1.5 transition-colors duration-300;
  }

  .profile-card__status-strip--active {
    @apply bg-primary/70 group-hover:bg-primary;
  }

  .profile-card__status-strip--inactive {
    @apply bg-muted-foreground/20 group-hover:bg-muted-foreground/35;
  }

  .profile-card__header {
    @apply py-2;
  }

  .profile-card__top-row {
    @apply flex items-start gap-4;
  }

  .profile-card__avatar {
    @apply shrink-0 rounded-full border-2 border-primary/20 transition-transform duration-300;
    @apply group-hover:scale-105 group-hover:border-primary/40;
  }

  .profile-card__avatar-fallback {
    @apply text-sm font-semibold;
  }

  .profile-card__identity {
    @apply min-w-0 flex-1;
  }

  .profile-card__name {
    @apply truncate text-lg md:text-xl lg:text-2xl font-bold;
  }

  .profile-card__focus-area {
    @apply text-xs md:text-sm text-gray-700 line-clamp-2 tracking-wider;
  }

  .profile-card__status-badge {
    @apply shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300;
  }

  .profile-card__status-badge--active {
    @apply border-primary/20 bg-primary/10 text-primary;
  }

  .profile-card__status-badge--inactive {
    @apply border-muted bg-muted text-muted-foreground;
  }

  .profile-card__content {
    @apply space-y-4 flex-1;
  }

  .profile-card___content_rate-bio {
    @apply flex gap-2;
  }

  .profile-card__rate-block {
    @apply rounded-xl border bg-muted/40 px-3 py-2 transition-colors duration-300;
    @apply group-hover:bg-muted/60;
  }

  .profile-card__rate-label {
    @apply text-xs font-medium uppercase tracking-wide text-muted-foreground;
  }

  .profile-card__rate-value {
    @apply mt-1 text-base font-semibold;
  }

  .profile-card__bio {
    @apply text-sm leading-6 text-muted-foreground whitespace-pre-wrap;
  }

  .profile-card__skills {
    @apply flex flex-wrap gap-2;
  }

  .profile-card__skill-badge {
    @apply rounded-full px-2.5 py-1 text-xs transition-colors duration-300;
    @apply hover:border-primary/40 hover:bg-primary/5;
  }

  .profile-card__footer {
    @apply pt-0;
  }

  .profile-card__cta {
    @apply rounded-xl transition-all duration-300;
    @apply group-hover:border-primary/30 group-hover:text-primary;
  }

  .profile-card__cta-icon {
    @apply ml-1 h-4 w-4 transition-transform duration-300;
  }

  .profile-card:hover .profile-card__cta-icon {
    transform: translateX(2px) translateY(-1px);
  }
  /* PROFILE_CARD END*/
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .pi-table {
    @apply text-xs max-h-lvh;
  }

  .pi-table thead {
    @apply cursor-pointer whitespace-nowrap h-9 px-3 !text-primary-foreground;
  }

  .pi-table > thead > th {
    @apply !text-primary-foreground;
  }

  .field_description {
    @apply text-xs text-muted-foreground font-light tracking-wide wrap-anywhere;
  }
  .field_error {
    @apply text-xs font-light tracking-wide whitespace-pre-wrap;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
.pulse-glow {
  animation: pulse-glow 2.5s infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 0.8s linear infinite;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--background);
  color: var(--text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

body {
  -webkit-font-smoothing: antialiased;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--surface);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
