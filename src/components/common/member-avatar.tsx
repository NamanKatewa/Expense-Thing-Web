import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface MemberAvatarProps {
	name: string | null;
	image: string | null;
	size?: "sm" | "md" | "lg";
	showStatus?: boolean;
	isOnline?: boolean;
}

const sizeClasses = {
	sm: "h-8 w-8 text-xs",
	md: "h-10 w-10 text-sm",
	lg: "h-12 w-12 text-base",
};

const fallbackSizes = {
	sm: "h-8 w-8",
	md: "h-10 w-10",
	lg: "h-12 w-12",
};

export function MemberAvatar({
	name,
	image,
	size = "md",
	showStatus = false,
	isOnline = false,
}: MemberAvatarProps) {
	const initials = name
		? name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<div className="relative inline-block">
			<Avatar className={cn(sizeClasses[size])}>
				<AvatarImage alt={name ?? "User"} src={image ?? undefined} />
				<AvatarFallback className={cn(fallbackSizes[size])}>
					{initials}
				</AvatarFallback>
			</Avatar>
			{showStatus && (
				<span
					className={cn(
						"absolute right-0 bottom-0 block rounded-full border-2 border-background",
						isOnline ? "bg-green-500" : "bg-gray-400",
						size === "sm" && "h-2 w-2",
						size === "md" && "h-2.5 w-2.5",
						size === "lg" && "h-3 w-3",
					)}
				/>
			)}
		</div>
	);
}
