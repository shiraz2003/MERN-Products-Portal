import { 
  Button, 
  Container, 
  Flex, 
  HStack, 
  Text, 
  useColorMode, 
  IconButton, 
  Box,
  Tooltip,
  useColorModeValue,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from "@chakra-ui/react";
import React from "react";
import { PlusSquareIcon, MoonIcon, SunIcon, StarIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";
import { useProductStore } from "../store/product";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { products } = useProductStore();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const location = useLocation();
  
  return (
    <Box 
      as="nav" 
      position="sticky" 
      top="0" 
      zIndex="sticky" 
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW={"1140px"} px={4} py={3}>
        <Flex
          h={16}
          alignItems={"center"}
          justifyContent={"space-between"}
          flexDir={{
            base: "column",
            md: "row",
          }}
        >
          <Flex align="center">
            <img src="/hi.png" alt="logo" width={32} height={32} style={{marginRight:5}}/>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight={"bold"}
              textTransform={"uppercase"}
              textAlign={"center"}
              bgGradient={"linear(to-l, #7928CA,#FF0080)"}
              bgClip={"text"}
            >
              <Link to={"/"}> Product Store</Link>
            </Text>
          </Flex>

          {/* Mobile menu */}
          <Box display={{ base: 'block', md: 'none' }} mt={2}>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<HamburgerIcon />}
                variant='outline'
              />
              <MenuList>
                <MenuItem as={Link} to="/" isActive={location.pathname === '/'}>
                  Home
                </MenuItem>
                <MenuItem as={Link} to="/create" isActive={location.pathname === '/create'}>
                  Add New Product
                </MenuItem>
                <MenuDivider />
                <MenuItem 
                  onClick={toggleColorMode} 
                  icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                >
                  {colorMode === "light" ? "Dark Mode" : "Light Mode"}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
          
          {/* Desktop menu */}
          <HStack spacing={3} alignItems={"center"} display={{ base: 'none', md: 'flex' }}>
            <Box position="relative" display="inline-block">
              <Badge 
                position="absolute" 
                top="-1" 
                right="-1" 
                borderRadius="full" 
                bg="blue.500" 
                color="white"
                fontSize="xs"
                px={2}
              >
                {products.length}
              </Badge>
              <Tooltip label="Product count" hasArrow placement="top">
                <Text fontSize="sm" fontWeight="medium" mr={2}>
                  Products
                </Text>
              </Tooltip>
            </Box>
            
            <Link to={"/create"}>
              <Tooltip label="Add new product" hasArrow placement="top">
                <Button colorScheme="blue" leftIcon={<PlusSquareIcon />}>
                  Add Product
                </Button>
              </Tooltip>
            </Link>

            <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow placement="top">
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                colorScheme="blue"
              />
            </Tooltip>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
