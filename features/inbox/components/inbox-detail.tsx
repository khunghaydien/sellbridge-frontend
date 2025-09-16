"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { IconPhone, IconStar, IconMoreVertical, IconSend } from "@/icons";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  sender: string;
  order: number; // Thêm order để sắp xếp đúng thứ tự
}

interface InboxDetailProps {
  messageId: string | null;
}

// Mock data generator for chat messages
const generateChatMessages = (startIndex: number, count: number, isOwn: boolean = false): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const sender = isOwn ? "Bạn" : "Nguyễn Văn A";

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const hour = 23 - (index % 24);
    const minute = 59 - (index % 60);

    messages.push({
      id: `chat-${index}`,
      content: `Tin nhắn thứ ${index + 1} trong cuộc trò chuyện này. ${isOwn ? 'Đây là tin nhắn của bạn.' : 'Đây là tin nhắn từ khách hàng.'}`,
      timestamp: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      isOwn: isOwn,
      sender: sender,
      order: index, // Order thấp = tin nhắn cũ
    });
  }

  return messages;
};

// Initial chat messages - sắp xếp theo thứ tự thời gian
const initialChatMessages = [
  ...generateChatMessages(0, 5, false), // Messages from customer (order 0-4)
  ...generateChatMessages(5, 3, true),  // Your messages (order 5-7)
  ...generateChatMessages(8, 4, false), // More customer messages (order 8-11)
  ...generateChatMessages(12, 2, true), // Your replies (order 12-13)
].sort((a, b) => a.order - b.order); // Sắp xếp theo order tăng dần

export const InboxDetail = memo(function InboxDetail({ messageId }: InboxDetailProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const isLoadingOlderRef = useRef<boolean>(false);

  // Mock API call to load older messages
  const loadOlderMessages = useCallback(async () => {
    if (isLoading || !hasMore || !messageId || isLoadingOlderRef.current) return;

    isLoadingOlderRef.current = true;
    setIsLoading(true);

    // Save current scroll position
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Tạo tin nhắn cũ với order thấp hơn tin nhắn hiện tại
    const currentMinOrder = Math.min(...messages.map(m => m.order));
    const olderMessages = [
      ...generateChatMessages(currentMinOrder - 6, 3, false), // Tin nhắn cũ hơn
      ...generateChatMessages(currentMinOrder - 3, 2, true),  // Tin nhắn cũ hơn
      ...generateChatMessages(currentMinOrder - 1, 3, false), // Tin nhắn cũ hơn
    ];

    // Simulate end of data after 50 messages
    if (messages.length + olderMessages.length >= 50) {
      setHasMore(false);
    }

    // Thêm tin nhắn cũ vào đầu và sắp xếp lại
    const allMessages = [...olderMessages, ...messages].sort((a, b) => a.order - b.order);
    setMessages(allMessages);
    setPage(prev => prev + 1);
    setIsLoading(false);
    isLoadingOlderRef.current = false;
  }, [isLoading, hasMore, messages, messageId]);

  // Intersection Observer for infinite scroll (top)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading && messageId && !isLoadingOlderRef.current) {
          loadOlderMessages();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadOlderMessages, hasMore, isLoading, messageId]);

  // Restore scroll position after loading older messages
  useEffect(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0 && !isLoading) {
      const container = scrollContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      const oldScrollHeight = newScrollHeight - (messages.length * 100); // Approximate message height

      // Calculate new scroll position
      const scrollDiff = newScrollHeight - oldScrollHeight;
      container.scrollTop = scrollPositionRef.current + scrollDiff;

      // Reset scroll position ref
      scrollPositionRef.current = 0;
    }
  }, [messages.length, isLoading]);

  // Auto scroll to bottom when sending new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !messageId) return;

    // Tạo order mới cao hơn tin nhắn hiện tại
    const currentMaxOrder = Math.max(...messages.map(m => m.order));

    const newMsg: ChatMessage = {
      id: `new-${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOwn: true,
      sender: "Bạn",
      order: currentMaxOrder + 1, // Order cao nhất = tin nhắn mới nhất
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");

    // Auto scroll to bottom after sending
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 100);

    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!messageId) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">Chọn một tin nhắn</p>
          <p className="text-sm">Để bắt đầu trò chuyện</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-4 bg-gradient-to-b from-background to-muted rounded-xl">
      {/* Header */}
      <div className="p-4 bg-muted rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              N
            </div>
            <div>
              <h3 className="font-semibold text-sm">Nguyễn Văn A</h3>
              <p className="text-xs text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <IconPhone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <IconStar className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <IconMoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages with Infinite Scroll */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth scrollbar-messenger p-4 space-y-4"
      >
        {/* Loading indicator for older messages */}
        <div
          ref={loadingRef}
          className="flex items-center justify-center py-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm">Đang tải tin nhắn cũ...</span>
            </div>
          ) : hasMore ? (
            <div className="text-xs text-muted-foreground">
              Cuộn lên để xem tin nhắn cũ
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Đã tải hết tin nhắn
            </div>
          )}
        </div>

        {/* Messages - đã được sắp xếp theo order */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              "flex gap-3",
              message.isOwn ? "justify-end" : "justify-start"
            )}
          >
            {!message.isOwn && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                {message.sender.charAt(0)}
              </div>
            )}

            <div className={clsx(
              "max-w-[70%] rounded-lg px-3 py-2",
              message.isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}>
              <p className="text-sm">{message.content}</p>
              <p className={clsx(
                "text-xs mt-1",
                message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {message.timestamp}
              </p>
            </div>

            {message.isOwn && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                B
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="my-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={clsx(
              "w-[38px] h-[38px] flex items-center justify-center rounded-lg transition-colors",
              newMessage.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary"
                : "bg-background  text-muted-foreground cursor-not-allowed"
            )}
          >
            <IconSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default InboxDetail; 