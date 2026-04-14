import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { UpworkProfile } from "@/types/types";
import { Separator } from "../ui/separator";

export type ProfileStatus = "active" | "inactive";

interface ProfileCardProps {
  profileInfo: UpworkProfile;
}

export const ProfileCard = ({ profileInfo }: ProfileCardProps) => {
  const {
    profile_name,

    profile_link,
    focus_area,
    skill_tags,
    status,
  } = profileInfo;

  const skills = skill_tags
    ?.split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const initials = profile_name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = status === "active";
  const profile_pic = undefined;
  const rate_per_hour = 15;
  const bio = "I am full Stack engineer with 13+ years of experience in JAVA";

  return (
    <Card className="profile-card group border-0 border-t-6 border-green-400">
      <CardHeader className="profile-card__header">
        <div className="flex gap-2 justify-between items-center w-full">
          <div>
            <Avatar className="profile-card__avatar self-center h-16 w-16">
              <AvatarImage src={profile_pic || undefined} alt={profile_name} />
              <AvatarFallback className="profile-card__avatar-fallback">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="profile-card__top-row flex-1">
            <div className="profile-card__identity text-center">
              <h3 className="profile-card__name whitespace-pre-wrap">{profile_name}</h3>
              <p className="profile-card__focus-area">{focus_area}</p>
            </div>
          </div>
        </div>

        <Separator className="h-0.5 group-hover:bg-primary" />
      </CardHeader>

      <CardContent className="profile-card__content">
        <div className="profile-card___content_rate-bio items-center">
          <p className="profile-card__bio line-clamp-3 text-gray-700 bg-gray-700/10 p-2 rounded">
            {bio}
          </p>
          <div className="profile-card__rate-block text-center">
            <span className="profile-card__rate-label">Rate</span>
            <p className="profile-card__rate-value">${rate_per_hour}/hr</p>
          </div>
        </div>
        <div className="profile-card__skills">
          {skills?.map((skill) => (
            <Badge key={skill} variant="disabled" className="profile-card__skill-badge">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="profile-card__footer p-2 bg-gray-700/10 place-content-end">
        <Link href={profile_link as unknown as URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="xs" className="profile-card__cta">
            Visit
            <ExternalLink className="profile-card__cta-icon" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
