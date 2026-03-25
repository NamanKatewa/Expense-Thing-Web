"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface CreateGroupModalProps {
	trigger?: React.ReactNode;
	onSubmit?: (data: CreateGroupData) => void;
}

export interface CreateGroupData {
	name: string;
	description: string;
}

export function CreateGroupModal({ trigger, onSubmit }: CreateGroupModalProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const resetForm = () => {
		setName("");
		setDescription("");
	};

	const handleSubmit = () => {
		if (!name.trim()) return;

		onSubmit?.({ name: name.trim(), description: description.trim() });
		setOpen(false);
		resetForm();
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Group</DialogTitle>
					<DialogDescription>
						Create a group to start splitting expenses with friends, family, or
						roommates.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Group Name</Label>
						<Input
							id="name"
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Trip to Japan, Apartment 4B"
							value={name}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="What's this group for?"
							value={description}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={() => setOpen(false)} variant="outline">
						Cancel
					</Button>
					<Button disabled={!name.trim()} onClick={handleSubmit}>
						Create Group
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
