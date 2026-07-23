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
    <div className="border border-gray-200 rounded-lg overflow-hidden my-4 bg-gray-50">
      <div 
        className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 cursor-pointer"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Generated SQL</span>
          {!isEditing && (
            isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>
        
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="text-xs flex items-center text-gray-600 hover:text-gray-900 px-2 py-1 bg-white border border-gray-300 rounded">
                <X size={14} className="mr-1" /> Cancel
              </button>
              <button onClick={handleSave} className="text-xs flex items-center text-white bg-primary-main hover:bg-primary-dark px-2 py-1 rounded">
                <Check size={14} className="mr-1" /> Save
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setIsExpanded(true); setIsEditing(true); }} 
                className="text-xs flex items-center text-gray-600 hover:text-gray-900 px-2 py-1 bg-white border border-gray-300 rounded"
              >
                <Edit2 size={14} className="mr-1" /> Edit
              </button>
              <button 
                onClick={() => onRerun(editedSql)}
                disabled={isRerunning || editedSql === sql}
                className="text-xs flex items-center text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-green-600 px-2 py-1 rounded transition-colors"
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
