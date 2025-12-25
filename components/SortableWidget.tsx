import React from 'react';
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
}

export const SortableWidget: React.FC<SortableWidgetProps> = ({ id, widget, children, isEditMode, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const getSpanClasses = (size: string) => {
    switch (size) {
      case 'medium': return 'col-span-1 md:col-span-2 lg:col-span-2';
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2';
      case 'small': default: return 'col-span-1';
    }
  };

  // We clone the child (Widget) to inject the dragHandleProps
  // This avoids extra wrapping divs that mess up grid layout height
  const childWithProps = React.isValidElement(children) 
    ? React.cloneElement(children as React.ReactElement<any>, {
        dragHandleProps: { ...attributes, ...listeners }
      })
    : children;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative ${getSpanClasses(widget.size)} ${isDragging ? 'opacity-50 ring-2 ring-indigo-500 rounded-2xl' : ''}`}
    >
      {isEditMode && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-50 bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors"
          title="Remove widget"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}
      {childWithProps}
    </div>
  );
};