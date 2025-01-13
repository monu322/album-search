"use client";
import React from "react";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Input,
  Flex,
  Text,
  VStack,
  Image,
  List,
  ListItem,
  Spinner,
} from "@chakra-ui/react";
import { useSearchContext } from "../../contexts/searchContext";

// Define the types for search results and API response
interface SearchResult {
  id: string;
  title: string;
  artist: string;
  artistImageUrl: string;
}

interface DiscogsApiResponse {
  results: {
    id: string;
    title: string;
    artist: string;
    cover_image?: string;
  }[];
}

export default function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]); // Use explicit type for results
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        const response = await axios.get<DiscogsApiResponse>(
          `https://api.discogs.com/database/search?q=${encodeURIComponent(
            debouncedQuery
          )}&type=artist&token=${
            process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN
          }&per_page=10`
        );

        // Process and store the results
        const searchResults: SearchResult[] = response.data.results.map(
          (result) => ({
            id: result.id,
            title: result.title,
            artist: result.artist,
            artistImageUrl: result.cover_image || "", // Fallback for the artist image
          })
        );

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
  const handleSearch = (e: FormEvent): void => {
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
  const handleSuggestionClick = (id: string, artistName: string): void => {
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
      <form
        onSubmit={handleSearch}
        style={{
          width: "100%",
          maxWidth: "600px",
          position: "relative",
        }}
      >
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
            border="1px solid #e2e8f0"
            borderRadius="md"
            boxShadow="sm"
            bg="white"
            position="absolute"
            zIndex="10"
            top="100%"
            left="0"
            maxHeight="400px"
            overflowY="auto"
          >
            {results.map((result) => (
              <ListItem
                key={result.id}
                display="flex"
                alignItems="center"
                p={3}
                borderBottom="1px solid #e2e8f0"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                borderRadius="md"
                onClick={() => handleSuggestionClick(result.id, result.artist)}
              >
                <Image
                  src={result.artistImageUrl || "/path/to/placeholder-image.jpg"}
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
      {isLoading && <Spinner size="lg" mt={4} />}

      {/* Display no results message */}
      {!isLoading && debouncedQuery && results.length === 0 && (
        <Text color="gray.500" mt={4}>
          No results found.
        </Text>
      )}
    </Box>
  );
}
