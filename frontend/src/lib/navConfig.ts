import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Home,
  Info,
  ListChecks,
} from "lucide-react";

export type NavLinkKey =
  | "home"
  | "onboardingProcess"
  | "scholarships"
  | "partners"
  | "resources"
  | "about";

export type NavGroup = "explore";

export type NavLinkConfig = {
  to: "/" | "/onboarding-process" | "/scholarships" | "/partners" | "/resources" | "/about";
  key: NavLinkKey;
  icon: LucideIcon;
  group: NavGroup;
  hintKey?: string;
};

export const exploreNavLinks: NavLinkConfig[] = [
  { to: "/", key: "home", icon: Home, group: "explore" },
  { to: "/onboarding-process", key: "onboardingProcess", icon: ListChecks, group: "explore" },
  {
    to: "/scholarships",
    key: "scholarships",
    icon: GraduationCap,
    group: "explore",
    hintKey: "scholarships",
  },
  { to: "/partners", key: "partners", icon: Building2, group: "explore" },
  { to: "/resources", key: "resources", icon: BookOpen, group: "explore" },
  { to: "/about", key: "about", icon: Info, group: "explore" },
];
