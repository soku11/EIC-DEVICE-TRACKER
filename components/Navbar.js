import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

export default function Navbar() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username"));
    }
  }, []);

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <Box
      bg="white"
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow="md"
      px={8}
      py={4}
    >
      <Flex justify="space-between" align="center">
        
        {/* SIMPLE TITLE */}
        <Flex align="center" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="orange.500">
            Cam-
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="orange.400">
            छो
          </Text>
        </Flex>

        {/* USER MENU */}
        <Flex align="center">
          {username ? (
            <Menu>
              <MenuButton cursor="pointer">
                <Flex align="center" gap={2}>
                  <Avatar size="sm" name={username} bg="orange.400" />
                  <Text fontWeight="semibold">{username}</Text>
                </Flex>
              </MenuButton>

              <MenuList>
                <MenuItem onClick={handleLogout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button colorScheme="orange">Login</Button>
          )}
        </Flex>

      </Flex>
    </Box>
  );
}
