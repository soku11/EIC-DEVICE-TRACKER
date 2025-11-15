// pages/devices.js
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  Container,
  useToast,
  Text,
  Flex,
} from "@chakra-ui/react";
import { sendTeamsMessage } from "../lib/sendTeamsMessage";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import DeviceTable from "../components/DeviceTable";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  // NEW: COUNTS
  const [totalDevices, setTotalDevices] = useState(0);
  const [inUseCount, setInUseCount] = useState(0);
  const [freeCount, setFreeCount] = useState(0);

  const currentUser =
    typeof window !== "undefined"
      ? {
          id: Number(localStorage.getItem("userId") || 0),
          username: localStorage.getItem("username"),
          isAdmin: localStorage.getItem("isAdmin") === "1",
        }
      : null;

  // FETCH DEVICES + USER & COUNTS
  const fetchDevices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("devices")
        .select(
          `
          id,
          name,
          in_use,
          user_id,
          users:user_id (
            username
          )
        `
        )
        .order("in_use", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;

      const mapped = data.map((d) => ({
        id: d.id,
        name: d.name,
        in_use: d.in_use,
        user_id: d.user_id ? Number(d.user_id) : null,
        user_username: d.users?.username || null,
      }));

      setDevices(mapped);

      // NEW: DEVICE COUNT CALCULATION
      const total = mapped.length;
      const inUse = mapped.filter((d) => d.in_use).length;
      const free = total - inUse;

      setTotalDevices(total);
      setInUseCount(inUse);
      setFreeCount(free);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load devices", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // REALTIME LISTENING
  useEffect(() => {
    fetchDevices();

    const channel = supabase
      .channel("realtime-devices")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "devices" },
        () => fetchDevices()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchDevices]);

  // FREE TIER AUTO REFRESH
  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 2000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  // TAKE / RELEASE DEVICE
  async function handleToggle(device) {
    try {
      const userId = currentUser?.id;

      if (!userId) {
        toast({ title: "Not signed in", status: "warning" });
        return;
      }

      // TAKE
      if (!device.in_use) {
        const { error } = await supabase
          .from("devices")
          .update({ in_use: true, user_id: userId })
          .eq("id", device.id);

        if (error) throw error;

        sendTeamsMessage(
          `📹 **${device.name}** was taken by **${currentUser.username}**`
        );

        toast({ title: `You took ${device.name}`, status: "success" });
        return;
      }

      // RELEASE
      const isOwner = device.user_id === userId;
      const admin = currentUser?.isAdmin;

      if (!isOwner && !admin) {
        toast({
          title: "This device is used by someone else",
          status: "info",
        });
        return;
      }

      const { error } = await supabase
        .from("devices")
        .update({ in_use: false, user_id: null })
        .eq("id", device.id);

      if (error) throw error;

      sendTeamsMessage(
        `🔓 **${device.name}** has been released by **${currentUser.username}**`
      );

      toast({ title: `Released ${device.name}`, status: "success" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Action failed",
        description: err.message,
        status: "error",
      });
    }
  }

  return (
    <Box>
      <Navbar />
      <Container maxW="container.lg" py={8}>
        <Heading size="md" mb={4}>
          Devices
        </Heading>

        {/* NEW COUNT BOXES */}
        <Flex gap={6} mb={6}>
          <Box
            bg="orange.100"
            p={4}
            borderRadius="lg"
            boxShadow="md"
            fontWeight="bold"
          >
            Total Devices: {totalDevices}
          </Box>
          <Box
            bg="red.100"
            p={4}
            borderRadius="lg"
            boxShadow="md"
            fontWeight="bold"
          >
            In Use: {inUseCount}
          </Box>
          <Box
            bg="green.100"
            p={4}
            borderRadius="lg"
            boxShadow="md"
            fontWeight="bold"
          >
            Free: {freeCount}
          </Box>
        </Flex>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <DeviceTable
            devices={devices}
            onToggle={handleToggle}
            currentUser={currentUser}
          />
        )}
      </Container>
    </Box>
  );
}
