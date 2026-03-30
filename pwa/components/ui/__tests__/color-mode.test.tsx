import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, renderHook, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import {
  ColorModeProvider,
  useColorMode,
  useColorModeValue,
  ColorModeIcon,
  ColorModeButton,
  LightMode,
  DarkMode,
} from "../color-mode";

// Mock next-themes
const mockSetTheme = vi.fn();
let mockResolvedTheme = "light";
let mockForcedTheme: string | undefined = undefined;

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
    forcedTheme: mockForcedTheme,
  }),
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="theme-provider" {...props}>
      {children}
    </div>
  ),
}));

describe("ColorMode Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolvedTheme = "light";
    mockForcedTheme = undefined;
  });

  describe("ColorModeProvider", () => {
    it("renders the ThemeProvider from next-themes", () => {
      render(
        <ColorModeProvider attribute="class">
          <div>Test content</div>
        </ColorModeProvider>,
      );
      const provider = screen.getByTestId("theme-provider");
      expect(provider).toBeInTheDocument();
      expect(provider).toHaveTextContent("Test content");
      expect(provider).toHaveAttribute("attribute", "class");
    });
  });

  describe("useColorMode hook", () => {
    it("returns correct color mode state and setter when light", () => {
      mockResolvedTheme = "light";
      const { result } = renderHook(() => useColorMode());

      expect(result.current.colorMode).toBe("light");

      result.current.setColorMode("dark");
      expect(mockSetTheme).toHaveBeenCalledWith("dark");

      result.current.toggleColorMode();
      expect(mockSetTheme).toHaveBeenCalledWith("dark"); // because it toggles from 'light'
    });

    it("returns correct color mode state and setter when dark", () => {
      mockResolvedTheme = "dark";
      const { result } = renderHook(() => useColorMode());

      expect(result.current.colorMode).toBe("dark");

      result.current.toggleColorMode();
      expect(mockSetTheme).toHaveBeenCalledWith("light"); // because it toggles from 'dark'
    });

    it("prioritizes forcedTheme over resolvedTheme", () => {
      mockResolvedTheme = "dark";
      mockForcedTheme = "light";
      const { result } = renderHook(() => useColorMode());

      expect(result.current.colorMode).toBe("light");
    });
  });

  describe("useColorModeValue hook", () => {
    it("returns light value when light mode", () => {
      mockResolvedTheme = "light";
      const { result } = renderHook(() =>
        useColorModeValue("light-val", "dark-val"),
      );
      expect(result.current).toBe("light-val");
    });

    it("returns dark value when dark mode", () => {
      mockResolvedTheme = "dark";
      const { result } = renderHook(() =>
        useColorModeValue("light-val", "dark-val"),
      );
      expect(result.current).toBe("dark-val");
    });
  });

  describe("ColorModeIcon", () => {
    it("renders sun icon when light mode", () => {
      mockResolvedTheme = "light";
      const { container } = render(<ColorModeIcon />);
      // Sun icon has SVG paths or class
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders moon icon when dark mode", () => {
      mockResolvedTheme = "dark";
      const { container } = render(<ColorModeIcon />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("ColorModeButton", () => {
    it("toggles color mode when clicked", async () => {
      mockResolvedTheme = "light";
      const user = userEvent.setup();
      render(<ColorModeButton />);

      const button = screen.getByRole("button", { name: /toggle color mode/i });
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });
  });

  describe("LightMode component", () => {
    it("renders a Span with light mode classes", () => {
      render(<LightMode>Test</LightMode>);
      const span = screen.getByText("Test");
      expect(span).toHaveClass("chakra-theme light");
    });
  });

  describe("DarkMode component", () => {
    it("renders a Span with dark mode classes", () => {
      render(<DarkMode>Test</DarkMode>);
      const span = screen.getByText("Test");
      expect(span).toHaveClass("chakra-theme dark");
    });
  });
});
