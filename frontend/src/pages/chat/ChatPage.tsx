import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setSelectedDataSource } from '../../store/slices/uiSlice';
import { useAskQuery } from '../../hooks/useAskQuery';
import { useDataSources } from '../../hooks/useDataSources';
import { useQueryHistory } from '../../hooks/useQueryHistory';
import ChatInput from '../../components/chat/ChatInput';
import MessageThread, { ChatMessage } from '../../components/chat/MessageThread';
import ActiveDatabaseBanner from '../../components/chat/ActiveDatabaseBanner';
import SchemaInspectorModal from '../../components/chat/SchemaInspectorModal';

export default function ChatPage() {
  const dispatch = useDispatch();
  const selectedDataSourceId = useSelector((state: RootState) => state.ui.selectedDataSourceId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSchemaInspectorOpen, setIsSchemaInspectorOpen] = useState(false);
  const [inputTextToInsert, setInputTextToInsert] = useState<string | null>(null);

  const { data: dataSourcesData } = useDataSources();
  const allDataSources = dataSourcesData?.content || [];

  const activeDataSource = useMemo(() => {
    return allDataSources.find((ds) => ds.id === selectedDataSourceId) || null;
  }, [allDataSources, selectedDataSourceId]);

  // Load past query history for the active database
  const { data: historyData } = useQueryHistory(0, 50, selectedDataSourceId || undefined);

  // Sync historical messages when active data source changes or history loads
  useEffect(() => {
    if (!selectedDataSourceId) {
      setMessages([]);
      return;
    }

    if (historyData?.content) {
      // Convert backend QueryLogResponse items into ChatMessage thread format
      const historicalMessages: ChatMessage[] = [];
      
      // Reverse array so oldest messages appear first in chat thread
      [...historyData.content].reverse().forEach((log) => {
        historicalMessages.push({
          id: `user-${log.id}`,
          type: 'user',
          content: log.questionText,
        });

        historicalMessages.push({
          id: `bot-${log.id}`,
          type: 'bot',
          result: {
            status: log.executionStatus as any,
            sql: log.generatedSql,
            executionTimeMs: log.executionTimeMs,
            clarificationMessage: log.errorMessage,
          },
        });
      });

      setMessages(historicalMessages);
    }
  }, [selectedDataSourceId, historyData]);

  const { mutate: askQuery, isPending: isAsking } = useAskQuery();

  const handleSelectDataSource = useCallback((id: number) => {
    dispatch(setSelectedDataSource(id));
  }, [dispatch]);

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
    console.log("Rerun called with:", editedSql);
  }, []);

  const handleInsertText = useCallback((text: string) => {
    setInputTextToInsert(text);
  }, []);

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl shadow-sm border border-border overflow-hidden relative transition-colors duration-200">
      {/* Sticky Active Database Banner */}
      <ActiveDatabaseBanner
        activeDataSource={activeDataSource}
        allDataSources={allDataSources}
        onSelectDataSource={handleSelectDataSource}
        onOpenSchemaInspector={() => setIsSchemaInspectorOpen(true)}
      />

      {/* Main Chat Thread */}
      <MessageThread 
        messages={messages} 
        onRerun={handleRerun} 
        isRerunningId={null} 
      />
      
      {/* Footer Chat Input */}
      <div className="p-4 bg-surface border-t border-border shrink-0 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSend={handleSend} 
            disabled={!selectedDataSourceId || isAsking} 
            placeholder={isAsking ? "Waiting for response..." : `Ask a question about ${activeDataSource?.name || 'your database'}...`}
            initialText={inputTextToInsert || undefined}
          />
        </div>
      </div>

      {/* Schema Inspector Slide-over Modal */}
      {selectedDataSourceId && (
        <SchemaInspectorModal
          dataSourceId={selectedDataSourceId}
          dataSourceName={activeDataSource?.name || 'Selected Database'}
          isOpen={isSchemaInspectorOpen}
          onClose={() => setIsSchemaInspectorOpen(false)}
          onInsertText={handleInsertText}
        />
      )}
    </div>
  );
}