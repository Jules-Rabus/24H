import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "../test-utils/render";
import BulkUsersPage from "../../app/admin/users/bulk/page";
import { server } from "../mocks/server";
import { buildAdminUser } from "../mocks/factories";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => "/admin/users/bulk",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

function setupUser() {
  return userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

async function renderPage() {
  const user = setupUser();
  render(<BulkUsersPage />);
  await waitFor(() => {
    expect(screen.getAllByLabelText("Prénom").length).toBeGreaterThan(0);
  });
  return { user };
}

describe("BulkUsersPage — saisie en masse", () => {
  it("affiche 5 lignes vides au chargement", async () => {
    await renderPage();
    expect(screen.getAllByLabelText("Prénom")).toHaveLength(5);
  });

  it("ajoute une nouvelle ligne au clic sur 'Ajouter une ligne'", async () => {
    const { user } = await renderPage();
    await user.click(
      screen.getByRole("button", { name: /ajouter une ligne/i }),
    );
    expect(screen.getAllByLabelText("Prénom")).toHaveLength(6);
  });

  it("supprime une ligne au clic sur l'icône poubelle", async () => {
    const { user } = await renderPage();
    expect(screen.getAllByLabelText("Supprimer la ligne")).toHaveLength(5);
    await user.click(screen.getAllByLabelText("Supprimer la ligne")[0]);
    expect(screen.getAllByLabelText("Supprimer la ligne")).toHaveLength(4);
  });

  it("garde au moins une ligne quand on supprime toutes les lignes", async () => {
    const { user } = await renderPage();
    while (screen.queryAllByLabelText("Supprimer la ligne").length > 1) {
      await user.click(screen.getAllByLabelText("Supprimer la ligne")[0]);
    }
    await user.click(screen.getAllByLabelText("Supprimer la ligne")[0]);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Prénom")).toHaveLength(1);
    });
  });

  it("détecte un doublon dans la liste en cours de saisie", async () => {
    const { user } = await renderPage();
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

    const firstNames = screen.getAllByLabelText("Prénom");
    const lastNames = screen.getAllByLabelText("Nom");

    await user.type(firstNames[0], "Alice");
    await user.type(lastNames[0], "Martin");
    await user.type(firstNames[1], "alice");
    await user.type(lastNames[1], "MARTIN");

    await waitFor(
      () => {
        expect(
          screen.getAllByText("Doublon dans la liste").length,
        ).toBeGreaterThanOrEqual(2);
      },
      { timeout: 4000 },
    );
  });

  it("détecte un doublon existant en API et affiche le bouton 'Lier'", async () => {
    const { user } = await renderPage();
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        const fn = url.searchParams.get("firstName");
        const ln = url.searchParams.get("lastName");
        if (fn && ln) {
          return HttpResponse.json([
            buildAdminUser({ id: 42, firstName: fn, lastName: ln }),
          ]);
        }
        if (url.searchParams.has("itemsPerPage")) {
          return HttpResponse.json([]);
        }
      }),
    );

    await user.type(screen.getAllByLabelText("Prénom")[0], "Bob");
    await user.type(screen.getAllByLabelText("Nom")[0], "Durand");

    await waitFor(
      () => {
        expect(screen.getByText(/existe déjà \(#42\)/i)).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(
      screen.getByRole("button", { name: /lier au coureur 2026/i }),
    ).toBeInTheDocument();
  });

  it("désactive 'Tout enregistrer' quand il n'y a pas de ligne valide", async () => {
    await renderPage();
    expect(
      screen.getByRole("button", { name: /tout enregistrer/i }),
    ).toBeDisabled();
  });

  it("désactive 'Tout enregistrer' s'il y a un doublon dans la liste", async () => {
    const { user } = await renderPage();
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

    const firstNames = screen.getAllByLabelText("Prénom");
    const lastNames = screen.getAllByLabelText("Nom");
    await user.type(firstNames[0], "Léa");
    await user.type(lastNames[0], "Bernard");
    await user.type(firstNames[1], "Léa");
    await user.type(lastNames[1], "Bernard");

    await waitFor(
      () => {
        expect(
          screen.getAllByText("Doublon dans la liste").length,
        ).toBeGreaterThanOrEqual(1);
      },
      { timeout: 4000 },
    );
    expect(
      screen.getByRole("button", { name: /tout enregistrer/i }),
    ).toBeDisabled();
  });

  it("enregistre les lignes valides via POST /users", async () => {
    const { user } = await renderPage();

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

    const firstNames = screen.getAllByLabelText("Prénom");
    const lastNames = screen.getAllByLabelText("Nom");
    const orgs = screen.getAllByLabelText("Organisation");

    await user.type(firstNames[0], "Camille");
    await user.type(lastNames[0], "Petit");
    await user.type(orgs[0], "ACBB");

    await user.type(firstNames[1], "Theo");
    await user.type(lastNames[1], "Garcia");

    await waitFor(
      () => {
        expect(screen.getAllByText("OK").length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 4000 },
    );

    const saveBtn = screen.getByRole("button", { name: /tout enregistrer/i });
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
    const { user } = await renderPage();

    let addedToRunUserId: string | null = null;
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        const fn = url.searchParams.get("firstName");
        const ln = url.searchParams.get("lastName");
        if (fn && ln) {
          return HttpResponse.json([
            buildAdminUser({ id: 77, firstName: fn, lastName: ln }),
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

    await user.type(screen.getAllByLabelText("Prénom")[0], "Lou");
    await user.type(screen.getAllByLabelText("Nom")[0], "Roux");

    await waitFor(
      () => {
        expect(screen.getByText(/existe déjà \(#77\)/i)).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    await user.click(
      screen.getByRole("button", { name: /lier au coureur 2026/i }),
    );

    const saveBtn = screen.getByRole("button", { name: /tout enregistrer/i });
    await waitFor(() => {
      expect(saveBtn).toBeEnabled();
    });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(addedToRunUserId).toBe("77");
    });
  });

  it("Enter dans la dernière colonne ajoute une nouvelle ligne", async () => {
    const { user } = await renderPage();
    expect(screen.getAllByLabelText("Prénom")).toHaveLength(5);

    const orgs = screen.getAllByLabelText("Organisation");
    const lastOrg = orgs[orgs.length - 1];
    lastOrg.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getAllByLabelText("Prénom")).toHaveLength(6);
    });
  });

  it("affiche 'Champs requis manquants' si une ligne est partiellement remplie", async () => {
    const { user } = await renderPage();
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

    await user.type(screen.getAllByLabelText("Prénom")[0], "Solo");

    await waitFor(
      () => {
        expect(screen.getByText("Champs requis manquants")).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(
      screen.getByRole("button", { name: /tout enregistrer/i }),
    ).toBeDisabled();
  });

  it("retourne sur /admin/users après enregistrement réussi", async () => {
    pushMock.mockClear();
    const { user } = await renderPage();

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

    await user.type(screen.getAllByLabelText("Prénom")[0], "Zoé");
    await user.type(screen.getAllByLabelText("Nom")[0], "Dubois");

    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /tout enregistrer/i }),
        ).toBeEnabled();
      },
      { timeout: 4000 },
    );
    await user.click(screen.getByRole("button", { name: /tout enregistrer/i }));

    await waitFor(
      () => {
        expect(pushMock).toHaveBeenCalledWith("/admin/users");
      },
      { timeout: 4000 },
    );
  });

  it("permet d'attacher une photo à une ligne et l'envoie après création", async () => {
    const { user } = await renderPage();

    let uploadedUserId: string | null = null;
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
            id: 555,
            firstName: body.firstName as string,
            lastName: body.lastName as string,
          }),
          { status: 201 },
        );
      }),
      http.post("*/users/:userId/image", ({ params }) => {
        uploadedUserId = params.userId as string;
        return HttpResponse.json({ ok: true }, { status: 201 });
      }),
    );

    await user.type(screen.getAllByLabelText("Prénom")[0], "Photo");
    await user.type(screen.getAllByLabelText("Nom")[0], "Coureur");

    const fileInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(0);
    const fakeFile = new File(["abc"], "selfie.jpg", { type: "image/jpeg" });
    await user.upload(fileInputs[0], fakeFile);

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /retirer la photo/i }).length,
      ).toBeGreaterThan(0);
    });

    await waitFor(
      () => {
        expect(screen.getAllByText("OK").length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 4000 },
    );

    await user.click(screen.getByRole("button", { name: /tout enregistrer/i }));

    await waitFor(() => {
      expect(uploadedUserId).toBe("555");
    });
  });
});
