"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Text,
  HStack,
  VStack,
  Spinner,
  Image,
  Divider,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

type Track = {
  position: string;
  title: string;
};

type Release = {
  title: string;
  year?: string;
  artists?: { name: string }[];
  tracklist?: Track[];
  thumb?: string;
  genres?: string[];
  community?: { have: number };
};

export default function ReleasePage() {
  const params = useParams(); // Get params from Next.js router
  const releaseId = params?.release_id; // Extract release ID from params
  const router = useRouter(); // Next.js router for navigation
  const [release, setRelease] = useState<Release | null>(null); // Store release data
  const [isLoading, setIsLoading] = useState<boolean>(true); // Track loading state
  const [error, setError] = useState<string | null>(null); // Store any errors

  const placeholderImage = "/assets/images/no-image.jpg"; // Fallback image

  useEffect(() => {
    if (!releaseId) return;

    const fetchRelease = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.discogs.com/releases/${releaseId}?token=${process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN}`
        );
        setRelease(response.data);
      } catch (err) {
        console.error("Error fetching release data:", err);
        setError("Failed to load release details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelease();
  }, [releaseId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (!release) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Text color="gray.500">Release not found.</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxWidth="1200px" margin="0 auto">
      {/* Back Button */}
      <Button
        onClick={() => router.push("/")}
        colorScheme="blue"
        mb={6}
        size="sm"
      >
        {`<`} Back to Home
      </Button>

      {/* Release Title as a Common Heading */}
      <Text fontSize="4xl" fontWeight="bold" mb={4}>
        {release.title}
      </Text>

      {/* Layout */}
      <HStack
        spacing={8}
        align="start"
        flexDirection={{ base: "column", md: "row" }}
        justify="space-between"
      >
        {/* Left Section: Image */}
        <Box width={{ base: "100%", md: "25%" }}>
          <Image
            src={release.thumb || placeholderImage}
            alt={release.title}
            borderRadius="md"
            width="100%"
            height="auto"
            objectFit="cover"
          />

          <VStack align="start" spacing={4} mt={4}>
            {release.year && (
              <Text fontSize="lg" color="gray.600">
                Year: {release.year}
              </Text>
            )}
            {release.artists && release.artists.length > 0 && (
              <Text fontSize="lg" color="gray.600">
                Artist: {release.artists.map((artist) => artist.name).join(", ")}
              </Text>
            )}
            {release.genres && release.genres.length > 0 && (
              <Text fontSize="lg" color="gray.600">
                Genres: {release.genres.join(", ")}
              </Text>
            )}
            {release.community?.have && (
              <Text fontSize="lg" color="gray.600">
                {release.community.have} people have this release in their Discogs collection.
              </Text>
            )}
          </VStack>
        </Box>

        {/* Right Section: Tracklist with Background */}
        <Box
          width={{ base: "100%", md: "70%" }}
           // Padding inside the tracklist background
           // Border radius for rounded corners
           // Light shadow for visual separation
        >
            <Text fontWeight="bold" fontSize="lg" mb={2}>
                Tracklist:
              </Text>
          {release.tracklist && release.tracklist.length > 0 && (
            <Box bg="gray.100" p={6} borderRadius="md" boxShadow="sm">
              
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Position</Th>
                    <Th>Title</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {release.tracklist.map((track, index) => (
                    <Tr key={`${track.position}-${index}`}>
                      <Td>{track.position}</Td>
                      <Td>{track.title}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </HStack>

      {/* Divider */}
      <Divider my={6} />
    </Box>
  );
}
