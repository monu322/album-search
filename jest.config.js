module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // For Jest setup
  testEnvironment: "jsdom", // For React tests
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"], // Recognize these extensions
};
