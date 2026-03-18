import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HeaderActionsProps {
  userName: string;
  showAdvisorAvatars?: boolean;
}

export const HeaderActions = ({ userName, showAdvisorAvatars = true }: HeaderActionsProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="flex items-center gap-4">
      {showAdvisorAvatars && (
        <div className="flex gap-1">
          <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">CZ</span>
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">DH</span>
          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">EW</span>
          <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">IN</span>
          <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">RS</span>
        </div>
      )}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{userName}</span>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
