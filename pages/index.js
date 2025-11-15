// pages/index.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import RegisterModal from "../components/RegisterModal";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const toast = useToast();
  const router = useRouter();

  // ⭐ FIXED AUTO-LOGIN REDIRECT
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUsername = localStorage.getItem("username");
    const savedUserId = localStorage.getItem("userId");
    const savedIsAdmin = localStorage.getItem("isAdmin") === "1";

    if (savedUsername && savedUserId) {
      // redirect based on admin flag
      if (savedIsAdmin) {
        router.push("/admin/devices");
      } else {
        router.push("/devices");
      }
    }
  }, []);

  // ⭐ LOGIN FUNCTION
  async function handleLogin() {
    const name = username.trim();
    if (!name) {
      toast({ title: "Enter username", status: "warning" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", name)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "User not found",
          description: "Please register first",
          status: "info",
        });
        return;
      }

      // ⭐ SAVE USER LOGIN INFO
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", String(data.id));
      localStorage.setItem("isAdmin", data.is_admin ? "1" : "0");

      toast({ title: `Signed in as ${data.username}`, status: "success" });

      // ⭐ ADMIN GOES TO ADMIN PAGE — FIXED
      if (data.is_admin) {
        router.push("/admin/devices");
      } else {
        router.push("/devices");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Login failed",
        description: err.message || String(err),
        status: "error",
      });
    }
  }

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <VStack
        spacing={6}
        w="full"
        maxW="md"
        p={8}
        borderWidth={1}
        borderRadius="md"
      >
        <Heading size="md">Login</Heading>

        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Button w="full" colorScheme="blue" onClick={handleLogin}>
          Login
        </Button>

        <Text>
          Don't have an account?{" "}
          <ChakraLink
            color="blue.500"
            cursor="pointer"
            onClick={() => setRegisterOpen(true)}
          >
            Register
          </ChakraLink>
        </Text>
      </VStack>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </Box>
  );
}
