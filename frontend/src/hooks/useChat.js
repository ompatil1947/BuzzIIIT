import { useState, useEffect } from 'react';
import { chatWithBot } from '../api/client';

const INITIAL_MESSAGE = {
    role: 'assistant',
    content: "Aadaab! 🙏 Main hoon Khidmatgar — aapka Awadhi dining guide for IIIT Lucknow.\n\nI can help you find the best food near campus based on diet, budget, vibe, or mood. Kya hukum hai aapka? (What are you craving today?)",
    sources: [],
};

export const useChat = () => {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('khidmatgar_chat_v2');
        if (saved) {
            try { return JSON.parse(saved); }
            catch (e) { /* ignore parse errors */ }
        }
        return [INITIAL_MESSAGE];
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('khidmatgar_chat_v2', JSON.stringify(messages));
    }, [messages]);

    const sendMessage = async (text) => {
        const userMsg = { role: 'user', content: text };
        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setLoading(true);

        try {
            // Pass conversation history (exclude current message — it's passed as `message`)
            const historyForApi = messages.map(m => ({
                role: m.role,
                content: m.content || '',
            }));

            const data = await chatWithBot(text, historyForApi);

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.reply,
                    restaurants: data.restaurants || [],
                    sources: data.sources || [],
                    reviewSources: data.review_sources_count || 0,
                },
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Maafi chahta hoon — kuch technical dikkat aa gayi. Thodi der mein try karein.',
                    isError: true,
                    sources: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([INITIAL_MESSAGE]);
        localStorage.removeItem('khidmatgar_chat_v2');
    };

    return { messages, sendMessage, loading, clearChat };
};
