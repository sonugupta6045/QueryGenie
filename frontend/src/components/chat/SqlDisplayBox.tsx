import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit2, Check, X, Play } from 'lucide-react';

interface SqlDisplayBoxProps {
  sql: string;
  onRerun: (editedSql: string) => void;
  isRerunning?: boolean;
}

export default function SqlDisplayBox({ sql, onRerun, isRerunning = false }: SqlDisplayBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSql, setEditedSql] = useState(sql);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedSql(sql);
  }, [sql]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing, editedSql]);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSql(sql);
    setIsEditing(false);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden my-4 bg-surface-secondary">
      <div 
        className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border cursor-pointer"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Generated SQL</span>
          {!isEditing && (
            isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />
          )}
        </div>
        
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="text-xs flex items-center text-text-primary hover:bg-surface-secondary px-2.5 py-1 bg-surface border border-border rounded transition-colors">
                <X size={14} className="mr-1" /> Cancel
              </button>
              <button onClick={handleSave} className="text-xs flex items-center text-white bg-primary-main hover:bg-primary-dark px-2.5 py-1 rounded transition-colors">
                <Check size={14} className="mr-1" /> Save
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setIsExpanded(true); setIsEditing(true); }} 
                className="text-xs flex items-center text-text-primary hover:bg-surface-secondary px-2.5 py-1 bg-surface border border-border rounded transition-colors"
              >
                <Edit2 size={14} className="mr-1" /> Edit
              </button>
              <button 
                onClick={() => onRerun(editedSql)}
                disabled={isRerunning || editedSql === sql}
                className="text-xs flex items-center text-white bg-success hover:opacity-90 disabled:opacity-50 px-2.5 py-1 rounded transition-colors"
              >
                <Play size={14} className="mr-1" /> Re-run
              </button>
            </>
          )}
        </div>
      </div>

      {(isExpanded || isEditing) && (
        <div className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedSql}
              onChange={(e) => setEditedSql(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 p-3 rounded border border-gray-700 focus:outline-none focus:border-primary-main resize-none"
              spellCheck={false}
            />
          ) : (
            <pre>
              <code>{editedSql}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
