"use client";
import ContentSection from "../layout/content-section";
import { WandBForm } from "./wandb-form";

export default function 
() {
	return (
		<ContentSection
			title="Weights and Biases"
			desc="Set your Weights and Biases key"
		>
			<WandBForm />
		</ContentSection>
	);
}
