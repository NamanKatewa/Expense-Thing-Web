"use client";

import {
	ArrowRight,
	CreditCard,
	Receipt,
	Shield,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingContent() {
	const [isVisible, _setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => _setIsVisible(true), 100);
		return () => clearTimeout(timer);
	}, []);

	return (
		<main className="pt-16 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<section className="relative overflow-hidden border-black border-b-2 dark:border-white">
				{/* Brutalist Grid Background */}
				<div
					className="absolute inset-0 -z-10"
					style={{
						backgroundImage:
							"linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
						backgroundSize: "40px 40px",
						opacity: 0.05,
					}}
				/>

				<div className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center border-black border-x-2 px-6 py-32 lg:py-48 dark:border-white">
					<div className="w-full max-w-5xl text-center">
						<h1
							className={`mb-8 font-serif text-7xl uppercase leading-[0.85] tracking-tighter transition-all delay-100 duration-500 md:text-9xl lg:text-[11rem] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
						>
							Split It.
							<br />
							<span className="brutal-text-shadow text-[#E05D36]">
								Settle It.
							</span>
						</h1>

						<p
							className={`mx-auto mb-12 max-w-2xl font-medium font-sans text-xl uppercase tracking-tight transition-all delay-200 duration-500 md:text-2xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
						>
							No awkwardness. No complex math. Just raw, unadulterated expense
							tracking.
						</p>

						<div
							className={`flex flex-col items-center gap-6 transition-all delay-300 duration-500 sm:flex-row sm:justify-center ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
						>
							<Link
								className="brutal-shadow flex h-16 w-full items-center justify-center gap-3 border-2 border-black bg-[#E05D36] px-10 font-bold font-sans text-black text-lg uppercase tracking-widest transition-all hover:translate-x-1 hover:-translate-y-1 sm:w-auto dark:border-white"
								href="/register"
							>
								Start Now
								<ArrowRight className="h-6 w-6" />
							</Link>
							<Link
								className="flex h-16 w-full items-center justify-center gap-3 border-2 border-black bg-background px-10 font-bold font-sans text-lg uppercase tracking-widest transition-all hover:bg-black hover:text-white sm:w-auto dark:border-white dark:hover:bg-white dark:hover:text-black"
								href="#how-it-works"
							>
								Read The Manual
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Marquee Divider */}
			<div className="flex w-full overflow-hidden border-black border-b-2 bg-black py-4 text-white dark:border-white dark:bg-white dark:text-black">
				<div className="animate-marquee whitespace-nowrap font-bold font-sans text-2xl uppercase tracking-widest">
					NO MORE IOU • TRACK EVERYTHING • SETTLE INSTANTLY • NO MORE IOU •
					TRACK EVERYTHING • SETTLE INSTANTLY • NO MORE IOU • TRACK EVERYTHING •
					SETTLE INSTANTLY •
				</div>
			</div>

			<section
				className="border-black border-b-2 dark:border-white"
				id="how-it-works"
			>
				<div className="mx-auto w-full max-w-[1400px] border-black border-x-2 dark:border-white">
					<div className="grid md:grid-cols-3">
						{[
							{
								icon: Users,
								title: "01 / Group",
								description:
									"Create stark, unyielding groups for your trips, roommates, or syndicates.",
								color: "bg-[#002FA7] text-white",
							},
							{
								icon: Receipt,
								title: "02 / Log",
								description:
									"Input expenses. Split them ruthlessly: equally, exact amounts, or shares.",
								color: "bg-[#E05D36] text-black",
							},
							{
								icon: TrendingUp,
								title: "03 / Settle",
								description:
									"See the cold, hard numbers. Pay your debts. Close the ledger.",
								color: "bg-[#B1D182] text-black",
							},
						].map((item, index) => (
							<div
								className={`group relative border-black p-10 transition-colors hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black ${index !== 2 ? "border-b-2 md:border-r-2 md:border-b-0" : ""}`}
								key={index}
							>
								<div
									className={`brutal-shadow-sm mb-8 inline-flex h-16 w-16 items-center justify-center border-2 border-black dark:border-white ${item.color}`}
								>
									<item.icon className="h-8 w-8" />
								</div>
								<h3 className="mb-4 font-bold font-serif text-4xl uppercase">
									{item.title}
								</h3>
								<p className="font-medium font-sans text-lg leading-relaxed">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="border-black border-b-2 bg-[#F5E3D8] text-black dark:border-white dark:bg-[#222]">
				<div className="mx-auto w-full max-w-[1400px] border-black border-x-2 dark:border-white">
					<div className="grid md:grid-cols-2">
						<div className="border-black border-b-2 p-12 md:border-r-2 md:border-b-0 lg:p-24 dark:border-white">
							<h2 className="mb-12 font-bold font-serif text-6xl uppercase leading-none md:text-7xl">
								Features
								<br />
								Without
								<br />
								Fluff.
							</h2>
							<div className="space-y-10">
								{[
									{
										icon: CreditCard,
										title: "Absolute Control",
										description:
											"Split modes that bend to your will. Percentages, shares, exact.",
									},
									{
										icon: TrendingUp,
										title: "Debt Optimization",
										description:
											"Algorithms that crush complex debt webs into simple transactions.",
									},
									{
										icon: Shield,
										title: "Ironclad Privacy",
										description:
											"Your data stays yours. Encrypted, secure, locked down.",
									},
								].map((feature, index) => (
									<div className="flex gap-6" key={index}>
										<div className="brutal-shadow-sm flex h-14 w-14 shrink-0 items-center justify-center border-2 border-black bg-white dark:border-white dark:bg-black">
											<feature.icon className="h-6 w-6 dark:text-white" />
										</div>
										<div>
											<h3 className="mb-1 font-bold font-sans text-2xl uppercase tracking-wide dark:text-white">
												{feature.title}
											</h3>
											<p className="font-medium font-sans text-lg opacity-80 dark:text-white">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="flex items-center justify-center bg-white p-12 lg:p-24 dark:bg-black">
							<div className="brutal-shadow w-full max-w-md border-4 border-black bg-background p-8 dark:border-white">
								<h3 className="mb-8 border-black border-b-4 pb-4 font-bold font-serif text-5xl uppercase dark:border-white">
									Ledger
								</h3>
								<div className="space-y-6 font-sans text-xl uppercase tracking-wider">
									<div className="flex items-center justify-between border-black border-b-2 border-dashed pb-4 dark:border-white">
										<span>Total Burn</span>
										<span className="font-bold">$4,320</span>
									</div>
									<div className="flex items-center justify-between border-black border-b-2 border-dashed pb-4 dark:border-white">
										<span>Your Share</span>
										<span className="font-bold">$864</span>
									</div>
									<div className="mt-8 flex items-center justify-between bg-black p-4 text-white dark:bg-white dark:text-black">
										<span className="font-bold">Settle Now</span>
										<span className="font-bold">-$280</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-black py-32 text-white dark:bg-white dark:text-black">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<h2 className="mb-8 font-bold font-serif text-7xl uppercase leading-none md:text-8xl">
						Stop Waiting.
					</h2>
					<p className="mb-12 font-medium font-sans text-2xl uppercase tracking-widest opacity-80">
						The ledger demands balance. Create your account.
					</p>
					<Link
						className="inline-flex h-20 items-center gap-4 border-4 border-white bg-transparent px-12 font-bold font-sans text-2xl uppercase tracking-widest transition-all hover:bg-white hover:text-black dark:border-black dark:hover:bg-black dark:hover:text-white"
						href="/register"
					>
						Join The Syndicate
						<ArrowRight className="h-8 w-8" />
					</Link>
				</div>
			</section>
		</main>
	);
}
