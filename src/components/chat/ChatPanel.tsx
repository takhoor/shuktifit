import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubble } from './ChatBubble';
import { WorkoutActionCard } from './WorkoutActionCard';
import { Spinner } from '../ui/Spinner';
import { useChatStore } from '../../stores/useChatStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useMessages, useConversations } from '../../hooks/useChat';
import { sendChatMessage } from '../../services/ai';
import { buildChatContext, buildTodayWorkoutContext } from '../../services/chatContext';
import { executeCreateWorkout, executeModifyWorkout } from '../../services/chatActionExecutor';
import { startWorkout as engineStartWorkout } from '../../services/workoutEngine';
import { toast } from '../ui/Toast';
import { db } from '../../db';
import type { PendingAction, CreateWorkoutInput, ModifyWorkoutInput } from '../../types/chatActions';

export function ChatPanel() {
  const { isOpen, closeChat, activeConversationId, setActiveConversation, isLoading, setLoading } =
    useChatStore();
  const { startWorkout: storeStartWorkout } = useWorkoutStore();
  const messages = useMessages(activeConversationId);
  const conversations = useConversations();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionStatus, setActionStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle');
  const [actionError, setActionError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom on new messages or pending action changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingAction]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Clear any stale pending action from a previous message
    setPendingAction(null);
    setActionStatus('idle');
    setActionError(null);

    setInput('');
    setError(null);
    setLoading(true);

    try {
      // Create conversation if needed
      let convId: number = activeConversationId ?? 0;
      if (convId <= 0) {
        const createNow = new Date().toISOString();
        convId = (await db.chatConversations.add({
          title: text.slice(0, 50),
          createdAt: createNow,
          updatedAt: createNow,
        })) as number;
        setActiveConversation(convId);
      }

      // Save user message
      const now = new Date().toISOString();
      await db.chatMessages.add({
        conversationId: convId,
        role: 'user',
        content: text,
        createdAt: now,
      });

      // Build context (general + today's workout with IDs for agentic actions)
      const [context, todayWorkoutContext] = await Promise.all([
        buildChatContext(),
        buildTodayWorkoutContext(),
      ]);

      const history = await db.chatMessages
        .where('conversationId')
        .equals(convId)
        .sortBy('createdAt');
      const historyForAPI = history.map((m) => ({ role: m.role, content: m.content }));

      // Send to AI — response may include a toolCall for workout actions
      const response = await sendChatMessage(text, context, historyForAPI, todayWorkoutContext);

      // Save assistant reply
      const replyNow = new Date().toISOString();
      await db.chatMessages.add({
        conversationId: convId,
        role: 'assistant',
        content: response.reply,
        createdAt: replyNow,
      });

      await db.chatConversations.update(convId, { updatedAt: replyNow });

      // If Claude called a tool, surface it as a pending action card
      if (response.toolCall) {
        const { name, input: toolInput } = response.toolCall;
        if (name === 'create_workout') {
          setPendingAction({ type: 'create', input: toolInput as CreateWorkoutInput });
        } else if (name === 'modify_workout') {
          setPendingAction({ type: 'modify', input: toolInput as ModifyWorkoutInput });
        }
        setActionStatus('idle');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (mode?: 'add' | 'start') => {
    if (!pendingAction) return;
    setActionStatus('applying');
    setActionError(null);

    try {
      if (pendingAction.type === 'create') {
        const workoutId = await executeCreateWorkout(pendingAction.input);
        setActionStatus('success');
        if (mode === 'start') {
          await engineStartWorkout(workoutId);
          storeStartWorkout(workoutId);
          setTimeout(() => {
            setPendingAction(null);
            setActionStatus('idle');
            closeChat();
            navigate(`/workouts/${workoutId}/play`);
          }, 800);
        } else {
          toast('Workout created! View it in your workouts list.', 'success');
          setTimeout(() => {
            setPendingAction(null);
            setActionStatus('idle');
          }, 3000);
        }
      } else {
        await executeModifyWorkout(pendingAction.input);
        setActionStatus('success');
        toast('Workout updated!', 'success');
        setTimeout(() => {
          setPendingAction(null);
          setActionStatus('idle');
        }, 3000);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed. Please try again.');
      setActionStatus('error');
    }
  };

  const handleDismissAction = () => {
    setPendingAction(null);
    setActionStatus('idle');
    setActionError(null);
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setError(null);
    setPendingAction(null);
    setActionStatus('idle');
    setActionError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showConversationList = activeConversationId === null && conversations && conversations.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/60" onClick={closeChat} />
      <div className="relative mt-12 flex-1 flex flex-col bg-bg-primary rounded-t-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-text-primary">AI Coach</h2>
          <div className="flex items-center gap-2">
            {activeConversationId && (
              <button
                onClick={handleNewConversation}
                className="p-1.5 text-text-muted active:text-text-primary"
                title="New conversation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
            <button
              onClick={closeChat}
              className="p-1 text-text-muted active:text-text-primary"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
          {showConversationList ? (
            /* Conversation list */
            <div className="space-y-2">
              <p className="text-xs text-text-muted mb-3">Recent conversations</p>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id!)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-bg-elevated active:bg-bg-card transition-colors"
                >
                  <span className="text-sm text-text-primary block truncate">
                    {conv.title || 'Untitled'}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setActiveConversation(-1)}
                className="w-full text-center text-sm text-accent py-3"
              >
                Start new conversation
              </button>
            </div>
          ) : messages && messages.length > 0 ? (
            /* Messages */
            <div className="space-y-3">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {pendingAction && (
                <WorkoutActionCard
                  action={pendingAction}
                  status={actionStatus}
                  error={actionError}
                  onConfirm={handleConfirmAction}
                  onDismiss={handleDismissAction}
                />
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-bg-elevated rounded-2xl rounded-bl-md px-4 py-3">
                    <Spinner />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-sm text-text-secondary mb-1">Ask your AI coach anything</p>
              <p className="text-xs text-text-muted">
                Progress insights, plateau advice, form tips — or ask to create a workout
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border px-4 py-3 pb-safe">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach..."
              className="flex-1 bg-bg-elevated rounded-xl px-4 py-2.5 text-sm text-text-primary border border-border outline-none focus:border-accent placeholder:text-text-muted"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:bg-accent/80"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
