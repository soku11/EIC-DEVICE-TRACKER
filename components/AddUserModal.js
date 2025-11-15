// components/AddUserModal.js
import React, { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, useToast, FormControl, FormLabel
} from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";

export default function AddUserModal({ isOpen, onClose }){
  const [username, setUsername] = useState("");
  const toast = useToast();

  async function handleAddUser(){
    const name = username.trim();
    if (!name) {
      toast({ title: "Enter a username", status: "warning" });
      return;
    }
    try {
      const { data: existing } = await supabase.from("users").select("id").eq("username", name).limit(1).maybeSingle();
      if (existing) {
        toast({ title: "Username already exists", status: "error" });
        return;
      }
      const isAdmin = name.toLowerCase() === "admin";
      const { error } = await supabase.from("users").insert([{ username: name, is_admin: isAdmin }]);
      if (error) throw error;
      toast({ title: `User ${name} added`, status: "success" });
      setUsername("");
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Add user failed", status: "error" });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username (type 'admin' to create admin)" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleAddUser}>Add</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
