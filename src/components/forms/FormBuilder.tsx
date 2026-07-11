import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, GripVertical, Plus, Palette, Type, Image, Layout, AlignLeft, AlignCenter, AlignRight, Mail, Settings2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slider } from "@/components/ui/slider";

export interface FieldCondition {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "is_empty" | "is_not_empty";
  value: string;
}

export interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "date" | "number" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  condition?: FieldCondition;
}

export interface FormStyle {
  // Colors
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonTextColor: string;
  borderColor: string;
  inputBackground: string;

  // Typography
  fontFamily: string;
  titleAlignment: "left" | "center" | "right";
  labelAlignment: "left" | "center" | "right";
  titleFontSize: number;
  labelFontSize: number;
  inputFontSize: number;

  // Layout
  borderRadius: number;
  padding: number;
  spacing: number;

  // Branding
  logoUrl: string;
  logoSize: number;
  showLogo: boolean;

  // Button
  buttonText: string;
  buttonStyle: "solid" | "outline" | "gradient";
  buttonFontSize: number;

  // Form Type
  isSubscriberForm: boolean;

  // Background
  backgroundStyle: "solid" | "gradient" | "pattern";
  gradientDirection: string;
  secondaryColor: string;
}

export const defaultFormStyle: FormStyle = {
  primaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  textColor: "#1e293b",
  buttonTextColor: "#ffffff",
  borderColor: "#e2e8f0",
  inputBackground: "#f8fafc",

  fontFamily: "Inter",
  titleAlignment: "center",
  labelAlignment: "left",
  titleFontSize: 24,
  labelFontSize: 14,
  inputFontSize: 16,

  borderRadius: 12,
  padding: 32,
  spacing: 20,

  logoUrl: "",
  logoSize: 60,
  showLogo: false,

  buttonText: "Submit",
  buttonStyle: "solid",
  buttonFontSize: 16,

  isSubscriberForm: false,

  backgroundStyle: "solid",
  gradientDirection: "to bottom right",
  secondaryColor: "#8b5cf6",
};

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  style?: FormStyle;
  onStyleChange?: (style: FormStyle) => void;
  activeFieldId?: string | null;
  onActiveFieldChange?: (id: string | null) => void;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
}

interface SortableFieldProps {
  field: FormField;
  allFields: FormField[];
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Georgia", label: "Georgia" },
];

const fieldTypes = [
  { value: "text", label: "Text", icon: "Aa" },
  { value: "email", label: "Email", icon: "@" },
  { value: "tel", label: "Phone", icon: "📱" },
  { value: "textarea", label: "Text Area", icon: "📝" },
  { value: "select", label: "Dropdown", icon: "▼" },
  { value: "date", label: "Date", icon: "📅" },
  { value: "number", label: "Number", icon: "#" },
  { value: "checkbox", label: "Checkbox", icon: "☑" },
];

function SortableField({ field, allFields, onUpdate, onDelete, isExpanded, onToggleExpand }: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`border rounded-xl bg-white shadow-sm mb-3 overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-brand ring-offset-2' : ''}`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggleExpand}
      >
        <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <span className="font-medium text-slate-900">{field.label}</span>
          <span className="text-xs text-slate-500 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">{field.type}</span>
          {field.required && <span className="text-xs text-red-500 ml-1">*required</span>}
        </div>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t bg-slate-50 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Type</Label>
              <Select value={field.type} onValueChange={(v) => onUpdate({ ...field, type: v as FormField["type"] })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="mr-2">{t.icon}</span> {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Placeholder</Label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
              className="bg-white"
            />
          </div>

          {
            field.type === "select" && (
              <div className="space-y-2">
                <Label className="text-sm">Options (one per line)</Label>
                <textarea
                  value={(field.options || []).join("\n")}
                  onChange={(e) => onUpdate({ ...field, options: e.target.value.split("\n").filter(Boolean) })}
                  className="w-full h-24 px-3 py-2 border rounded-lg bg-white text-sm resize-none"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )
          }

          <div className="flex items-center gap-2">
            <Switch
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ ...field, required: checked })}
            />
            <Label className="text-sm">Required field</Label>
          </div>
        </div >
      )
      }
    </div >
  );
}

