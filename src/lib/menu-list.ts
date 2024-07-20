import {
  Tag,
  Users,
  Settings,
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
      groupLabel: "Contents",
      menus: [
        {
          href: "/create",
          label: "Create Task",
          active: pathname.includes("/create"),
          icon: CircleFadingPlusIcon,
          submenus: [],
        },
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
      ],
    },
  ];
}
