// pages/admin/devices.js
import { sendTeamsMessage } from "../../lib/sendTeamsMessage";  // admin page
import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Heading, Container, useToast, Text, Input, Button, Flex, Spacer
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import AdminDeviceTable from "../../components/AdminDeviceTable";
import AddEditDeviceModal from "../../components/AddEditDeviceModal";
import AddUserModal from "../../components/AddUserModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import Router from "next/router";

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  const currentUser =
    typeof window !== "undefined"
      ? {
          id: Number(localStorage.getItem("userId") || 0),
          username: localStorage.getItem("username"),
          isAdmin: localStorage.getItem("isAdmin") === "1"
        }
      : null;

  // BLOCK NON ADMIN
  useEffect(() => {
    if (typeof window !== "undefined" && !currentUser?.isAdmin) {
      Router.push("/");
    }
  }, [currentUser]);

  // FETCH DEVICES
  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("devices")
        .select(`
          id,
          name,
          in_use,
          user_id,
          users:user_id ( username )
        `)
        .order("id", { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((d) => ({
        id: d.id,
        name: d.name,
        in_use: d.in_use,
        user_id: d.user_id ? Number(d.user_id) : null,
        user_username: d.users?.username ?? null
      }));

      setDevices(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load devices", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // INITIAL LOAD
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // REALTIME LISTENER — THIS FIXES "NOT UPDATING"
  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "devices" },
        () => fetchDevices()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDevices]);

  // SEARCH FILTER
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(devices.filter((d) => d.name.toLowerCase().includes(q)));
  }, [search, devices]);

  // SELECT FUNCTIONS
  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  function selectAllVisible() {
    setSelected(filtered.map((d) => d.id));
  }
  function clearSelection() {
    setSelected([]);
  }

  // ADD DEVICE
  function openAddDevice() {
    setDeviceToEdit(null);
    setDeviceModalOpen(true);
  }

  // EDIT DEVICE
  function openEditDevice() {
    if (selected.length !== 1) {
      toast({ title: "Select exactly one device", status: "info" });
      return;
    }
    const d = devices.find((x) => x.id === selected[0]);
    setDeviceToEdit(d);
    setDeviceModalOpen(true);
  }

  // DELETE MULTIPLE
  function openDeleteConfirm() {
    if (selected.length === 0) {
      toast({ title: "No devices selected", status: "info" });
      return;
    }
    setConfirmOpen(true);
  }

  // CONFIRM DELETE
  async function handleDeleteConfirmed() {
    try {
      const { error } = await supabase
        .from("devices")
        .delete()
        .in("id", selected);

      if (error) throw error;

      toast({
        title: `Deleted ${selected.length} device(s)`,
        status: "success"
      });

      setSelected([]);
      fetchDevices();
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Delete failed", status: "error" });
    }
  }

  // ADD USER
  function openAddUser() {
    setUserModalOpen(true);
  }

  // COUNTS
  const totalCount = devices.length;
  const inUseCount = devices.filter((d) => d.in_use).length;

  return (
    <Box>
      <Navbar />
      <Container maxW="container.lg" py={6}>
        <Heading mb={3}>Admin — Manage Devices</Heading>
        <Text mb={3}>
          Total devices: <strong>{totalCount}</strong> | In use:{" "}
          <strong>{inUseCount}</strong>
        </Text>

        <Flex mb={4} gap={3} wrap="wrap" align="center">
          <Button colorScheme="blue" onClick={openAddDevice}>
            + Add Device
          </Button>
          <Button colorScheme="teal" onClick={openAddUser}>
            + Add User
          </Button>
          <Button
            colorScheme="yellow"
            onClick={openEditDevice}
            isDisabled={selected.length !== 1}
          >
            Edit Selected
          </Button>
          <Button
            colorScheme="red"
            onClick={openDeleteConfirm}
            isDisabled={selected.length === 0}
          >
            Delete Selected ({selected.length})
          </Button>

          <Spacer />

          <Input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxW="300px"
          />

          <Button onClick={selectAllVisible} variant="ghost" size="sm">
            Select All
          </Button>
          <Button onClick={clearSelection} variant="ghost" size="sm">
            Clear
          </Button>

          <Button onClick={() => Router.push("/admin/history")} ml={2}>
            View History
          </Button>
        </Flex>

        {/* TABLE */}
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <AdminDeviceTable
            devices={filtered}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleInUse={async (device) => {
              try {
                const newState = !device.in_use;

                const { error } = await supabase
                  .from("devices")
                  .update({
                    in_use: newState,
                    user_id: newState ? currentUser.id : null
                  })
                  .eq("id", device.id);

                if (error) throw error;

                await supabase.from("history").insert({
                  device_id: device.id,
                  user_id: currentUser.id,
                  action: newState ? "take" : "release"
                });

                fetchDevices();

                toast({
                  title: newState ? "Device taken" : "Device released",
                  status: "success"
                });
              } catch (err) {
                console.error(err);
                toast({ title: "Action failed", status: "error" });
              }
            }}
            onDeleteSingle={async (id) => {
              if (!confirm("Delete this device?")) return;
              try {
                const { error } = await supabase
                  .from("devices")
                  .delete()
                  .eq("id", id);
                if (error) throw error;

                toast({ title: "Device deleted", status: "success" });
                fetchDevices();
              } catch (err) {
                console.error(err);
                toast({ title: "Delete failed", status: "error" });
              }
            }}
          />
        )}

        {/* MODALS */}
        <AddEditDeviceModal
          isOpen={deviceModalOpen}
          onClose={() => {
            setDeviceModalOpen(false);
            setDeviceToEdit(null);
            fetchDevices();
          }}
          device={deviceToEdit}
        />

        <AddUserModal
          isOpen={userModalOpen}
          onClose={() => {
            setUserModalOpen(false);
            fetchDevices();
          }}
        />

        <ConfirmDeleteModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDeleteConfirmed}
          heading={`Delete ${selected.length} device(s)?`}
          body="This will permanently delete the selected device(s)."
        />
      </Container>
    </Box>
  );
}
