import React, { useEffect, useState } from "react";
import { Box, Flex, Button, Text } from "@chakra-ui/react";

export default function Navbar() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("username");
      setUsername(name);
    }
  }, []);

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <Box bg="gray.800" color="white" px={6} py={4}>
      <Flex align="center" justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          EIC DEVICE TRACKER
        </Text>

        <Flex align="center" gap={4}>
          {username && <Text>Hi, {username}</Text>}

          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
