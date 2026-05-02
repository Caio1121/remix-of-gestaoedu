import { useState, useEffect, useRef } from "react";
import { Send, User, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages, useSendMessage, useProfile } from "@/hooks/useDashboardData";
import { supabase } from "@/integrations/supabase/client";

interface AdminChatProps {
    receiverId?: string;
    onClose?: () => void;
}

export function AdminChat({ receiverId, onClose }: AdminChatProps) {
    const [content, setContent] = useState("");
    const [selectedReceiver, setSelectedReceiver] = useState<string | null>(receiverId || null);
    const { data: messages = [] } = useChatMessages(selectedReceiver || "");
    const sendMessage = useSendMessage();
    const { data: profile } = useProfile();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [receivers, setReceivers] = useState<any[]>([]);
    

    // Buscar lista de possíveis destinatários (Docentes e Gestores)
    useEffect(() => {
        const fetchReceivers = async () => {
            const targetRoles = profile?.role === 'aluno'
                ? ['docente', 'gestor']            // students contact staff only
                : ['aluno', 'docente', 'gestor']   // staff contacts everyone

            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('role', targetRoles)
                .neq('id', profile?.id)            // exclude self from contact list

            if (data) {
                setReceivers(data);
            }
        };


        if (profile) fetchReceivers();
    }, [profile]);

    // Scroll automático para a última mensagem
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !selectedReceiver) return;

        try {
            await sendMessage.mutateAsync({
                receiver_id: selectedReceiver,
                content: content.trim()
            });
            setContent("");
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    };

    if (!profile) return null;

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-card border border-border rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">Chat Interno</span>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* List of Contacts (Sidebar if many) */}
                {!selectedReceiver ? (
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">Escolha um contato</div>
                        {receivers.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedReceiver(r.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">{r.full_name}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">{r.role}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Chat Window */
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Conversation Header */}
                        <div className="px-4 py-2 border-b border-border text-xs flex items-center gap-2">
                            <button onClick={() => setSelectedReceiver(null)} className="text-primary hover:underline">← Voltar</button>
                            <span className="text-muted-foreground">Conversando com:</span>
                            <span className="font-semibold">{receivers.find(r => r.id === selectedReceiver)?.full_name}</span>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Nenhuma mensagem ainda. Comece a conversa!
                                </div>
                            ) : (
                                messages.map((m: any) => {
                                    const isMine = m.sender_id === profile.id;
                                    return (
                                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${isMine
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-muted text-foreground rounded-tl-none border border-border'
                                                }`}>
                                                {m.content}
                                                <div className={`text-[10px] mt-1 opacity-70 ${isMine ? 'text-right' : 'text-left'}`}>
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
                            <Input
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" className="shrink-0 gradient-brand text-white">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
