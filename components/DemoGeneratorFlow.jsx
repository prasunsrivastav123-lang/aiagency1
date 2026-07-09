import { useState } from "react";
import { useRouter } from "next/router";
import GeminiFallbackModal from "./GeminiFallbackModal";
import { renderTemplate } from "../lib/demoTemplates/renderTemplate";

/**
 * DemoGeneratorFlow
 *
 * Wraps your existing "Generate Demo" button. The Gemini path is
 * untouched — this only adds what happens on failure:
 *
 *   Generate Demo click
 *     -> POST /api/generate-demo
 *        -> success: open preview (unchanged)
 *        -> fallbackRequired: open GeminiFallbackModal
 *             -> user picks a category
 *             -> renderTemplate() runs in the browser (0 API calls)
 *             -> POST /api/save-local-demo (same shape as Gemini save)
 *             -> open preview (same page component, same props)
 */
export default function DemoGeneratorFlow({ business, prompt }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  async function handleGenerateDemo() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, prompt }),
      });
      const data = await res.json();

      if (data.fallbackRequired) {
        // Never shown as an error — straight into the premium picker.
        setFallbackOpen(true);
        return;
      }

      router.push(`/preview/${data.id}`);
    } catch (e) {
      // Network failure reaching our own API also routes to the fallback,
      // since the user should never see a raw error state.
      setFallbackOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectCategory(categoryKey) {
    const demo = renderTemplate(categoryKey, business); // 0 API calls

    const res = await fetch("/api/save-local-demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business, demo }),
    });
    const data = await res.json();

    setFallbackOpen(false);
    router.push(`/preview/${data.id}`); // same preview page as Gemini demos
  }

  return (
    <>
      <button onClick={handleGenerateDemo} disabled={loading}>
        {loading ? "Generating…" : "Generate Demo"}
      </button>

      <GeminiFallbackModal
        open={fallbackOpen}
        onSelectCategory={handleSelectCategory}
        onClose={() => setFallbackOpen(false)}
      />
    </>
  );
}