"use client";

import { CreatePost } from "@/features/post";
import { useParams } from "next/navigation";

export default function CreatePostPage() {
    const params = useParams();
    const pageId = params.pageId as string;

    return <CreatePost pageId={pageId} />;
}



