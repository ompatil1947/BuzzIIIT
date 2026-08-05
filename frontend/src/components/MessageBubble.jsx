import React, { useState } from 'react';
import { CheckCircle2, Copy, Database } from 'lucide-react';
import { RestaurantCard } from './RestaurantCard';

export const MessageBubble = ({ message, onViewMap }) => {
    const isBot   = message.role === 'assistant';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex w-full mb-5 fade-slide-up ${isBot ? 'justify-start' : 'justify-end'}`}>
            
            {/* Bot avatar */}
            {isBot && (
                <div className="flex-shrink-0 mr-3 mt-1">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: 'var(--color-marigold)' }}
                        title="Khidmatgar"
                    >
                        🍽️
                    </div>
                </div>
            )}

            <div className={`max-w-[85%] ${isBot ? '' : 'flex flex-col items-end'}`}>
                
                {/* Message bubble */}
                {isBot ? (
                    <div className="bot-bubble px-4 py-3 shadow-sm text-sm group relative">
                        <div
                            className="whitespace-pre-wrap leading-relaxed"
                            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-kebab-brown)' }}
                        >
                            {message.content}
                        </div>

                        {/* Copy button */}
                        {!message.isError && (
                            <button
                                onClick={handleCopy}
                                className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: '#c9a97a' }}
                                title="Copy reply"
                            >
                                {copied
                                    ? <CheckCircle2 size={15} style={{ color: 'var(--color-pudina-green)' }} />
                                    : <Copy size={15} />
                                }
                            </button>
                        )}

                        {/* Source attribution — shown when sources are available */}
                        {message.sources && message.sources.length > 0 && (
                            <div className="source-citation mt-2 pt-2" style={{ borderTop: '1px solid var(--color-card-border)' }}>
                                <Database size={10} />
                                Based on&nbsp;
                                <span className="font-semibold mono">{message.sources.length}</span>
                                &nbsp;restaurant{message.sources.length !== 1 ? 's' : ''} from IIIT Lucknow data
                                {message.reviewSources > 0 && (
                                    <> + <span className="font-semibold mono">{message.reviewSources}</span> student review{message.reviewSources !== 1 ? 's' : ''}</>
                                )}
                            </div>
                        )}
                        {/* Fallback: show source count from restaurants array */}
                        {(!message.sources || message.sources.length === 0) && message.restaurants && message.restaurants.length > 0 && (
                            <div className="source-citation mt-2 pt-2" style={{ borderTop: '1px solid var(--color-card-border)' }}>
                                <Database size={10} />
                                Based on&nbsp;<span className="font-semibold mono">{message.restaurants.length}</span>&nbsp;restaurants from IIIT Lucknow data
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="user-bubble px-4 py-3 shadow-sm text-sm"
                        style={{ fontFamily: 'var(--font-body)' }}
                    >
                        {message.content}
                    </div>
                )}

                {/* Inline restaurant cards */}
                {isBot && message.restaurants && message.restaurants.length > 0 && (
                    <div className="mt-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                        <div className="flex gap-3 w-max">
                            {message.restaurants.map((r, i) => (
                                <div key={i} className="w-64 flex-shrink-0">
                                    <RestaurantCard restaurant={r} onViewMap={onViewMap} className="h-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* User avatar */}
            {!isBot && (
                <div className="flex-shrink-0 ml-3 mt-1">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--color-kebab-brown)', color: 'white', fontFamily: 'var(--font-display)' }}
                    >
                        U
                    </div>
                </div>
            )}
        </div>
    );
};
