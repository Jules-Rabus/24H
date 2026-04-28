import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "../test-utils/render";
import AdminUsersPage from "../../app/admin/users/page";
import { server } from "../mocks/server";
import { buildAdminUser } from "../mocks/factories";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/users",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("@/components/classement/BulkBibDownloadButton", () => ({
  default: () => <button>Mock BulkDownload</button>,
}));

/**
 * Chakra v3 Dialog applies `pointer-events: none` to background elements,
 * which trips up `userEvent`'s pointer-events check in jsdom (the dialog
 * portal layout doesn't fully simulate). We disable the check globally
 * so we can interact with inputs inside the dialog.
 */
function setupUser() {
  return userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

async function openBulkDialog() {
  const user = setupUser();
  render(<AdminUsersPage />);

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: /saisie en masse/i }),
    ).toBeInTheDocument();
  });

  await user.click(screen.getByRole("button", { name: /saisie en masse/i }));

  const dialog = await screen.findByRole("dialog");
  await waitFor(() => {
    expect(
      within(dialog).getByText("Saisie en masse d'utilisateurs"),
    ).toBeInTheDocument();
  });

  return { user, dialog };
}

describe("AdminUsersPage — Bulk creation dialog", () => {
  it("affiche le bouton 'Saisie en masse' à côté du bouton de création", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /saisie en masse/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /créer un utilisateur/i }),
      ).toBeInTheDocument();
    });
  });

  it("ouvre le dialog plein écran avec 5 lignes vides au clic", async () => {
    const { dialog } = await openBulkDialog();
    const firstNameInputs = within(dialog).getAllByLabelText("Prénom");
    expect(firstNameInputs).toHaveLength(5);
  });

  it("ajoute une nouvelle ligne au clic sur 'Ajouter une ligne'", async () => {
    const { user, dialog } = await openBulkDialog();
    const addBtn = within(dialog).getByRole("button", {
      name: /ajouter une ligne/i,
    });
    await user.click(addBtn);
    expect(within(dialog).getAllByLabelText("Prénom")).toHaveLength(6);
  });

  it("supprime une ligne au clic sur l'icône poubelle", async () => {
    const { user, dialog } = await openBulkDialog();
    expect(within(dialog).getAllByLabelText("Supprimer la ligne")).toHaveLength(
      5,
    );
    await user.click(within(dialog).getAllByLabelText("Supprimer la ligne")[0]);
    expect(within(dialog).getAllByLabelText("Supprimer la ligne")).toHaveLength(
      4,
    );
  });

  it("garde au moins une ligne quand on supprime toutes les lignes", async () => {
    const { user, dialog } = await openBulkDialog();
    // Re-query each iteration so we always click a fresh, attached node.
    while (
      within(dialog).queryAllByLabelText("Supprimer la ligne").length > 1
    ) {
      await user.click(
        within(dialog).getAllByLabelText("Supprimer la ligne")[0],
      );
    }
    // Click the last one — component should refill with a fresh row.
    await user.click(within(dialog).getAllByLabelText("Supprimer la ligne")[0]);
    await waitFor(() => {
      expect(within(dialog).getAllByLabelText("Prénom")).toHaveLength(1);
    });
  });

  it("détecte un doublon dans la liste en cours de saisie", async () => {
    const { user, dialog } = await openBulkDialog();
    // Stub the API lookup so it never matches.
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        if (
          url.searchParams.has("firstName") ||
          url.searchParams.has("lastName")
        ) {
          return HttpResponse.json([]);
        }
      }),
    );

    const firstNames = within(dialog).getAllByLabelText("Prénom");
    const lastNames = within(dialog).getAllByLabelText("Nom");

    await user.type(firstNames[0], "Alice");
    await user.type(lastNames[0], "Martin");
    await user.type(firstNames[1], "alice");
    await user.type(lastNames[1], "MARTIN");

    await waitFor(
      () => {
        expect(
          within(dialog).getAllByText("Doublon dans la liste").length,
        ).toBeGreaterThanOrEqual(2);
      },
      { timeout: 4000 },
    );
  });

  it("détecte un doublon existant en API et affiche le bouton 'Lier'", async () => {
    const { user, dialog } = await openBulkDialog();

    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        const fn = url.searchParams.get("firstName");
        const ln = url.searchParams.get("lastName");
        if (fn && ln) {
          return HttpResponse.json([
            buildAdminUser({
              id: 42,
              firstName: fn,
              lastName: ln,
            }),
          ]);
        }
        if (url.searchParams.has("itemsPerPage")) {
          return HttpResponse.json([]);
        }
      }),
    );

    const firstNames = within(dialog).getAllByLabelText("Prénom");
    const lastNames = within(dialog).getAllByLabelText("Nom");

    await user.type(firstNames[0], "Bob");
    await user.type(lastNames[0], "Durand");

    await waitFor(
      () => {
        expect(
          within(dialog).getByText(/existe déjà \(#42\)/i),
        ).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    expect(
      within(dialog).getByRole("button", { name: /lier au coureur 2026/i }),
    ).toBeInTheDocument();
  });

  it("désactive 'Tout enregistrer' quand il n'y a pas de ligne valide", async () => {
    const { dialog } = await openBulkDialog();
    const saveBtn = within(dialog).getByRole("button", {
      name: /tout enregistrer/i,
    });
    expect(saveBtn).toBeDisabled();
  });

  it("désactive 'Tout enregistrer' s'il y a un doublon dans la liste", async () => {
    const { user, dialog } = await openBulkDialog();
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        if (
          url.searchParams.has("firstName") ||
          url.searchParams.has("lastName")
        ) {
          return HttpResponse.json([]);
        }
      }),
    );

    const firstNames = within(dialog).getAllByLabelText("Prénom");
    const lastNames = within(dialog).getAllByLabelText("Nom");
    await user.type(firstNames[0], "Léa");
    await user.type(lastNames[0], "Bernard");
    await user.type(firstNames[1], "Léa");
    await user.type(lastNames[1], "Bernard");

    await waitFor(
      () => {
        expect(
          within(dialog).getAllByText("Doublon dans la liste").length,
        ).toBeGreaterThanOrEqual(1);
      },
      { timeout: 4000 },
    );

    expect(
      within(dialog).getByRole("button", { name: /tout enregistrer/i }),
    ).toBeDisabled();
  });

  it("enregistre les lignes valides via POST /users", async () => {
    const { user, dialog } = await openBulkDialog();

    const created: Array<Record<string, unknown>> = [];
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        if (
          url.searchParams.has("firstName") ||
          url.searchParams.has("lastName")
        ) {
          return HttpResponse.json([]);
        }
      }),
      http.post("*/users", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        created.push(body);
        return HttpResponse.json(
          buildAdminUser({
            id: 100 + created.length,
            firstName: body.firstName as string,
            lastName: body.lastName as string,
          }),
          { status: 201 },
        );
      }),
    );

    const firstNames = within(dialog).getAllByLabelText("Prénom");
    const lastNames = within(dialog).getAllByLabelText("Nom");
    const orgs = within(dialog).getAllByLabelText("Organisation");

    await user.type(firstNames[0], "Camille");
    await user.type(lastNames[0], "Petit");
    await user.type(orgs[0], "ACBB");

    await user.type(firstNames[1], "Theo");
    await user.type(lastNames[1], "Garcia");

    await waitFor(
      () => {
        expect(within(dialog).getAllByText("OK").length).toBeGreaterThanOrEqual(
          2,
        );
      },
      { timeout: 4000 },
    );

    const saveBtn = within(dialog).getByRole("button", {
      name: /tout enregistrer/i,
    });
    expect(saveBtn).toBeEnabled();
    await user.click(saveBtn);

    await waitFor(() => {
      expect(created).toHaveLength(2);
    });
    expect(created[0]).toMatchObject({
      firstName: "Camille",
      lastName: "Petit",
      organization: "ACBB",
    });
    expect(created[1]).toMatchObject({
      firstName: "Theo",
      lastName: "Garcia",
    });
  });

  it("appelle add_to_current_run quand l'utilisateur clique 'Lier'", async () => {
    const { user, dialog } = await openBulkDialog();

    let addedToRunUserId: string | null = null;
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        const fn = url.searchParams.get("firstName");
        const ln = url.searchParams.get("lastName");
        if (fn && ln) {
          return HttpResponse.json([
            buildAdminUser({
              id: 77,
              firstName: fn,
              lastName: ln,
            }),
          ]);
        }
        if (url.searchParams.has("itemsPerPage")) {
          return HttpResponse.json([]);
        }
      }),
      http.post("*/users/:id/add_to_current_run", ({ params }) => {
        addedToRunUserId = params.id as string;
        return HttpResponse.json({ ok: true });
      }),
    );

    const firstNames = within(dialog).getAllByLabelText("Prénom");
    const lastNames = within(dialog).getAllByLabelText("Nom");
    await user.type(firstNames[0], "Lou");
    await user.type(lastNames[0], "Roux");

    await waitFor(
      () => {
        expect(
          within(dialog).getByText(/existe déjà \(#77\)/i),
        ).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    // Click the "Lier au coureur 2026" button
    const linkBtn = within(dialog).getByRole("button", {
      name: /lier au coureur 2026/i,
    });
    await user.click(linkBtn);

    // The save-all button should now be enabled
    const saveBtn = within(dialog).getByRole("button", {
      name: /tout enregistrer/i,
    });
    await waitFor(() => {
      expect(saveBtn).toBeEnabled();
    });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(addedToRunUserId).toBe("77");
    });
  });

  it("Enter dans la dernière colonne ajoute une nouvelle ligne", async () => {
    const { user, dialog } = await openBulkDialog();

    expect(within(dialog).getAllByLabelText("Prénom")).toHaveLength(5);

    // Focus the last row's organization input (last column)
    const orgs = within(dialog).getAllByLabelText("Organisation");
    const lastOrg = orgs[orgs.length - 1];
    lastOrg.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(within(dialog).getAllByLabelText("Prénom")).toHaveLength(6);
    });
  });

  it("affiche 'Champs requis manquants' si une ligne est partiellement remplie", async () => {
    const { user, dialog } = await openBulkDialog();
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        if (
          url.searchParams.has("firstName") ||
          url.searchParams.has("lastName")
        ) {
          return HttpResponse.json([]);
        }
      }),
    );
    const firstNames = within(dialog).getAllByLabelText("Prénom");
    await user.type(firstNames[0], "Solo");

    await waitFor(
      () => {
        expect(
          within(dialog).getByText("Champs requis manquants"),
        ).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(
      within(dialog).getByRole("button", { name: /tout enregistrer/i }),
    ).toBeDisabled();
  });

  it("ferme le dialog après enregistrement réussi", async () => {
    const { user, dialog } = await openBulkDialog();

    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        if (
          url.searchParams.has("firstName") ||
          url.searchParams.has("lastName")
        ) {
          return HttpResponse.json([]);
        }
      }),
      http.post("*/users", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          buildAdminUser({
            id: 999,
            firstName: body.firstName as string,
            lastName: body.lastName as string,
          }),
          { status: 201 },
        );
      }),
    );

    const firstNames = within(dialog).getAllByLabelText("Prénom");
    const lastNames = within(dialog).getAllByLabelText("Nom");
    await user.type(firstNames[0], "Zoé");
    await user.type(lastNames[0], "Dubois");

    await waitFor(
      () => {
        expect(
          within(dialog).getByRole("button", { name: /tout enregistrer/i }),
        ).toBeEnabled();
      },
      { timeout: 4000 },
    );

    await user.click(
      within(dialog).getByRole("button", { name: /tout enregistrer/i }),
    );

    await waitFor(
      () => {
        expect(
          screen.queryByText("Saisie en masse d'utilisateurs"),
        ).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });
});
