import { useState } from "react";

export default function ExportControls({ brief, ticker }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 print:hidden">
      <button
        onClick={handleCopy}
        className="font-mono text-xs px-3 py-1.5 rounded transition"
        style={{
          background: copied ? "var(--signal-positive)" : "var(--bg-surface-raised)",
          color: copied ? "#04342c" : "var(--text-secondary)",
          border: "1px solid var(--border-hairline)",
        }}
      >
        {copied ? "✓ Copied" : "Copy brief"}
      </button>
      <button
        onClick={handlePrint}
        className="font-mono text-xs px-3 py-1.5 rounded transition"
        style={{
          background: "var(--bg-surface-raised)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-hairline)",
        }}
      >
        Print / Save PDF
      </button>
    </div>
  );
}