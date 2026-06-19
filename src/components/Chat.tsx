import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const CHAT_URL = 'https://functions.poehali.dev/a55b76ce-0604-4bc0-94e7-1390323161f5';

function getSessionId() {
  let sid = localStorage.getItem('chat_session_id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('chat_session_id', sid);
  }
  return sid;
}

interface Message {
  id: number;
  sender: 'user' | 'seller';
  message: string;
  created_at: string;
}

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = getSessionId();

  const fetchMessages = async () => {
    const res = await fetch(`${CHAT_URL}?session_id=${sessionId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  };

  useEffect(() => {
    if (!open) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const optimistic: Message = { id: Date.now(), sender: 'user', message: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    await fetch(`${CHAT_URL}?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: optimistic.message, sender: 'user' }),
    });
    await fetchMessages();
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Кнопка чата */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-amber-500 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Icon name={open ? 'X' : 'MessageCircle'} size={26} className="text-background" />
      </button>

      {/* Окно чата */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Шапка */}
          <div className="bg-gradient-to-r from-primary to-amber-500 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
              <Icon name="Gamepad2" size={16} className="text-background" />
            </div>
            <div>
              <p className="font-bold text-background text-sm">Чат с продавцом</p>
              <p className="text-background/70 text-xs">Обычно отвечаем быстро</p>
            </div>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72 min-h-[120px]">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-6">
                Напиши — продавец ответит!
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-primary to-amber-500 text-background rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.sender === 'seller' && (
                    <p className="text-xs font-bold text-primary mb-0.5">Продавец</p>
                  )}
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Поле ввода */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Написать..."
              className="bg-input border-border rounded-xl h-9 text-sm"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !text.trim()}
              className="h-9 w-9 p-0 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-background shrink-0"
            >
              <Icon name="Send" size={15} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
