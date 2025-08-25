import { useId } from "react";

/**
 * Small accessible toggle (checkbox under the hood).
 */
export default function Toggle({ label, checked, onChange, id, disabled = false }) {
  const autoId = useId();
  const toggleId = id ?? autoId;

  return (
    <label className="tog">
      <input
        id={toggleId}
        type="checkbox"
        className="tog-input"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <span className="tog-slider" aria-hidden="true" />
      <span className="tog-label">{label}</span>
    </label>
  );
}
