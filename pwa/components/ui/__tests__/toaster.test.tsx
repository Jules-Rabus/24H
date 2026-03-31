import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { Toaster, toaster } from "../toaster";
import { Button } from "@chakra-ui/react";

const TestComponent = () => {
  return (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toaster.create({
            title: "Test Toast",
            description: "This is a test",
            type: "success",
            action: { label: "Undo", onClick: () => {} },
          })
        }
      >
        Show Toast
      </Button>
      <Button
        onClick={() =>
          toaster.create({
            title: "Loading Toast",
            type: "loading",
          })
        }
      >
        Show Loading Toast
      </Button>
    </div>
  );
};

describe("Toaster component", () => {
  it("renders a toast when created", async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText("Show Toast"));

    await waitFor(() => {
      expect(screen.getByText("Test Toast")).toBeInTheDocument();
      expect(screen.getByText("This is a test")).toBeInTheDocument();
      expect(screen.getByText("Undo")).toBeInTheDocument();
    });
  });

  it("renders a loading toast when type is loading", async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText("Show Loading Toast"));

    await waitFor(() => {
      expect(screen.getByText("Loading Toast")).toBeInTheDocument();
    });
  });
});
