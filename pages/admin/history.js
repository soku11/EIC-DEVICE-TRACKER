// pages/admin/history.js
import React, { useEffect, useState, useCallback } from "react";
import { Box, Container, Heading, Text, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabaseClient";
import Router from "next/router";

export default function AdminHistoryPage(){
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = typeof window !== "undefined" ? {
    isAdmin: localStorage.getItem("isAdmin") === "1"
  } : null;

  useEffect(() => {
    if (typeof window !== "undefined" && !currentUser?.isAdmin) {
      Router.push("/");
    }
  }, [currentUser]);

  const fetchHistory = useCallback(async ()=>{
    try {
      const { data, error } = await supabase
        .from("history")
        .select(`
          id,
          action,
          created_at,
          users:user_id ( username ),
          devices:device_id ( name )
        `)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const mapped = (data || []).map(r => ({
        id: r.id,
        action: r.action,
        created_at: r.created_at,
        username: r.users?.username ?? "Unknown",
        device_name: r.devices?.name ?? `Device ${r.device_id}`
      }));
      setHistory(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{ fetchHistory(); }, [fetchHistory]);

  return (
    <Box>
      <Navbar />
      <Container maxW="container.lg" py={6}>
        <Heading mb={4}>Admin — Activity History</Heading>
        {loading ? <Text>Loading...</Text> : (
          <Table variant="simple">
            <Thead><Tr><Th>When</Th><Th>User</Th><Th>Device</Th><Th>Action</Th></Tr></Thead>
            <Tbody>
              {history.map(h => (
                <Tr key={h.id}>
                  <Td>{new Date(h.created_at).toLocaleString()}</Td>
                  <Td>{h.username}</Td>
                  <Td>{h.device_name}</Td>
                  <Td>{h.action}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Container>
    </Box>
  );
}
