"use client";

import { memo, useState } from "react";
import clsx from "clsx";
import {
    IconMessageCircle,
    IconMail,
    IconCheckCircle,
    IconPhone,
    IconStar,
    IconClock,
    IconCalendar,
    IconGlobe,
    IconUsers,
} from "@/icons";

interface FilterOption {
    id: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    bgColor?: string;
    component?: React.ReactNode;
    onClick?: () => void;
    hasActiveFilter?: boolean;
}

interface InboxFilterProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export const InboxFilter = memo(function InboxFilter({
    activeFilter,
    onFilterChange,
}: InboxFilterProps) {
    const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

    const filterOptions: FilterOption[] = [
        {
            id: "all",
            icon: IconMessageCircle,
            label: "Tất cả tin nhắn",
            bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
        },
        {
            id: "unread",
            icon: IconMail,
            label: "Chưa đọc",
            bgColor: "bg-red-500/10 hover:bg-red-500/20",
        },
        {
            id: "read",
            icon: IconCheckCircle,
            label: "Đã đọc",
            bgColor: "bg-gray-500/10 hover:bg-gray-500/20",
        },
        {
            id: "comments",
            icon: IconMessageCircle,
            label: "Bình luận",
            bgColor: "bg-green-500/10 hover:bg-green-500/20",
        },
        {
            id: "phone",
            icon: IconPhone,
            label: "Có số điện thoại",
            bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
        },
        {
            id: "important",
            icon: IconStar,
            label: "Quan trọng",
            bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
        },
        {
            id: "unanswered",
            icon: IconClock,
            label: "Chưa trả lời",
            bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
        },
        {
            id: "timeRange",
            icon: IconCalendar,
            label: "Khoảng thời gian",
            bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
            hasActiveFilter: false,
        },
        {
            id: "source",
            icon: IconGlobe,
            label: "Nguồn",
            bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
            hasActiveFilter: false,
        },
        {
            id: "assignee",
            icon: IconUsers,
            label: "Người phân công",
            bgColor: "bg-violet-500/10 hover:bg-violet-500/20",
            hasActiveFilter: false,
        },
    ];

    const handleFilterClick = (filterId: string, onClick?: () => void) => {
        onFilterChange(filterId);
        if (onClick) {
            onClick();
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 pb-2 px-2 bg-gradient-to-b from-background to-muted rounded-xl">
            {filterOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = activeFilter === option.id;
                const isHovered = hoveredFilter === option.id;

                return (
                    <div key={option.id} className="relative">
                        <button
                            onClick={() => handleFilterClick(option.id, option.onClick)}
                            onMouseEnter={() => setHoveredFilter(option.id)}
                            onMouseLeave={() => setHoveredFilter(null)}
                            className={clsx(
                                "relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                                "shadow-sm hover:shadow-md",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                    : clsx(
                                        option.bgColor,
                                        "text-foreground/70 hover:text-foreground hover:scale-105"
                                    )
                            )}
                        >
                            <IconComponent className="w-6 h-6" />
                        </button>
                        {isHovered && (
                            <div className="absolute left-12 top-1/2 transform -translate-y-1/2 z-50">
                                <div className="bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                                    {option.label}
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-foreground rotate-45"></div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

export default InboxFilter; 