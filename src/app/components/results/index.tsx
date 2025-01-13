"use client";
import { useSearchContext } from "../../contexts/searchContext"; // Use the SearchContext to access artist ID
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, SimpleGrid, VStack, Input, Image, Card, CardBody, Spinner, Button, HStack } from "@chakra-ui/react";
import Link from 'next/link'; // Import Link from next/link for navigation

export default function SearchResults() {
  const { artistId } = useSearchContext(); // Access the artist ID from the context
  const [albums, setAlbums] = useState<any[]>([]); // Store the albums in state
  const [artistName, setArtistName] = useState<string>(""); // Store the artist name
  const [isLoading, setIsLoading] = useState<boolean>(false); // Track loading state
  const [error, setError] = useState<string | null>(null); // Store any error message
  const [currentPage, setCurrentPage] = useState<number>(1); // Track the current page number
  const [totalPages, setTotalPages] = useState<number>(1); // Track the total number of pages
  const [inputPage, setInputPage] = useState<string>(""); // Track input for the page jump
  const [pageError, setPageError] = useState<string>(""); // Error message for page jump

  // Placeholder image URL
  const placeholderImage = "/assets/images/no-image.jpg";

  // Fetch artist info and albums when the component loads or when currentPage changes
  useEffect(() => {
    if (!artistId) return; // If no artistId is found in context, don't make the API call

    const fetchArtistInfoAndAlbums = async () => {
      setIsLoading(true);
      try {
        // Fetch artist information
        const artistResponse = await axios.get(
          `https://api.discogs.com/artists/${artistId}?token=${process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN}`
        );
        setArtistName(artistResponse.data.name); // Set the artist name

        // Fetch albums of the artist with pagination
        const albumsResponse = await axios.get(
          `https://api.discogs.com/artists/${artistId}/releases?token=${process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN}&per_page=5&page=${currentPage}&sort=year&sort_order=desc`
        );
        console.log("artist releases:", albumsResponse.data.releases);
        setAlbums(albumsResponse.data.releases); // Ensure albums is always an array

        // Fetch the total number of pages from the pagination metadata
        setTotalPages(Math.ceil(albumsResponse.data.pagination.items / 5)); // Assuming 5 items per page
      } catch (err) {
        setError("Failed to load artist or albums");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistInfoAndAlbums();
  }, [artistId, currentPage]); // Run the effect when artistId or currentPage changes

  // Show a loading spinner if fetching data
  if (!artistId) {
    return null; // If there's no artistId in the context, render nothing
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  // Show error message if there was an error fetching data
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageJump(); // Trigger the page jump when the Enter key is pressed
    }
  };

  // Handle page jump input
  const handlePageJump = () => {
    const page = parseInt(inputPage, 10);

    if (isNaN(page) || page < 1 || page > totalPages) {
      setPageError(`Please enter a valid page number between 1 and ${totalPages}`);
    } else {
      setPageError(""); // Clear any previous error
      setCurrentPage(page); // Update the page number
    }
  };

  // Show a message if no albums are found
  if (albums.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Text color="gray.500">No albums found for this artist.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} mt={4}>
      {/* Display the title with the artist's name */}
      <Text fontSize="2xl" fontWeight="bold" mb={4} px={4}>
        Showing top 5 releases for {artistName}
      </Text>

      {/* Responsive SimpleGrid */}
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} 
        spacing={4} 
        width="100%" 
        px={{ base: 4, sm: 6, md: 8, lg: 20 }}
      >
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/release/${album.type === "release" ? album.id : album.main_release}`} // Use Link to navigate to the correct release page
            passHref
          >
            <Card
              borderWidth="1px"
              borderColor="gray.300" // Lighter border color
              borderRadius="lg"
              overflow="hidden"
              boxShadow="sm" // Subtle box shadow
              bg="white"
              p={0} // Remove padding to make the image span the entire width
              cursor="pointer" // Indicate the card is clickable
            >
              <Image
                src={album.thumb || placeholderImage} // Use the album cover or the placeholder
                alt={`${album.title} cover`}
                width="100%" // Ensure the image spans the full width of the card
                objectFit="cover" // Ensures the image covers the box entirely without distortion
                height="200px" // Adjust the height as needed
              />
              <CardBody p={4}>
                <Text fontWeight="bold">{album.title}</Text>
                <Text>{album.label}</Text>
                <Text color="gray.500">{album.artist}</Text>
              </CardBody>
            </Card>
          </Link>
        ))}
      </SimpleGrid>

      {/* Pagination controls */}
      <HStack spacing={4} mt={6} justify="center">
        {/* Show Previous button if not on the first page */}
        {currentPage > 1 && (
          <Button colorScheme="blue" size="sm" onClick={() => setCurrentPage(currentPage - 1)}>{`< Prev`}</Button>
        )}

        {/* Display current page and total pages */}
        <Text fontSize="lg">
          Showing page {currentPage} of {totalPages}
        </Text>

        {/* Show Next button if not on the last page */}
        {currentPage < totalPages && (
          <Button colorScheme="blue" size="sm" onClick={() => setCurrentPage(currentPage + 1)}>{`Next >`}</Button>
        )}
      </HStack>

      {/* Go to specific page */}
      <Box mt={4} display="flex" justifyContent="center" alignItems="center">
        <Text>Go to page</Text>
        <Input
          type="number"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyPress={handleKeyPress} // Listen for the Enter key press
          width="80px"
          ml={2}
          mr={2}
        />
        <Button colorScheme="blue" size="sm" onClick={handlePageJump}>Go</Button>
      </Box>

      {/* Error message for invalid page input */}
      {pageError && (
        <Box mt={2} display="flex" justifyContent="center" alignItems="center">
          <Text color="red.500">{pageError}</Text>
        </Box>
      )}
    </VStack>
  );
}
