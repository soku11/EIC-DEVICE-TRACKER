// components/ConfirmDeleteModal.js
import React from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Text
} from "@chakra-ui/react";

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, heading="Confirm", body="" }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{body || "Are you sure?"}</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="red" onClick={() => { onConfirm(); }}>Delete</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
