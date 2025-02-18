import { AlignHorizontalJustifyCenterIcon, Blocks, CircleDollarSign, CircleUser, Home, Menu, MessagesSquare, Plus, Radio, Rocket, Settings,Users } from "lucide-react";
import { iconType } from "../../../bounty/src/types/types";

const icons = {
  home: ({ size = 16, color = "#000", className }: iconType) => (
    <Home size={size} color={color} className={className ?? ""} />
  ),
  users: ({ size = 16, color = "#000", className }: iconType) => (
    <Users size={size} color={color} className={className ?? ""} />
  ),
  broadcast: ({ size = 16, color = "#000", className }: iconType) => (
    <Radio size={size} color={color} className={className ?? ""} />
  ),
  messages: ({ size = 16, color = "#000", className }: iconType) => (
    <MessagesSquare size={size} color={color} className={className ?? ""} />
  ),
  profile: ({ size = 16, color = "#000", className }: iconType) => (
    <CircleUser size={size} color={color} className={className ?? ""} />
  ),
  menu: ({ size = 16, color = "#000", className }: iconType) => (
    <Menu size={size} color={color} className={className ?? ""} />
  ),
  CircleDollarSign: ({ size = 16, color = "#000", className }: iconType) => (
    <CircleDollarSign size={size} color={color} className={className ?? ""} />
  ),
  Settings: ({ size = 16, color = "#000", className }: iconType) => (
    <Settings size={size} color={color} className={className ?? ""} />
  ),
  Blocks: ({ size = 16, color = "#000", className }: iconType) => (
    <Blocks size={size} color={color} className={className ?? ""} />
  ),
  AlignHorizontalJustifyCenterIcon: ({ size = 16, color = "#000", className }: iconType) => (
    <AlignHorizontalJustifyCenterIcon size={size} color={color} className={className ?? ""} />
  ),
  Rocket: ({ size = 16, color = "#000", className }: iconType) => (
    <Rocket size={size} color={color} className={className ?? ""} />
  ),
  Plus: ({ size = 16, color = "#000", className }: iconType) => (
    <Plus size={size} color={color} className={className ?? ""} />
  ),
};

export default icons;
