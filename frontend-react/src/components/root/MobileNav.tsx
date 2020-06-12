import React, { RefObject } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerCloseButton,
  useColorMode,
  DrawerOverlay,
  Box,
} from "@chakra-ui/core"

import { SideNavContent } from "./SideNavContent"

interface MobileNavProps {
  btnRef?: RefObject<HTMLElement>
  isOpen: boolean
  onClose: () => void
}

const MobileNav: React.FC<MobileNavProps> = ({ btnRef, isOpen, onClose }) => {
  const { colorMode } = useColorMode()
  const bgColor = { light: "#D6D7DA", dark: "#0A102D" }
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={btnRef}
    >
      <DrawerOverlay />
      <DrawerContent bg={bgColor[colorMode]}>
        <Box overflowX="hidden" mx="auto">
          <DrawerCloseButton />
          <SideNavContent isMobile />
        </Box>
      </DrawerContent>
    </Drawer>
  )
}

export default MobileNav
