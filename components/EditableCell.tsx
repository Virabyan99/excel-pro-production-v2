// components/EditableCell.tsx
import { useState, useRef, useEffect } from 'react';
import { CellSchema } from '@/schemas/cell';
import { Input } from './ui/input';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
}

export function EditableCell({ value, onChange }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  function validate(value: string) {
    try {
      CellSchema.parse(value);
      setError(null);
      return true;
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Invalid input');
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
    <div className="relative">
      {isEditing ? (
        <>
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              validate(e.target.value);
            }}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className={error ? 'border-red-500' : ''}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </>
      ) : (
        <div onClick={() => setIsEditing(true)} className="px-2 py-1">
          {value}
        </div>
      )}
    </div>
  );
}