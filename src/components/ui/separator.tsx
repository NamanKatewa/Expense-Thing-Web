"use client";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import type * as React from "react";

import { cn } from "~/lib/utils";

function Separator({
	className,
	orientation = "horizontal",
	...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
	return (
		<SeparatorPrimitive
			className={cn(
				"shrink-0 bg-black dark:bg-white",
				orientation === "horizontal" ? "h-0.5 w-full" : "h-full w-0.5",
				className,
			)}
			orientation={orientation}
			{...props}
		/>
	);
}

export { Separator };
