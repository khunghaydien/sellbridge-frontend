"use client";

import { memo, useState, useMemo, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { IconSearch } from "@/icons";

interface Message {
  id: string;
  sender: string;
  preview: string;
  time: string;
  isUnread: boolean;
  hasPhone: boolean;
  isImportant: boolean;
}

interface InboxListProps {
  filter: string;
  selectedMessageId: string | null;
  onMessageSelect: (messageId: string) => void;
}

// Mock data generator
const generateMockMessages = (startIndex: number, count: number): Message[] => {
  const names = [
    "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E",
    "Vũ Thị F", "Đặng Văn G", "Bùi Thị H", "Ngô Văn I", "Dương Thị K",
    "Lý Văn L", "Hồ Thị M", "Tô Văn N", "Đỗ Thị O", "Võ Văn P"
  ];

  const messages: Message[] = [];

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const nameIndex = index % names.length;
    const hour = 23 - (index % 24);
    const minute = 59 - (index % 60);

    messages.push({
      id: `msg-${index}`,
      sender: names[nameIndex],
      preview: `Tin nhắn thứ ${index + 1} từ ${names[nameIndex]}...`,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      isUnread: index % 3 === 0,
      hasPhone: index % 2 === 0,
      isImportant: index % 5 === 0,
    });
  }

  return messages;
};

// Initial messages
const initialMessages = generateMockMessages(0, 20);

export const InboxList = memo(function InboxList({
  filter,
  selectedMessageId,
  onMessageSelect,
}: InboxListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Mock API call to load more messages
  const loadMoreMessages = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newMessages = generateMockMessages(messages.length, 10);

    // Simulate end of data after 100 messages
    if (messages.length + newMessages.length >= 100) {
      setHasMore(false);
    }

    setMessages(prev => [...prev, ...newMessages]);
    setPage(prev => prev + 1);
    setIsLoading(false);
  }, [isLoading, hasMore, messages.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMoreMessages();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreMessages, hasMore, isLoading]);

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(message =>
        message.sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected filter
    switch (filter) {
      case "unread":
        filtered = filtered.filter(message => message.isUnread);
        break;
      case "read":
        filtered = filtered.filter(message => !message.isUnread);
        break;
      case "phone":
        filtered = filtered.filter(message => message.hasPhone);
        break;
      case "important":
        filtered = filtered.filter(message => message.isImportant);
        break;
      case "unanswered":
        filtered = filtered.filter(message => message.isUnread);
        break;
      default:
        break;
    }

    return filtered;
  }, [filter, searchQuery, messages]);

  return (
    <div className="h-full flex flex-col px-2 bg-gradient-to-b from-background to-muted rounded-xl">
      {/* Search Header */}
      <div className="pb-4">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
          />
        </div>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-2">
            {filteredMessages.length} kết quả tìm kiếm
          </p>
        )}
      </div>

      {/* Message List with Infinite Scroll */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth scrollbar-messenger"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Không tìm thấy tin nhắn</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => onMessageSelect(message.id)}
                className={clsx(
                  "p-4 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/50 rounded-lg",
                  selectedMessageId === message.id && "bg-primary/5 border-primary/20"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={clsx(
                    "font-medium text-sm truncate",
                    message.isUnread ? "text-foreground font-semibold" : "text-foreground"
                  )}>
                    {message.sender}
                  </h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {message.time}
                  </span>
                </div>

                <p className={clsx(
                  "text-sm line-clamp-2",
                  message.isUnread ? "text-foreground" : "text-muted-foreground"
                )}>
                  {message.preview}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  {message.isUnread && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                  {message.hasPhone && (
                    <span className="text-xs text-blue-500">📞</span>
                  )}
                  {message.isImportant && (
                    <span className="text-xs text-yellow-500">⭐</span>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            <div
              ref={loadingRef}
              className="p-4 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-sm">Đang tải thêm tin nhắn...</span>
                </div>
              ) : hasMore ? (
                <div className="text-xs text-muted-foreground">
                  Cuộn xuống để tải thêm
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Đã tải hết tin nhắn
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default InboxList; 