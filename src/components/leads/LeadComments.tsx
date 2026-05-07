'use client';

import { useEffect, useRef, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { AtSign, CornerDownRight, Loader2, MessageSquare, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateComment,
  useDeleteComment,
  useLeadComments,
} from '@/hooks/http/leads/lead-comments.hooks';
import { useAuthStore } from '@/store/authStore';


interface MentionUser {
  id: string;
  full_name: string;
  avatar_initials: string;
}

interface MentionDropdownProps {
  users: MentionUser[];
  query: string;
  onSelect: (user: MentionUser) => void;
}

function MentionDropdown({ users, query, onSelect }: MentionDropdownProps) {
  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(query.toLowerCase())
  );

  if (!filtered.length) return null;

  return (
    <div className="absolute bottom-full mb-1 left-0 z-50 w-56 rounded-lg border bg-popover shadow-lg overflow-hidden animate-fade-in">
      {filtered.map((u) => (
        <button
          key={u.id}
          type="button"
          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          onMouseDown={(e) => {
            e.preventDefault(); // prevent textarea blur
            onSelect(u);
          }}
        >
          <span className="size-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
            {u.avatar_initials}
          </span>
          <span className="truncate">{u.full_name}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Render comment body with highlighted mentions ─────────────────────────────

function CommentBody({ content }: { content: string }) {
  const parts = content.split(/(@\w+)/g);
  return (
    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <span
            key={i}
            className="text-primary font-semibold bg-primary/8 rounded px-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface LeadCommentsProps {
  leadId: string;
  /** All users the current org has so we can power @mention autocomplete */
  mentionableUsers?: MentionUser[];
}

export default function LeadComments({ leadId, mentionableUsers = [] }: LeadCommentsProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { data: comments = [], isLoading } = useLeadComments(leadId);
  const createComment = useCreateComment(leadId);
  const deleteComment = useDeleteComment(leadId);

  const [text, setText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Group comments into top-level and replies
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {} as Record<string, typeof comments>);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments.length]);

  // Detect @mention in textarea
  function handleInput(val: string) {
    setText(val);

    // Find the active @word before cursor
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? val.length;
    const textUpToCursor = val.slice(0, cursor);
    const match = textUpToCursor.match(/@(\w*)$/);
    setMentionQuery(match ? match[1] : null);
  }

  function insertMention(user: MentionUser) {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? text.length;
    const before = text.slice(0, cursor).replace(/@(\w*)$/, '');
    const after = text.slice(cursor);
    const newText = `${before}@${user.full_name.split(' ')[0]} ${after}`;
    setText(newText);
    setMentionQuery(null);
    // restore focus + move cursor to right spot
    setTimeout(() => {
      el.focus();
      const pos = before.length + user.full_name.split(' ')[0].length + 2;
      el.setSelectionRange(pos, pos);
    }, 0);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const content = text.trim();
    if (!content || !currentUser) return;

    try {
      await createComment.mutateAsync({ author_id: currentUser.id, content, parent_id: replyTo });
      setText('');
      setReplyTo(null);
    } catch {
      toast.error('Failed to post comment');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl+Enter → submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    // Escape → close mention dropdown or cancel reply
    if (e.key === 'Escape') {
      if (mentionQuery !== null) {
        setMentionQuery(null);
      } else if (replyTo !== null) {
        setReplyTo(null);
      }
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteComment.mutateAsync(commentId);
    } catch {
      toast.error('Failed to delete comment');
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          Comments
          {comments.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Comment list */}
        <div
          ref={listRef}
          className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-1"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
              <MessageSquare className="size-8 opacity-30" />
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            topLevelComments.map((comment) => {
              const isOwn = comment.author_id === currentUser?.id;
              const replies = repliesByParent[comment.id] || [];

              return (
                <div key={comment.id} className="flex flex-col gap-3">
                  <div className="group flex gap-3 items-start">
                    {/* Avatar */}
                    <Avatar className="size-8 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {comment.author?.avatar_initials ?? '??'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Bubble */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-sm font-semibold leading-none">
                          {comment.author?.full_name ?? 'Unknown'}
                        </span>
                        <time
                          dateTime={comment.created_at}
                          title={format(new Date(comment.created_at), 'PPP p')}
                          className="text-[11px] text-muted-foreground"
                        >
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </time>
                      </div>

                      <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2 border border-border/50">
                        <CommentBody content={comment.content} />
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => {
                            setReplyTo(comment.id);
                            setTimeout(() => textareaRef.current?.focus(), 0);
                          }}
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Delete (own comments only) */}
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteComment.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="flex flex-col gap-3 ml-11">
                      {replies.map((reply) => {
                        const isOwnReply = reply.author_id === currentUser?.id;
                        return (
                          <div key={reply.id} className="group flex gap-3 items-start relative">
                            {/* Connector line */}
                            <div className="absolute -left-7 top-0 bottom-0 w-px bg-border/50 hidden" />
                            <div className="absolute -left-7 top-4 w-4 h-px bg-border/50 hidden" />
                            
                            <Avatar className="size-6 shrink-0 mt-0.5">
                              <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                                {reply.author?.avatar_initials ?? '??'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-sm font-semibold leading-none">
                                  {reply.author?.full_name ?? 'Unknown'}
                                </span>
                                <time
                                  dateTime={reply.created_at}
                                  title={format(new Date(reply.created_at), 'PPP p')}
                                  className="text-[11px] text-muted-foreground"
                                >
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </time>
                              </div>

                              <div className="bg-transparent rounded-xl rounded-tl-sm px-0 py-0 text-muted-foreground">
                                <CommentBody content={reply.content} />
                              </div>
                            </div>
                            
                            {isOwnReply && (
                              <button
                                onClick={() => handleDelete(reply.id)}
                                disabled={deleteComment.isPending}
                                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label="Delete reply"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        {currentUser && (
          <div className="flex flex-col gap-2 pt-2 border-t">
            {replyTo && (
              <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5 rounded-md text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CornerDownRight className="size-3.5" />
                  Replying to <span className="font-medium text-foreground">{comments.find(c => c.id === replyTo)?.author?.full_name || 'comment'}</span>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative flex gap-2 items-end">
              <Avatar className="size-8 shrink-0 mb-0.5">
                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                  {currentUser.user_metadata?.avatar_initials ?? '??'}
                </AvatarFallback>
              </Avatar>

              <div className="relative flex-1">
              {/* @mention dropdown */}
              {mentionQuery !== null && (
                <MentionDropdown
                  users={mentionableUsers}
                  query={mentionQuery}
                  onSelect={insertMention}
                />
              )}

              <Textarea
                ref={textareaRef}
                id="lead-comment-input"
                value={text}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment… use @ to mention teammates"
                className="min-h-[60px] max-h-40 resize-none text-sm pr-10 rounded-xl"
                rows={2}
              />

              {/* @ hint icon */}
              <AtSign className="absolute right-3 bottom-2.5 size-4 text-muted-foreground/50 pointer-events-none" />
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={!text.trim() || createComment.isPending}
              className="shrink-0 h-9 w-9 rounded-xl mb-0.5"
            >
              {createComment.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
        )}
        <p className="text-[11px] text-muted-foreground/60 -mt-1">
          Press <kbd className="font-mono bg-muted px-1 rounded text-[10px]">⌘</kbd>+
          <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Enter</kbd> to send
        </p>
      </CardContent>
    </Card>
  );
}
