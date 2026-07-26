import Disclaimer from "./Disclaimer";

const stageColor = "var(--signal-positive)";
const lineColor = "var(--border-strong)";
const boxFill = "var(--bg-surface)";
const boxStroke = "var(--border-hairline)";
const textColor = "var(--text-primary)";
const subTextColor = "var(--text-tertiary)";

function PipelineDiagram() {
  return (
    <svg viewBox="0 0 900 260" className="w-full h-auto" role="img" aria-label="Data pipeline flowchart">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={lineColor} />
        </marker>
      </defs>

      {/* Stage 1: Input */}
      <g className="diagram-fade" style={{ animationDelay: "0s" }}>
        <rect x="10" y="100" width="120" height="60" rx="10" fill={boxFill} stroke={boxStroke} />
        <text x="70" y="126" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor} fontFamily="monospace">
          Ticker
        </text>
        <text x="70" y="142" textAnchor="middle" fontSize="10" fill={subTextColor}>
          user input
        </text>
      </g>

      <path className="diagram-flow-line" d="M130 130 H175" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Stage 2: Parallel fetch */}
      <g className="diagram-fade" style={{ animationDelay: "0.15s" }}>
        <rect x="180" y="40" width="140" height="55" rx="10" fill={boxFill} stroke={boxStroke} />
        <text x="250" y="63" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor}>NewsAPI</text>
        <text x="250" y="78" textAnchor="middle" fontSize="10" fill={subTextColor}>relevance-filtered</text>

        <rect x="180" y="165" width="140" height="55" rx="10" fill={boxFill} stroke={boxStroke} />
        <text x="250" y="188" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor}>yfinance</text>
        <text x="250" y="203" textAnchor="middle" fontSize="10" fill={subTextColor}>price history</text>
      </g>

      <path className="diagram-flow-line" d="M70 100 V67 H180" fill="none" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path className="diagram-flow-line" d="M70 160 V193 H180" fill="none" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path className="diagram-flow-line" d="M320 67 H345 V115 H395" fill="none" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path className="diagram-flow-line" d="M320 193 H345 V145 H395" fill="none" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Stage 3: Processing */}
      <g className="diagram-fade" style={{ animationDelay: "0.3s" }}>
        <rect x="400" y="40" width="140" height="55" rx="10" fill={boxFill} stroke={boxStroke} />
        <text x="470" y="63" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor}>FinBERT</text>
        <text x="470" y="78" textAnchor="middle" fontSize="10" fill={subTextColor}>sentiment score</text>

        <rect
          className="diagram-pulse"
          x="400" y="165" width="285" height="55" rx="10"
          fill={boxFill} stroke={stageColor} strokeWidth="1.5"
        />
        <text x="542" y="188" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor}>Correlation Engine</text>
        <text x="542" y="203" textAnchor="middle" fontSize="10" fill={subTextColor}>sentiment vs. price → alignment verdict</text>
      </g>

      <path className="diagram-flow-line" d="M540 67 H565" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Stage 4: Agent */}
      <g className="diagram-fade" style={{ animationDelay: "0.45s" }}>
        <rect
          className="diagram-pulse"
          x="570" y="40" width="140" height="55" rx="10"
          fill={boxFill} stroke={stageColor} strokeWidth="1.5"
        />
        <text x="640" y="63" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor}>LangGraph</text>
        <text x="640" y="78" textAnchor="middle" fontSize="10" fill={subTextColor}>3-node agent</text>
      </g>

      <path className="diagram-flow-line" d="M650 165 V95" fill="none" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path className="diagram-flow-line" d="M710 67.5 H730 V152 H735" fill="none" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path className="diagram-flow-line" d="M685 192.5 H720 V140 H735" fill="none" stroke={lineColor} strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Stage 5: Output */}
      <g className="diagram-fade" style={{ animationDelay: "0.6s" }}>
        <rect x="740" y="100" width="150" height="60" rx="10" fill={boxFill} stroke={boxStroke} />
        <text x="815" y="123" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor}>Report</text>
        <text x="815" y="138" textAnchor="middle" fontSize="10" fill={subTextColor}>price + sentiment</text>
        <text x="815" y="151" textAnchor="middle" fontSize="10" fill={subTextColor}>+ written brief</text>
      </g>
    </svg>
  );
}

