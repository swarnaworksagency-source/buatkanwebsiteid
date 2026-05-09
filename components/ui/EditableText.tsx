"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  isEditMode: boolean;
  className?: string;
  multiline?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
  style?: React.CSSProperties;
}

export function EditableText({
  value,
  onChange,
  isEditMode,
  className = "",
  multiline = false,
  as: Tag = "span",
  style,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setTempValue(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  // Not in edit mode — render plain text
  if (!isEditMode) return <Tag className={className} style={style}>{value}</Tag>;

  // Currently editing inline
  if (editing) {
    const sharedStyle: React.CSSProperties = {
      background: "rgba(255,255,255,0.08)",
      border: "2px solid #3b82f6",
      borderRadius: "6px",
      padding: multiline ? "6px 8px" : "2px 6px",
      width: "100%",
      resize: "none" as const,
      outline: "none",
      color: "inherit",
      font: "inherit",
      fontSize: "inherit",
      fontWeight: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit",
      ...style,
    };
    const commit = () => { onChange(tempValue); setEditing(false); };
    const cancel = () => { setTempValue(value); setEditing(false); };

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Escape") cancel(); }}
          className={className}
          style={sharedStyle}
          rows={3}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        className={className}
        style={sharedStyle}
      />
    );
  }

  // Edit mode ON, not editing yet — show hover effects
  return (
    <Tag
      data-editable="true"
      className={className}
      style={{
        ...style,
        cursor: "text",
        borderRadius: "4px",
        transition: "outline 0.15s, background 0.15s",
        outline: hovered ? "2px solid #3b82f6" : "2px solid transparent",
        outlineOffset: "3px",
        background: hovered ? "rgba(59,130,246,0.1)" : "transparent",
        position: "relative" as const,
      }}
      onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Klik untuk edit"
    >
      {value}
      {hovered && (
        <Pencil
          className="absolute -top-2 -right-2 w-3.5 h-3.5 text-blue-500 bg-white rounded-full p-0.5 shadow"
          style={{ pointerEvents: "none" }}
        />
      )}
    </Tag>
  );
}
