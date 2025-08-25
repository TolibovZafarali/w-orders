import { useId } from "react";

export default function NumberInput({
  label,
  value,
  onChange,
  id,
  min = 0,
  step = 1,
  placeholder = "",
  suffix = "",
  prefix = "",
  disabled = false,
  hideZero = true,   // NEW: default behavior hides 0
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

  // 👇 show empty when value is 0 (and hideZero is on)
  const displayValue =
    hideZero && value === 0 ? "" : value;

  return (
    <div className="form-row">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="ni-wrap">
        {prefix ? <span className="ni-affix ni-prefix">{prefix}</span> : null}
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
          disabled={disabled}
        />
        {suffix ? <span className="ni-affix ni-suffix">{suffix}</span> : null}
      </div>
    </div>
  );
}
