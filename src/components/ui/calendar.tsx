"use client";

import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import {
	type DayButton,
	DayPicker,
	getDefaultClassNames,
	type Locale,
} from "react-day-picker";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	buttonVariant = "ghost",
	locale,
	formatters,
	components,
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
	const defaultClassNames = getDefaultClassNames();

	return (
		<DayPicker
			captionLayout={captionLayout}
			className={cn(
				"group/calendar brutal-shadow-sm border-2 border-black bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent p-4 [--cell-size:--spacing(9)] dark:border-white",
				String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
				String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
				className,
			)}
			classNames={{
				root: cn("w-fit", defaultClassNames.root),
				months: cn(
					"relative flex flex-col gap-6 md:flex-row",
					defaultClassNames.months,
				),
				month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
				nav: cn(
					"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
					defaultClassNames.nav,
				),
				button_previous: cn(
					buttonVariants({ variant: buttonVariant }),
					"brutal-shadow-sm size-(--cell-size) select-none rounded-none border-2 border-black p-0 aria-disabled:opacity-50 dark:border-white",
					defaultClassNames.button_previous,
				),
				button_next: cn(
					buttonVariants({ variant: buttonVariant }),
					"brutal-shadow-sm size-(--cell-size) select-none rounded-none border-2 border-black p-0 aria-disabled:opacity-50 dark:border-white",
					defaultClassNames.button_next,
				),
				month_caption: cn(
					"flex h-(--cell-size) w-full items-center justify-center px-(--cell-size) font-bold font-serif text-2xl uppercase",
					defaultClassNames.month_caption,
				),
				dropdowns: cn(
					"flex h-(--cell-size) w-full items-center justify-center gap-1.5 font-bold text-sm uppercase tracking-widest",
					defaultClassNames.dropdowns,
				),
				dropdown_root: cn(
					"relative rounded-none border-2 border-black dark:border-white",
					defaultClassNames.dropdown_root,
				),
				dropdown: cn(
					"absolute inset-0 bg-popover opacity-0",
					defaultClassNames.dropdown,
				),
				caption_label: cn(
					"select-none font-bold uppercase tracking-widest",
					captionLayout === "label"
						? "text-sm"
						: "flex items-center gap-1 rounded-none border-2 border-black px-2 py-1 text-sm dark:border-white [&>svg]:size-3.5 [&>svg]:text-foreground",
					defaultClassNames.caption_label,
				),
				table: "w-full border-collapse",
				weekdays: cn("flex", defaultClassNames.weekdays),
				weekday: cn(
					"flex-1 select-none rounded-none border-black border-b-2 pb-2 font-black text-[0.7rem] text-foreground uppercase tracking-tighter dark:border-white",
					defaultClassNames.weekday,
				),
				week: cn("mt-2 flex w-full", defaultClassNames.week),
				week_number_header: cn(
					"w-(--cell-size) select-none",
					defaultClassNames.week_number_header,
				),
				week_number: cn(
					"select-none text-[0.8rem] text-muted-foreground",
					defaultClassNames.week_number,
				),
				day: cn(
					"group/day relative aspect-square h-full w-full select-none rounded-none p-0 text-center",
					defaultClassNames.day,
				),
				range_start: cn(
					"relative isolate z-0 rounded-none bg-black text-white dark:bg-white dark:text-black",
					defaultClassNames.range_start,
				),
				range_middle: cn(
					"rounded-none bg-zinc-100 dark:bg-zinc-800",
					defaultClassNames.range_middle,
				),
				range_end: cn(
					"relative isolate z-0 rounded-none bg-black text-white dark:bg-white dark:text-black",
					defaultClassNames.range_end,
				),
				today: cn(
					"rounded-none border-2 border-black bg-zinc-200 font-black text-foreground dark:border-white dark:bg-zinc-700",
					defaultClassNames.today,
				),
				outside: cn(
					"text-muted-foreground/30 aria-selected:text-muted-foreground/30",
					defaultClassNames.outside,
				),
				disabled: cn(
					"text-muted-foreground opacity-30",
					defaultClassNames.disabled,
				),
				hidden: cn("invisible", defaultClassNames.hidden),
				...classNames,
			}}
			components={{
				Root: ({ className, rootRef, ...props }) => {
					return (
						<div
							className={cn(className)}
							data-slot="calendar"
							ref={rootRef}
							{...props}
						/>
					);
				},
				Chevron: ({ className, orientation, ...props }) => {
					if (orientation === "left") {
						return (
							<ChevronLeftIcon
								className={cn("size-5 stroke-[3]", className)}
								{...props}
							/>
						);
					}

					if (orientation === "right") {
						return (
							<ChevronRightIcon
								className={cn("size-5 stroke-[3]", className)}
								{...props}
							/>
						);
					}

					return (
						<ChevronDownIcon
							className={cn("size-5 stroke-[3]", className)}
							{...props}
						/>
					);
				},
				DayButton: ({ ...props }) => (
					<CalendarDayButton locale={locale} {...props} />
				),
				WeekNumber: ({ children, ...props }) => {
					return (
						<td {...props}>
							<div className="flex size-(--cell-size) items-center justify-center text-center font-bold">
								{children}
							</div>
						</td>
					);
				},
				...components,
			}}
			formatters={{
				formatMonthDropdown: (date) =>
					date.toLocaleString(locale?.code, { month: "short" }),
				...formatters,
			}}
			locale={locale}
			showOutsideDays={showOutsideDays}
			{...props}
		/>
	);
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	locale,
	...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
	const defaultClassNames = getDefaultClassNames();

	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			className={cn(
				"relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-none border-0 font-bold uppercase leading-none tracking-widest transition-none hover:bg-black hover:text-white data-[range-end=true]:bg-black data-[range-middle=true]:bg-zinc-100 data-[range-start=true]:bg-black data-[selected-single=true]:bg-black data-[range-end=true]:text-white data-[range-middle=true]:text-foreground data-[range-start=true]:text-white data-[selected-single=true]:text-white group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-2 group-data-[focused=true]/day:border-black dark:group-data-[focused=true]/day:border-white dark:data-[range-end=true]:bg-white dark:data-[range-start=true]:bg-white dark:data-[selected-single=true]:bg-white dark:data-[range-end=true]:text-black dark:data-[range-start=true]:text-black dark:data-[selected-single=true]:text-black dark:hover:bg-white dark:hover:text-black",
				defaultClassNames.day,
				className,
			)}
			data-day={day.date.toLocaleDateString(locale?.code)}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			data-range-start={modifiers.range_start}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			size="icon"
			variant="ghost"
			{...props}
		/>
	);
}

export { Calendar, CalendarDayButton };
