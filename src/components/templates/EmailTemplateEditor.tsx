import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  Link2, 
  GripVertical, 
  Trash2, 
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";

export interface EmailBlock {
  id: string;
  type: "heading" | "text" | "image" | "button" | "divider" | "spacer";
  content: string;
  settings: {
    align?: "left" | "center" | "right";
    fontSize?: string;
    color?: string;
    bgColor?: string;
    padding?: string;
    link?: string;
    alt?: string;
  };
}

interface EmailBlockItemProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<EmailBlock>) => void;
  onDelete: () => void;
}

function SortableBlockItem({ block, isSelected, onSelect, onUpdate, onDelete }: EmailBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case "heading":
        return (
          <h2 
            className="text-2xl font-bold"
            style={{ 
              textAlign: block.settings.align || "left",
              color: block.settings.color || "inherit"
            }}
          >
            {block.content || "Heading text"}
          </h2>
        );
      case "text":
        return (
          <p 
            style={{ 
              textAlign: block.settings.align || "left",
              color: block.settings.color || "inherit"
            }}
          >
            {block.content || "Add your text here..."}
          </p>
        );
      case "image":
        return (
          <div className="flex justify-center">
            {block.content ? (
              <img 
                src={block.content} 
                alt={block.settings.alt || "Image"} 
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <Image className="h-8 w-8 mr-2" />
                Click to add image URL
              </div>
            )}
          </div>
        );
      case "button":
        return (
          <div style={{ textAlign: block.settings.align || "center" }}>
            <button
              className="px-6 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: block.settings.bgColor || "hsl(174, 72%, 40%)",
                color: block.settings.color || "#ffffff"
              }}
            >
              {block.content || "Click me"}
            </button>
          </div>
        );
      case "divider":
        return <hr className="border-t-2 border-border my-4" />;
      case "spacer":
        return <div className="h-8" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg transition-all duration-200",
        isDragging && "opacity-50",
        isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-border"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </button>

      {/* Block Content */}
      <div className="p-4 min-h-[60px]">
        {renderBlockContent()}
      </div>
    </div>
  );
}

interface BlockSettingsProps {
  block: EmailBlock;
  onUpdate: (updates: Partial<EmailBlock>) => void;
}

function BlockSettings({ block, onUpdate }: BlockSettingsProps) {
  const updateSetting = (key: string, value: string) => {
    onUpdate({
      settings: { ...block.settings, [key]: value }
    });
  };

  return (
    <div className="space-y-4 p-4 border-t border-border">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Settings className="h-4 w-4" />
        Block Settings
      </div>

      {(block.type === "heading" || block.type === "text" || block.type === "button") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter content..."
            rows={block.type === "text" ? 4 : 1}
          />
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Image URL</label>
          <Input
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          <label className="text-sm font-medium">Alt Text</label>
          <Input
            value={block.settings.alt || ""}
            onChange={(e) => updateSetting("alt", e.target.value)}
            placeholder="Image description"
          />
        </div>
      )}

      {block.type === "button" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Link URL</label>
          <Input
            value={block.settings.link || ""}
            onChange={(e) => updateSetting("link", e.target.value)}
            placeholder="https://example.com"
          />
          <label className="text-sm font-medium">Background Color</label>
          <Input
            type="color"
            value={block.settings.bgColor || "#14b8a6"}
            onChange={(e) => updateSetting("bgColor", e.target.value)}
            className="h-10 w-20"
          />
        </div>
      )}

      {(block.type === "heading" || block.type === "text" || block.type === "button") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Alignment</label>
          <div className="flex gap-2">
            {["left", "center", "right"].map((align) => (
              <Button
                key={align}
                variant={block.settings.align === align ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting("align", align)}
              >
                {align === "left" && <AlignLeft className="h-4 w-4" />}
                {align === "center" && <AlignCenter className="h-4 w-4" />}
                {align === "right" && <AlignRight className="h-4 w-4" />}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface EmailTemplateEditorProps {
  blocks: EmailBlock[];
  onBlocksChange: (blocks: EmailBlock[]) => void;
}

const blockTypes = [
  { type: "heading", icon: Type, label: "Heading" },
  { type: "text", icon: AlignLeft, label: "Text" },
  { type: "image", icon: Image, label: "Image" },
  { type: "button", icon: Square, label: "Button" },
  { type: "divider", icon: Minus, label: "Divider" },
  { type: "spacer", icon: Link2, label: "Spacer" },
] as const;

export function EmailTemplateEditor({ blocks, onBlocksChange }: EmailTemplateEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
      settings: {
        align: "left",
      },
    };
    onBlocksChange([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = useCallback((id: string, updates: Partial<EmailBlock>) => {
    onBlocksChange(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((id: string) => {
    onBlocksChange(blocks.filter((block) => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [blocks, onBlocksChange, selectedBlockId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Block Palette */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Add Blocks
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {blockTypes.map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4"
              onClick={() => addBlock(type)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {/* Block Settings */}
        {selectedBlock && (
          <div className="mt-6 rounded-lg border border-border bg-card">
            <BlockSettings
              block={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
            />
          </div>
        )}
      </div>

      {/* Email Preview */}
      <div className="lg:col-span-3">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-muted px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/50" />
              <div className="w-3 h-3 rounded-full bg-warning/50" />
              <div className="w-3 h-3 rounded-full bg-success/50" />
              <span className="ml-4 text-sm text-muted-foreground">Email Preview</span>
            </div>
          </div>
          
          <div className="p-6 min-h-[500px] bg-background">
            <div className="max-w-[600px] mx-auto bg-card rounded-lg shadow-lg overflow-hidden">
              {/* Email Header */}
              <div className="gradient-primary p-6 text-center">
                <h1 className="text-xl font-bold text-primary-foreground">Your Email</h1>
              </div>
              
              {/* Email Body */}
              <div className="p-6">
                {blocks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Drag and drop blocks here to build your email</p>
                    <p className="text-sm mt-2">Or click the buttons on the left to add blocks</p>
                  </div>
                ) : (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {blocks.map((block) => (
                          <SortableBlockItem
                            key={block.id}
                            block={block}
                            isSelected={selectedBlockId === block.id}
                            onSelect={() => setSelectedBlockId(block.id)}
                            onUpdate={(updates) => updateBlock(block.id, updates)}
                            onDelete={() => deleteBlock(block.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId ? (
                        <div className="bg-card p-4 rounded-lg shadow-lg opacity-80">
                          Dragging...
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>

              {/* Email Footer */}
              <div className="p-6 bg-muted text-center text-sm text-muted-foreground border-t border-border">
                <p>© 2024 Your Company. All rights reserved.</p>
                <p className="mt-2">
                  <a href="#" className="text-primary hover:underline">Unsubscribe</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
