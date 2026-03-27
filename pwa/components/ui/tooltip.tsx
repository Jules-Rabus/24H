"use client";

import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import * as React from "react";

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  content: React.ReactNode;
  contentProps?: ChakraTooltip.ContentProps;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props;

    if (disabled) return children as React.ReactElement;

    const TriggerComponent = ChakraTooltip.Trigger as any;
    const PositionerComponent = ChakraTooltip.Positioner as any;
    const ArrowComponent = ChakraTooltip.Arrow as any;

    return (
      <ChakraTooltip.Root {...rest}>
        <TriggerComponent asChild>
          {children as React.ReactElement}
        </TriggerComponent>
        <Portal disabled={!portalled} container={portalRef}>
          <PositionerComponent>
            <ChakraTooltip.Content ref={ref} {...contentProps}>
              {showArrow && (
                <ArrowComponent>
                  <ChakraTooltip.ArrowTip />
                </ArrowComponent>
              )}
              {content}
            </ChakraTooltip.Content>
          </PositionerComponent>
        </Portal>
      </ChakraTooltip.Root>
    );
  },
);
