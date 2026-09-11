"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type NativeSelectProps = React.ComponentProps<"select">;

interface SelectProps extends Omit<
  NativeSelectProps,
  "children" | "multiple" | "size" | "defaultValue" | "value"
> {
  children: React.ReactNode;
  defaultValue?: string | number;
  value?: string | number;
  placeholder?: string;
}

interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled: boolean;
}

function getOptions(children: React.ReactNode): SelectOption[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<React.ComponentProps<"option">>(child)) return [];
    if (child.type !== "option") return [];
    return [
      {
        value: String(child.props.value ?? child.props.children ?? ""),
        label: child.props.children,
        disabled: Boolean(child.props.disabled),
      },
    ];
  });
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      children,
      className,
      defaultValue,
      value,
      onChange,
      onBlur,
      disabled,
      required,
      name,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      placeholder,
      ...props
    },
    forwardedRef,
  ) => {
    const options = React.useMemo(() => getOptions(children), [children]);
    const initialValue = String(
      defaultValue ?? options.find((option) => !option.disabled)?.value ?? "",
    );
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState(initialValue);
    const nativeRef = React.useRef<HTMLSelectElement | null>(null);
    const controlled = value !== undefined;
    const selectedValue = controlled ? String(value) : uncontrolledValue;

    const assignRef = React.useCallback(
      (node: HTMLSelectElement | null) => {
        nativeRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
        if (!controlled && node) {
          window.queueMicrotask(() => setUncontrolledValue(node.value));
        }
      },
      [controlled, forwardedRef],
    );

    function change(nextValue: string | null) {
      if (nextValue === null) return;
      if (!controlled) setUncontrolledValue(nextValue);
      const native = nativeRef.current;
      if (!native) return;
      native.value = nextValue;
      onChange?.({
        target: native,
        currentTarget: native,
      } as React.ChangeEvent<HTMLSelectElement>);
    }

    function blur() {
      const native = nativeRef.current;
      if (!native) return;
      onBlur?.({
        target: native,
        currentTarget: native,
      } as React.FocusEvent<HTMLSelectElement>);
    }

    return (
      <>
        <select
          {...props}
          ref={assignRef}
          name={name}
          value={selectedValue}
          onChange={() => undefined}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        >
          {children}
        </select>
        <BaseSelect.Root
          items={options.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          value={selectedValue}
          onValueChange={change}
          disabled={disabled}
          required={required}
        >
          <BaseSelect.Trigger
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            onBlur={blur}
            data-slot="select"
            className={cn(
              "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-1 text-left text-sm shadow-xs transition-[border-color,box-shadow,background-color] outline-none select-none hover:bg-muted/35 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 data-disabled:cursor-not-allowed data-disabled:bg-muted/70 data-disabled:opacity-70",
              className,
            )}
          >
            <BaseSelect.Value
              placeholder={placeholder}
              className="min-w-0 flex-1 truncate data-placeholder:text-muted-foreground"
            />
            <BaseSelect.Icon className="shrink-0 text-muted-foreground">
              <ChevronDown className="size-3.5" />
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
          <BaseSelect.Portal>
            <BaseSelect.Positioner
              sideOffset={5}
              alignItemWithTrigger={false}
              className="z-60 outline-none"
            >
              <BaseSelect.Popup className="min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_18px_44px_rgba(55,39,31,.14)] transition-[transform,opacity] duration-150 data-ending-style:scale-[.98] data-ending-style:opacity-0 data-starting-style:scale-[.98] data-starting-style:opacity-0">
                <BaseSelect.ScrollUpArrow className="flex h-6 items-center justify-center bg-popover text-muted-foreground">
                  <ChevronUp className="size-3" />
                </BaseSelect.ScrollUpArrow>
                <BaseSelect.List className="max-h-[min(18rem,var(--available-height))] scroll-py-1 overflow-y-auto p-1 outline-none">
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className="grid min-h-9 cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-45"
                    >
                      <BaseSelect.ItemIndicator className="text-primary">
                        <Check className="size-3.5" />
                      </BaseSelect.ItemIndicator>
                      <BaseSelect.ItemText className="truncate">
                        {option.label}
                      </BaseSelect.ItemText>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
                <BaseSelect.ScrollDownArrow className="flex h-6 items-center justify-center bg-popover text-muted-foreground">
                  <ChevronDown className="size-3" />
                </BaseSelect.ScrollDownArrow>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
      </>
    );
  },
);
Select.displayName = "Select";

export { Select };
export type { SelectProps };
