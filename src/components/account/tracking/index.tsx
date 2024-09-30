"use client";
import ContentSection from "../layout/content-section";
import { TrackingForm } from "./tracking-form";

export default function 
() {
	return (
		<ContentSection
			title="Weights and Biases"
			desc="Set your Weights and Biases key"
		>
			<TrackingForm />
		</ContentSection>
	);
}
