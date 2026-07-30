/**
 * Typed documentation schema for Astro components.
 */

export type ComponentDoc<TProps> = {
	/** Unique identifier for the component page */
	slug: string;

	/** Human-readable name of the component */
	name: string;

	/** Brief description of what this component does */
	summary: string;

	/** Import statement to use when including the component in a page */
	importStatement: string;

	/** Groups of examples to display, ordered logically by category */
	groups: readonly DocGroup<TProps>[];

	/** Accessibility notes that apply to all examples for this component */
	accessibility: readonly NoteRecord[];

	/** Responsive behavior notes that apply to all examples for this component */
	responsive: readonly NoteRecord[];
};

export type DocGroup<TProps> = {
	/** Unique identifier for this group */
	id: string;

	/** Title of the example group */
	title: string;

	/** Description explaining what this group demonstrates */
	description?: string;

	/** Examples in the group, ordered by relevance or appearance */
	examples: readonly DocExample<TProps>[];
};

export type DocExample<TProps> = {
	/** Unique identifier for this example */
	id: string;

	/** Human-readable title of the example */
	title: string;

	/** Description explaining what this example demonstrates */
	description?: string;

	/** Props to pass to the component for rendering this example */
	props: TProps;

	/** Raw Astro source code to render this example (as a string) */
	source: string;

	/** Optional label to show in the preview area if needed for context */
	previewLabel?: string;
};

export type NoteRecord = {
	/** Unique identifier for this note */
	id: string;

	/** Title of the note to display */
	title: string;

	/** Body content of the note, can be markdown or plain text */
	body: string;
};
