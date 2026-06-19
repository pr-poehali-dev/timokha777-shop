import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const ADMIN_URL = 'https://functions.poehali.dev/b7885480-fb2f-4bd2-bcaa-4421383b715d';

interface Refund {
  id: number;
  name: string;
  email: string;
  order_info: string;
  reason: string;
  created_at: string;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'seller';
  message: string;
  created_at: string;
}

interface Chat {
  session_id: string;
  last_at: string;
  messages: ChatMessage[];
}

export default function Admin() {
  const [pwd, setPwd] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [tab, setTab] = useState<'refunds' | 'chats'>('refunds');

  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const login = async () => {
    const res = await fetch(`${ADMIN_URL}?section=refunds&pwd=${pwd}`);
    if (res.status === 403) { setAuthError(true); return; }
    setAuthed(true);
    setAuthError(false);
  };

  const loadRefunds = async () => {
    const res = await fetch(`${ADMIN_URL}?section=refunds&pwd=${pwd}`);
    const data = await res.json();
    setRefunds(data.refunds || []);
  };

  const loadChats = async () => {
    const res = await fetch(`${ADMIN_URL}?section=chats&pwd=${pwd}`);
    const data = await res.json();
    setChats(data.chats || []);
  };

  useEffect(() => {
    if (!authed) return;
    loadRefunds();
    loadChats();
  }, [authed]);

  useEffect(() => {
    if (!authed || tab !== 'chats') return;
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [authed, tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat, chats]);

  const sendReply = async () => {
    if (!replyText.trim() || !activeChat) return;
    setReplySending(true);
    await fetch(`${ADMIN_URL}?section=reply&pwd=${pwd}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: activeChat, message: replyText.trim() }),
    });
    setReplyText('');
    await loadChats();
    setReplySending(false);
  };

  const activeMessages = chats.find(c => c.session_id === activeChat)?.messages || [];

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-background" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Панель продавца</h1>
              <p className="text-muted-foreground text-sm">Тимоха777shop</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Пароль"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className={`bg-input border-border rounded-xl h-11 ${authError ? 'border-red-500' : ''}`}
            />
            {authError && <p className="text-red-500 text-sm">Неверный пароль</p>}
            <Button onClick={login} className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-primary to-amber-500 text-background">
              Войти
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
              <Icon name="Shield" size={16} className="text-background" />
            </div>
            <span className="font-bold">Панель продавца</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Выйти
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('refunds')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'refunds' ? 'bg-primary text-background' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            Заявки на возврат <span className="ml-1 opacity-70">({refunds.length})</span>
          </button>
          <button
            onClick={() => setTab('chats')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'chats' ? 'bg-primary text-background' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            Чаты <span className="ml-1 opacity-70">({chats.length})</span>
          </button>
        </div>

        {/* Refunds */}
        {tab === 'refunds' && (
          <div className="space-y-4 pb-8">
            {refunds.length === 0 && (
              <div className="text-center text-muted-foreground py-16">Заявок пока нет</div>
            )}
            {refunds.map(r => (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold text-background">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-muted-foreground text-sm">{r.email}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {new Date(r.created_at).toLocaleString('ru')}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="bg-background/50 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-muted-foreground mb-0.5">Что купил</p>
                    <p className="text-sm">{r.order_info}</p>
                  </div>
                  <div className="bg-background/50 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-muted-foreground mb-0.5">Причина</p>
                    <p className="text-sm">{r.reason}</p>
                  </div>
                </div>
                <a
                  href={`mailto:${r.email}?subject=Ответ на заявку возврата&body=Здравствуй, ${r.name}!`}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Icon name="Mail" size={14} /> Ответить на почту
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Chats */}
        {tab === 'chats' && (
          <div className="flex gap-4 pb-8 h-[calc(100vh-180px)]">
            {/* List */}
            <div className="w-64 shrink-0 space-y-2 overflow-y-auto">
              {chats.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">Диалогов пока нет</div>
              )}
              {chats.map(c => {
                const lastMsg = c.messages[c.messages.length - 1];
                const unread = c.messages.some(m => m.sender === 'user');
                return (
                  <button
                    key={c.session_id}
                    onClick={() => setActiveChat(c.session_id)}
                    className={`w-full text-left bg-card border rounded-xl p-3 transition-colors ${activeChat === c.session_id ? 'border-primary' : 'border-border hover:border-primary/40'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center shrink-0">
                        <Icon name="User" size={12} className="text-background" />
                      </div>
                      <span className="text-xs font-medium truncate">
                        #{c.session_id.slice(-6)}
                      </span>
                      {unread && <span className="w-2 h-2 rounded-full bg-primary ml-auto shrink-0" />}
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-muted-foreground truncate pl-9">{lastMsg.message}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Chat window */}
            {activeChat ? (
              <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Icon name="MessageCircle" size={16} className="text-primary" />
                  <span className="text-sm font-medium">Диалог #{activeChat.slice(-6)}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {activeMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        msg.sender === 'seller'
                          ? 'bg-gradient-to-br from-primary to-amber-500 text-background rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendReply()}
                    placeholder="Ответить..."
                    className="bg-input border-border rounded-xl h-9 text-sm"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={replySending || !replyText.trim()}
                    className="h-9 w-9 p-0 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-background shrink-0"
                  >
                    <Icon name="Send" size={15} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Выбери диалог слева
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
