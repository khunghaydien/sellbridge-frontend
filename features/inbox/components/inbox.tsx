"use client";

import { useState } from "react";
import { InboxFilter } from "./inbox-filter";
import { InboxList } from "./inbox-list";
import { InboxDetail } from "./inbox-detail";
import { CheckoutSection } from "./checkout-section";


export default function page() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");


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
          filter={activeFilter}
          selectedMessageId={selectedMessageId}
          onMessageSelect={setSelectedMessageId}
        />
      </div>

      {/* Column 3: Message Detail */}
      <div className="flex-1 min-w-0">
        <InboxDetail
          messageId={selectedMessageId}
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