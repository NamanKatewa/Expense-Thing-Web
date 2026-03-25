"use client";

import { Switch as SwitchPrimitives } from "@base-ui/react/switch";
import type * as React from "react";

import { cn } from "~/lib/utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
	return (
		<SwitchPrimitives.Root
			className={cn(
				"peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-none border-2 border-black bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-black data-[state=unchecked]:bg-white dark:border-white dark:bg-black dark:data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-black",
				className,
			)}
			{...props}
		>
			<SwitchPrimitives.Thumb
				className={cn(
					"pointer-events-none block h-5 w-5 rounded-none border-2 border-black bg-white transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-white data-[state=unchecked]:bg-black dark:border-white dark:bg-black dark:data-[state=checked]:bg-black dark:data-[state=unchecked]:bg-white",
				)}
			/>
		</SwitchPrimitives.Root>
	);
}

export { Switch };
