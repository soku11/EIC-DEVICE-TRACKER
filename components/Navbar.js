import React, { useEffect, useState } from "react";
import { Box, Flex, Button, Text, Image } from "@chakra-ui/react";

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
        
        {/* LOGO + TITLE */}
        <Flex align="center" gap={3}>
          <Image 
            src="/logo.png"   
            alt="Logo"
            boxSize="40px"
            objectFit="cover"
            border= "3px solid #F37321"
            borderRadius="50%"
          />
          <Text fontSize="lg" fontWeight="bold">
            CAMERA YAHA HAI
          </Text>
        </Flex>

        {/* USER + LOGOUT */}
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
