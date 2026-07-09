"use client";
import { useMemo, useState } from "react";
import { getCategoryList } from "@/lib/demoTemplates/renderTemplate";

/**
 * GeminiFallbackModal
 *
 * Shown ONLY when the Gemini call throws (429 / quota / 500 / network /
 * timeout / invalid JSON). Never shown as an error — it's framed as an
 * upgrade path: "generate instantly from premium templates instead."
 *
 * onSelectCategory(categoryKey) should trigger renderTemplate() locally.
 * No network calls happen inside this component.
 */
export default function GeminiFallbackModal({ open, onSelectCategory, onClose }) {
  const [query, setQuery] = useState("");
  const categories = useMemo(() => getCategoryList(), []);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter((c) => c.label.toLowerCase().includes(q));
  }, [categories, query]);

  if (!open) return null;

  return (
    <div className="gfm-overlay" role="dialog" aria-modal="true" aria-labelledby="gfm-title">
      <style>{CSS}</style>
      <div className="gfm-backdrop" onClick={onClose} />

      <div className="gfm-panel">
        <button className="gfm-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="gfm-header">
          <span className="gfm-eyebrow">Instant Demo</span>
          <h2 id="gfm-title" className="gfm-title">
            Gemini is temporarily unavailable
          </h2>
          <p className="gfm-subtitle">
            You can still generate a professional demo website instantly using our premium templates.
          </p>
        </div>

        <div className="gfm-search-wrap">
          <svg className="gfm-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="gfm-search"
            type="text"
            placeholder="Search a category — restaurant, salon, gym…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="gfm-chip-row">
          {categories.slice(0, 8).map((c) => (
            <button
              key={c.key}
              className="gfm-chip"
              style={{ "--chip-color": c.accentColor }}
              onClick={() => setQuery(c.label)}
            >
              <span className="gfm-chip-emoji">{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="gfm-grid">
          {filtered.map((c) => (
            <button
              key={c.key}
              className="gfm-card"
              style={{ "--card-primary": c.primaryColor, "--card-accent": c.accentColor }}
              onClick={() => onSelectCategory(c.key)}
            >
              <div className="gfm-card-glow" />
              <div className="gfm-card-emoji">{c.emoji}</div>
              <div className="gfm-card-label">{c.label}</div>
              <div className="gfm-card-cta">Generate Demo →</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="gfm-empty">No templates match "{query}" — try another search.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const CSS = `
.gfm-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.gfm-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 120% at 50% 0%, rgba(20,19,26,0.72), rgba(8,8,12,0.92));
  backdrop-filter: blur(6px);
}
.gfm-panel {
  position: relative;
  width: 100%;
  max-width: 880px;
  max-height: 86vh;
  overflow-y: auto;
  border-radius: 28px;
  padding: 40px 40px 32px;
  background: linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 30px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  font-family: 'Inter', system-ui, sans-serif;
  color: #F3F1FF;
  animation: gfm-rise 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes gfm-rise {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.gfm-close {
  position: absolute;
  top: 20px;
  right: 24px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.06);
  color: #F3F1FF;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.gfm-close:hover { background: rgba(255,255,255,0.16); transform: rotate(90deg); }

.gfm-header { text-align: center; margin-bottom: 28px; }
.gfm-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #C9C3F5;
  background: rgba(160,140,255,0.14);
  border: 1px solid rgba(160,140,255,0.28);
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 16px;
}
.gfm-title {
  font-family: 'Fraunces', 'Playfair Display', serif;
  font-size: clamp(24px, 3.4vw, 34px);
  font-weight: 600;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}
.gfm-subtitle {
  font-size: 15.5px;
  line-height: 1.5;
  color: rgba(243,241,255,0.72);
  max-width: 520px;
  margin: 0 auto;
}

.gfm-search-wrap {
  position: relative;
  margin: 0 auto 18px;
  max-width: 480px;
}
.gfm-search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(243,241,255,0.5);
}
.gfm-search {
  width: 100%;
  padding: 13px 16px 13px 44px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.06);
  color: #F3F1FF;
  font-size: 14.5px;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.gfm-search::placeholder { color: rgba(243,241,255,0.42); }
.gfm-search:focus { border-color: rgba(160,140,255,0.6); background: rgba(255,255,255,0.09); }

.gfm-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 26px;
}
.gfm-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.05);
  color: rgba(243,241,255,0.85);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
}
.gfm-chip:hover {
  border-color: var(--chip-color);
  background: rgba(255,255,255,0.1);
  transform: translateY(-1px);
}
.gfm-chip-emoji { font-size: 14px; }

.gfm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}
.gfm-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 22px 14px 18px;
  border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(150deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02));
  cursor: pointer;
  text-align: left;
  color: #F3F1FF;
  transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), border-color 0.22s ease, box-shadow 0.22s ease;
}
.gfm-card:hover {
  transform: translateY(-4px);
  border-color: var(--card-accent);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--card-accent) inset;
}
.gfm-card-glow {
  position: absolute;
  top: -40%;
  right: -30%;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--card-primary), transparent 70%);
  opacity: 0.35;
  filter: blur(10px);
  pointer-events: none;
  transition: opacity 0.22s ease;
}
.gfm-card:hover .gfm-card-glow { opacity: 0.6; }
.gfm-card-emoji { font-size: 30px; margin-bottom: 10px; }
.gfm-card-label { font-size: 14.5px; font-weight: 600; margin-bottom: 6px; }
.gfm-card-cta {
  font-size: 12px;
  color: var(--card-accent);
  font-weight: 500;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.gfm-card:hover .gfm-card-cta { opacity: 1; transform: translateY(0); }

.gfm-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px 0;
  color: rgba(243,241,255,0.55);
  font-size: 14px;
}
`;