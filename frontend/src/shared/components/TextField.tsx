interface Props {
  name: string;
  label: string;
  value: string;
  touched: boolean;
  errors: readonly unknown[];
  maxLength: number;
  multiline?: boolean;
  type?: "text" | "number" | "email" | "password" | "tel" | "url";
  autoComplete?: string;
  step?: number | string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function TextField({
  name,
  label,
  value,
  touched,
  errors,
  maxLength,
  multiline,
  type = "text",
  autoComplete,
  step = 0.01,
  onChange,
  onBlur,
}: Props) {
  const messages = touched
    ? errors.filter((error): error is string => typeof error === "string")
    : [];
  const props = {
    id: name,
    name,
    value,
    maxLength,
    onBlur,
    onChange: (event: { target: { value: string } }) =>
      onChange(event.target.value),
    "aria-invalid": messages.length > 0,
    "aria-describedby": `${name}-error`,
    className: "field",
  };
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {multiline ? (
        <textarea {...props} rows={3} />
      ) : (
        <input
          {...props}
          type={type}
          autoComplete={autoComplete}
          {...(type === "number" ? { min: 0, step } : {})}
        />
      )}
      <p
        id={`${name}-error`}
        className="mt-1.5 text-sm text-danger"
        role={messages.length ? "alert" : undefined}
      >
        {messages.join(" · ")}
      </p>
    </div>
  );
}

interface BoundProps
  extends Omit<
    Props,
    "name" | "value" | "touched" | "errors" | "onChange" | "onBlur"
  > {
  field: {
    name: string;
    state: {
      value: string;
      meta: { isTouched: boolean; errors: readonly unknown[] };
    };
    handleChange: (value: string) => void;
    handleBlur: () => void;
  };
}

export function BoundTextField({ field, ...props }: BoundProps) {
  return (
    <TextField
      {...props}
      name={field.name}
      value={field.state.value}
      touched={field.state.meta.isTouched}
      errors={field.state.meta.errors}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
    />
  );
}
