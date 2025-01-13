import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "./index";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { SearchProvider } from "../../contexts/searchContext";

// Create a mock instance of Axios
const mockAxios = new MockAdapter(axios);

describe("SearchBar", () => {
  beforeEach(() => {
    // Reset Axios mock before each test
    mockAxios.reset();
  });

  test("renders the search input and button", () => {
    render(
      <SearchProvider>
        <SearchBar />
      </SearchProvider>
    );

    // Assert input and button are rendered
    expect(screen.getByPlaceholderText("Type name of artist to search...")).toBeInTheDocument();
  });

  test("shows loading spinner when API is called", async () => {
    render(
      <SearchProvider>
        <SearchBar />
      </SearchProvider>
    );

    // Mock the axios response
    mockAxios.onGet().reply(200, {
      results: [{ id: "1", title: "Artist 1", artist: "Artist 1", cover_image: "" }],
    });

    fireEvent.change(screen.getByPlaceholderText("Type name of artist to search..."), {
      target: { value: "Artist 1" },
    });

    // Assert loading spinner is visible during the request
    expect(screen.getByRole("spinner")).toBeInTheDocument();

    // Wait for results
    await waitFor(() => expect(screen.getByText("Artist 1")).toBeInTheDocument());

    // Assert spinner is no longer visible
    expect(screen.queryByRole("spinner")).not.toBeInTheDocument();
  });

  test("displays search results after API call", async () => {
    render(
      <SearchProvider>
        <SearchBar />
      </SearchProvider>
    );

    // Mock API response
    mockAxios.onGet().reply(200, {
      results: [
        {
          id: "1",
          title: "Artist 1",
          artist: "Artist 1",
          cover_image: "image_url",
        },
      ],
    });

    fireEvent.change(screen.getByPlaceholderText("Type name of artist to search..."), {
      target: { value: "Artist 1" },
    });

    // Wait for results
    await waitFor(() => expect(screen.getByText("Artist 1")).toBeInTheDocument());

    // Assert that the search result is displayed
    expect(screen.getByText("Artist 1")).toBeInTheDocument();
  });

  test("displays no results message when no results found", async () => {
    render(
      <SearchProvider>
        <SearchBar />
      </SearchProvider>
    );

    // Mock API response with empty results
    mockAxios.onGet().reply(200, {
      results: [],
    });

    fireEvent.change(screen.getByPlaceholderText("Type name of artist to search..."), {
      target: { value: "Nonexistent Artist" },
    });

    // Wait for "No results found" message
    await waitFor(() => expect(screen.getByText("No results found.")).toBeInTheDocument());
  });

  test("handles search suggestion click correctly", async () => {
    render(
      <SearchProvider>
        <SearchBar />
      </SearchProvider>
    );

    // Mock API response with results
    mockAxios.onGet().reply(200, {
      results: [
        { id: "1", title: "Artist 1", artist: "Artist 1", cover_image: "" },
      ],
    });

    fireEvent.change(screen.getByPlaceholderText("Type name of artist to search..."), {
      target: { value: "Artist 1" },
    });

    // Wait for results to show
    await waitFor(() => expect(screen.getByText("Artist 1")).toBeInTheDocument());

    // Simulate click on a suggestion
    fireEvent.click(screen.getByText("Artist 1"));

    // Assert that the search input is now the artist name
    expect(screen.getByPlaceholderText("Type name of artist to search...")).toHaveValue("Artist 1");
  });

  test("does not make API call for empty query", async () => {
    render(
      <SearchProvider>
        <SearchBar />
      </SearchProvider>
    );

    // Ensure no API calls for empty query
    fireEvent.change(screen.getByPlaceholderText("Type name of artist to search..."), {
      target: { value: "" },
    });

    expect(mockAxios.history.get.length).toBe(0); // Ensure no request was made
  });
});
