"use client";

import { memo, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
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

// Helper function to create custom background styles
const getCustomBackgroundSx = (bgColor?: string, hoverColor?: string) => {
    if (!bgColor) return undefined;
    
    return {
        '&:not([aria-pressed="true"])': {
            backgroundColor: bgColor,
            '&:hover': {
                backgroundColor: hoverColor || bgColor.replace('0.1', '0.2'), // Auto darken if no hover color
            }
        }
    };
};

interface FilterOption {
    id: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    bgColor?: string;  // CSS color or object with bg and hover
    hoverColor?: string; // Optional hover color
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

    const filterOptions: FilterOption[] = [
        {
            id: "all",
            icon: IconMessageCircle,
            label: "Tất cả tin nhắn",
            bgColor: "rgba(59, 130, 246, 0.1)", // blue-500/10
            hoverColor: "rgba(59, 130, 246, 0.2)", // blue-500/20
        },
        {
            id: "unread",
            icon: IconMail,
            label: "Chưa đọc",
            bgColor: "rgba(239, 68, 68, 0.1)", // red-500/10
            hoverColor: "rgba(239, 68, 68, 0.2)", // red-500/20
        },
        {
            id: "read",
            icon: IconCheckCircle,
            label: "Đã đọc",
            bgColor: "rgba(107, 114, 128, 0.1)", // gray-500/10
            hoverColor: "rgba(107, 114, 128, 0.2)", // gray-500/20
        },
        {
            id: "comments",
            icon: IconMessageCircle,
            label: "Bình luận",
            bgColor: "rgba(34, 197, 94, 0.1)", // green-500/10
            hoverColor: "rgba(34, 197, 94, 0.2)", // green-500/20
        },
        {
            id: "phone",
            icon: IconPhone,
            label: "Có số điện thoại",
            bgColor: "rgba(168, 85, 247, 0.1)", // purple-500/10
            hoverColor: "rgba(168, 85, 247, 0.2)", // purple-500/20
        },
        {
            id: "important",
            icon: IconStar,
            label: "Quan trọng",
            bgColor: "rgba(234, 179, 8, 0.1)", // yellow-500/10
            hoverColor: "rgba(234, 179, 8, 0.2)", // yellow-500/20
        },
        {
            id: "unanswered",
            icon: IconClock,
            label: "Chưa trả lời",
            bgColor: "rgba(249, 115, 22, 0.1)", // orange-500/10
            hoverColor: "rgba(249, 115, 22, 0.2)", // orange-500/20
        },
        {
            id: "timeRange",
            icon: IconCalendar,
            label: "Khoảng thời gian",
            bgColor: "rgba(20, 184, 166, 0.1)", // teal-500/10
            hoverColor: "rgba(20, 184, 166, 0.2)", // teal-500/20
            hasActiveFilter: false,
        },
        {
            id: "source",
            icon: IconGlobe,
            label: "Nguồn",
            bgColor: "rgba(6, 182, 212, 0.1)", // cyan-500/10
            hoverColor: "rgba(6, 182, 212, 0.2)", // cyan-500/20
            hasActiveFilter: false,
        },
        {
            id: "assignee",
            icon: IconUsers,
            label: "Người phân công",
            bgColor: "rgba(139, 92, 246, 0.1)", // violet-500/10
            hoverColor: "rgba(139, 92, 246, 0.2)", // violet-500/20
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
                return (
                    <Tooltip key={option.id} title={option.label} placement="right" arrow>
                        <IconButton
                            onClick={() => handleFilterClick(option.id, option.onClick)}
                            aria-pressed={isActive}
                            sx={getCustomBackgroundSx(option.bgColor, option.hoverColor)}
                        >
                            <IconComponent className="w-6 h-6" />
                        </IconButton>
                    </Tooltip>
                );
            })}
        </div>
    );
});

export default InboxFilter; 