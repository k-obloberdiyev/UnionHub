import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { profile } = useProfile();
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger />
        
        {/* search removed */}

        <div className="flex-1" />

        <div className="flex items-center gap-3">

          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/evaluation">Evaluation</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-muted rounded-lg p-2 transition-colors">
                    <div className="text-right hidden sm:block">
                      {profile ? (
                        <>
                          <p className="text-sm font-medium">
                            {`${profile.first_name} ${profile.last_name}`}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="text-coin-gold">🪙</span>
                            <span className="font-semibold text-coin-gold">
                              {profile?.coins ?? 0} coins
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate('/login');
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // If there's no profile (not logged in), show a Login button in the top-right
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
