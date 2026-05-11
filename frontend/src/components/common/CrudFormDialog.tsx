import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type CrudFieldOption = {
  label: string;
  value: string;
};

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "datetime-local" | "time" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: CrudFieldOption[];
  description?: string;
  validate?: (value: string, values: Record<string, string>) => string | undefined;
};

type CrudFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: CrudField[];
  initialValues: Record<string, string>;
  values?: Record<string, string>;
  onValuesChange?: (values: Record<string, string>) => void;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
};

export function CrudFormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialValues,
  values: controlledValues,
  onValuesChange,
  submitLabel,
  pending = false,
  onSubmit,
}: CrudFormDialogProps) {
  const [internalValues, setInternalValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const wasOpenRef = useRef(false);
  const isControlled = controlledValues !== undefined;
  const resolvedValues = isControlled ? controlledValues : internalValues;

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      if (!isControlled) {
        setInternalValues(initialValues);
      }

      onValuesChange?.(initialValues);
      setErrors({});
      wasOpenRef.current = true;
      return;
    }

    if (!open) {
      wasOpenRef.current = false;
      setErrors({});
    }
  }, [initialValues, isControlled, onValuesChange, open]);

  const validateField = (field: CrudField, values: Record<string, string>) => {
    const value = values[field.name] ?? "";
    const normalizedValue = value.trim();

    if (field.required && normalizedValue.length === 0) {
      return `${field.label} không được để trống.`;
    }

    if (
      field.type === "email" &&
      normalizedValue &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)
    ) {
      return `${field.label} không đúng định dạng email.`;
    }

    return field.validate?.(value, values);
  };

  const validateValues = (values: Record<string, string>) => {
    const nextErrors: Record<string, string> = {};

    for (const field of fields) {
      const error = validateField(field, values);
      if (error) {
        nextErrors[field.name] = error;
      }
    }

    return nextErrors;
  };

  const setValue = (name: string, value: string) => {
    const nextValues = { ...resolvedValues, [name]: value };

    if (!isControlled) {
      setInternalValues(nextValues);
    }

    onValuesChange?.(nextValues);

    const field = fields.find((item) => item.name === name);
    if (!field) return;

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      const error = validateField(field, nextValues);

      if (error) {
        nextErrors[name] = error;
      } else {
        delete nextErrors[name];
      }

      return nextErrors;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();

            const nextErrors = validateValues(resolvedValues);
            setErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
              return;
            }

            try {
              await onSubmit(resolvedValues);
            } catch {
              // Parent mutation handlers already surface submit failures.
            }
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const error = errors[field.name];

              return (
                <div
                  key={field.name}
                  className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}
                >
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      value={resolvedValues[field.name] ?? ""}
                      required={field.required}
                      aria-invalid={Boolean(error)}
                      className={cn(error && "border-destructive focus-visible:ring-destructive")}
                      onChange={(event) => setValue(field.name, event.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={resolvedValues[field.name] ?? ""}
                      onValueChange={(value) => setValue(field.name, value)}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={Boolean(error)}
                        className={cn(error && "border-destructive focus:ring-destructive")}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options || []).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type || "text"}
                      value={resolvedValues[field.name] ?? ""}
                      required={field.required}
                      aria-invalid={Boolean(error)}
                      className={cn(error && "border-destructive focus-visible:ring-destructive")}
                      onChange={(event) => setValue(field.name, event.target.value)}
                    />
                  )}
                  {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Đang lưu..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
