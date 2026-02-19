import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";
import { FamilyMemberListItem, BusinessListItem } from "@/hooks/useClientRelationships";
import { Client } from "@/types/client";

interface FamilyTreeWidgetProps {
  client: Client;
  familyMembers: FamilyMemberListItem[];
  businesses: BusinessListItem[];
  totalAssetValue: number;
  currencySymbol: string;
  onClose: () => void;
}

const AVATAR_COLORS = [
  "hsl(180, 60%, 40%)",
  "hsl(210, 55%, 50%)",
  "hsl(260, 45%, 55%)",
  "hsl(330, 50%, 50%)",
  "hsl(30, 60%, 50%)",
  "hsl(150, 50%, 40%)",
  "hsl(0, 50%, 50%)",
  "hsl(45, 60%, 45%)",
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatValue(value: number, symbol: string) {
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value.toLocaleString()}`;
}

interface NodeProps {
  name: string;
  relationship?: string;
  value: number;
  currencySymbol: string;
  isMain?: boolean;
  status?: "active" | "attention";
}

const TreeNode = ({ name, relationship, value, currencySymbol, isMain, status = "active" }: NodeProps) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="relative">
      <div
        className="flex items-center justify-center rounded-full text-white font-semibold"
        style={{
          backgroundColor: getAvatarColor(name),
          width: isMain ? 44 : 36,
          height: isMain ? 44 : 36,
          fontSize: isMain ? 13 : 10,
        }}
      >
        {getInitials(name)}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
          status === "active" ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
    </div>
    <span className={`text-[11px] font-medium text-foreground text-center leading-tight max-w-[72px] truncate ${isMain ? "font-semibold" : ""}`}>
      {name}
    </span>
    {relationship && (
      <span className="text-[9px] text-muted-foreground">{relationship}</span>
    )}
    <span className="text-[9px] font-medium text-muted-foreground">
      {formatValue(value, currencySymbol)}
    </span>
  </div>
);

const FamilyTreeWidget = ({
  client,
  familyMembers,
  businesses,
  totalAssetValue,
  currencySymbol,
  onClose,
}: FamilyTreeWidgetProps) => {
  const allMembers = useMemo(() => {
    const members = [
      ...familyMembers.map((f, i) => ({
        id: f.id,
        name: f.name,
        relationship: f.familyType,
        status: (i % 3 === 2 ? "attention" : "active") as "active" | "attention",
        value: Math.round(totalAssetValue * (0.05 + (i * 0.08) % 0.3)),
      })),
      ...businesses.map((b, i) => ({
        id: b.id,
        name: b.name,
        relationship: b.type,
        status: "active" as const,
        value: Math.round(totalAssetValue * (0.1 + (i * 0.05) % 0.2)),
      })),
    ];
    return members;
  }, [familyMembers, businesses, totalAssetValue]);

  const clientName = `${client.first_name} ${client.surname || ""}`.trim();

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Family & Relationships</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 min-h-0 overflow-auto">
        <div className="flex flex-col items-center">
          {/* Main client node */}
          <TreeNode
            name={clientName}
            value={totalAssetValue}
            currencySymbol={currencySymbol}
            isMain
            status="active"
          />

          {/* Connecting lines */}
          {allMembers.length > 0 && (
            <svg
              width="100%"
              height="28"
              className="my-0.5"
              viewBox={`0 0 ${Math.max(allMembers.length * 90, 180)} 28`}
              preserveAspectRatio="xMidYMid meet"
            >
              {allMembers.map((_, i) => {
                const totalWidth = allMembers.length * 90;
                const centerX = totalWidth / 2;
                const memberX = i * 90 + 45;
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={0}
                    x2={memberX}
                    y2={28}
                    stroke="hsl(var(--border))"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                );
              })}
            </svg>
          )}

          {/* Member nodes */}
          {allMembers.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3 mt-0.5">
              {allMembers.map((m) => (
                <TreeNode
                  key={m.id}
                  name={m.name}
                  relationship={m.relationship}
                  value={m.value}
                  currencySymbol={currencySymbol}
                  status={m.status}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-4">No household members added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyTreeWidget;
