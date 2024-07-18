import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  BookCheck,
  LayoutGrid,
  LucideIcon,
  Grid2x2X,
  KeyRound,
  ShieldAlert
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
  icon: LucideIcon
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
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/tasks",
          label: "Tasks",
          active: pathname.includes("/tasks"),
          icon: BookCheck,
          submenus: []
        },
        {
          href: "/apps",
          label: "Apps",
          active: pathname.includes("/apps"),
          icon: Grid2x2X,
          submenus: []
        },
        {
          href: "",
          label: "Authentication",
          active: pathname.includes("/authentication"),
          icon: KeyRound,
          submenus: [
            {
              href: "/sign-in",
              label: "Sign In (email + password)",
              active: pathname === "/sign-in"
            },
            {
              href: "/sign-in-2",
              label: "Sign In (Box)",
              active: pathname === "/sign-in-2"
            },
            {
              href: "/sign-up",
              label: "Sign Up",
              active: pathname === "/sign-up"
            },
            {
              href: "/forgot-password",
              label: "Forgot Password",
              active: pathname === "/forgot-password"
            },
            {
              href: "/otp",
              label: "OTP",
              active: pathname === "/otp"
            },
          ]
        },
        {
          href: "",
          label: "Error Pages",
          active: pathname.includes("/error-pages"),
          icon: ShieldAlert,
          submenus: [
            {
              href: "/not-found",
              label: "Not Found",
              active: pathname === "/not-found"
            },
            {
              href: "/internal-server-error",
              label: "Internal Server Error",
              active: pathname === "/internal-server-error"
            },
            {
              href: "/maintenance-error",
              label: "Maintenance Error",
              active: pathname === "/maintenance-error"
            },
            {
              href: "/unauthorised-error",
              label: "Unauthorised Error",
              active: pathname === "/unauthorised-error"
            },
          ]
        },
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          active: pathname.includes("/users"),
          icon: Users,
          submenus: []
        },
        {
          href: "/settings",
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: Settings,
          submenus: []
        }
      ]
    }
  ];
}
