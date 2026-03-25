import { cn } from "~/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-none border-2 border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5",
				className,
			)}
			{...props}
		/>
	);
}

export { Skeleton };