export function FormBuilder({
  fields,
  onChange,
  style = defaultFormStyle,
  onStyleChange,
  activeFieldId,
  onActiveFieldChange,
  activeTab,
  onActiveTabChange
}: FormBuilderProps) {
  // Local state for fallback (uncontrolled mode)
  const [localActiveTab, setLocalActiveTab] = useState("fields");
  const [localActiveFieldId, setLocalActiveFieldId] = useState<string | null>(null);

  const currentTab = activeTab !== undefined ? activeTab : localActiveTab;
  const currentActiveFieldId = activeFieldId !== undefined ? activeFieldId : localActiveFieldId;

  const handleTabChange = (val: string) => {
    if (onActiveTabChange) {
      onActiveTabChange(val);
    } else {
      setLocalActiveTab(val);
    }
  };

  const handleFieldExpand = (id: string) => {
    const newId = currentActiveFieldId === id ? null : id;
    if (onActiveFieldChange) {
      onActiveFieldChange(newId);
    } else {
      setLocalActiveFieldId(newId);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addField = (type: FormField["type"] = "text") => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: type === "email" ? "Email Address" : type === "tel" ? "Phone Number" : `New ${type} field`,
      placeholder: type === "email" ? "Enter your email" : "",
      required: type === "email",
    };
    onChange([...fields, newField]);
  };

  const addSubscriberFields = () => {
    const subscriberFields: FormField[] = [
      { id: `field_${Date.now()}_1`, type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
      { id: `field_${Date.now()}_2`, type: "email", label: "Email Address", placeholder: "Enter your email", required: true },
    ];
    onChange([...fields, ...subscriberFields]);
    if (onStyleChange) {
      onStyleChange({ ...style, isSubscriberForm: true });
    }
  };

  const updateStyle = (updates: Partial<FormStyle>) => {
    if (onStyleChange) {
      onStyleChange({ ...style, ...updates });
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Type Selection */}
      <Card className="border-brand/20 bg-brand/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Subscriber Form</p>
                <p className="text-sm text-slate-500">Auto-save emails to your subscribers list</p>
              </div>
            </div>
            <Switch
              checked={style.isSubscriberForm}
              onCheckedChange={(checked) => updateStyle({ isSubscriberForm: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="fields" className="gap-2">
            <Layout className="h-4 w-4" />
            Fields
          </TabsTrigger>
          <TabsTrigger value="style" className="gap-2">
            <Palette className="h-4 w-4" />
            Style
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Image className="h-4 w-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        {/* Fields Tab */}
        <TabsContent value="fields" className="space-y-4">
          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => addField("text")} className="gap-1">
              <Plus className="h-3 w-3" /> Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("email")} className="gap-1">
              <Plus className="h-3 w-3" /> Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("tel")} className="gap-1">
              <Plus className="h-3 w-3" /> Phone
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("textarea")} className="gap-1">
              <Plus className="h-3 w-3" /> Text Area
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("select")} className="gap-1">
              <Plus className="h-3 w-3" /> Dropdown
            </Button>
            <Button variant="outline" size="sm" onClick={() => addField("checkbox")} className="gap-1">
              <Plus className="h-3 w-3" /> Checkbox
            </Button>
          </div>

          {/* Subscriber Quick Add */}
          <Button
            variant="secondary"
            className="w-full gap-2 bg-brand/10 text-brand hover:bg-brand/20"
            onClick={addSubscriberFields}
          >
            <Mail className="h-4 w-4" />
            Add Subscriber Fields (Name + Email)
          </Button>

          {/* Fields List */}
          {fields.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Layout className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No fields yet</p>
              <p className="text-sm text-slate-400">Add fields using the buttons above</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    allFields={fields}
                    onUpdate={(updated) => onChange(fields.map((f) => (f.id === updated.id ? updated : f)))}
                    onDelete={() => onChange(fields.filter((f) => f.id !== field.id))}
                    isExpanded={currentActiveFieldId === field.id}
                    onToggleExpand={() => handleFieldExpand(field.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          {/* Colors */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <Palette className="h-4 w-4" /> Colors
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.primaryColor}
                    onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={style.primaryColor}
                    onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Background Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.textColor}
                    onChange={(e) => updateStyle({ textColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={style.textColor}
                    onChange={(e) => updateStyle({ textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.secondaryColor}
                    onChange={(e) => updateStyle({ secondaryColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={style.secondaryColor}
                    onChange={(e) => updateStyle({ secondaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background Style */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Background Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {["solid", "gradient", "pattern"].map((bg) => (
                <Button
                  key={bg}
                  variant={style.backgroundStyle === bg ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStyle({ backgroundStyle: bg as FormStyle["backgroundStyle"] })}
                  className="capitalize"
                >
                  {bg}
                </Button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <Type className="h-4 w-4" /> Typography
            </h3>
            <div className="space-y-2">
              <Label className="text-sm">Font Family</Label>
              <Select value={style.fontFamily} onValueChange={(v) => updateStyle({ fontFamily: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title Alignment */}
            <div className="space-y-2">
              <Label className="text-sm">Title Alignment</Label>
              <div className="flex gap-2">
                <Button
                  variant={style.titleAlignment === "left" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStyle({ titleAlignment: "left" })}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={style.titleAlignment === "center" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStyle({ titleAlignment: "center" })}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={style.titleAlignment === "right" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStyle({ titleAlignment: "right" })}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Label Alignment */}
            <div className="space-y-2">
              <Label className="text-sm">Label Alignment</Label>
              <div className="flex gap-2">
                <Button
                  variant={style.labelAlignment === "left" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStyle({ labelAlignment: "left" })}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={style.labelAlignment === "center" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStyle({ labelAlignment: "center" })}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={style.labelAlignment === "right" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStyle({ labelAlignment: "right" })}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Font Sizes */}
            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="font-medium">Font Sizes</Label>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Title Size</Label>
                  <span className="text-xs text-muted-foreground">{style.titleFontSize}px</span>
                </div>
                <Slider
                  value={[style.titleFontSize]}
                  onValueChange={([v]) => updateStyle({ titleFontSize: v })}
                  min={16}
                  max={48}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Label Size</Label>
                  <span className="text-xs text-muted-foreground">{style.labelFontSize}px</span>
                </div>
                <Slider
                  value={[style.labelFontSize]}
                  onValueChange={([v]) => updateStyle({ labelFontSize: v })}
                  min={10}
                  max={24}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Input Text Size</Label>
                  <span className="text-xs text-muted-foreground">{style.inputFontSize}px</span>
                </div>
                <Slider
                  value={[style.inputFontSize]}
                  onValueChange={([v]) => updateStyle({ inputFontSize: v })}
                  min={12}
                  max={24}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Button Text Size</Label>
                  <span className="text-xs text-muted-foreground">{style.buttonFontSize}px</span>
                </div>
                <Slider
                  value={[style.buttonFontSize]}
                  onValueChange={([v]) => updateStyle({ buttonFontSize: v })}
                  min={12}
                  max={24}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <Layout className="h-4 w-4" /> Layout
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Border Radius</Label>
                  <span className="text-sm text-slate-500">{style.borderRadius}px</span>
                </div>
                <Slider
                  value={[style.borderRadius]}
                  onValueChange={([v]) => updateStyle({ borderRadius: v })}
                  min={0}
                  max={32}
                  step={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Padding</Label>
                  <span className="text-sm text-slate-500">{style.padding}px</span>
                </div>
                <Slider
                  value={[style.padding]}
                  onValueChange={([v]) => updateStyle({ padding: v })}
                  min={16}
                  max={64}
                  step={4}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Field Spacing</Label>
                  <span className="text-sm text-slate-500">{style.spacing}px</span>
                </div>
                <Slider
                  value={[style.spacing]}
                  onValueChange={([v]) => updateStyle({ spacing: v })}
                  min={8}
                  max={40}
                  step={4}
                />
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Button
            </h3>
            <div className="space-y-2">
              <Label className="text-sm">Button Text</Label>
              <Input
                value={style.buttonText}
                onChange={(e) => updateStyle({ buttonText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Button Style</Label>
              <div className="grid grid-cols-3 gap-2">
                {["solid", "outline", "gradient"].map((btnStyle) => (
                  <Button
                    key={btnStyle}
                    variant={style.buttonStyle === btnStyle ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStyle({ buttonStyle: btnStyle as FormStyle["buttonStyle"] })}
                    className="capitalize"
                  >
                    {btnStyle}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <Label className="font-medium">Show Logo</Label>
              </div>
              <Switch
                checked={style.showLogo}
                onCheckedChange={(checked) => updateStyle({ showLogo: checked })}
              />
            </div>

            {style.showLogo && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Logo URL</Label>
                  <Input
                    value={style.logoUrl}
                    onChange={(e) => updateStyle({ logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-slate-500">Paste a URL to your logo image</p>
                </div>

                {style.logoUrl && (
                  <div className="p-4 bg-slate-100 rounded-xl flex items-center justify-center">
                    <img
                      src={style.logoUrl}
                      alt="Logo Preview"
                      style={{ height: style.logoSize }}
                      className="object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/icon.png";
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Logo Size</Label>
                    <span className="text-sm text-slate-500">{style.logoSize}px</span>
                  </div>
                  <Slider
                    value={[style.logoSize]}
                    onValueChange={([v]) => updateStyle({ logoSize: v })}
                    min={30}
                    max={120}
                    step={5}
                  />
                </div>
              </>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-4">
            <Label className="font-medium">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => updateStyle({
                  primaryColor: "#6366f1",
                  backgroundColor: "#ffffff",
                  textColor: "#1e293b",
                  backgroundStyle: "solid",
                  borderRadius: 12,
                })}
                className="h-auto py-3 justify-start"
              >
                <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2" />
                Clean White
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStyle({
                  primaryColor: "#10b981",
                  backgroundColor: "#0f172a",
                  textColor: "#f8fafc",
                  backgroundStyle: "solid",
                  borderRadius: 8,
                })}
                className="h-auto py-3 justify-start"
              >
                <div className="w-4 h-4 rounded-full bg-slate-900 mr-2" />
                Dark Mode
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStyle({
                  primaryColor: "#ec4899",
                  backgroundColor: "#fdf2f8",
                  textColor: "#831843",
                  backgroundStyle: "solid",
                  borderRadius: 20,
                })}
                className="h-auto py-3 justify-start"
              >
                <div className="w-4 h-4 rounded-full bg-pink-400 mr-2" />
                Soft Pink
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStyle({
                  primaryColor: "#6366f1",
                  secondaryColor: "#ec4899",
                  backgroundColor: "#ffffff",
                  textColor: "#1e293b",
                  backgroundStyle: "gradient",
                  borderRadius: 16,
                })}
                className="h-auto py-3 justify-start"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 mr-2" />
                Gradient
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
