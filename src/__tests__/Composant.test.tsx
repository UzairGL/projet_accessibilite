import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
afterEach(cleanup);

describe("Question à l’organisateur", () => {
  it("depuis App, conserve le sujet et la question après un envoi sans email, puis confirme le bon atelier et le bon sujet après correction", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Poser une question sur Une tasse en céramique",
      }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Poser une question sur Une tasse en céramique",
    });

    const subject = within(dialog).getByRole("combobox", { name: /sujet/i });
    const question = within(dialog).getByRole("textbox", {
      name: /votre question/i,
    });
    await user.selectOptions(subject, "Le matériel à apporter");
    await user.type(question, "Faut-il apporter un tablier ?");

    await user.click(within(dialog).getByRole("button", { name: "Envoyer" }));

    const email = within(dialog).getByRole("textbox", {
      name: /adresse électronique/i,
    });
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(
      "Saisissez une adresse électronique au format nom@exemple.fr.",
    );
    expect(dialog).toBeInTheDocument();
    expect(subject).toHaveValue("materiel");
    expect(question).toHaveValue("Faut-il apporter un tablier ?");
    expect(screen.queryByText(/Question envoyée/)).not.toBeInTheDocument();

    await user.type(email, "test@example.fr");
    await user.click(within(dialog).getByRole("button", { name: "Envoyer" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const confirmation = screen.getByText(/Question envoyée/);
    expect(confirmation).toHaveTextContent("Une tasse en céramique");
    expect(confirmation).toHaveTextContent("Le matériel à apporter");
  });
});
