'use client';

import { useMemo, useState } from 'react';
import { wandSpells, type WandSpell } from './spells';

const categories = ['All', ...Array.from(new Set(wandSpells.map((spell) => spell.type)))];

export default function WandSpellsPage() {
    const [selectedSpell, setSelectedSpell] = useState<WandSpell>(wandSpells.find((s) => s.name === 'Lumos') ?? wandSpells[0]);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [isCasting, setIsCasting] = useState(false);
    const [showPath, setShowPath] = useState(true);

    const filteredSpells = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        return wandSpells.filter((spell) => {
            const matchesQuery = !normalized ||
                spell.name.toLowerCase().includes(normalized) ||
                spell.explanation.toLowerCase().includes(normalized);

            const matchesCategory = category === 'All' || spell.type === category;
            return matchesQuery && matchesCategory;
        });
    }, [query, category]);

    const castSpell = () => {
        setIsCasting(false);
        requestAnimationFrame(() => setIsCasting(true));
        window.setTimeout(() => setIsCasting(false), 1200);
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[#07110d] text-[#eee8d5] selection:bg-amber-300/30">
            <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_0%,rgba(255,210,120,.10),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(73,130,93,.12),transparent_30%)]" />

            <section className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="mb-10 text-center">
                    <p className="mb-2 text-xs uppercase tracking-[0.45em] text-amber-300/70">The Wandmaker's Archive</p>
                    <h1 className="font-serif text-4xl tracking-wide text-amber-50 sm:text-6xl">Wand Spells</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-stone-400 sm:text-base">
                        Browse the spell catalogue, inspect each custom wand-motion path, and preview the casting gesture.
                    </p>
                </header>

                <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)_380px]">
                    <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
                        <div className="mb-4">
                            <label htmlFor="spell-search" className="mb-2 block text-xs uppercase tracking-[0.2em] text-stone-500">
                                Search
                            </label>
                            <input
                                id="spell-search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Lumos, shield, memory..."
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-300/40"
                            />
                        </div>

                        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
                            {categories.map((item) => {
                                const active = category === item;
                                return (
                                    <button
                                        key={item}
                                        onClick={() => setCategory(item)}
                                        className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs transition lg:block lg:w-full ${active
                                                ? 'bg-amber-200/10 text-amber-200'
                                                : 'text-stone-500 hover:bg-white/5 hover:text-stone-200'
                                            }`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="border-t border-white/10 pt-4 text-xs text-stone-600">
                            {filteredSpells.length} of {wandSpells.length} spells
                        </p>
                    </aside>

                    <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-3 backdrop-blur sm:p-4">
                        <div className="grid max-h-[720px] gap-1 overflow-y-auto pr-1">
                            {filteredSpells.map((spell) => {
                                const selected = selectedSpell.id === spell.id;

                                return (
                                    <button
                                        key={spell.id}
                                        onClick={() => {
                                            setSelectedSpell(spell);
                                            setIsCasting(false);
                                        }}
                                        className={`group flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition ${selected
                                                ? 'border-amber-300/30 bg-amber-200/[0.06]'
                                                : 'border-transparent hover:border-white/10 hover:bg-white/[0.035]'
                                            }`}
                                    >
                                        <span className="w-7 shrink-0 text-right font-mono text-[10px] text-stone-700">
                                            {String(spell.id).padStart(2, '0')}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className={`block truncate font-serif text-lg ${selected ? 'text-amber-100' : 'text-stone-200'}`}>
                                                {spell.name}
                                            </span>
                                            <span className="mt-0.5 block truncate text-xs text-stone-600">{spell.type}</span>
                                        </span>
                                        <span className="text-xs text-stone-700 transition group-hover:text-amber-300">↗</span>
                                    </button>
                                );
                            })}

                            {filteredSpells.length === 0 && (
                                <div className="grid min-h-52 place-items-center text-center text-sm text-stone-600">
                                    No spells match your search.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="lg:sticky lg:top-6 lg:self-start">
                        <div className="overflow-hidden rounded-2xl border border-amber-200/10 bg-[#0b1712] shadow-2xl shadow-black/20">
                            <div className="relative aspect-square overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(217,180,107,.10),transparent_45%)]">
                                <div className={`absolute inset-0 transition-opacity duration-300 ${isCasting ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/20 blur-3xl cast-flash" />
                                </div>

                                <div className="absolute left-5 top-5 flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${isCasting ? 'bg-amber-200 shadow-[0_0_18px_rgba(255,235,170,.9)]' : 'bg-stone-700'}`} />
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-stone-600">
                                        {isCasting ? 'Casting' : 'Ready'}
                                    </span>
                                </div>

                                <svg viewBox={selectedSpell.svg.viewBox} className="h-full w-full p-14">
                                    <defs>
                                        <filter id="wandGlow" x="-80%" y="-80%" width="260%" height="260%">
                                            <feGaussianBlur stdDeviation="1.6" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {showPath && (
                                        <path
                                            key={`${selectedSpell.id}-${isCasting}`}
                                            d={selectedSpell.svg.path}
                                            fill="none"
                                            pathLength={1}
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`text-amber-200/80 ${isCasting ? 'wand-path' : 'opacity-35'}`}
                                            filter="url(#wandGlow)"
                                        />
                                    )}

                                    <circle cx="50" cy="90" r="1.8" className="fill-amber-100/70" />
                                </svg>

                                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600">Gesture</p>
                                        <p className="mt-1 max-w-[250px] text-xs leading-5 text-stone-400">{selectedSpell.svg.gesture}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPath((value) => !value)}
                                        className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 transition hover:border-amber-200/20 hover:text-amber-200"
                                    >
                                        {showPath ? 'Hide path' : 'Show path'}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-5">
                                    <p className="text-xs uppercase tracking-[0.25em] text-amber-300/50">{selectedSpell.type}</p>
                                    <h2 className="mt-2 font-serif text-4xl text-amber-50">{selectedSpell.name}</h2>
                                </div>

                                <p className="text-sm leading-7 text-stone-400">{selectedSpell.explanation}</p>

                                <button
                                    onClick={castSpell}
                                    className="mt-6 w-full rounded-xl border border-amber-200/20 bg-amber-200/[0.07] px-4 py-3 text-xs uppercase tracking-[0.28em] text-amber-100 transition hover:bg-amber-200/[0.12] active:scale-[0.99]"
                                >
                                    Cast Spell
                                </button>

                                <div className="mt-5 border-t border-white/10 pt-5">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-600">SVG path</span>
                                        <span className="font-mono text-[10px] text-stone-700">0 0 100 100</span>
                                    </div>
                                    <code className="block max-h-24 overflow-auto rounded-lg bg-black/20 p-3 font-mono text-[10px] leading-5 text-stone-500">
                                        {selectedSpell.svg.path}
                                    </code>
                                </div>

                                <p className="mt-4 text-[10px] leading-5 text-stone-700">
                                    The spell effect is canon-inspired. The SVG is a custom web UI gesture, not an official canonical wand-motion specification.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </section>

            <style jsx>{`
        .wand-path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: draw-path 0.9s cubic-bezier(.2,.8,.2,1) forwards, pulse-path 0.75s 0.9s ease-out forwards;
        }

        .cast-flash {
          animation: flash 0.9s ease-out forwards;
        }

        @keyframes draw-path {
          to { stroke-dashoffset: 0; }
        }

        @keyframes pulse-path {
          0% { opacity: 1; filter: drop-shadow(0 0 10px rgba(255,235,170,.85)); }
          100% { opacity: .45; filter: drop-shadow(0 0 2px rgba(255,235,170,.2)); }
        }

        @keyframes flash {
          0% { transform: translate(-50%, -50%) scale(.25); opacity: 0; }
          25% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }
      `}</style>
        </main>
    );
}
