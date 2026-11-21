// Mercor style isometric illustrations, redrawn in the WorldLoop palette:
// white ground, ink near black, loop blue, warm orange for failure, green
// for pass. No purple. Each one is a plain inline SVG, no image file.
const INK = "#0b0b0c";
const BLUE = "#1d4ed8";
const BLUE_SOFT = "#dbeafe";
const ORANGE = "#ea580c";
const GREEN = "#15803d";
const GREY = "#e5e7eb";

function IsoGrid({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 220" className="h-auto w-full" role="img" aria-hidden="true">
      <g stroke={GREY} strokeWidth="1">
        <path d="M40 150 L160 90 L280 150 L160 210 Z" fill="#f6f7f9" />
        <path d="M80 130 L200 70 M120 110 L240 50 M40 150 L160 90 M280 150 L160 90" fill="none" opacity="0.6" />
        <path d="M100 180 L100 120 M160 210 L160 90 M220 180 L220 120" fill="none" opacity="0.4" />
      </g>
      {children}
    </svg>
  );
}

export function PackArt() {
  return (
    <IsoGrid>
      {/* Isometric room: floor, back wall, table, folded cloth, loop arrow */}
      <path d="M70 148 L160 102 L250 148 L160 194 Z" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
      <path d="M70 148 L70 96 L160 50 L160 102 Z" fill={BLUE_SOFT} stroke={INK} strokeWidth="1.5" />
      <path d="M250 148 L250 96 L160 50 L160 102 Z" fill="#eff6ff" stroke={INK} strokeWidth="1.5" />
      <path d="M110 150 L210 150 L210 138 L110 138 Z" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
      <path d="M120 138 L120 128 L200 128 L200 138 Z" fill={BLUE} opacity="0.9" />
      <path d="M140 128 L140 118 L180 118 L180 128 Z" fill="#ffffff" stroke={INK} strokeWidth="1.2" />
      <path d="M230 60 Q 265 60 265 95 Q 265 125 235 125" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
      <path d="M235 125 L225 118 M235 125 L243 116" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
      <circle cx="230" cy="60" r="5" fill={BLUE} />
    </IsoGrid>
  );
}

export function EvalArt() {
  return (
    <IsoGrid>
      {/* Isometric bars: pass in green, fail in orange, person icon tile */}
      <rect x="105" y="120" width="26" height="34" fill={GREEN} stroke={INK} strokeWidth="1.5" transform="skewY(-8)" />
      <rect x="140" y="100" width="26" height="54" fill={BLUE} stroke={INK} strokeWidth="1.5" transform="skewY(-8)" />
      <rect x="175" y="132" width="26" height="22" fill={ORANGE} stroke={INK} strokeWidth="1.5" transform="skewY(-8)" />
      <rect x="215" y="60" width="52" height="52" rx="10" fill={BLUE} stroke={INK} strokeWidth="1.5" />
      <circle cx="241" cy="78" r="8" fill="#ffffff" />
      <path d="M228 104 Q241 88 254 104 Z" fill="#ffffff" />
      <path d="M105 120 L105 154 M140 100 L140 154 M175 132 L175 154" stroke={INK} strokeWidth="1" opacity="0.4" />
    </IsoGrid>
  );
}

export function LoopArt() {
  return (
    <IsoGrid>
      {/* Isometric calendar grid with dollar tile, loop arrow around it */}
      <rect x="80" y="70" width="150" height="95" rx="6" fill="#ffffff" stroke={INK} strokeWidth="1.5" transform="skewY(-6)" />
      <g fill={BLUE_SOFT} stroke={INK} strokeWidth="1">
        <rect x="95" y="92" width="26" height="18" />
        <rect x="128" y="92" width="26" height="18" />
        <rect x="161" y="92" width="26" height="18" fill={ORANGE} />
        <rect x="95" y="118" width="26" height="18" />
        <rect x="128" y="118" width="26" height="18" fill={GREEN} />
        <rect x="161" y="118" width="26" height="18" />
      </g>
      <rect x="215" y="130" width="52" height="52" rx="10" fill={BLUE} stroke={INK} strokeWidth="1.5" />
      <text x="241" y="166" textAnchor="middle" fontSize="30" fontWeight="700" fill="#ffffff">$</text>
      <path d="M70 170 Q 60 200 110 200 L 210 200" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
      <path d="M210 200 L200 192 M210 200 L200 208" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
    </IsoGrid>
  );
}

export function HandsStill() {
  return (
    <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label="Still image of two carbon robotic hands folding a cloth">
      <rect width="400" height="260" fill="#f6f7f9" />
      <rect x="40" y="150" width="320" height="60" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
      <rect x="120" y="130" width="160" height="26" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
      <rect x="120" y="130" width="80" height="26" fill={BLUE} opacity="0.85" />
      <g fill="#17191d" stroke={INK} strokeWidth="1.5">
        <rect x="90" y="70" width="70" height="42" rx="8" />
        <rect x="240" y="70" width="70" height="42" rx="8" />
      </g>
      <g fill="#2b2f36">
        <rect x="100" y="112" width="10" height="26" rx="4" />
        <rect x="118" y="112" width="10" height="30" rx="4" />
        <rect x="136" y="112" width="10" height="28" rx="4" />
        <rect x="252" y="112" width="10" height="28" rx="4" />
        <rect x="270" y="112" width="10" height="30" rx="4" />
        <rect x="288" y="112" width="10" height="26" rx="4" />
      </g>
      <circle cx="125" cy="88" r="4" fill={BLUE} />
      <circle cx="275" cy="88" r="4" fill={BLUE} />
    </svg>
  );
}
