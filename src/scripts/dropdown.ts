const initialized = new WeakSet<HTMLElement>();

export const initDropdown = (root: Element | null) => {
	if (!(root instanceof HTMLElement) || initialized.has(root)) return;

	const trigger = root.querySelector("[data-dropdown-trigger]");
	const menu = root.querySelector("[data-dropdown-menu]");
	if (!(trigger instanceof HTMLElement) || !(menu instanceof HTMLElement))
		return;

	initialized.add(root);

	const closeOnSelect = root.dataset.closeOnSelect === "true";

	/* ---------- helpers ---------- */
	const isFocusable = (el: Element | null): el is HTMLElement =>
		el instanceof HTMLElement &&
		!el.disabled &&
		el.getAttribute("aria-disabled") !== "true" &&
		!["none", "hidden"].includes(getComputedStyle(el).display);

	const getItems = () =>
		Array.from(menu.querySelectorAll<HTMLElement>('[role^="menuitem"]')).filter(
			isFocusable,
		);

	const focusItem = (idx: number) => {
		const items = getItems();
		if (!items.length) return;
		const len = items.length;
		items[((idx % len) + len) % len].focus({ preventScroll: true });
	};
	const focusFirst = () => focusItem(0);
	const focusLast = () => focusItem(getItems().length - 1);

	const moveBy = (delta: number) => {
		const items = getItems();
		const active = items.indexOf(document.activeElement as HTMLElement);
		focusItem(active < 0 ? 0 : active + delta);
	};

	/* ---------- keyboard ---------- */
	trigger.addEventListener("keydown", (e) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			menu.dataset.focusIntent = e.key === "ArrowUp" ? "last" : "first";
			trigger.click(); // open popover
		}
	});

	menu.addEventListener("keydown", (e) => {
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				moveBy(1);
				break;
			case "ArrowUp":
				e.preventDefault();
				moveBy(-1);
				break;
			case "Home":
				e.preventDefault();
				focusFirst();
				break;
			case "End":
				e.preventDefault();
				focusLast();
				break;
			case "Escape":
				/* let browser close popover */
				break;
			default:
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					/* simple type-ahead */
					const items = getItems();
					const active = items.indexOf(document.activeElement as HTMLElement);
					const ordered = [
						...items.slice(active + 1),
						...items.slice(0, active + 1),
					];
					const textFor = (el: HTMLElement) =>
						(el.getAttribute("aria-label") || el.textContent || "")
							.trim()
							.toLowerCase();
					const match = ordered.find((el) =>
						textFor(el).startsWith(e.key.toLowerCase()),
					);
					if (match) match.focus({ preventScroll: true });
				}
		}
	});

	/* ---------- focus management after open ---------- */
	menu.addEventListener("toggle", () => {
		if (menu.matches(":popover-open")) {
			requestAnimationFrame(() =>
				menu.dataset.focusIntent === "last" ? focusLast() : focusFirst(),
			);
			delete menu.dataset.focusIntent;
		}
	});

	/* ---------- optional close-on-select ---------- */
	if (closeOnSelect) {
		menu.addEventListener("click", (e) => {
			const item = (e.target as Element | null)?.closest?.(
				'[role^="menuitem"]',
			);
			if (isFocusable(item)) {
				queueMicrotask(() => menu.hidePopover()); // close & browser returns focus
			}
		});
	}
};

export const initAllDropdowns = (scope?: ParentNode | Document) => {
	const rootScope =
		scope ??
		(typeof document !== "undefined" ? (document as ParentNode) : undefined);
	rootScope?.querySelectorAll("[data-dropdown-root]").forEach((root) => {
		initDropdown(root);
	});
};

const runOnReady = () => initAllDropdowns(document);

if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", runOnReady, { once: true });
	} else {
		runOnReady();
	}

	document.addEventListener("astro:page-load", runOnReady);
	document.addEventListener("astro:after-swap", runOnReady);
}
