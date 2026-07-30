import type { ComponentDoc } from "../types.ts";
import type { ButtonPublicProps } from "../../components/Button.astro";

/**
 * Typed documentation for the Button component.
 */
export const buttonDoc = {
	slug: "button",
	name: "Button",
	summary:
		"A versatile button component that supports various themes, sizes, shapes, and states. Can be used as a native button or anchor element.",
	importStatement: 'import Button from "@components/Button.astro";',
	groups: [
		{
			id: "themes",
			title: "Themes",
			description:
				"Button themes define the visual styling and color scheme of the component. The default theme is unthemed (transparent background).",
			examples: [
				{
					id: "default",
					title: "Default",
					description: "The default button style with transparent background and brand color text.",
					props: { text: "Default" },
					source: '<Button text="Default" />',
				},
				{
					id: "outlined",
					title: "Outlined",
					description: "An outlined button with a border and transparent background. Often used for secondary actions.",
					props: { theme: "outlined", text: "Outlined" },
					source: '<Button theme="outlined" text="Outlined" />',
				},
				{
					id: "tonal",
					title: "Tonal",
					description: "A tonal button with a subtle background color, often used for neutral or secondary actions.",
					props: { theme: "tonal", text: "Tonal" },
					source: '<Button theme="tonal" text="Tonal" />',
				},
				{
					id: "filled",
					title: "Filled",
					description: "A filled button with solid background color. Often used for primary actions.",
					props: { theme: "filled", text: "Filled" },
					source: '<Button theme="filled" text="Filled" />',
				},
				{
					id: "custom",
					title: "Custom",
					description: "A custom button with a unique color scheme. Useful for branding or special actions.",
					props: { theme: "custom", text: "Custom" },
					source: '<Button theme="custom" text="Custom" />',
				},
			],
		},
		{
			id: "variants",
			title: "Variants and Content",
			description: "Content variations including icon buttons, text-only buttons, and combined icons with text.",
			examples: [
				{
					id: "icon-button",
					title: "Icon Button",
					description: "A button that only displays an icon. Requires aria-label for accessibility.",
					props: { variant: "icon-button", icon: "symbols-solid", "aria-label": "Default button" },
					source: '<Button variant="icon-button" icon="symbols-solid" aria-label="Default button" />',
				},
				{
					id: "icon-button-outlined",
					title: "Outlined Icon Button",
					description: "An outlined icon button. Requires aria-label for accessibility.",
					props: { variant: "icon-button", theme: "outlined", icon: "symbols-solid", "aria-label": "Outlined button" },
					source: '<Button variant="icon-button" theme="outlined" icon="symbols-solid" aria-label="Outlined button" />',
				},
				{
					id: "icon-button-tonal",
					title: "Tonal Icon Button",
					description: "A tonal icon button. Requires aria-label for accessibility.",
					props: { variant: "icon-button", theme: "tonal", icon: "symbols-solid", "aria-label": "Tonal button" },
					source: '<Button variant="icon-button" theme="tonal" icon="symbols-solid" aria-label="Tonal button" />',
				},
				{
					id: "icon-button-filled",
					title: "Filled Icon Button",
					description: "A filled icon button. Requires aria-label for accessibility.",
					props: { variant: "icon-button", theme: "filled", icon: "symbols-solid", "aria-label": "Filled button" },
					source: '<Button variant="icon-button" theme="filled" icon="symbols-solid" aria-label="Filled button" />',
				},
				{
					id: "icon-button-custom",
					title: "Custom Icon Button",
					description: "A custom icon button. Requires aria-label for accessibility.",
					props: { variant: "icon-button", theme: "custom", icon: "symbols-solid", "aria-label": "Custom button" },
					source: '<Button variant="icon-button" theme="custom" icon="symbols-solid" aria-label="Custom button" />',
				},
				{
					id: "icon-button-circle",
					title: "Circle Icon Button",
					description: "A circular icon button. Requires aria-label for accessibility.",
					props: {
						variant: "icon-button",
						theme: "custom",
						shape: "circle",
						icon: "symbols-solid",
						"aria-label": "Circle button",
					},
					source:
						'<Button variant="icon-button" theme="custom" shape="circle" icon="symbols-solid" aria-label="Circle button" />',
				},
				{
					id: "text-and-icon",
					title: "Icon with Text",
					description: "A button that displays both an icon and text content.",
					props: { icon: "symbols-solid", text: "Button with Icon" },
					source: '<Button icon="symbols-solid" text="Button with Icon" />',
				},
				{
					id: "text-and-icon-outlined",
					title: "Outlined Icon with Text",
					description: "An outlined button that displays both an icon and text content.",
					props: { theme: "outlined", icon: "symbols-solid", text: "Outlined with Icon" },
					source: '<Button theme="outlined" icon="symbols-solid" text="Outlined with Icon" />',
				},
				{
					id: "text-and-icon-tonal",
					title: "Tonal Icon with Text",
					description: "A tonal button that displays both an icon and text content.",
					props: { theme: "tonal", icon: "symbols-solid", text: "Tonal with Icon" },
					source: '<Button theme="tonal" icon="symbols-solid" text="Tonal with Icon" />',
				},
				{
					id: "text-and-icon-filled",
					title: "Filled Icon with Text",
					description: "A filled button that displays both an icon and text content.",
					props: { theme: "filled", icon: "symbols-solid", text: "Filled with Icon" },
					source: '<Button theme="filled" icon="symbols-solid" text="Filled with Icon" />',
				},
				{
					id: "text-and-icon-custom",
					title: "Custom Icon with Text",
					description: "A custom button that displays both an icon and text content.",
					props: { theme: "custom", icon: "symbols-solid", text: "Custom with Icon" },
					source: '<Button theme="custom" icon="symbols-solid" text="Custom with Icon" />',
				},
			],
		},
		{
			id: "states",
			title: "States and Semantics",
			description: "Button states including disabled, links, submit types, and interactive behaviors.",
			examples: [
				{
					id: "disabled-button",
					title: "Disabled Button",
					description: "A button that is disabled and cannot be interacted with.",
					props: { text: "Disabled", disabled: true },
					source: '<Button text="Disabled" disabled />',
				},
				{
					id: "disabled-icon-button",
					title: "Disabled Icon Button",
					description: "An icon button that is disabled and cannot be interacted with.",
					props: { variant: "icon-button", icon: "symbols-solid", "aria-label": "Disabled button", disabled: true },
					source: '<Button variant="icon-button" icon="symbols-solid" aria-label="Disabled button" disabled />',
				},
				{
					id: "link-button",
					title: "Link Button",
					description: "A button that functions as a link, navigating to the specified URL.",
					props: { href: "#", theme: "filled", text: "Link Button" },
					source: '<Button href="#" theme="filled" text="Link Button" />',
				},
				{
					id: "submit-button",
					title: "Submit Button",
					description: "A button that submits a form when clicked (useful in forms).",
					props: { type: "submit", theme: "filled", text: "Submit" },
					source: '<Button type="submit" theme="filled" text="Submit" />',
				},
				{
					id: "button-with-spring",
					title: "Button with Spring Effect",
					description: "A button that has a spring animation effect on press.",
					props: { theme: "tonal", text: "Press me", classes: "spring" },
					source: '<Button theme="tonal" text="Press me" classes="spring" />',
				},
			],
		},
		{
			id: "shapes",
			title: "Shapes",
			description: "Button shapes that alter the corner radius and overall form of the button.",
			examples: [
				{
					id: "pill",
					title: "Pill Shape",
					description: "A pill-shaped button with rounded edges that are longer than they are tall.",
					props: { theme: "outlined", text: "Pill Shape", shape: "pill" },
					source: '<Button theme="outlined" text="Pill Shape" shape="pill" />',
				},
				{
					id: "square",
					title: "Square Shape",
					description: "A square-shaped button with sharp corners.",
					props: { theme: "tonal", text: "Square Shape", shape: "square" },
					source: '<Button theme="tonal" text="Square Shape" shape="square" />',
				},
				{
					id: "circle",
					title: "Circle Shape",
					description: "A circular button with equal width and height.",
					props: { theme: "filled", shape: "circle", text: "Ci", variant: "icon-button" },
					source: '<Button theme="filled" shape="circle" text="Ci" variant="icon-button" />',
				},
				{
					id: "squircle",
					title: "Squircle Shape",
					description: "A squircle-shaped button with rounded corners that are more circular than square.",
					props: { theme: "tonal", text: "Squircle Shape", shape: "squircle" },
					source: '<Button theme="tonal" text="Squircle Shape" shape="squircle" />',
				},
				{
					id: "superellipse",
					title: "Superellipse Shape",
					description: "A superellipse-shaped button with smooth, rounded corners.",
					props: { theme: "tonal", text: "Superellipse Shape", shape: "superellipse" },
					source: '<Button theme="tonal" text="Superellipse Shape" shape="superellipse" />',
				},
			],
		},
		{
			id: "sizes",
			title: "Sizes",
			description: "Button sizes that alter the height and padding of the button.",
			examples: [
				{
					id: "small",
					title: "Small Size",
					description: "A small-sized button with reduced padding and font size.",
					props: { theme: "tonal", text: "Small", size: "sm" },
					source: '<Button theme="tonal" text="Small" size="sm" />',
				},
				{
					id: "default-size",
					title: "Default Size",
					description: "The default button size with standard padding and font.",
					props: { theme: "tonal", text: "Default" },
					source: '<Button theme="tonal" text="Default" />',
				},
				{
					id: "large",
					title: "Large Size",
					description: "A large-sized button with increased padding and font size.",
					props: { theme: "tonal", text: "Large", size: "lg" },
					source: '<Button theme="tonal" text="Large" size="lg" />',
				},
			],
		},
		{
			id: "elevation",
			title: "Elevation",
			description: "Button elevation that adds shadow effects to create depth.",
			examples: [
				{
					id: "shadow-xs",
					title: "Extra Small Shadow",
					description: "A button with a subtle extra small shadow.",
					props: { theme: "tonal", text: "Shadow XS", elevated: "shadow-xs" },
					source: '<Button theme="tonal" text="Shadow XS" elevated="shadow-xs" />',
				},
				{
					id: "shadow-sm",
					title: "Small Shadow",
					description: "A button with a subtle small shadow.",
					props: { theme: "tonal", text: "Shadow SM", elevated: "shadow-sm" },
					source: '<Button theme="tonal" text="Shadow SM" elevated="shadow-sm" />',
				},
				{
					id: "shadow-md",
					title: "Medium Shadow",
					description: "A button with a moderate shadow.",
					props: { theme: "tonal", text: "Shadow MD", elevated: "shadow-md" },
					source: '<Button theme="tonal" text="Shadow MD" elevated="shadow-md" />',
				},
				{
					id: "shadow-lg",
					title: "Large Shadow",
					description: "A button with a large shadow.",
					props: { theme: "tonal", text: "Shadow LG", elevated: "shadow-lg" },
					source: '<Button theme="tonal" text="Shadow LG" elevated="shadow-lg" />',
				},
				{
					id: "shadow-xl",
					title: "Extra Large Shadow",
					description: "A button with a very large shadow.",
					props: { theme: "tonal", text: "Shadow XL", elevated: "shadow-xl" },
					source: '<Button theme="tonal" text="Shadow XL" elevated="shadow-xl" />',
				},
				{
					id: "shadow-2xl",
					title: "2X Large Shadow",
					description: "A button with a massive shadow.",
					props: { theme: "tonal", text: "Shadow 2XL", elevated: "shadow-2xl" },
					source: '<Button theme="tonal" text="Shadow 2XL" elevated="shadow-2xl" />',
				},
			],
		},
	],
	accessibility: [
		{
			id: "icon-button-label",
			title: "Icon Button Labeling",
			body: "Icon buttons must have an accessible name via the aria-label attribute. This is essential for screen reader users to understand the button's purpose.",
		},
		{
			id: "link-button-href",
			title: "Link Button Usage",
			body: "Link buttons must use the href attribute to specify their destination. Native disabled behavior is not appropriate for links.",
		},
		{
			id: "disabled-behavior",
			title: "Disabled Button Semantics",
			body: "Disabled state is handled differently for buttons vs links. Native button elements use the 'disabled' attribute, while link elements remove href and add aria-disabled='true' with tabindex=-1 for focus management.",
		},
	],
	responsive: [
		{
			id: "responsive-sizing",
			title: "Responsive Sizing",
			body: "Buttons adjust to the available space and maintain intrinsic inline sizing. Content may wrap or truncate as needed in narrow layouts.",
		},
		{
			id: "scrollable-code",
			title: "Responsive Code Blocks",
			body: "Code examples have local scrolling when content exceeds the visible area, preventing horizontal overflow on small screens.",
		},
	],
} satisfies ComponentDoc<ButtonPublicProps>;
