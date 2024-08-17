import {
  IconBrowserCheck,
  IconExclamationCircle,
  IconNotification,
  IconPalette,
  IconTool,
  IconUser,
  IconDatabase,
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
];
