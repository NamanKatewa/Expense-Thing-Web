export type ExpenseCategory =
	| "FOOD"
	| "TRANSPORT"
	| "HOUSING"
	| "UTILITIES"
	| "ENTERTAINMENT"
	| "SHOPPING"
	| "HEALTHCARE"
	| "TRAVEL"
	| "EDUCATION"
	| "OTHER";

export type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";

export type ActivityType =
	| "EXPENSE_CREATED"
	| "EXPENSE_EDITED"
	| "EXPENSE_DELETED"
	| "SETTLEMENT_CREATED"
	| "MEMBER_JOINED"
	| "MEMBER_LEFT"
	| "GROUP_CREATED";

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

export interface User {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
}

export interface GroupMember {
	id: string;
	userId: string;
	groupId: string;
	role: MemberRole;
	joinedAt: string;
	user: User;
}

export interface Group {
	id: string;
	name: string;
	description: string | null;
	image: string | null;
	members: GroupMember[];
}

export interface ExpensePayer {
	id: string;
	userId: string;
	amount: number;
	isPaid: boolean;
	user: User;
}

export interface ExpenseSplit {
	id: string;
	userId: string;
	type: SplitType;
	value: number;
	user: User;
}

export interface Expense {
	id: string;
	description: string;
	amount: number;
	date: string;
	category: ExpenseCategory;
	createdById: string;
	groupId: string;
	createdBy: User;
	payers: ExpensePayer[];
	splits: ExpenseSplit[];
}

export interface Settlement {
	id: string;
	amount: number;
	description: string | null;
	date: string;
	isPartial: boolean;
	remainingAmount: number | null;
	groupId: string;
	fromUserId: string;
	toUserId: string;
	fromUser: User;
	toUser: User;
}

export interface Activity {
	id: string;
	type: ActivityType;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	userId: string;
	groupId: string | null;
	user: User;
	group: Group | null;
}

export interface Balance {
	userId: string;
	user: User;
	amount: number;
}

export interface SimplifiedDebt {
	from: User;
	to: User;
	amount: number;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
	FOOD: "Food",
	TRANSPORT: "Transport",
	HOUSING: "Housing",
	UTILITIES: "Utilities",
	ENTERTAINMENT: "Entertainment",
	SHOPPING: "Shopping",
	HEALTHCARE: "Healthcare",
	TRAVEL: "Travel",
	EDUCATION: "Education",
	OTHER: "Other",
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
	FOOD: "🍔",
	TRANSPORT: "🚗",
	HOUSING: "🏠",
	UTILITIES: "💡",
	ENTERTAINMENT: "🎬",
	SHOPPING: "🛒",
	HEALTHCARE: "🏥",
	TRAVEL: "✈️",
	EDUCATION: "📚",
	OTHER: "📦",
};
