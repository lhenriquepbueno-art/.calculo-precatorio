import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

const SYSTEM_CONTEXT = `Você é um assistente jurídico especializado em precatórios do Estado de São Paulo.

Sua expertise inclui:
- Atualização monetária de precatórios (IPCA-E até nov/2021, SELIC após dez/2021)
- Emenda Constitucional nº 113/2021
- Tema 810 do STF e Tema 905 do STJ
- Inaplicabilidade da Lei nº 14.905/2024 a precatórios da Fazenda Pública
- Período de graça constitucional (Art. 100, §5º CF)
- Resoluções do CNJ aplicáveis
- Metodologia de consolidação do débito em novembro de 2021

Responda de forma técnica, precisa e fundamentada. Cite a legislação e jurisprudência quando pertinente.
Formate suas respostas com Markdown para melhor legibilidade.`;

const SUGGESTIONS = [
  'Explique a metodologia de cálculo IPCA-E + SELIC para precatórios',
  'Por que a Lei 14.905/2024 não se aplica a precatórios?',
  'O que é o período de graça constitucional?',
  'Como funciona a consolidação do débito em nov/2021?',
  'Qual a diferença entre SELIC linear e acumulada?',
  'Explique o Tema 810 do STF sobre correção monetária',
];

export default function Assistente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const fullPrompt = `${SYSTEM_CONTEXT}\n\nHistórico da conversa:\n${messages.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n')}\n\nUsuário: ${text.trim()}\n\nAssistente:`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      const msg = String(err?.message || err || '');
      const limite = /limit|upgrade|quota/i.test(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: limite
        ? '⚠️ **Limite de créditos de IA atingido este mês.** O assistente jurídico utiliza os créditos de integração da plataforma, que se esgotaram. Para reativar as respostas, é necessário fazer upgrade do plano. Os créditos são renovados no próximo ciclo mensal.'
        : 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.' }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          IA Jurídica
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Assistente especializado em precatórios do Estado de São Paulo
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Assistente Jurídico</h3>
            <p className="text-xs text-muted-foreground mb-6 max-w-sm">
              Pergunte sobre atualização monetária, legislação aplicável, metodologia de cálculo ou qualquer tema sobre precatórios.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="glass-card glass-hover rounded-lg p-3 text-left text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
              </div>
            )}
            <div className={`max-w-2xl rounded-xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'glass-card'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-li:text-foreground/80 prose-a:text-blue-400">
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="glass-card rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-border/30">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pergunte sobre precatórios, legislação, cálculos..."
          className="flex-1 bg-muted/50 border-border/50 text-sm placeholder:text-muted-foreground/50"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}