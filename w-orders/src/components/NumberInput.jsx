import { useId } from "react";

/**
 * Icon-first number input.
 * - Renders icon or $/mi as prefix/suffix; hides text labels visually.
 * - Hides 0 by default so fields look blank until typed.
 */
export default function NumberInput({
  label,           // still used for aria-label
  value,
  onChange,
  id,
  min = 0,
  step = 1,
  placeholder = "",
  suffix = "",     // e.g., "mi", "×"
  prefix = "",     // e.g., "$"
  icon = "",       // material symbol name, e.g., "near_me", "group"
  disabled = false,
  hideZero = true,
}) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const handleChange = (e) => {
    const raw = e.target.value;
    const n = Number(raw);
    onChange?.(Number.isFinite(n) ? n : 0);
  };

  const handleBlur = (e) => {
    const n = Number(e.target.value);
    const v = Number.isFinite(n) ? n : 0;
    const clamped = Math.max(min, v);
    if (clamped !== v) onChange?.(clamped);
  };

  const displayValue = hideZero && value === 0 ? "" : value;

  return (
    <div className="form-row">
      {/* visually hidden label for a11y */}
      {label && (
        <label htmlFor={inputId} style={{ position:'absolute', width:1, height:1, margin:-1, padding:0, overflow:'hidden', clip:'rect(0 0 0 0)', border:0 }}>
          {label}
        </label>
      )}
      <div className="ni-wrap">
        {/* Icon OR prefix */}
        {icon ? (
          <span className="ni-prefix"><span className="ms">{icon}</span></span>
        ) : prefix ? (
          <span className="ni-prefix">{prefix}</span>
        ) : null}

        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          className="ni-input"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          step={step}
          placeholder={placeholder}
          aria-label={label || icon || prefix || suffix}
          disabled={disabled}
        />

        {/* Suffix */}
        {suffix ? <span className="ni-suffix">{suffix}</span> : null}
      </div>
    </div>
  );
}
