import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchResults from "./index";
import { useSearchContext } from "../../contexts/searchContext";
import axios from "axios";

// Mock useSearchContext
jest.mock("../../contexts/searchContext", () => ({
  useSearchContext: jest.fn(),
}));

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SearchResults Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading spinner when fetching data", async () => {
    // Mock useSearchContext to return an artistId
    (useSearchContext as jest.Mock).mockReturnValue({ artistId: "12345" });

    // Mock axios to delay response
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));

    render(<SearchResults />);

    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner is displayed
  });

  test("renders error message on fetch failure", async () => {
    (useSearchContext as jest.Mock).mockReturnValue({ artistId: "12345" });

    // Mock axios to reject the promise
    mockedAxios.get.mockRejectedValue(new Error("Fetch error"));

    render(<SearchResults />);

    await waitFor(() =>
      expect(screen.getByText("Failed to load artist or albums")).toBeInTheDocument()
    );
  });

  test("renders 'No albums found' when no albums are returned", async () => {
    (useSearchContext as jest.Mock).mockReturnValue({ artistId: "12345" });

    // Mock axios to return empty releases
    mockedAxios.get.mockResolvedValueOnce({ data: { name: "Test Artist" } }); // Artist name fetch
    mockedAxios.get.mockResolvedValueOnce({
      data: { releases: [], pagination: { items: 0, pages: 1 } },
    }); // Albums fetch

    render(<SearchResults />);

    await waitFor(() =>
      expect(screen.getByText("No albums found for this artist.")).toBeInTheDocument()
    );
  });

  test("renders album cards when albums are returned", async () => {
    (useSearchContext as jest.Mock).mockReturnValue({ artistId: "12345" });

    // Mock axios to return album data
    mockedAxios.get.mockResolvedValueOnce({ data: { name: "Test Artist" } }); // Artist name fetch
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        releases: [
          { id: "1", title: "Album 1", label: "Label 1", artist: "Artist 1", thumb: "image1.jpg", type: "release" },
          { id: "2", title: "Album 2", label: "Label 2", artist: "Artist 2", thumb: "image2.jpg", type: "release" },
        ],
        pagination: { items: 2, pages: 1 },
      },
    }); // Albums fetch

    render(<SearchResults />);

    await waitFor(() => {
      expect(screen.getByText("Album 1")).toBeInTheDocument();
      expect(screen.getByText("Album 2")).toBeInTheDocument();
      expect(screen.getByText("Label 1")).toBeInTheDocument();
      expect(screen.getByText("Label 2")).toBeInTheDocument();
    });
  });
});
