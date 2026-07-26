import { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';
import { QueryResultResponse } from '../../types/query';
import SqlDisplayBox from './SqlDisplayBox';
import ChartRenderer from './ChartRenderer';
import ExplanationBanner from './ExplanationBanner';
import ClarificationPrompt from './ClarificationPrompt';
import LoadingState from './LoadingState';
import ErrorBanner from '../common/ErrorBanner';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'loading' | 'error';
  content?: string;
  result?: QueryResultResponse;
  error?: any;
}

interface MessageThreadProps {
  messages: ChatMessage[];
  onRerun: (logId: number, editedSql: string) => void;
  isRerunningId?: number | null;
}

export default function MessageThread({ messages, onRerun, isRerunningId }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-text-secondary pb-20">
          <Bot size={48} className="text-primary-main/60 mb-4" />
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Welcome to QueryGenie</h2>
          <p className="mt-2 text-sm max-w-md text-center text-text-secondary">Ask me questions about your connected data source in plain English.</p>
          <div className="mt-8 flex gap-2 flex-wrap justify-center max-w-2xl">
            <span className="px-4 py-2 bg-surface rounded-full text-sm border border-border shadow-sm cursor-pointer hover:border-primary-main hover:text-primary-main transition-colors font-medium text-text-primary">"Show me total revenue by month for this year"</span>
            <span className="px-4 py-2 bg-surface rounded-full text-sm border border-border shadow-sm cursor-pointer hover:border-primary-main hover:text-primary-main transition-colors font-medium text-text-primary">"What are our top 5 selling products?"</span>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] md:max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0 mx-3 mt-1">
                {msg.type === 'user' ? (
                  <div className="w-8 h-8 bg-primary-subtle text-primary-main rounded-full flex items-center justify-center font-bold border border-border">
                    <User size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center border border-border text-primary-main">
                    <Bot size={16} />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex flex-col min-w-0">
                {msg.type === 'user' && (
                  <div className="bg-primary-main text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-sm">
                    <p>{msg.content}</p>
                  </div>
                )}

                {msg.type === 'loading' && (
                  <LoadingState />
                )}

                {msg.type === 'error' && (
                  <ErrorBanner error={msg.error} />
                )}

                {msg.type === 'bot' && msg.result && (
                  <div className="flex flex-col w-full">
                    {msg.result.status === 'SUCCESS' && (
                      <div className="w-full">
                        {msg.result.explanation && <ExplanationBanner explanation={msg.result.explanation} />}
                        {msg.result.sql && (
                          <SqlDisplayBox 
                            sql={msg.result.sql} 
                            onRerun={(editedSql) => {
                              onRerun(0, editedSql);
                            }}
                            isRerunning={isRerunningId !== null}
                          />
                        )}
                        <ChartRenderer 
                          chart={msg.result.chart}
                          columns={msg.result.columns}
                          rows={msg.result.rows}
                        />
                        {msg.result.executionTimeMs && (
                          <div className="text-right text-xs text-text-secondary mt-2">
                            Executed in {msg.result.executionTimeMs}ms
                          </div>
                        )}
                      </div>
                    )}
                    
                    {msg.result.status === 'CLARIFICATION_NEEDED' && (
                      <ClarificationPrompt message={msg.result.clarificationMessage || "Can you clarify your question?"} />
                    )}

                    {msg.result.status === 'REJECTED' && (
                      <ErrorBanner error={{ code: 'UNSAFE_SQL_REJECTED', message: msg.result.clarificationMessage || 'Rejected' }} />
                    )}

                    {msg.result.status === 'FAILED' && (
                      <ErrorBanner error={{ code: 'FAILED', message: msg.result.clarificationMessage || 'Execution failed' }} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
