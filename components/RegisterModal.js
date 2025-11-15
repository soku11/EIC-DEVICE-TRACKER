// components/RegisterModal.js
import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, useToast, FormControl, FormLabel
} from '@chakra-ui/react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function RegisterModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function handleRegister() {
    const name = username.trim();
    if (!name) {
      toast({ title: 'Enter a username', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const { data: existing, error: e1 } = await supabase
        .from('users').select('id').eq('username', name).limit(1).maybeSingle();
      if (e1) throw e1;
      if (existing) {
        toast({ title: 'Username already exists', status: 'error' });
        setLoading(false);
        return;
      }
      const payload = { username: name, is_admin: name === 'admin' };
      const { data, error } = await supabase.from('users').insert(payload).select().single();
      if (error) throw error;
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', String(data.id));
      localStorage.setItem('isAdmin', data.is_admin ? '1' : '0');
      toast({ title: `Registered as ${data.username}`, status: 'success' });
      onClose();
      router.push('/devices');
    } catch (err) {
      console.error(err);
      toast({ title: 'Registration failed', description: err.message || String(err), status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Register</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleRegister} isLoading={loading}>Register</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
