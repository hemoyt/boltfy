import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send } from "lucide-react";
import type { FormField, FieldCondition, FormStyle } from "./FormBuilder";
import { defaultFormStyle } from "./FormBuilder";

interface FormPreviewProps {
  name: string;
  description?: string;
  fields: FormField[];
  style?: FormStyle;
  onSubmit?: (data: Record<string, string | boolean>) => Promise<void>;
  isSubmitting?: boolean;
}

function evaluateCondition(
  condition: FieldCondition | undefined,
  formData: Record<string, string | boolean>
): boolean {
  if (!condition || !condition.fieldId) return true;

  const fieldValue = formData[condition.fieldId];
  const stringValue = fieldValue?.toString() || "";
  const compareValue = condition.value || "";

  switch (condition.operator) {
    case "equals":
      return stringValue === compareValue;
    case "not_equals":
      return stringValue !== compareValue;
    case "contains":
      return stringValue.toLowerCase().includes(compareValue.toLowerCase());
    case "not_contains":
      return !stringValue.toLowerCase().includes(compareValue.toLowerCase());
    case "is_empty":
      return !fieldValue || stringValue === "";
    case "is_not_empty":
      return !!fieldValue && stringValue !== "";
    default:
      return true;
  }
}

export function FormPreview({ name, description, fields, style, onSubmit, isSubmitting, onSelectField }: FormPreviewProps & { onSelectField?: (fieldId: string | null) => void }) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStyle = { ...defaultFormStyle, ...style };

  const visibleFields = useMemo(() => {
    return fields.filter((field) => evaluateCondition(field.condition, formData));
  }, [fields, formData]);

  const handleChange = (id: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSelectField) return; // Prevent submit when in design mode

    const newErrors: Record<string, string> = {};
    visibleFields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData: Record<string, string | boolean> = {};
    visibleFields.forEach((field) => {
      if (formData[field.id] !== undefined) {
        submitData[field.id] = formData[field.id];
      }
    });

    if (onSubmit) {
      await onSubmit(submitData);
      setFormData({});
    }
  };

  // Generate background style
  const getBackgroundStyle = () => {
    switch (currentStyle.backgroundStyle) {
      case "gradient":
        return {
          background: `linear-gradient(${currentStyle.gradientDirection}, ${currentStyle.primaryColor}, ${currentStyle.secondaryColor})`,
        };
      case "pattern":
        return {
          background: currentStyle.backgroundColor,
          backgroundImage: `radial-gradient(${currentStyle.primaryColor}15 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        };
      default:
        return { backgroundColor: currentStyle.backgroundColor };
    }
  };

  // Generate button style
  const getButtonStyle = () => {
    const baseStyle = {
      fontSize: `${currentStyle.buttonFontSize || 16}px`,
      borderRadius: `${currentStyle.borderRadius}px`,
    };

    switch (currentStyle.buttonStyle) {
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          color: currentStyle.primaryColor,
          border: `2px solid ${currentStyle.primaryColor}`,
        };
      case "gradient":
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${currentStyle.primaryColor}, ${currentStyle.secondaryColor})`,
          color: currentStyle.buttonTextColor,
          border: "none",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: currentStyle.primaryColor,
          color: currentStyle.buttonTextColor,
          border: "none",
        };
    }
  };

  const inputStyle = {
    borderRadius: `${currentStyle.borderRadius}px`,
    backgroundColor: currentStyle.inputBackground || "transparent",
    borderColor: currentStyle.borderColor || `${currentStyle.textColor}30`,
    color: currentStyle.textColor,
    fontSize: `${currentStyle.inputFontSize || 16}px`,
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];
    const clickHandler = (e: React.MouseEvent) => {
      if (onSelectField) {
        e.stopPropagation();
        onSelectField(field.id);
      }
    };

    switch (field.type) {
      case "textarea":
        return (
          <div onClick={clickHandler}>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={(formData[field.id] as string) || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={`transition-all ${hasError ? "border-red-500 ring-2 ring-red-200" : "focus:ring-2"} ${onSelectField ? "cursor-pointer pointer-events-none" : ""}`}
              style={{
                ...inputStyle,
                ...(hasError ? {} : { "--tw-ring-color": `${currentStyle.primaryColor}40` } as React.CSSProperties),
              }}
              rows={4}
            />
          </div>
        );

      case "select":
        return (
          <div onClick={clickHandler} className={onSelectField ? "pointer-events-none" : ""}>
            <Select value={(formData[field.id] as string) || ""} onValueChange={(v) => handleChange(field.id, v)}>
              <SelectTrigger
                className={`transition-all ${hasError ? "border-red-500" : ""}`}
                style={inputStyle}
              >
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-3" onClick={clickHandler}>
            <Checkbox
              id={field.id}
              checked={(formData[field.id] as boolean) || false}
              onCheckedChange={(checked) => handleChange(field.id, !!checked)}
              className={onSelectField ? "pointer-events-none" : ""}
              style={{
                borderColor: currentStyle.primaryColor,
                backgroundColor: formData[field.id] ? currentStyle.primaryColor : "transparent",
              }}
            />
            <Label
              htmlFor={field.id}
              className={`text-sm font-normal ${onSelectField ? "cursor-pointer" : "cursor-pointer"}`}
              style={{
                color: currentStyle.textColor,
                fontSize: `${currentStyle.labelFontSize || 14}px`
              }}
            >
              {field.placeholder || field.label}
            </Label>
          </div>
        );

      default:
        return (
          <div onClick={clickHandler}>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={(formData[field.id] as string) || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={`transition-all h-12 ${hasError ? "border-red-500 ring-2 ring-red-200" : "focus:ring-2"} ${onSelectField ? "cursor-pointer pointer-events-none" : ""}`}
              style={{
                ...inputStyle,
                ...(hasError ? {} : { "--tw-ring-color": `${currentStyle.primaryColor}40` } as React.CSSProperties),
              }}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={`overflow-hidden shadow-xl relative group ${onSelectField ? "cursor-default" : ""}`}
      style={{
        ...getBackgroundStyle(),
        fontFamily: currentStyle.fontFamily,
        borderRadius: `${currentStyle.borderRadius}px`,
        padding: `${currentStyle.padding}px`,
      }}
      onClick={() => onSelectField?.(null)}
    >
      {/* Logo */}
      {currentStyle.showLogo && currentStyle.logoUrl && (
        <div
          className={`mb-6 ${onSelectField ? "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400 rounded p-2 -m-2 cursor-pointer" : ""}`}
          style={{ textAlign: currentStyle.titleAlignment }}
          onClick={(e) => {
            if (onSelectField) {
              e.stopPropagation();
              onSelectField("branding");
            }
          }}
        >
          <img
            src={currentStyle.logoUrl}
            alt="Logo"
            style={{
              height: currentStyle.logoSize,
              display: "inline-block",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Title & Description */}
      <div
        className={`mb-6 ${onSelectField ? "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400 rounded p-2 -m-2 cursor-pointer" : ""}`}
        style={{ textAlign: currentStyle.titleAlignment }}
        onClick={(e) => {
          if (onSelectField) {
            e.stopPropagation();
            onSelectField("settings");
          }
        }}
      >
        <h2
          className="font-bold mb-2"
          style={{
            color: currentStyle.textColor,
            fontSize: `${currentStyle.titleFontSize || 24}px`
          }}
        >
          {name}
        </h2>
        {description && (
          <p
            className="opacity-75"
            style={{
              color: currentStyle.textColor,
              fontSize: `${(currentStyle.labelFontSize || 14) + 2}px`
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ gap: `${currentStyle.spacing}px` }} className="flex flex-col">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className={`space-y-2 animate-in fade-in-0 duration-200 ${onSelectField
                ? "hover:bg-black/5 hover:backdrop-blur-[1px] rounded-lg p-2 -m-2 border border-transparent hover:border-blue-400/50 transition-all"
                : ""
              }`}
          >
            {field.type !== "checkbox" && (
              <Label
                htmlFor={field.id}
                className="font-medium"
                style={{
                  color: currentStyle.textColor,
                  display: "block",
                  textAlign: currentStyle.labelAlignment,
                  fontSize: `${currentStyle.labelFontSize || 14}px`
                }}
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-xs text-red-500">{errors[field.id]}</p>
            )}
          </div>
        ))}

        <div
          className={onSelectField ? "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400 rounded p-1 -m-1 cursor-pointer" : ""}
          onClick={(e) => {
            if (onSelectField) {
              e.stopPropagation();
              onSelectField("style"); // Or "button" if we had a specific button tab, but "style" is likely what we want
            }
          }}
        >
          <Button
            type="submit"
            className={`w-full h-12 font-medium mt-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${onSelectField ? "pointer-events-none" : ""}`}
            disabled={isSubmitting}
            style={getButtonStyle()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                {currentStyle.buttonText}
                <Send className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Subscriber Form Badge */}
        {currentStyle.isSubscriberForm && (
          <p className="text-xs text-center mt-4 opacity-60" style={{ color: currentStyle.textColor }}>
            📧 Your email will be saved to our newsletter
          </p>
        )}
      </form>
    </div>
  );
}
