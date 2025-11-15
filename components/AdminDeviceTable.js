import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Box,
  Badge,
  Checkbox,
  Flex,
  Text
} from "@chakra-ui/react";
import Link from "next/link";

export default function AdminDeviceTable({
  devices = [],
  selected = [],
  onToggleSelect = () => {},
  onToggleInUse = () => {},
  onDeleteSingle = () => {}
}) {
  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th width="50px">Select</Th>
            <Th>ID</Th>
            <Th>Device</Th>
            <Th>State</Th>
            <Th>Used by</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {devices.map((d) => (
            <Tr key={d.id} bg={d.in_use ? "red.50" : "green.50"}>
              <Td>
                <Checkbox
                  isChecked={selected.includes(d.id)}
                  onChange={() => onToggleSelect(d.id)}
                />
              </Td>
              <Td>{d.id}</Td>
              <Td>
                <Link href={`/history/${d.id}`} passHref>
                  <Text as="u" cursor="pointer">
                    {d.name}
                  </Text>
                </Link>
              </Td>
              <Td>
                {d.in_use ? (
                  <Badge colorScheme="red">In use</Badge>
                ) : (
                  <Badge colorScheme="green">Available</Badge>
                )}
              </Td>
              <Td>{d.user_username ?? "-"}</Td>
              <Td>
                <Flex gap={2}>
                  <Button size="sm" onClick={() => onToggleInUse(d)}>
                    {d.in_use ? "Release" : "Take"}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => onDeleteSingle(d.id)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
