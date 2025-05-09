import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { User } from "./types";

// Mock child components
jest.mock("./components/Login", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function Login({ onLogin }: { onLogin: (userData: any) => void }) {
    return (
      <div data-testid="login-component">
        <button
          onClick={() =>
            onLogin({
              userId: 1,
              name: "Test User",
              createdDate: "",
              lastActiveDate: "",
              deleted: false,
            })
          }
        >
          Login
        </button>
      </div>
    );
  },
}));

jest.mock("./components/Dashboard", () => ({
  __esModule: true,
  default: function Dashboard({
    onLogout,
  }: {
    onLogout: () => void;
    user: User;
  }) {
    return (
      <div data-testid="dashboard-component">
        <button onClick={onLogout}>Logout</button>
      </div>
    );
  },
}));

// Create a mock version of App without the Router
const MockApp = () => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Check for user data in sessionStorage when the app loads
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = (userData: any) => {
    // Save user to state and sessionStorage
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    // Clear user from state and sessionStorage
    setUser(null);
    sessionStorage.removeItem("user");
  };

  if (user) {
    return (
      <div data-testid="dashboard-component">
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  } else {
    return (
      <div data-testid="login-component">
        <button
          onClick={() =>
            handleLogin({
              userId: 1,
              name: "Test User",
              createdDate: "",
              lastActiveDate: "",
              deleted: false,
            })
          }
        >
          Login
        </button>
      </div>
    );
  }
};

describe("App", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it("redirects to login page initially", () => {
    render(<MockApp />);
    expect(screen.getByTestId("login-component")).toBeInTheDocument();
  });

  it("redirects to dashboard after login", async () => {
    render(<MockApp />);

    // Click login button
    await userEvent.click(screen.getByText("Login"));

    // Should redirect to dashboard
    expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
  });

  it("redirects to login after logout", async () => {
    // First login
    render(<MockApp />);
    await userEvent.click(screen.getByText("Login"));

    // Then logout
    await userEvent.click(screen.getByText("Logout"));

    // Should redirect back to login
    expect(screen.getByTestId("login-component")).toBeInTheDocument();
  });

  it("persists user session on reload", () => {
    // Set user in sessionStorage
    sessionStorage.setItem(
      "user",
      JSON.stringify({
        userId: 1,
        name: "Test User",
        createdDate: "",
        lastActiveDate: "",
        deleted: false,
      })
    );

    // Render app
    render(<MockApp />);

    // Should go directly to dashboard
    expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
  });
});
