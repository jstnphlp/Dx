import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LedgerTable } from "@/components/shared/ledger-table";

describe("LedgerTable", () => {
  it("renders a solid record ledger with semantic status and navigation", () => {
    render(
      <LedgerTable
        eyebrow="Recent customers"
        rows={[
          {
            id: "customer-1",
            title: "Northstar Supplies",
            subtitle: "ops@northstar.example",
            status: { label: "Active", tone: "success" },
            href: "/customers/customer-1",
          },
        ]}
        actionHref="/customers"
      />,
    );

    expect(
      screen.getByRole("region", { name: "Recent customers · 1" }),
    ).toHaveAttribute("data-ledger-size", "standard");
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Northstar Supplies/ }),
    ).toHaveAttribute("href", "/customers/customer-1");
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/customers",
    );
  });

  it("renders its empty state without an outer card", () => {
    render(
      <LedgerTable
        rows={[]}
        emptyTitle="No customers yet"
        emptyDescription="Add the first customer."
      />,
    );

    expect(screen.getByText("No customers yet")).toBeInTheDocument();
    expect(screen.getByText("Add the first customer.")).toBeInTheDocument();
  });
});
