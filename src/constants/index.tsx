import {
  IconTool,
  IconUser,
  IconDatabase,
  IconWeight
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
    title: "Weights and Biases",
    icon: <IconWeight size={18} />,
    href: "/settings/wandb",
  },
];
