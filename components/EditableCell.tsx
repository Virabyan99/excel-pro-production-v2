"use client";
import { useState, useRef, useEffect } from 'react';
import { CellSchema } from '@/schemas/cell';
import { Input } from './ui/input';

interface EditableCellProps {
  rawValue: string;
  displayValue: string;
  onChange: (value: string) => void;
}

export function EditableCell({ rawValue, displayValue, onChange }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(rawValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraft(rawValue);
  }, [rawValue]);

  function validate(value: string) {
    try {
      CellSchema.parse(value);
      setError(null);
      return true;
    } catch (e: any) {
      const message = e.errors?.[0]?.message ?? 'Invalid input';
      console.error(message);
      setError(message);
      return false;
    }
  }

  function commit() {
    if (validate(draft)) {
      setIsEditing(false);
      onChange(draft);
    }
  }

  return (
    <div
      className="w-full h-full"
      onClick={() => {
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
    >
      {isEditing ? (
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            validate(e.target.value);
          }}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className={`w-full h-full ${error ? 'border-red-500' : ''}`}
          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to outer div
        />
      ) : (
        <div className="w-full h-full px-2 py-1 truncate">
          {displayValue}
        </div>
      )}
    </div>
  );
}