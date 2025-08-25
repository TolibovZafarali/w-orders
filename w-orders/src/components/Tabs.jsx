export default function Tabs({ value, onChange, tabs }) {
    return (
      <div className="tabs" role="tablist" aria-label="Mode">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            className="tab-btn"
            aria-selected={value === t.id}
            onClick={() => onChange?.(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
}
  