function AgentDiagram() {
  const nodes = [
    { label: "extract_facts", desc: "pulls clean numbers from raw data" },
    { label: "write_brief", desc: "LLM writes the narrative" },
    { label: "review_brief", desc: "self-checks for hallucination + advice" },
  ];

  return (
    <svg viewBox="0 0 720 110" className="w-full h-auto" role="img" aria-label="LangGraph agent internal flow">
      <defs>
        <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={lineColor} />
        </marker>
      </defs>
      {nodes.map((n, i) => (
        <g key={n.label} className="diagram-fade" style={{ animationDelay: `${i * 0.2}s` }}>
          <rect
            className={i === 2 ? "diagram-pulse" : ""}
            x={20 + i * 240}
            y="20"
            width="200"
            height="65"
            rx="10"
            fill={boxFill}
            stroke={i === 2 ? stageColor : boxStroke}
            strokeWidth={i === 2 ? 1.5 : 1}
          />
          <text x={120 + i * 240} y="45" textAnchor="middle" fontSize="12" fontWeight="600" fill={textColor} fontFamily="monospace">
            {n.label}
          </text>
          <text x={120 + i * 240} y="62" textAnchor="middle" fontSize="9.5" fill={subTextColor}>
            {n.desc}
          </text>
          {i < 2 && (
            <path
              className="diagram-flow-line"
              d={`M${220 + i * 240} 52 H${260 + i * 240}`}
              stroke={lineColor}
              strokeWidth="1.5"
              markerEnd="url(#arrow2)"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl p-6 md:p-7 mb-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}>
      <h2 className="font-display text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function HowItWorks({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10 md:py-14">
      <button
        type="button"
        onClick={onBack}
        className="font-mono text-xs mb-6 hover:opacity-70 transition"
        style={{ color: "var(--text-primary)" }}
      >
        ← Back to Dashboard
      </button>

      <h1 className="font-display text-2xl md:text-[28px] font-semibold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
        How MarketSynapse Works
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        A look under the hood — the real pipeline, the real tradeoffs, and where it's still imperfect.
      </p>

      <Section title="The pipeline">
        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          A ticker goes through five stages before you see a report. News and price data are fetched
          in parallel, since they don't depend on each other — this keeps the total wait time closer to
          the slower of the two calls rather than the sum of both.
        </p>
        <PipelineDiagram />
      </Section>

      <Section title="The AI agent, in detail">
        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          The LangGraph agent isn't one prompt — it's three chained steps. The third step is a
          self-correction pass: the model re-checks its own draft against the source facts before
          anything reaches you.
        </p>
        <AgentDiagram />
      </Section>

      <Section title="Why sentiment and price sometimes disagree">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          The "alignment" verdict (aligned / diverged / mixed) exists because news sentiment and price
          movement often <em>don't</em> tell the same story — a stock can rise on factors never
          mentioned in that week's headlines (buybacks, sector rotation, options flow), or fall despite
          neutral coverage. MarketSynapse surfaces that mismatch instead of forcing a narrative that
          fits.
        </p>
      </Section>

      <Section title="Known limitations — stated plainly">
        <ul className="text-sm space-y-2.5" style={{ color: "var(--text-secondary)" }}>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>FinBERT</strong> is trained on financial
            language, but can misread routine corporate news (e.g. a neutral dividend announcement) as
            negative — it's a domain model, not a perfect one.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>The self-correction node</strong> reliably
            catches explicit investment advice, but is measurably less reliable at catching subtler
            hallucinated details with the small, fast model used here. A larger model would likely do
            better; this is a documented capability limit, not an unfixed bug.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>yfinance</strong> is an unofficial Yahoo
            Finance scraper with no formal uptime guarantee — occasional transient failures are expected.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>The eval harness</strong> uses
            keyword/substring checks, not semantic verification — a passing score reflects the
            heuristic's coverage, not a guarantee of perfect output.
          </li>
        </ul>
      </Section>

      <Disclaimer />
    </div>
  );
}