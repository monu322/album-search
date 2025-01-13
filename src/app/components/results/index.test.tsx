import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import  SearchResults from '../results/index';
import { SearchProvider } from "../../contexts/searchContext"; // Assuming you're using a Context Provider
import axios from 'axios';

// Mocking axios for API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SearchResults Component', () => {
  const mockArtistId = 123; // A mock artist ID
  const mockAlbumsResponse = {
    data: {
      releases: [
        { id: 1, title: 'Album 1', artist: 'Artist 1', label: 'Label 1', thumb: '/img/album1.jpg' },
        { id: 2, title: 'Album 2', artist: 'Artist 2', label: 'Label 2', thumb: '/img/album2.jpg' },
      ],
      pagination: { items: 10 },
    },
  };

  beforeEach(() => {
    // Set up mock API response for artist info and albums
    mockedAxios.get.mockResolvedValueOnce({ data: { name: 'Artist Name' } }); // Mock artist info response
    mockedAxios.get.mockResolvedValueOnce(mockAlbumsResponse); // Mock albums response
  });

  test('renders without crashing', () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );
    expect(screen.getByText(/Showing top 5 releases/)).toBeInTheDocument();
  });

  test('displays loading spinner while data is being fetched', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { name: 'Artist Name' } }); // Mock the artist info response

    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // Check if loading spinner is displayed
  });

  test('displays error message when fetching data fails', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    await waitFor(() => expect(screen.getByText('Failed to load artist or albums')).toBeInTheDocument());
  });

  test('displays albums correctly', async () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Album 1')).toBeInTheDocument();
      expect(screen.getByText('Album 2')).toBeInTheDocument();
    });
  });

  test('correctly handles pagination', async () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    await waitFor(() => {
      // Check if the page number is rendered
      expect(screen.getByText(/Showing page 1 of 2/)).toBeInTheDocument();
    });

    // Click Next page button
    fireEvent.click(screen.getByText('Next >'));

    // Check if the page number is updated
    await waitFor(() => expect(screen.getByText(/Showing page 2 of 2/)).toBeInTheDocument());
  });

  test('correctly handles page jump input', async () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    // Simulate typing in the page jump input and clicking Go
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2' } });
    fireEvent.click(screen.getByText('Go'));

    // Check if the page number is updated
    await waitFor(() => expect(screen.getByText(/Showing page 2 of 2/)).toBeInTheDocument());
  });

  test('shows error for invalid page number input', async () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    // Simulate typing in an invalid page number and clicking Go
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '99' } });
    fireEvent.click(screen.getByText('Go'));

    // Check if the error message is displayed
    await waitFor(() => expect(screen.getByText('Please enter a valid page number between 1 and 2')).toBeInTheDocument());
  });
});
