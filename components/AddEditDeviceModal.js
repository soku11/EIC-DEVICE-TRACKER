// components/AddEditDeviceModal.js
import React, { useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, useToast, FormControl, FormLabel, Switch
} from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";

export default function AddEditDeviceModal({ isOpen, onClose, device }){
  const [name, setName] = useState("");
  const [inUse, setInUse] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (device) {
      setName(device.name || "");
      setInUse(Boolean(device.in_use));
    } else {
      setName("");
      setInUse(false);
    }
  }, [device]);

  async function handleSave(){
    if (!name.trim()) {
      toast({ title: "Enter device name", status: "warning" });
      return;
    }
    try {
      if (device && device.id) {
        const { error } = await supabase.from("devices").update({ name: name.trim(), in_use: inUse }).eq("id", device.id);
        if (error) throw error;
        toast({ title: "Device updated", status: "success" });
      } else {
        const { error } = await supabase.from("devices").insert([{ name: name.trim(), in_use: inUse, user_id: inUse ? null : null }]);
        if (error) throw error;
        toast({ title: "Device added", status: "success" });
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Save failed", status: "error" });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{device ? "Edit Device" : "Add Device"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Device name</FormLabel>
            <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Camera A1" />
          </FormControl>

          <FormControl display="flex" alignItems="center" mb={3}>
            <FormLabel htmlFor="inuse" mb="0">Mark In Use</FormLabel>
            <Switch id="inuse" isChecked={inUse} onChange={(e)=>setInUse(e.target.checked)} />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleSave}>{device ? "Save" : "Add"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
