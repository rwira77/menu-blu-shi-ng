import React from 'react'

export default function CenterpieceArch({
  scrollPos = 0,
  archColor = '#5B1927',
  textColor = '#FF9ED9',
  marqueeText = 'SEDUH DENGAN RASA, TUANG DENGAN SENI, NIKMATI SETIAP TETES • BLU SHI NG COFFEE • ',
}) {
  // Subtle organic rotation of the rounded polygon blob + continuous rotation of the curved text
  const blobRotate = Math.sin(scrollPos * 0.65) * 6 - 4
  const textRotate = -scrollPos * 38

  const repeatedText = `${marqueeText}${marqueeText}`

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center items-end z-0 overflow-hidden h-full">
      <div className="relative w-[132vw] sm:w-[92vw] md:w-[74vw] max-w-[1040px] aspect-square translate-y-[42%] sm:translate-y-[44%] md:translate-y-[43%]">
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Circular path for the oversized serif marquee text inside the arch */}
            <path
              id="arch-text-circle"
              d="M 500, 520 m -335, 0 a 335,335 0 1,1 670,0 a 335,335 0 1,1 -670,0"
            />
          </defs>

          {/* Rounded-corner polygon/blob arch inspired by Agrumea Farm reference */}
          <g
            style={{
              transform: `rotate(${blobRotate}deg)`,
              transformOrigin: '500px 540px',
              transition: 'fill 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <path
              d="M 455 78
                 Q 500 52 548 76
                 L 788 196
                 Q 842 224 868 278
                 L 962 496
                 Q 986 552 960 612
                 L 852 848
                 Q 824 904 762 918
                 L 242 918
                 Q 180 904 152 848
                 L 44 612
                 Q 18 552 44 496
                 L 138 278
                 Q 164 224 218 196
                 Z"
              fill={archColor}
              style={{
                transition: 'fill 650ms ease',
              }}
            />
          </g>

          {/* Rotating oversized editorial text along the inner curve */}
          <g
            style={{
              transform: `rotate(${textRotate}deg)`,
              transformOrigin: '500px 520px',
            }}
          >
            <text
              fill={textColor}
              className="font-editorial uppercase select-none"
              style={{
                fontSize: '74px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                opacity: 0.92,
                transition: 'fill 650ms ease',
              }}
            >
              <textPath href="#arch-text-circle" startOffset="0%">
                {repeatedText}
              </textPath>
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}

