// pages/history/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { Box, Container, Heading, List, ListItem, Text } from '@chakra-ui/react';
import Navbar from '../../components/Navbar';

export default function HistoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [history, setHistory] = useState([]);
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      const { data: device } = await supabase.from('devices').select('name').eq('id', id).maybeSingle();
      setDeviceName(device?.name ?? `Device ${id}`);

      const { data, error } = await supabase
        .from('history')
        .select('id, action, created_at, users!left(username)')
        .eq('device_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }
      const mapped = data.map((r) => ({
        id: r.id,
        action: r.action,
        created_at: r.created_at,
        username: r.users?.username ?? 'Unknown',
      }));
      setHistory(mapped);
    }

    fetchData();

    const channel = supabase.channel(`history-device-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'history', filter: `device_id=eq.${id}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [id]);

  return (
    <Box>
      <Navbar />
      <Container maxW="container.md" py={8}>
        <Heading size="md" mb={4}>History — {deviceName}</Heading>
        <List spacing={3}>
          {history.length === 0 && <Text>No history yet.</Text>}
          {history.map((h) => (
            <ListItem key={h.id} borderWidth={1} p={3} borderRadius="md">
              <Text fontSize="sm"><strong>{h.username}</strong> — {h.action} at {new Date(h.created_at).toLocaleString()}</Text>
            </ListItem>
          ))}
        </List>
      </Container>
    </Box>
  );
}
