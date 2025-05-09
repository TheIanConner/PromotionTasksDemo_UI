import { describe, expect, jest, beforeEach } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Login from "./Login";
import { api } from "../api/client";
import { User } from "../types";

// Mock api client
jest.mock("../api/client", () => ({
  api: {
    getUserByName: jest.fn(),
  },
}));

describe("Login Component", () => {
  // Mock callback function
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the login form correctly", () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Sign in to manage your releases")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  test("allows entering username and password", async () => {
    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  test("calls api.getUserByName with entered username on form submission", async () => {
    const mockUser: User = {
      userId: 1,
      name: "testuser",
      createdDate: "2023-01-01",
      lastActiveDate: "2023-01-01",
      deleted: false,
    };
    (api.getUserByName as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockUser)
    );

    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.getUserByName).toHaveBeenCalledWith("testuser");
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  test("displays an error message on failed login", async () => {
    (api.getUserByName as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error("User not found"))
    );

    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password")
      ).toBeInTheDocument();
    });
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test("disables the submit button while loading and shows loading state", async () => {
    // Mock a delayed response to ensure we can test the loading state
    (api.getUserByName as jest.Mock).mockImplementation(
      () =>
        new Promise<User>((resolve) => {
          setTimeout(() => {
            resolve({
              userId: 1,
              name: "testuser",
              createdDate: "2023-01-01",
              lastActiveDate: "2023-01-01",
              deleted: false,
            });
          }, 100);
        })
    );

    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
