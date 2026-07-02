import React from 'react';

export default function KolamBackground({ className = "opacity-5" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}>
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Kolam Pattern Grid Elements */}
        <circle cx="400" cy="400" r="8" fill="currentColor" />
        <circle cx="300" cy="400" r="4" fill="currentColor" />
        <circle cx="500" cy="400" r="4" fill="currentColor" />
        <circle cx="400" cy="300" r="4" fill="currentColor" />
        <circle cx="400" cy="500" r="4" fill="currentColor" />
        
        {/* Central Lotus Loops */}
        <path d="M 400,280 C 370,320 330,370 330,400 C 330,440 370,470 400,520 C 430,470 470,440 470,400 C 470,370 430,320 400,280 Z" />
        <path d="M 280,400 C 320,370 370,330 400,330 C 440,330 470,370 520,400 C 470,430 440,470 400,470 C 370,470 320,430 280,400 Z" />

        {/* Diagonal Loops */}
        <path d="M 315,315 C 340,340 380,380 400,400 C 420,420 460,460 485,485 C 460,460 420,420 400,400 C 380,380 340,340 315,315 Z" />
        <path d="M 485,315 C 460,340 420,380 400,400 C 380,420 340,460 315,485 C 340,460 380,420 400,400 C 420,380 460,340 485,315 Z" />

        {/* Outer Ring Ornate Petals */}
        <path d="M 400,180 C 340,240 280,300 240,400 C 280,500 340,560 400,620 C 460,560 520,500 560,400 C 520,300 460,240 400,180 Z" strokeWidth="1" />
        
        {/* Geometric Corner Flares */}
        <path d="M 400,100 L 430,150 L 370,150 Z" />
        <path d="M 400,700 L 430,650 L 370,650 Z" />
        <path d="M 100,400 L 150,430 L 150,370 Z" />
        <path d="M 700,400 L 650,430 L 650,370 Z" />
      </svg>
    </div>
  );
}
