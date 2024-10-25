import {
  Tag,
  Users,
  Settings,
  BarChart2,
  Medal,
  Bookmark,
  SquarePen,
  BookCheck,
  LayoutGrid,
  LucideIcon,
  Brain,
  KeyRound,
  ShieldAlert,
  Grid2X2,
  ScrollText,
  SquareArrowOutUpRightIcon,
  CircleFadingPlusIcon,
  NetworkIcon,
  BarChart,
  MessageSquare,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "Dashboard",
          active: pathname === "/",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Create",
      menus: [
        {
          href: "/create",
          label: "Create Task",
          active: pathname.includes("/create"),
          icon: CircleFadingPlusIcon,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/tasks",
          label: "Tasks",
          active: pathname.includes("/tasks"),
          icon: BookCheck,
          submenus: [],
        },
        {
          href: "/models",
          label: "Models",
          active: pathname.includes("/models"),
          icon: Brain,
          submenus: [],
        },
        {
          href: "/datasets",
          label: "Datasets",
          active: pathname.includes("/datasets"),
          icon: Grid2X2,
          submenus: [],
        },
        {
          href: "/endpoints",
          label: "Endpoints",
          active: pathname.includes("/endpoints"),
          icon: NetworkIcon,
          submenus: [],
        },
        {
          href: "/playground",
          label: "Playground",
          active: pathname.includes("/playground"),
          icon: MessageSquare,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/settings",
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: Settings,
          submenus: [],
        },
        {
          href: "/usage",
          label: "Usage",
          active: pathname.includes("/usage"),
          icon: BarChart2,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "External",
      menus: [
        {
          href: "https://chat.lmsys.org/?leaderboard",
          label: "Leaderboard",
          active: pathname.includes("/leaderboard"),
          icon: Medal,
          submenus: [],
        },
      ],
    },
  ];
}
