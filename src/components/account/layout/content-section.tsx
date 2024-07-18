"use client";
import { Separator } from "@/components/ui/separator";
import SidebarNav from "./sidebar-nav";
import { sidebarNavItems } from "@/constants";

interface ContentSectionProps {
	title: string;
	desc: string;
	children: JSX.Element;
}

export default function ContentSection({
	title,
	desc,
	children,
}: ContentSectionProps) {
	return (
		<div className="flex flex-col mt-7">
			<div className="space-y-0.5">
				<h1 className="text-2xl font-bold tracking-tight md:text-3xl">
					Settings
				</h1>
				<p className="text-muted-foreground">
					Manage your account settings and set e-mail preferences.
				</p>
			</div>
			<Separator className="my-4 lg:my-6" />
			<div className="flex flex-1 flex-col space-y-8 md:space-y-2 md:overflow-hidden lg:flex-row lg:space-x-12 lg:space-y-0">
				<aside className="top-0 lg:sticky lg:w-1/5">
					<SidebarNav items={sidebarNavItems} />
				</aside>
				<div className="flex w-full p-1 pr-4 md:overflow-y-hidden">
					<div className="flex flex-1 flex-col">
						<div className="flex-none">
							<h3 className="text-lg font-medium">{title}</h3>
							<p className="text-sm text-muted-foreground">{desc}</p>
						</div>
						{title && <Separator className="my-4 flex-none" />}
						{/* "faded-bottom" class here */}
						<div className=" -mx-4 flex-1 overflow-auto scroll-smooth px-4 md:pb-16">
							<div className="lg:max-w-xl">{children}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
