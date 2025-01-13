"use client";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Input,
  Button,
  Flex,
  Text,
  VStack,
  Image,
  List,
  ListItem,
  Spinner,
} from "@chakra-ui/react";
import { useSearchContext } from "../../contexts/searchContext"; // Import the context

export default function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]); // Store search results in local state
  const [isLoading, setIsLoading] = useState(false);
  const { setArtistId } = useSearchContext(); // Get the setArtistId function from the context
  const router = useRouter();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query || "");
    }, 500); // 500ms debounce time

    return () => clearTimeout(timer); // Clean up the timeout on query change
  }, [query]);

  // Make the API call when the debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setResults([]); // Clear results if the query is empty
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.discogs.com/database/search?q=${encodeURIComponent(debouncedQuery)}&type=artist&token=${process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN}&per_page=10`
        );
        console.log("Discogs API Response:", response.data);
        
        // Process and store the results
        const searchResults = response.data.results.map((result: any) => ({
          id: result.id,
          title: result.title,
          artist: result.artist,
          artistImageUrl: result.cover_image || "", // Fallback for the artist image
        }));

        setResults(searchResults); // Store results in local state
      } catch (error) {
        console.error("Error fetching data from Discogs API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Handle form submission (optional)
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() === "") {
      return;
    }

    // Update the URL with the search query
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set("search", query);
    router.push(`/?${newSearchParams.toString()}`);
  };

  // Handle click on search suggestion
  const handleSuggestionClick = (id: string, artistName: string) => {
    setArtistId(id); // Store the selected artist's ID in context
    setQuery(artistName); // Set the artist's name in the search field
    setResults([]); // Hide the suggestion list
  };

  return (
    <Box
      p={4}
      bgImage="url('/path-to-your-background-image.jpg')"
      bgSize="cover"
      bgPosition="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
      minH="auto" // Ensure the height is flexible and adjusts to the content
    >
      <VStack spacing={4} mb={8} textAlign="center" mt={8}>
        <Text fontSize="4xl" fontWeight="bold" mt={4}>
          Album Search
        </Text>
        <Text fontSize="sm" color="gray.500" mb={2}>
          Powered by Discogs
        </Text>
      </VStack>
      <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: "600px", position: "relative" }}>
        <Flex>
          <Input
            type="text"
            placeholder="Type name of artist to search..."
            value={query || ""}
            onChange={(e) => setQuery(e.target.value)}
            flex="1"
            mr={2}
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: "gray.400" }}
            _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
          />
        </Flex>

        {/* Suggestions list with maxHeight and overflow scroll */}
        {!isLoading && debouncedQuery && results.length > 0 && (
          <List
            spacing={2}
            width="100%"
            maxWidth="600px"
            mt={2}
            border="1px solid #e2e8f0" // Border around the suggestions list
            borderRadius="md" // Rounded corners
            boxShadow="sm" // Light shadow around the list
            bg="white"
            position="absolute"
            zIndex="10"
            top="100%" // Position below the search input
            left="0"
            maxHeight="400px" // Set max height of the suggestions box
            overflowY="auto" // Enable vertical scrolling when content exceeds max height
          >
            {results.map((result) => (
              <ListItem
                key={result.id}
                display="flex"
                alignItems="center"
                p={3}
                borderBottom="1px solid #e2e8f0" // Light border for each suggestion
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                borderRadius="md" // Rounded corners for the suggestion items
                onClick={() => handleSuggestionClick(result.id, result.artist)} // Set artist ID on click and update the query with artist name
              >
                <Image
                  src={result.artistImageUrl || "/path/to/placeholder-image.jpg"} // Fallback to placeholder if no image
                  alt={`${result.artist} image`}
                  boxSize="50px"
                  objectFit="cover"
                  borderRadius="md"
                  mr={3}
                />
                <Box>
                  <Text fontWeight="bold">{result.title}</Text>
                  <Text color="gray.500">{result.artist}</Text>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </form>

      {/* Display loading spinner */}
      {isLoading && <Spinner size="lg" mt={4} />} {/* Show a loading spinner when fetching results */}

      {/* Display no results message */}
      {!isLoading && debouncedQuery && results.length === 0 && (
        <Text color="gray.500" mt={4}>
          No results found.
        </Text>
      )}
    </Box>
  );
}
