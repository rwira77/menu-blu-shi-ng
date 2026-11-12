import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, Coffee, Flame, Droplets } from 'lucide-react'

export default function DetailModal({ item, onClose, lang = 'id', t, onAddOrder }) {
  const [ice, setIce] = useState('Normal Ice')
  const [sweetness, setSweetness] = useState('100% (Signature)')
  const [milk, setMilk] = useState('Fresh Milk')
  const [justAdded, setJustAdded] = useState(false)

  if (!item) return null

  const handleAdd = () => {
    setJustAdded(true)
    onAddOrder?.({
      ...item,
      customization: { ice, sweetness, milk },
    })
    setTimeout(() => {
      setJustAdded(false)
    }, 1600)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#140E1C]/65 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF5EF] text-[#1B1521] shadow-2xl border border-[#1B1521]/10 grid grid-cols-1 md:grid-cols-12"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#1B1521] text-[#FAF5EF] flex items-center justify-center hover:bg-[#8E1E3A] transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Visual Column */}
          <div
            className="md:col-span-5 relative flex flex-col items-center justify-center p-8 overflow-hidden min-h-[300px]"
            style={{ backgroundColor: item.archColor }}
          >
            {/* Subtle glowing radial aura */}
            <div
              className="absolute w-64 h-64 rounded-full blur-3xl opacity-35 pointer-events-none"
              style={{ backgroundColor: '#FF9ED9' }}
            />

            <span className="relative z-10 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase bg-[#FF9ED9] text-[#1B1521] mb-3">
              {item.badge} • {item.category}
            </span>

            <motion.img
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: -4, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              src={item.image}
              alt={item.name}
              className="relative z-10 w-56 sm:w-64 h-56 sm:h-64 object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.45)]"
              style={{ filter: item.cupTint || 'none' }}
            />

            {/* Tasting notes pills */}
            <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-1.5">
              {item.notes.map((note) => (
                <span
                  key={note}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 text-[#FAF5EF] backdrop-blur-xs border border-white/15"
                >
                  ✦ {note}
                </span>
              ))}
            </div>
          </div>

          {/* Right Info & Customizer Column */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-baseline justify-between gap-2 pr-10">
                <div>
                  <h2 className="font-editorial font-bold text-3xl sm:text-4xl tracking-tight uppercase text-[#1B1521]">
                    {item.name}
                  </h2>
                  <p className="font-editorial italic text-xl text-[#8E1E3A] -mt-1">
                    {item.subTitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-widest text-[#1B1521]/60 block">
                    Price
                  </span>
                  <span className="font-editorial font-bold text-3xl text-[#1B1521]">
                    IDR {item.price}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm sm:text-base text-[#1B1521]/80 leading-relaxed">
                {item.description[lang]}
              </p>

              {/* Quick specs row */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#1B1521]/5 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#8E1E3A] shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-60">Volume</div>
                    <div className="text-xs font-bold">{item.volume}</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#1B1521]/5 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#8E1E3A] shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-60">Energy</div>
                    <div className="text-xs font-bold">{item.calories}</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#1B1521]/5 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#8E1E3A] shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-60">Caffeine</div>
                    <div className="text-xs font-bold">{item.caffeine}</div>
                  </div>
                </div>
              </div>

              {/* Drink Customization */}
              <div className="mt-5 space-y-3 border-t border-[#1B1521]/10 pt-4">
                <div className="text-xs font-bold uppercase tracking-widest text-[#1B1521]/70">
                  {t.customizeTitle}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold opacity-75 block mb-1">
                      {t.iceLevel}
                    </label>
                    <select
                      value={ice}
                      onChange={(e) => setIce(e.target.value)}
                      className="w-full rounded-xl border border-[#1B1521]/20 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#8E1E3A]"
                    >
                      <option>Less Ice</option>
                      <option>Normal Ice</option>
                      <option>Extra Crystal Ice</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold opacity-75 block mb-1">
                      {t.sweetness}
                    </label>
                    <select
                      value={sweetness}
                      onChange={(e) => setSweetness(e.target.value)}
                      className="w-full rounded-xl border border-[#1B1521]/20 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#8E1E3A]"
                    >
                      <option>50% (Less Sweet)</option>
                      <option>75% (Balanced)</option>
                      <option>100% (Signature)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold opacity-75 block mb-1">
                      {t.milkOption}
                    </label>
                    <select
                      value={milk}
                      onChange={(e) => setMilk(e.target.value)}
                      className="w-full rounded-xl border border-[#1B1521]/20 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#8E1E3A]"
                    >
                      <option>Fresh Milk</option>
                      <option>Barista Oat (+8K)</option>
                      <option>Roasted Almond (+8K)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nutrition Facts Table */}
              <div className="mt-4 border-t border-[#1B1521]/10 pt-3">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#1B1521]/65 mb-2">
                  {t.nutritionTitle}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  {item.nutrition.map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between py-1 border-b border-[#1B1521]/10"
                    >
                      <span className="opacity-75">{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#1B1521] hover:bg-[#8E1E3A] text-[#FAF5EF] font-semibold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#FF9ED9]" />
                    <span>{t.addedToast}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FF9ED9]" />
                    <span>
                      {t.orderNow} — IDR {item.price}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

