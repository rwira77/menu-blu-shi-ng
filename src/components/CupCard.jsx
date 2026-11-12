import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// Smooth Catmull-Rom spline sampler over keyframe positions [-2, -1, 0, 1, 2]
function sampleSpline(points, offset) {
  const u = offset + 2
  if (u <= 0) return points[0]
  if (u >= 4) return points[4]
  const i = Math.floor(u)
  const t = u - i
  const p0 = points[Math.max(0, i - 1)]
  const p1 = points[i]
  const p2 = points[Math.min(4, i + 1)]
  const p3 = points[Math.min(4, i + 2)]
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  )
}

// Keyframes tuned to match the visual hierarchy & asymmetrical arc composition
const X_VW_KEYS = [-52, -30.5, 0, 31.5, 52]
const Y_VH_KEYS = [-9, -11.5, 2.5, 4.5, 16]
const SCALE_KEYS = [0.38, 0.64, 1.04, 0.61, 0.38]
const ROTATE_KEYS = [0, 26, -1.5, -4, 22]
const BLUR_KEYS = [2.2, 0, 0, 0, 2.2]

export default function CupCard({
  item,
  offset, // relative distance from center in item units, e.g. -2.2 .. +2.2
  velocity = 0,
  onSelect,
  lang = 'id',
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDescOpen, setIsDescOpen] = useState(false)

  const absOff = Math.abs(offset)

  const xVw = sampleSpline(X_VW_KEYS, offset)
  const yVh = sampleSpline(Y_VH_KEYS, offset)
  const baseScale = sampleSpline(SCALE_KEYS, offset)

  const baseTilt = sampleSpline(ROTATE_KEYS, offset)
  const velocityTilt = Math.max(-7, Math.min(7, velocity * 14))
  const scrollRotate = baseTilt + velocityTilt
  const hoverTilt = offset < -0.25 ? -3 : 3

  const depthBlur = Math.max(0, sampleSpline(BLUR_KEYS, offset))
  const motionBlur = Math.min(3.5, Math.abs(velocity) * 12)
  const totalBlur = depthBlur + motionBlur

  const opacity = absOff > 2.3 ? 0 : absOff > 1.9 ? 1 - (absOff - 1.9) / 0.4 : 1
  const zIndex = Math.round(100 - absOff * 30) + (isDescOpen ? 25 : 0)

  // Compact normal label & moving hotspot point appear smoothly only when cup is centered
  const isCentered = absOff < 0.22 && Math.abs(velocity) < 0.045

  // Automatically close description card when scrolling away from center
  useEffect(() => {
    if (!isCentered && isDescOpen) {
      setIsDescOpen(false)
    }
  }, [isCentered, isDescOpen])

  const toggleDescription = (e) => {
    e.stopPropagation()
    if (!isCentered) return
    setIsDescOpen((prev) => !prev)
  }

  return (
    <div
      className="fixed left-1/2 top-1/2 select-none cursor-pointer will-change-transform"
      style={{
        transform: `translate3d(calc(-50% + ${xVw}vw), calc(-50% + ${yVh}vh), 0) scale(${baseScale}) rotate(${scrollRotate}deg)`,
        filter: totalBlur > 0.15 ? `blur(${totalBlur.toFixed(2)}px)` : 'none',
        opacity,
        zIndex,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(item)}
    >
      {/* Cup Container sized proportionally to viewport height & width */}
      <div
        className="relative aspect-square flex items-center justify-center"
        style={{
          width: 'clamp(240px, min(52vh, 34vw), 480px)',
        }}
      >
        {/* Separate GPU-composited hover layer so hover eases smoothly without fighting scroll */}
        <div
          className="relative w-full h-full flex items-center justify-center will-change-transform pointer-events-none"
          style={{
            transform: isHovered
              ? `translate3d(0, -6px, 0) scale(1.04) rotate(${hoverTilt}deg)`
              : 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
            transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Soft contact shadow beneath the cup */}
          <div
            className="absolute bottom-[4%] w-[48%] h-[8%] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(closest-side, rgba(20, 12, 28, 0.34), rgba(20, 12, 28, 0))',
              transform: `rotate(${-scrollRotate * 0.4}deg) translateY(8px)`,
            }}
          />

          {/* Photorealistic Iced Coffee Cup Image (from workspace cup.png or custom photo) */}
          <img
            src={item.image}
            alt={`${item.name} - ${item.subTitle}`}
            draggable={false}
            className="w-full h-full object-contain drop-shadow-[0_24px_32px_rgba(22,12,28,0.28)] pointer-events-none transition-[filter] duration-500"
            style={{
              filter: item.cupTint || 'none',
            }}
          />
        </div>

        {/* Interactive moving hotspot point — appears when cup is centered; click to toggle description */}
        <div
          className={`absolute top-[33%] right-[19%] z-20 transition-all duration-300 ease-out ${
            isCentered
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-75 pointer-events-none'
          }`}
          style={{
            transform: `rotate(${-scrollRotate}deg)`,
          }}
        >
          <button
            type="button"
            onClick={toggleDescription}
            aria-label={isDescOpen ? 'Tutup deskripsi' : `Lihat deskripsi ${item.name}`}
            className="animate-float-point group relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer focus:outline-none"
          >
            {/* Expanding pulse halo */}
            {!isDescOpen && (
              <span className="absolute inset-0 rounded-full bg-[#FF9ED9] opacity-60 animate-ping" />
            )}
            {/* Outer crisp ring */}
            <span
              className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 shadow-lg transition-all duration-200 ${
                isDescOpen
                  ? 'bg-[#1B1521] border-[#FF9ED9] text-[#FF9ED9] scale-95'
                  : 'bg-[#FF9ED9] border-[#FAF5EF] text-[#1B1521] group-hover:scale-115'
              }`}
            >
              {isDescOpen ? (
                <X className="w-3 h-3" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#1B1521]" />
              )}
            </span>
          </button>
        </div>

        {/* Inline compact description card — unfolds smoothly only when the moving point is clicked */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-[43%] left-1/2 z-20 w-[215px] sm:w-[255px] px-3.5 py-3 rounded-2xl backdrop-blur-md bg-[#1B1521]/90 text-[#FAF5EF] border border-[#FF9ED9]/35 shadow-2xl text-left transition-all duration-300 ease-out origin-top-right ${
            isCentered && isDescOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          style={{
            transform: `translate(-50%, ${isCentered && isDescOpen ? '0px' : '-8px'}) rotate(${-scrollRotate}deg) scale(${isCentered && isDescOpen ? 1 : 0.9})`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-editorial italic text-xs sm:text-sm text-[#FF9ED9] leading-tight">
                {item.subTitle}
              </div>
              <div className="text-[9px] uppercase tracking-[0.16em] text-white/55 mt-0.5">
                {item.category}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleDescription}
              aria-label="Tutup deskripsi"
              className="w-5 h-5 rounded-full bg-white/10 hover:bg-[#FF9ED9] hover:text-[#1B1521] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="mt-2 text-[11px] sm:text-xs text-[#FAF5EF]/90 leading-relaxed font-sans-clean">
            {item.description[lang]}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1">
            {item.notes.map((note) => (
              <span
                key={note}
                className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/10 text-[#FF9ED9]"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Compact normal label (name & price only) — appears smoothly only when centered */}
        <div
          className={`absolute bottom-[3%] z-10 pointer-events-none px-3.5 py-1.5 rounded-xl backdrop-blur-md bg-[#1B1521]/85 text-[#FAF5EF] border border-[#FF9ED9]/30 shadow-lg text-center transition-all duration-300 ease-out ${
            isCentered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `rotate(${-scrollRotate}deg) translateY(${isCentered ? '0px' : '8px'}) scale(${isCentered ? 1 : 0.9})`,
          }}
        >
          <div className="font-editorial font-bold text-sm sm:text-base leading-tight whitespace-nowrap">
            {item.name}
          </div>
          <div className="text-[10px] tracking-[0.16em] uppercase text-[#FF9ED9] font-semibold leading-tight mt-0.5 whitespace-nowrap">
            IDR {item.price}
          </div>
        </div>
      </div>
    </div>
  )
}
