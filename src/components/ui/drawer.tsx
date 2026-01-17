'use client';

import { Drawer as ChakraDrawer } from '@chakra-ui/react';
import { CloseButton } from '@chakra-ui/react';
import * as React from 'react';

interface DrawerContentProps extends ChakraDrawer.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(function DrawerContent(props, ref) {
  const { children, ...rest } = props;
  return (
    <ChakraDrawer.Positioner>
      <ChakraDrawer.Content ref={ref} {...rest} asChild={false}>
        {children}
      </ChakraDrawer.Content>
    </ChakraDrawer.Positioner>
  );
});

export const DrawerCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraDrawer.CloseTriggerProps
>(function DrawerCloseTrigger(props, ref) {
  return (
    <ChakraDrawer.CloseTrigger
      position="absolute"
      top="2"
      insetEnd="2"
      {...props}
      asChild
    >
      <CloseButton size="sm" ref={ref}>
        {props.children}
      </CloseButton>
    </ChakraDrawer.CloseTrigger>
  );
});

export const DrawerBackdrop = React.forwardRef<
  HTMLDivElement,
  ChakraDrawer.BackdropProps
>(function DrawerBackdrop(props, ref) {
  return (
    <ChakraDrawer.Backdrop
      ref={ref}
      bg="blackAlpha.600"
      backdropFilter="blur(4px)"
      {...props}
    />
  );
});

export const DrawerRoot = ChakraDrawer.Root;
export const DrawerBody = ChakraDrawer.Body;
export const DrawerFooter = ChakraDrawer.Footer;
export const DrawerHeader = ChakraDrawer.Header;
export const DrawerTitle = ChakraDrawer.Title;
export const DrawerDescription = ChakraDrawer.Description;
export const DrawerTrigger = ChakraDrawer.Trigger;
