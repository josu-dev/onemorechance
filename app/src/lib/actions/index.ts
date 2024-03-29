import { tick } from "svelte";

/**
 * Original source: https://github.com/romkor/svelte-portal/blob/a650e7b762344a1bb0ad9e218660ed1ee66e3f90/src/Portal.svelte
 */
export function usePortal(el: HTMLElement, target: HTMLElement | string | false | undefined) {
    if (typeof target !== 'string' && !(target instanceof HTMLElement)) {
        if (target === false) {
            el.hidden = false;
        }
        return {
            destroy() { },
            update() { }
        };
    }

    let targetEl;

    async function update(newTarget: HTMLElement | string | false | undefined) {
        const document = el.ownerDocument;
        target = newTarget;
        if (newTarget === undefined || newTarget === false) {
            return;
        }

        if (typeof target === "string") {
            targetEl = document.querySelector(target);
            if (targetEl === null) {
                await tick();
                targetEl = document.querySelector(target);
            }
            if (targetEl === null) {
                throw new Error(
                    `No element found matching css selector: "${target}"`
                );
            }
        } else if (target instanceof HTMLElement) {
            targetEl = target;
        } else {
            throw new TypeError(
                `Unknown portal target type: ${target === null ? "null" : typeof target
                }. Allowed types: string (CSS selector), HTMLElement or "false".`
            );
        }
        targetEl.appendChild(el);
        el.hidden = false;
    }

    function destroy() {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    update(target);

    return {
        update,
        destroy,
    };
}

type ClickTypeMap = {
    click: MouseEvent;
    pointerdown: PointerEvent;
    pointerup: PointerEvent;
};

export type UseClickOutsideOptions<K extends keyof ClickTypeMap> = {
    type?: K;
    handler: (event: ClickTypeMap[K]) => void;
    exclude?: HTMLElement;
};

export function useClickOutside<K extends keyof ClickTypeMap>(el: HTMLElement, options: UseClickOutsideOptions<K>) {
    const document = el.ownerDocument;
    let eventType = (options.type || "click") as K;
    let eventHandler = options.handler;

    function onPointer(event: ClickTypeMap[K]) {
        if (!el.contains(event.target as Node) && !event.defaultPrevented && (!options.exclude || !options.exclude.contains(event.target as Node))) {
            eventHandler(event);
        }
    }

    const config = { passive: false, capture: true };
    document.addEventListener(eventType, onPointer, config);

    return {
        destroy() {
            document.removeEventListener(eventType, onPointer, config);
        },
        update(newOptions: Partial<UseClickOutsideOptions<K>>) {
            if (!newOptions.type) {
                newOptions.type = eventType;
            }
            if (newOptions.type !== eventType) {
                document.removeEventListener(eventType, onPointer, config);
                eventType = newOptions.type;
                document.addEventListener(eventType, onPointer, config);
            }
            if (newOptions.handler) {
                eventHandler = newOptions.handler;
            }
        }
    };
}
