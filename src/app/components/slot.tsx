'use client';

import * as React from 'react';

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    const childArray = React.Children.toArray(children);
    const child = childArray.length === 1 ? childArray[0] : null;

    if (React.isValidElement(child)) {
      const childElement = child as React.ReactElement<Record<string, unknown>>;
      return React.cloneElement(childElement, {
        ...(mergeProps(childElement.props, slotProps) as Record<string, unknown>),
        ref: composeRefs(
          forwardedRef as React.Ref<HTMLElement> | undefined,
          getComponentRef<HTMLElement>(childElement),
        ),
      });
    }

    return (
      <span {...slotProps} ref={forwardedRef}>
        {children}
      </span>
    );
  },
);

Slot.displayName = 'Slot';

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else if (typeof ref === 'object' && ref !== null) {
        (ref as React.RefObject<T | null>).current = node;
      }
    }
  };
}

function getComponentRef<T>(element: React.ReactElement): React.Ref<T> | undefined {
  return (element as any).ref as React.Ref<T> | undefined;
}

function mergeProps(childProps: Record<string, unknown>, parentProps: Record<string, unknown>) {
  const merged: Record<string, unknown> = { ...childProps, ...parentProps };

  if (childProps.className && parentProps.className) {
    merged.className = `${childProps.className} ${parentProps.className}`;
  }

  if (childProps.style && parentProps.style) {
    merged.style = { ...(childProps.style as object), ...(parentProps.style as object) };
  }

  return merged;
}
