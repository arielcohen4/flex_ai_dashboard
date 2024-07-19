"use client";
import { HTMLAttributes, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/custom/button";
import { PasswordInput } from "@/components/custom/password-input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Please enter your email" })
		.email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(1, {
			message: "Please enter your password",
		})
		.min(7, {
			message: "Password must be at least 7 characters long",
		}),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const params = useSearchParams();
	const next = params.get("next") || "";
	const handleLoginWithOAuth = (provider: "github" | "google") => {
		const supabase = supabaseBrowser();
		console.log(location.origin + "/auth/callback?next=" + next)
		supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: location.origin + "/auth/callback?next=" + next,
			},
		});
	};

	const handleLoginWithPassword = () => {
		const supabase = supabaseBrowser();
		console.log(location.origin + "/auth/callback?next=" + next)
		supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);
		console.log(data);

		setTimeout(() => {
			setIsLoading(false);
		}, 3000);
	}

	return (
		<div className={cn("grid gap-6", className)} {...props}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="grid gap-2">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-1">
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="name@example.com" {...field} value={email}
											onChange={(e) => {
												field.onChange(e);
												setEmail(e.target.value);
											}}/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className="space-y-1">
									<div className="flex items-center justify-between">
										<FormLabel>Password</FormLabel>
										<Link
											href="/forgot-password"
											className="text-sm font-medium text-muted-foreground hover:opacity-75"
										>
											Forgot password?
										</Link>
									</div>
									<FormControl>
										<PasswordInput placeholder="********" {...field} value={password}
											onChange={(e) => {
												field.onChange(e);
												setPassword(e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button className="mt-2" loading={isLoading} onClick={() => handleLoginWithPassword()}>
							Login
						</Button>

						<div className="relative my-2">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								className="w-full"
								type="button"
								onClick={() => handleLoginWithOAuth("github")}
								loading={isLoading}
								leftSection={<IconBrandGithub className="h-4 w-4" />}
							>
								GitHub
							</Button>
							<Button
								variant="outline"
								className="w-full"
								type="button"
								onClick={() => handleLoginWithOAuth("google")}
								loading={isLoading}
								leftSection={<IconBrandGoogle className="h-4 w-4" />}
							>
								Google
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
