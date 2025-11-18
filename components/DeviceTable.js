// components/DeviceTable.js
import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Box,
  Text,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";

export default function DeviceTable({ devices, onToggle, currentUser }) {
  const [search, setSearch] = useState("");
  const [comment, setComment] = useState(""); // single comment
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loadingComment, setLoadingComment] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load comment for a device
  async function loadComment(deviceId) {
    setLoadingComment(true);
    const res = await fetch(`/api/comments?deviceId=${deviceId}`);
    const data = await res.json();
    setComment(data?.comment || "");
    setLoadingComment(false);
  }

  // Open TAKE modal
  function handleTakeClick(device) {
    setSelectedDevice(device);
    loadComment(device.id);
    onOpen();
  }

  // Confirm TAKE with comment
  async function handleTakeConfirm() {
    // only add comment when device is FREE
    if (!selectedDevice.in_use) {
      if (!comment.trim()) return alert("Please enter a comment.");
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          userId: currentUser.id,
          comment,
        }),
      });
    }

    onClose();
    setComment("");
    onToggle(selectedDevice);
  }

  // Release device → delete comment
  async function handleRelease(device) {
    await fetch(`/api/comments?deviceId=${device.id}`, {
      method: "DELETE",
    });

    onToggle(device);
  }

  // Filter search
  const filteredDevices = devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box overflowX="auto">
      {/* Search Bar */}
      <Input
        placeholder="Search devices..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={4}
        bg="white"
        color="black"
      />

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Device</Th>
            <Th>Status</Th>
            <Th>Used By</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {filteredDevices.map((d) => (
            <Tr key={d.id}>
              <Td>
                <Link href={`/history/${d.id}`}>
                  <Text as="u" cursor="pointer">
                    {d.name}
                  </Text>
                </Link>
              </Td>

              <Td>
                {d.in_use ? (
                  <Badge colorScheme="orange">In Use</Badge>
                ) : (
                  <Badge colorScheme="green">Available</Badge>
                )}
              </Td>

              <Td>
                {d.in_use ? (
                  d.user_id === currentUser?.id ? (
                    <Badge colorScheme="blue">You</Badge>
                  ) : (
                    <Badge colorScheme="purple">{d.user_username}</Badge>
                  )
                ) : (
                  "-"
                )}
              </Td>

              <Td>
                {/* RELEASE */}
                {d.in_use && d.user_id === currentUser?.id ? (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleRelease(d)}
                  >
                    Release
                  </Button>
                ) : (
                  /* TAKE */
                  <Button
                    size="sm"
                    colorScheme="orange"
                    onClick={() => handleTakeClick(d)}
                  >
                    Take
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* TAKE / COMMENT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>
            {selectedDevice?.in_use
              ? "Device Already Taken"
              : "Take Device – Add Comment"}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            {loadingComment ? (
              <Flex justify="center" py={6}>
                <Spinner size="lg" />
              </Flex>
            ) : selectedDevice?.in_use ? (
              // Device is in use → show existing comment
              <Box bg="gray.100" p={4} borderRadius="md">
                <Text fontWeight="bold" mb={2}>
                  Taken by:{" "}
                  {selectedDevice.user_id === currentUser.id
                    ? "You"
                    : selectedDevice.user_username}
                </Text>

                <Text mb={2}>
                  <b>Comment:</b> {comment || "No comment added."}
                </Text>
              </Box>
            ) : (
              // Device is free → ask for comment
              <>
                <Text mb={2}>Add a comment before taking this device:</Text>
                <Textarea
                  placeholder="Enter comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {!selectedDevice?.in_use && (
              <Button colorScheme="orange" onClick={handleTakeConfirm}>
                Confirm Take
              </Button>
            )}

            {selectedDevice?.in_use && (
              <Button onClick={onClose} colorScheme="gray">
                Close
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
