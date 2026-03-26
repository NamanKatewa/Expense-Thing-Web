"use client";

import { ArrowLeft, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid credentials. Try again.");
			} else {
				router.push("/dashboard");
			}
		} catch {
			setError("System failure. Try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<nav className="fixed top-0 right-0 left-0 z-50 border-black border-b-2 bg-background px-6 dark:border-white">
				<div className="mx-auto flex h-16 w-full items-center justify-between">
					<Link className="flex items-center gap-3" href="/">
						<Image alt="Logo" height={32} src="/logo.png" width={32} />
						<span className="font-bold font-serif text-2xl uppercase tracking-tight">
							ExpenseThing
						</span>
					</Link>
				</div>
			</nav>

			<main className="flex min-h-screen flex-col lg:flex-row">
				<div className="flex flex-1 flex-col justify-center border-black p-8 lg:border-r-4 lg:p-24 dark:border-white">
					<Link
						className="mb-12 inline-flex items-center gap-3 font-bold font-sans text-sm uppercase tracking-[0.2em] decoration-2 underline-offset-8 hover:underline"
						href="/"
					>
						<ArrowLeft className="h-4 w-4" />
						Return Home
					</Link>

					<h1 className="font-bold font-serif text-[clamp(4rem,10vw,8rem)] uppercase leading-[0.85] tracking-tighter">
						Welcome
						<br />
						Back.
					</h1>
					<p className="mt-8 max-w-md font-bold font-sans text-xl uppercase tracking-widest opacity-60">
						The ledger awaits your input. Access your account to settle the
						scores.
					</p>
				</div>

				<div className="flex flex-1 items-center justify-center bg-[#F0F0F0] p-8 lg:p-24 dark:bg-zinc-900">
					<div className="brutal-shadow w-full max-w-md border-4 border-black bg-white p-10 dark:border-white dark:bg-black">
						<div className="mb-10 border-black border-b-4 pb-6 dark:border-white">
							<h2 className="font-bold font-serif text-4xl uppercase">
								Identification
							</h2>
						</div>

						{error && (
							<div className="mb-8 border-2 border-[#E05D36] bg-[#FFF0EB] p-4 font-bold font-sans text-[#E05D36] text-sm uppercase tracking-wider dark:bg-[#331100]">
								{error}
							</div>
						)}

						<form className="space-y-8" onSubmit={handleSubmit}>
							<div>
								<label className="mb-3 block font-black font-sans text-xs uppercase tracking-[0.2em]">
									Email Address
								</label>
								<div className="relative">
									<input
										className="w-full border-2 border-black bg-white py-4 pr-4 pl-12 font-bold font-sans text-black uppercase placeholder:text-black/30 focus:bg-black focus:text-white focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black dark:placeholder:text-white/30"
										onChange={(e) => setEmail(e.target.value)}
										placeholder="NAME@SYNDICATE.COM"
										required
										type="email"
										value={email}
									/>
									<Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 opacity-40 group-focus:opacity-100" />
								</div>
							</div>

							<div>
								<label className="mb-3 block font-black font-sans text-xs uppercase tracking-[0.2em]">
									Security Key
								</label>
								<div className="relative">
									<input
										className="w-full border-2 border-black bg-white py-4 pr-12 pl-12 font-bold font-sans text-black uppercase placeholder:text-black/30 focus:bg-black focus:text-white focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black dark:placeholder:text-white/30"
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										required
										type={showPassword ? "text" : "password"}
										value={password}
									/>
									<Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 opacity-40" />
									<button
										className="absolute top-1/2 right-4 -translate-y-1/2 font-black font-sans text-xs uppercase tracking-widest hover:underline"
										onClick={() => setShowPassword(!showPassword)}
										type="button"
									>
										{showPassword ? "Hide" : "Show"}
									</button>
								</div>
							</div>

							<button
								className="w-full border-4 border-black bg-black py-5 font-black font-sans text-lg text-white uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
								disabled={isLoading}
								type="submit"
							>
								{isLoading ? "Authenticating..." : "Access Ledger"}
							</button>
						</form>

						<p className="mt-10 text-center font-bold font-sans text-sm uppercase tracking-widest opacity-60">
							New Recruit?{" "}
							<Link
								className="text-black underline decoration-2 underline-offset-4 hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black"
								href="/register"
							>
								Register Now
							</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
