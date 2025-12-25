import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetInstance } from '../types';
import { Trash2 } from 'lucide-react';

interface SortableWidgetProps {
  id: string;
  widget: WidgetInstance;
  children: React.ReactNode;
  isEditMode?: boolean;
  onRemove?: () => void;
  onSizeChange?: (newSize: 'small' | 'medium' | 'large') => void;
}

/**
 * ResizeHandle: Pointer-based drag to resize widget
 */
interface ResizeHandleProps {
  widget: WidgetInstance;
  onSizeChange: (newSize: 'small' | 'medium' | 'large') => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ widget, onSizeChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    setIsDragging(true);

    // Get the widget container
    const widgetContainer = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    if (!widgetContainer) return;

    const initialRect = widgetContainer.getBoundingClientRect();

    // Capture pointer to track moves outside element bounds
    try {
      (e.currentTarget as any).setPointerCapture(e.pointerId);
    } catch {}

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      try {
        (e.currentTarget as any).releasePointerCapture(e.pointerId);
      } catch {}
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);

      const deltaX = upEvent.clientX - startX;
      const newWidth = initialRect.width + deltaX;

      // Map pixel widths to size categories
      let nextSize: 'small' | 'medium' | 'large';
      if (newWidth < 400) nextSize = 'small';
      else if (newWidth < 800) nextSize = 'medium';
      else nextSize = 'large';

      console.log(`[ResizeHandle] Widget resized from ${Math.round(initialRect.width)}px to ${Math.round(newWidth)}px → size: ${nextSize}`);
      onSizeChange(nextSize);
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      role="slider"
      aria-label={`Resize widget (currently ${widget.size})`}
      tabIndex={0}
      className={`absolute bottom-2 right-2 z-50 w-6 h-6 bg-slate-600 hover:bg-slate-500 rounded-full ${
        isDragging ? 'cursor-grabbing bg-slate-400' : 'cursor-grab'
      } transition-colors opacity-70 hover:opacity-100 flex items-center justify-center shadow-lg`}
      style={{ touchAction: 'none' }}
    >
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    </div>
  );
};

/**
 * SortableWidget: Drag-to-reorder and resize-to-size widget container
 */
export const SortableWidget: React.FC<SortableWidgetProps> = ({
  id,
  widget,
  children,
  isEditMode,
  onRemove,
  onSizeChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const getSpanClasses = (size: string) => {
    switch (size) {
      case 'medium':
        return 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2';
      case 'large':
        return 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-3 row-span-1 sm:row-span-2';
      case 'small':
      default:
        return 'col-span-1 sm:col-span-1';
    }
  };

  // Inject drag handle props into child widget
  const childWithProps = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        dragHandleProps: { ...attributes, ...listeners },
      })
    : children;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${getSpanClasses(widget.size)} ${
        isDragging ? 'opacity-50 ring-2 ring-indigo-500 rounded-2xl' : ''
      } transition-all duration-200`}
    >
      {/* Remove Button (Edit Mode) */}
      {isEditMode && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-50 bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors shadow-lg"
          title="Remove widget"
          aria-label="Remove widget"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Size Cycle Button (Edit Mode) */}
      {isEditMode && (
        <div className="absolute -top-2 -left-2 z-40">
          <button
            onClick={() => {
              if (!onSizeChange) return;
              const next = widget.size === 'small' ? 'medium' : widget.size === 'medium' ? 'large' : 'small';
              onSizeChange(next as any);
            }}
            className="bg-slate-700 hover:bg-slate-600 rounded-full p-2 text-white flex items-center justify-center transition-colors shadow-lg"
            title="Cycle widget size (small → medium → large)"
            aria-label={`Cycle size, currently ${widget.size}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </button>
        </div>
      )}

      {/* Resize Handle (Edit Mode) */}
      {isEditMode && onSizeChange && <ResizeHandle widget={widget} onSizeChange={onSizeChange} />}

      {/* Widget Content */}
      {childWithProps}
    </div>
  );
};