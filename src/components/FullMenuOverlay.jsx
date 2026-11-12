import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function FullMenuOverlay({
  isOpen,
  onClose,
  items,
  onJumpToItem,
  lang = 'id',
  t,
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  if (!isOpen) return null

  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category)))]
  const filtered =
    selectedCategory === 'ALL'
      ? items
      : items.filter((item) => item.category === selectedCategory)

  return (
    <AnimatePresence>
      <motion.div
        key="menu-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[190] bg-[#16101E]/92 backdrop-blur-xl text-[#FAF5EF] overflow-y-auto p-6 sm:p-10"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#FF9ED9] font-semibold">
                BLU SHI NG • ROASTERY &amp; BAR
              </span>
              <h2 className="font-editorial font-bold text-3xl sm:text-5xl mt-1">
                {t.fullMenuTitle}
              </h2>
              <p className="text-xs sm:text-sm text-white/65 mt-1">{t.fullMenuSubtitle}</p>
            </div>

            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full border border-white/25 flex items-center justify-center hover:bg-[#FF9ED9] hover:text-[#16101E] hover:border-[#FF9ED9] transition-colors cursor-pointer"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF9ED9] text-[#16101E] shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {cat === 'ALL' ? t.allCategories : cat}
                </button>
              )
            })}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {filtered.map((item, idx) => {
              const originalIndex = items.findIndex((x) => x.id === item.id)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group relative rounded-3xl p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF9ED9]/50 transition-all flex items-center gap-4 cursor-pointer"
                  onClick={() => {
                    onJumpToItem(originalIndex)
                    onClose()
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: item.archColor }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300"
                      style={{ filter: item.cupTint || 'none' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#FF9ED9] font-semibold">
                        {item.category}
                      </span>
                      <span className="font-editorial font-bold text-lg text-white">
                        {item.price}
                      </span>
                    </div>
                    <h3 className="font-editorial font-bold text-2xl leading-tight truncate">
                      {item.name}
                    </h3>
                    <p className="font-editorial italic text-sm text-white/80 truncate">
                      {item.subTitle}
                    </p>
                    <p className="text-xs text-white/60 line-clamp-2 mt-1">
                      {item.tagline[lang]}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-white/45">{t.replaceHint}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

