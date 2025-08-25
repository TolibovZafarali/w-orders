export default function Tabs({ value, onChange }) {
  const tabs = [
    { id: "shopping", label: "Shopping", icon: "shopping_bag" },
    { id: "pickup",   label: "Pickup",   icon: "local_shipping" },
  ];
  return (
    <div className="tabs" role="tablist" aria-label="Mode">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          className="tab-btn"
          aria-selected={value === t.id}
          aria-label={t.label}
          onClick={() => onChange?.(t.id)}
          title={t.label}
        >
          <span className="ms">{t.icon}</span>
        </button>
      ))}
    </div>
  );
}
