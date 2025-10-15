"use client";

import { useMemo, useState } from "react";
import { InboxFilter } from "./inbox-filter";
import { InboxList } from "./inbox-list";
import { CheckoutSection } from "./checkout-section";
import { usePages } from "@/features/page/hooks";
import { useFacebookWebhook } from "@/hooks/use-facebook-webhook";
import InboxDetail from "./inbox-detail";

export default function Inbox() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const { pages, selectedPageIds } = usePages();
  // Use selected pages from Redux, fallback to all pages if none selected
  const subscriptionPageIds = useMemo(() => {
    return selectedPageIds.length > 0 ? selectedPageIds : pages.map((p: any) => p.id);
  }, [selectedPageIds, pages]);

  // Use WebSocket with scoped subscription
  const { messages: websocketMessages } = useFacebookWebhook({
    pageIds: subscriptionPageIds,
    // Optional: send a token if required by backend later
    autoConnect: true,
  });

  // Debug log for websocket messages
  console.log('🔍 INBOX - WEBSOCKET MESSAGES:', websocketMessages);


  return (
    <div className="messages-page w-full max-w-[1400px] h-[calc(100vh-75px)] flex gap-4 p-4">
      {/* Column 1: Filter Menu */}
      <div className="w-16 flex-shrink-0">
        <InboxFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Column 2: Message List */}
      <div className="w-80 flex-shrink-0">
        <InboxList
          pageIds={subscriptionPageIds}
          filter={activeFilter}
          selectedMessageId={selectedMessageId}
          onMessageSelect={setSelectedMessageId}
          websocketMessages={websocketMessages}
        />
      </div>

      {/* Column 3: Message Detail */}
      <div className="flex-1 min-w-0">
        <InboxDetail
          conversationId={selectedMessageId}
          pageIds={subscriptionPageIds}
        />
      </div>

      {/* Column 4: Checkout Section */}
      <div className="w-96 flex-shrink-0">
        <CheckoutSection
          messageId={selectedMessageId}
        />
      </div>
    </div>
  );
}