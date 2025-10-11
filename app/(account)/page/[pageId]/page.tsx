"use client";

import { Inbox } from "@/features/inbox";
import { useParams } from "next/navigation";

export default function InboxPage() {
    const params = useParams();
    const pageId = params.pageId as string;

    return (
        <Inbox pageId={pageId} />
    )
}