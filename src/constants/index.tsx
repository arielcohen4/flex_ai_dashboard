import {
  IconTool,
  IconUser,
  IconDatabase,
  IconChartDots2
} from "@tabler/icons-react";

export const sidebarNavItems = [
  {
    title: "Profile",
    icon: <IconUser size={18} />,
    href: "/settings",
  },
  {
    title: "API Keys",
    icon: <IconTool size={18} />,
    href: "/settings/api-keys",
  },
  {
    title: "Storage",
    icon: <IconDatabase size={18} />,
    href: "/settings/storage",
  },
  {
    title: "Tracking",
    icon: <IconChartDots2 size={18} />,
    href: "/settings/tracking",
  },
];
