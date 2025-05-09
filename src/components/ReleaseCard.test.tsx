import { describe, it, expect, jest, beforeEach } from "@jest/globals";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import ReleaseCard from "./ReleaseCard";
import { TaskStatus, TaskPriority, PromotionTask, Release } from "../types";

describe("ReleaseCard Component", () => {
  const mockTasks = [
    {
      taskId: 1,
      releaseId: 123,
      description: "Test task 1",
      status: TaskStatus.ToDo,
      priority: TaskPriority.High,
      deleted: false,
    },
    {
      taskId: 2,
      releaseId: 123,
      description: "Test task 2",
      status: TaskStatus.InProgress,
      priority: TaskPriority.Medium,
      deleted: false,
    },
  ];

  const mockRelease: Release = {
    releaseId: 123,
    userId: 1,
    title: "Test Release",
    type: 0,
    releaseDate: "2023-05-15",
    description: "Test description",
    deleted: false,
    promotionTasks: mockTasks,
  };

  // Define the mock task for onTaskCreate to return
  const mockNewTask: PromotionTask = {
    taskId: 3,
    releaseId: 123,
    description: "New test task",
    status: TaskStatus.ToDo,
    priority: TaskPriority.Low,
    deleted: false,
  };

  // Make all the mock functions
  const mockOnTaskStatusUpdate = jest.fn();
  const mockOnTaskPriorityUpdate = jest.fn();
  const mockOnTaskUpdate = jest.fn();

  // const mockOnTaskCreate = jest
  //   .fn()
  //   .mockImplementation(() => Promise.resolve(mockNewTask));

  // const mockOnTaskCreate = jest
  //   .fn()
  //   .mockImplementation((task: Omit<PromotionTask, "taskId">) => {
  //     return Promise.resolve(mockNewTask);
  //   });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockOnTaskCreate = async (task: Omit<PromotionTask, "taskId">) => {
    return mockNewTask;
  };

  it("should render release title", () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );
    expect(screen.getByText("Test Release")).toBeInTheDocument();
  });

  it("should render release date", () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );
    expect(screen.getByText(/release date:/i)).toBeInTheDocument();
  });

  it("should render release description", () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should display the Promotion Tasks button", () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );
    const taskButton = screen.getByText("Promotion Tasks");
    expect(taskButton).toBeInTheDocument();
  });

  it("should display Add New Task button", () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );
    const addButton = screen.getByText("Add New Task");
    expect(addButton).toBeInTheDocument();
  });

  it("should show tasks count", () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );
    expect(screen.getByText(/0 \/ 2 completed/)).toBeInTheDocument();
  });

  it("should toggle task list when clicking on Promotion Tasks button", async () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );

    // Click to expand
    const taskButton = screen.getByText("Promotion Tasks").closest("button");
    if (taskButton) {
      await userEvent.click(taskButton);
    }

    // Tasks should be visible
    expect(screen.getByText("Test task 1")).toBeInTheDocument();
    expect(screen.getByText("Test task 2")).toBeInTheDocument();

    // Click to collapse
    if (taskButton) {
      await userEvent.click(taskButton);
    }

    // Tasks should not be visible
    await waitFor(() => {
      expect(screen.queryByText("Test task 1")).not.toBeInTheDocument();
    });
  });

  it("should show the Add Task form when clicking Add New Task", async () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );

    // Find and click the Add New Task button
    const addButton = screen.getByText("Add New Task");
    await userEvent.click(addButton);

    // The form should be visible
    expect(
      screen.getByPlaceholderText("Enter task description...")
    ).toBeInTheDocument();
    expect(screen.getByText("Priority:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Task" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should call onTaskCreate when adding a new task", async () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );

    // Open the add task form
    const addButton = screen.getByText("Add New Task");
    await userEvent.click(addButton);

    // Fill out the form
    const descriptionInput = screen.getByPlaceholderText(
      "Enter task description..."
    );
    await userEvent.type(descriptionInput, "New test task");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Add Task" });
    await userEvent.click(submitButton);

    // Form should close after submission
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Enter task description...")
      ).not.toBeInTheDocument();
    });
  });

  it("should hide add task form when clicking cancel", async () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );

    // Open the add task form
    const addButton = screen.getByText("Add New Task");
    await userEvent.click(addButton);

    // Check that form is visible
    expect(
      screen.getByPlaceholderText("Enter task description...")
    ).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelButton);

    // Form should be hidden
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Enter task description...")
      ).not.toBeInTheDocument();
    });
  });

  it("should select different priorities when adding a task", async () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );

    // Open the add task form
    const addButton = screen.getByText("Add New Task");
    await userEvent.click(addButton);

    // Initial priority should be Medium (default)
    expect(screen.getByText("Medium")).toBeInTheDocument();

    // Click to open dropdown
    const priorityDropdown = screen.getByText("Medium");
    await userEvent.click(priorityDropdown);

    // Select High priority
    const highOption = screen.getByText("High");
    await userEvent.click(highOption);

    // Now high should be selected
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("should show task list when expanding", async () => {
    render(
      <ReleaseCard
        release={mockRelease}
        onTaskStatusUpdate={mockOnTaskStatusUpdate}
        onTaskPriorityUpdate={mockOnTaskPriorityUpdate}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
      />
    );

    // Click to expand task list
    const taskButton = screen.getByText("Promotion Tasks").closest("button");
    if (taskButton) {
      await userEvent.click(taskButton);
    }

    // Tasks should be visible
    expect(screen.getByText("Test task 1")).toBeInTheDocument();
    expect(screen.getByText("Test task 2")).toBeInTheDocument();
  });
});
