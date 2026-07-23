import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useAskQuery } from '../../hooks/useAskQuery';
import ChatInput from '../../components/chat/ChatInput';
import MessageThread, { ChatMessage } from '../../components/chat/MessageThread';

export default function ChatPage() {
  const selectedDataSourceId = useSelector((state: RootState) => state.ui.selectedDataSourceId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const { mutate: askQuery, isPending: isAsking } = useAskQuery();

  const handleSend = useCallback((text: string) => {
    if (!selectedDataSourceId) return;

    const userMessageId = Date.now().toString();
    const loadingMessageId = (Date.now() + 1).toString();

    // 1. Add user message and loading state
    setMessages(prev => [
      ...prev,
      { id: userMessageId, type: 'user', content: text },
      { id: loadingMessageId, type: 'loading' }
    ]);

    // 2. Call API
    askQuery(
      { dataSourceId: selectedDataSourceId, question: text },
      {
        onSuccess: (result) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === loadingMessageId 
                ? { id: loadingMessageId, type: 'bot', result } 
                : msg
            )
          );
        },
        onError: (error: any) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === loadingMessageId 
                ? { id: loadingMessageId, type: 'error', error: error.response?.data?.error || { code: 'UNKNOWN' } } 
                : msg
            )
          );
        }
      }
    );
  }, [selectedDataSourceId, askQuery]);

  const handleRerun = useCallback((_logId: number, editedSql: string) => {
    // In a full implementation, we'd call the rerun mutation here
    // For now, this is a placeholder since the backend doesn't explicitly return the logId in the ask response yet
    console.log("Rerun called with:", editedSql);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
      {!selectedDataSourceId && (
        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Source Selected</h3>
            <p className="text-sm text-gray-600">
              Please select a database from the dropdown in the top right corner to start asking questions.
            </p>
          </div>
        </div>
      )}

      <MessageThread 
        messages={messages} 
        onRerun={handleRerun} 
        isRerunningId={null} 
      />
      
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSend={handleSend} 
            disabled={!selectedDataSourceId || isAsking} 
            placeholder={isAsking ? "Waiting for response..." : "Ask a question about your data..."}
          />
        </div>
      </div>
    </div>
  );
}