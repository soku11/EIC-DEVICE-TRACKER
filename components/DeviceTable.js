// components/DeviceTable.js
import React, { useState } from 'react';
import {
  Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Box, Text, Input
} from '@chakra-ui/react';
import Link from 'next/link';

export default function DeviceTable({ devices, onToggle, currentUser }) {
  const [search, setSearch] = useState("");

  // Filter devices based on search input
  const filteredDevices = devices.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box overflowX="auto">

      {/* 🔍 SEARCH BAR */}
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
            <Th>State</Th>
            <Th>Used by</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {filteredDevices.map((d) => (
            <Tr
              key={d.id}
              bg={d.in_use ? 'orange.50' : 'transparent'}
              transition="0.2s"
            >
              {/* Device Name */}
              <Td>
                <Link href={`/history/${d.id}`}>
                  <Text as="u" cursor="pointer">{d.name}</Text>
                </Link>
              </Td>

              {/* Status */}
              <Td>
                {d.in_use ? (
                  <Badge colorScheme="orange">In use</Badge>
                ) : (
                  <Badge colorScheme="green">Available</Badge>
                )}
              </Td>

              {/* Used By — NOW SHOWS "You" */}
              <Td>
                {d.in_use ? (
                  d.user_id === currentUser?.id
                    ? <Badge colorScheme="blue">You</Badge>
                    : <Badge colorScheme="purple">{d.user_username}</Badge>
                ) : (
                  "-"
                )}
              </Td>

              {/* Action Button */}
              <Td>
                <Button
                  size="sm"
                  colorScheme={d.in_use ? "red" : "green"}
                  onClick={() => onToggle(d)}
                >
                  {d.in_use
                    ? (d.user_id === currentUser?.id || currentUser?.isAdmin
                        ? 'Release'
                        : 'Take (force)')
                    : 'Take'}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
