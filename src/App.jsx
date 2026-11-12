import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MENU_ITEMS, UI_TEXT } from './data/menuData'
import BluShingLogo from './components/BluShingLogo'
import CenterpieceArch from './components/CenterpieceArch'
import CupCard from './components/CupCard'

// Helper to wrap difference into [-total/2, +total/2] for seamless infinite loop
function getWrappedOffset(itemIndex, scrollPos, total) {
  let diff = (itemIndex - scrollPos) % total
  if (diff < -total / 2) diff += total
  if (diff > total / 2) diff -= total
  return diff
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)

  // Smooth physics state rendered at 60/120fps
  const [renderState, setRenderState] = useState({
    current: 0,
    velocity: 0,
  })

  const targetScrollRef = useRef(0)
  const currentScrollRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollRef = useRef(0)
  const dragMovedRef = useRef(false)
  const pointerSamplesRef = useRef([])
  const wheelSnapTimerRef = useRef(null)

  const t = UI_TEXT.id

  // Dynamically derive unique categories and counts from menuData
  const categoryList = useMemo(() => {
    const counts = new Map()
    MENU_ITEMS.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) || 0) + 1)
    })
    return [
      { id: 'ALL', label: t.allCategories, count: MENU_ITEMS.length },
      ...Array.from(counts.entries()).map(([cat, count]) => ({
        id: cat,
        label: cat,
        count,
      })),
    ]
  }, [t.allCategories])

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'ALL') return MENU_ITEMS
    return MENU_ITEMS.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  const totalItems = visibleItems.length
  const isCircular = totalItems >= 4

  // Frame-rate independent animation loop (silky across 60Hz, 90Hz & 120Hz displays)
  useEffect(() => {
    let rafId
    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000))
      lastTime = now

      const target = targetScrollRef.current
      const current = currentScrollRef.current
      const diff = target - current

      // Responsive tracking while finger is dragging; smooth organic coast after release
      const speed = isDraggingRef.current ? 28 : 7.8
      const alpha = 1 - Math.exp(-speed * dt)

      const next = Math.abs(diff) < 0.0004 ? target : current + diff * alpha
      // Normalize velocity to 60fps units so tilt & blur feel identical on 60Hz and 120Hz screens
      const velocity = (next - current) / (dt * 60)
      currentScrollRef.current = next

      setRenderState((prev) => {
        if (
          Math.abs(prev.current - next) < 0.0004 &&
          Math.abs(prev.velocity - velocity) < 0.0004
        ) {
          return prev
        }
        return { current: next, velocity }
      })

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Wheel & Trackpad listener with gentle snap-to-center after scroll settles
  useEffect(() => {
    const handleWheel = (e) => {
      if (isCategoryMenuOpen) return
      e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      const nextTarget = targetScrollRef.current + delta * 0.0022
      targetScrollRef.current = isCircular
        ? nextTarget
        : Math.max(-0.35, Math.min(totalItems - 1 + 0.35, nextTarget))

      if (wheelSnapTimerRef.current) clearTimeout(wheelSnapTimerRef.current)
      wheelSnapTimerRef.current = setTimeout(() => {
        const rounded = Math.round(targetScrollRef.current)
        targetScrollRef.current = isCircular
          ? rounded
          : Math.max(0, Math.min(totalItems - 1, rounded))
      }, 150)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      if (wheelSnapTimerRef.current) clearTimeout(wheelSnapTimerRef.current)
    }
  }, [isCategoryMenuOpen, isCircular, totalItems])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCategoryMenuOpen) {
        if (e.key === 'Escape') {
          setIsCategoryMenuOpen(false)
        }
        return
      }
      if (e.key === 'ArrowRight') {
        const next = Math.round(targetScrollRef.current + 1)
        targetScrollRef.current = isCircular
          ? next
          : Math.min(totalItems - 1, next)
      } else if (e.key === 'ArrowLeft') {
        const prev = Math.round(targetScrollRef.current - 1)
        targetScrollRef.current = isCircular ? prev : Math.max(0, prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCategoryMenuOpen, isCircular, totalItems])

  // Responsive pixels-per-item for natural 1:1 touch & mouse drag across phone/tablet/desktop
  const getPxPerItem = () => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 390
    return Math.max(135, Math.min(330, vw * 0.36))
  }

  // Pointer drag handlers with momentum flick inertia for natural mobile swipe
  const handlePointerDown = (e) => {
    if (isCategoryMenuOpen) return
    if (e.target.closest('button, a, select')) return
    if (wheelSnapTimerRef.current) clearTimeout(wheelSnapTimerRef.current)

    isDraggingRef.current = true
    dragMovedRef.current = false
    dragStartXRef.current = e.clientX
    dragStartScrollRef.current = currentScrollRef.current
    targetScrollRef.current = currentScrollRef.current
    pointerSamplesRef.current = [{ x: e.clientX, t: performance.now() }]
  }

  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      if (!isDraggingRef.current) return
      const now = performance.now()
      const dx = e.clientX - dragStartXRef.current
      if (Math.abs(dx) > 6) {
        dragMovedRef.current = true
      }

      const pxPerItem = getPxPerItem()
      const nextTarget = dragStartScrollRef.current - dx / pxPerItem
      targetScrollRef.current = isCircular
        ? nextTarget
        : Math.max(-0.35, Math.min(totalItems - 1 + 0.35, nextTarget))

      const samples = pointerSamplesRef.current
      samples.push({ x: e.clientX, t: now })
      // Keep only recent samples within last 110ms for accurate flick velocity
      while (samples.length > 2 && now - samples[0].t > 110) {
        samples.shift()
      }
    }

    const handleWindowPointerUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false

      if (dragMovedRef.current || !isCircular) {
        const now = performance.now()
        const samples = pointerSamplesRef.current.filter((s) => now - s.t <= 120)
        let scrollVelPerSec = 0

        if (samples.length >= 2) {
          const first = samples[0]
          const last = samples[samples.length - 1]
          const dtSec = Math.max(0.012, (last.t - first.t) / 1000)
          const pxPerSec = (last.x - first.x) / dtSec
          scrollVelPerSec = -pxPerSec / getPxPerItem()
        }

        // Natural momentum projection
        const clampedVel = Math.max(-8, Math.min(8, scrollVelPerSec))
        const projected = targetScrollRef.current + clampedVel * 0.22
        let snapped = Math.round(projected)

        // Ensure quick natural thumb flick always advances at least 1 card
        const startSnapped = Math.round(dragStartScrollRef.current)
        if (Math.abs(clampedVel) > 0.7 && snapped === startSnapped) {
          snapped = startSnapped + Math.sign(clampedVel)
        }

        targetScrollRef.current = isCircular
          ? snapped
          : Math.max(0, Math.min(totalItems - 1, snapped))
      }
    }

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true })
    window.addEventListener('pointerup', handleWindowPointerUp, { passive: true })
    window.addEventListener('pointercancel', handleWindowPointerUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
    }
  }, [isCircular, totalItems])

  // Jump smoothly to a specific index on the carousel
  const jumpToIndex = (targetIdx) => {
    if (!isCircular) {
      targetScrollRef.current = Math.max(0, Math.min(totalItems - 1, targetIdx))
      return
    }
    const currentMod =
      ((currentScrollRef.current % totalItems) + totalItems) % totalItems
    let delta = targetIdx - currentMod
    if (delta > totalItems / 2) delta -= totalItems
    if (delta < -totalItems / 2) delta += totalItems
    targetScrollRef.current = currentScrollRef.current + delta
  }

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId)
    setIsCategoryMenuOpen(false)
    targetScrollRef.current = 0
    currentScrollRef.current = 0
    setRenderState({ current: 0, velocity: 0 })
  }

  const handleSelectCup = (item) => {
    if (dragMovedRef.current) return
    const idx = visibleItems.findIndex((x) => x.id === item.id)
    if (idx === -1) return
    const offset = isCircular
      ? getWrappedOffset(idx, renderState.current, totalItems)
      : idx - renderState.current
    if (Math.abs(offset) > 0.25) {
      jumpToIndex(idx)
    }
  }

  // Determine the currently centered active item for arch color & category badge
  const rawIndex = Math.round(renderState.current)
  const activeIndex = isCircular
    ? ((rawIndex % totalItems) + totalItems) % totalItems
    : Math.max(0, Math.min(totalItems - 1, rawIndex))
  const activeItem = visibleItems[activeIndex] || MENU_ITEMS[0]

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#FAF5EF] select-none touch-none"
      onPointerDown={handlePointerDown}
    >
      {/* Subtle ambient background glow matching the active drink */}
      <div
        className="pointer-events-none fixed inset-0 transition-colors duration-700 opacity-15"
        style={{
          background: `radial-gradient(circle at 50% 65%, ${activeItem.labelSecondary}, transparent 70%)`,
        }}
      />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 inset-x-0 z-[120] flex items-start justify-between px-5 sm:px-9 pt-5 sm:pt-7 pointer-events-none">
        {/* Left: Current Category Name Badge */}
        <div className="pointer-events-auto max-w-[32vw] sm:max-w-none">
          <div className="inline-flex items-center gap-2 h-10 sm:h-11 px-3.5 sm:px-5 rounded-full border border-[#8E1E3A]/35 bg-[#FAF5EF]/80 backdrop-blur-xs shadow-xs max-w-full">
            <span
              className="inline-block w-2 h-2 rotate-45 shrink-0 transition-colors duration-500"
              style={{ backgroundColor: activeItem.archColor }}
            />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-[#1B1521] whitespace-nowrap truncate">
              {activeItem.category}
            </span>
          </div>
        </div>

        {/* Center: Official BLU SHI NG Brand Logo (locked mathematically to center) */}
        <div
          className="pointer-events-auto fixed left-1/2 -translate-x-1/2 top-4 sm:top-6"
          onClick={() => jumpToIndex(0)}
          title="BLU SHI NG — Kembali ke awal"
        >
          <BluShingLogo
            iconColor="#FF9ED9"
            textColor="#1B1521"
          />
        </div>

        {/* Right: MENU Pill + Diamond Button -> Category Selector Dropdown */}
        <div className="relative flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsCategoryMenuOpen((v) => !v)}
            aria-expanded={isCategoryMenuOpen}
            className={`h-10 sm:h-11 px-5 sm:px-6 rounded-full border text-xs font-bold tracking-[0.16em] uppercase transition-all cursor-pointer ${
              isCategoryMenuOpen
                ? 'bg-[#8E1E3A] border-[#8E1E3A] text-[#FAF5EF] shadow-md'
                : 'border-[#8E1E3A]/70 bg-[#FAF5EF]/80 backdrop-blur-xs text-[#1B1521] hover:bg-[#8E1E3A] hover:text-[#FAF5EF]'
            }`}
          >
            {t.menuButton}
          </button>

          <button
            onClick={() => setIsCategoryMenuOpen((v) => !v)}
            aria-label="Pilih Kategori Menu"
            className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#8E1E3A] text-[#FAF5EF] items-center justify-center hover:scale-105 hover:bg-[#1B1521] transition-all shadow-md cursor-pointer"
          >
            <span
              className={`inline-block w-2.5 h-2.5 bg-[#FF9ED9] transition-transform duration-300 ${
                isCategoryMenuOpen ? 'rotate-0 scale-110' : 'rotate-45'
              }`}
            />
          </button>

          {/* Category Dropdown Panel */}
          <AnimatePresence>
            {isCategoryMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[130]"
                  onClick={() => setIsCategoryMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-13 sm:top-14 z-[140] w-60 rounded-2xl bg-[#FAF5EF]/95 backdrop-blur-xl border border-[#1B1521]/12 shadow-2xl p-2"
                >
                  <div className="px-3 pt-1.5 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B1521]/50 border-b border-[#1B1521]/10 mb-1">
                    Kategori Menu
                  </div>
                  <div className="space-y-1">
                    {categoryList.map((cat) => {
                      const isActive = selectedCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#1B1521] text-[#FAF5EF] shadow-sm'
                              : 'text-[#1B1521] hover:bg-[#8E1E3A]/10'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`inline-block w-2 h-2 rotate-45 ${
                                isActive ? 'bg-[#FF9ED9]' : 'bg-[#8E1E3A]/40'
                              }`}
                            />
                            <span className="tracking-wide">{cat.label}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-mono ${
                                isActive ? 'text-[#FF9ED9]' : 'text-[#1B1521]/45'
                              }`}
                            >
                              {cat.count}
                            </span>
                            {isActive && <Check className="w-3.5 h-3.5 text-[#FF9ED9]" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* CENTERPIECE ORGANIC ARCH & ROTATING CURVED TYPOGRAPHY */}
      <CenterpieceArch
        scrollPos={renderState.current}
        archColor={activeItem.archColor}
        textColor={activeItem.archTextColor}
        marqueeText={t.curvedMarquee}
      />

      {/* CURVED ARC PRODUCT CAROUSEL */}
      <main className="relative w-full h-full z-10">
        {visibleItems.map((item, idx) => {
          const offset = isCircular
            ? getWrappedOffset(idx, renderState.current, totalItems)
            : idx - renderState.current
          if (Math.abs(offset) > 2.35) return null
          return (
            <CupCard
              key={item.id}
              item={item}
              offset={offset}
              velocity={renderState.velocity}
              onSelect={handleSelectCup}
              lang="id"
            />
          )
        })}
      </main>

      {/* BOTTOM BAR */}
      <footer className="fixed bottom-0 inset-x-0 z-[120] grid grid-cols-1 md:grid-cols-3 items-end px-5 sm:px-9 pb-4 sm:pb-6 gap-2 pointer-events-none">
        {/* Left spacer to keep center prompt mathematically centered */}
        <div className="hidden md:block" />

        {/* Bottom-center: Scroll prompt + Dots */}
        <div className="justify-self-center flex flex-col items-center gap-2 pointer-events-auto">
          <span className="font-editorial text-xs sm:text-sm tracking-[0.22em] uppercase text-[#FAF5EF] drop-shadow-xs">
            {t.scrollToDiscover}
          </span>

          {/* Quick Drink Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {visibleItems.map((item, idx) => {
              const isActive = idx === activeIndex
              return (
                <button
                  key={item.id}
                  onClick={() => jumpToIndex(idx)}
                  aria-label={item.name}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'w-6 bg-[#FF9ED9]'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Bottom-right counter */}
        <div className="hidden md:flex items-center justify-self-end pointer-events-none">
          <span className="text-[#1B1521]/55 font-mono text-xs">
            0{activeIndex + 1} / 0{totalItems}
          </span>
        </div>
      </footer>
    </div>
  )
}
