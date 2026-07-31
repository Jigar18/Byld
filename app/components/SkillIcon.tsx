"use client";

import { Icon } from "@iconify/react";

export type SkillIconMap = Record<string, string | null>;

const defaultSkillIcons: Record<string, string> = {
  react: "devicon:react",
  reactjs: "devicon:react",
  nextjs: "devicon:nextjs",
  typescript: "devicon:typescript",
  javascript: "devicon:javascript",
  java: "devicon:java",
  spring: "devicon:spring",
  springboot: "devicon:spring",
  springsecurity: "devicon:spring",
  git: "devicon:git",
  github: "devicon:github",
  docker: "devicon:docker",
  postgresql: "devicon:postgresql",
  sqlserver: "devicon:microsoftsqlserver",
};

const normaliseSkill = (skill: string) =>
  skill.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getSkillIcon = (skill: string, iconMap: SkillIconMap = {}) => {
  if (iconMap[skill] === null) return undefined;
  return iconMap[skill] || defaultSkillIcons[normaliseSkill(skill)];
};

interface SkillIconProps {
  skill: string;
  iconMap?: SkillIconMap;
  className?: string;
}

export default function SkillIcon({
  skill,
  iconMap = {},
  className = "h-4 w-4 shrink-0",
}: SkillIconProps) {
  const icon = getSkillIcon(skill, iconMap);
  return icon ? (
    <Icon
      icon={icon}
      className={className}
      aria-hidden="true"
    />
  ) : null;
}
