import React from 'react';
import { X, Heart, Coffee, Code, Music, Zap, Users, Palette, Server, GitBranch } from 'lucide-react';

export function AboutPanel({ onClose }: { onClose: () => void }) {
  const version = '1.0.0';
  const buildDate = '2026-11-11';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close about panel"
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-3">
              <Coffee size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Tiny Office Life</h1>
            <p className="text-white/80 text-sm mt-1">v{version} • {buildDate}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Heart className="text-rose-500" size={18} />
              What is this?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Tiny Office Life is a charming <strong>isometric pixel-art office simulation</strong> where 5 autonomous characters
              live out their workday — coding, designing, managing, taking coffee breaks, chatting by the water cooler,
              and occasionally napping on the sofa.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Everything you see and hear is <strong>100% procedurally generated at runtime</strong> — no external images, fonts,
              or audio files. The sprites, sounds, and even the wall clock hands are drawn in real-time via code.
            </p>
          </section>

          {/* Meet the Team */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="text-emerald-500" size={18} />
              Meet the Team
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { id: 'alex', name: 'Alex', role: 'Senior Full-Stack Dev', color: '#2563eb', emoji: '👨‍💻', trait: 'Types at 120 WPM' },
                { id: 'sarah', name: 'Sarah', role: 'Lead UI/UX Designer', color: '#f43f5e', emoji: '🎨', trait: 'Waters the plants' },
                { id: 'mike', name: 'Mike', role: 'Office Manager', color: '#eab308', emoji: '☕', trait: 'Keeps coffee flowing' },
                { id: 'toby', name: 'Toby', role: 'Engineering Intern', color: '#10b981', emoji: '🌱', trait: 'Coffee enthusiast' },
                { id: 'kevin', name: 'Kevin', role: 'Backend Architect', color: '#a855f7', emoji: '😴', trait: 'Power napper' },
              ].map(member => (
                <div
                  key={member.id}
                  className="group p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                  style={{ borderLeft: `4px solid ${member.color}` }}
                >
                  <div className="text-2xl mb-1">{member.emoji}</div>
                  <div className="font-semibold text-slate-800">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.role}</div>
                  <div className="text-xs text-slate-400 mt-1 italic">{member.trait}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Zap className="text-amber-500" size={18} />
              Key Features
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Code, color: 'text-blue-500', title: 'Procedural Pixel Art', desc: '120 character sprites + 14 furniture types generated at runtime' },
                { icon: Music, color: 'text-violet-500', title: 'Procedural Audio', desc: 'Web Audio API synthesis — keyboard clacks, coffee bubbles, Zzz' },
                { icon: Palette, color: 'text-rose-500', title: 'Dynamic Lighting', desc: 'Morning → noon → golden hour ambient transitions' },
                { icon: Server, color: 'text-emerald-500', title: 'Autonomous AI', desc: 'Personality-driven decisions, energy management, social behavior' },
                { icon: Coffee, color: 'text-amber-600', title: 'Interactive Camera', desc: 'Pan, zoom (0.6x–2.5x), rotate 90° (Q/E), ripple effects' },
                { icon: GitBranch, color: 'text-indigo-500', title: 'A* Pathfinding', desc: '13×13 grid with dynamic walkability & smooth interpolation' },
              ].map((feature, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-50 ${feature.color}`}>
                      <feature.icon size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{feature.title}</div>
                      <div className="text-sm text-slate-500">{feature.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Code className="text-sky-500" size={18} />
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'React 19', color: 'bg-sky-100 text-sky-700' },
                { name: 'TypeScript 5', color: 'bg-blue-100 text-blue-700' },
                { name: 'Vite 8', color: 'bg-violet-100 text-violet-700' },
                { name: 'PixiJS 8', color: 'bg-rose-100 text-rose-700' },
                { name: 'Tailwind CSS 4', color: 'bg-teal-100 text-teal-700' },
                { name: 'Framer Motion', color: 'bg-pink-100 text-pink-700' },
                { name: 'Lucide React', color: 'bg-slate-100 text-slate-700' },
                { name: 'Bun / npm', color: 'bg-amber-100 text-amber-700' },
              ].map((tech, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${tech.color}`}>
                  {tech.name}
                </span>
              ))}
            </div>
          </section>

          {/* Controls */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Coffee className="text-amber-500" size={18} />
              Controls
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Drag / Touch', 'Pan camera'],
                ['Scroll / Pinch', 'Zoom (0.6x – 2.5x)'],
                ['Q / E keys', 'Rotate camera 90°'],
                ['R key', 'Reset view'],
                ['Click character', 'Open details panel'],
                ['Click furniture', 'Open furniture info'],
                ['Click floor', 'Spawn ripple + deselect'],
                ['TopBar buttons', 'Speed, pause, coffee, end day'],
              ].map(([key, action], i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <kbd className="px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded">{key}</kbd>
                  <span className="text-sm text-slate-600">{action}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Links */}
          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <GitBranch className="text-indigo-500" size={18} />
              Links & Resources
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href="https://tiny-office-life.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <Coffee className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <div className="font-medium text-slate-800">Play Live Demo</div>
                  <div className="text-xs text-slate-500">tiny-office-life.vercel.app</div>
                </div>
              </a>
              <a
                href="https://github.com/Nierowheezy/tiny-office-life"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <GitBranch className="text-slate-500 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <div className="font-medium text-slate-800">GitHub Repository</div>
                  <div className="text-xs text-slate-500">Source code & issues</div>
                </div>
              </a>
              <a
                href="https://github.com/Nierowheezy/tiny-office-life/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors group"
              >
                <Code className="text-violet-500 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <div className="font-medium text-slate-800">Releases</div>
                  <div className="text-xs text-slate-500">v1.0.0 and changelog</div>
                </div>
              </a>
              <a
                href="https://github.com/Nierowheezy/tiny-office-life/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-colors group"
              >
                <Heart className="text-rose-500 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <div className="font-medium text-slate-800">Report Bug / Request Feature</div>
                  <div className="text-xs text-slate-500">GitHub Issues</div>
                </div>
              </a>
            </div>
          </section>

          {/* License */}
          <section className="pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              MIT License — Built with ☕ and 💻 by{' '}
              <a href="https://github.com/Nierowheezy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                Nierowheezy
              </a>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              © 2026 Tiny Office Life. No external assets — 100% procedural.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}