"use client";

import { Box, Button, Input, Text, VStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [username, setUsername] = useState("");

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
    >
      <Box
        bg="white"
        p="8"
        rounded="lg"
        shadow="md"
        minW="300px"
        textAlign="center"
      >
        <Text fontSize="2xl" mb="4" fontWeight="bold">
          Login
        </Text>

        <VStack spacing="4">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="lg"
          />

          <Button colorScheme="blue" width="100%">
            Login
          </Button>

          <Link as={NextLink} href="/register" color="blue.500">
            New user? Register
          </Link>
        </VStack>
      </Box>
    </Box>
  );
}
