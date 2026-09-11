import Link from "next/link";

import styles from "./ledger-table.module.css";

export type LedgerTableSize = "compact" | "standard" | "roomy";
export type LedgerStatusTone =
  "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export interface LedgerTableRow {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  status?: {
    label: string;
    tone?: LedgerStatusTone;
  };
  href?: string;
}

interface LedgerTableProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  rows: LedgerTableRow[];
  actionLabel?: string;
  actionHref?: string;
  size?: LedgerTableSize;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  showArrow?: boolean;
}

function cx(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function LedgerTable({
  eyebrow = "Recent records",
  title,
  description,
  rows,
  actionLabel = "View all",
  actionHref,
  size = "standard",
  className,
  emptyTitle = "No records yet",
  emptyDescription = "New records will appear here.",
  showArrow = true,
}: LedgerTableProps) {
  const heading = title ?? `${eyebrow} · ${rows.length}`;

  return (
    <section
      className={cx(styles.ledger, styles[size], className)}
      aria-label={heading}
      data-ledger-size={size}
    >
      <header className={styles.header}>
        <div className={styles.headingCopy}>
          <div className={styles.eyebrow}>{heading}</div>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>

        {actionHref ? (
          <Link className={styles.headerAction} href={actionHref}>
            {actionLabel}
          </Link>
        ) : null}
      </header>

      <div className={styles.body}>
        {rows.length ? (
          <ul className={styles.rows}>
            {rows.map((row) => {
              const content = (
                <>
                  <div className={styles.primary}>
                    <div className={styles.title}>{row.title}</div>
                    {row.subtitle ? (
                      <div className={styles.subtitle}>{row.subtitle}</div>
                    ) : null}
                    {row.meta ? (
                      <div className={styles.meta}>{row.meta}</div>
                    ) : null}
                  </div>

                  <div className={styles.trailing}>
                    {row.status ? (
                      <span
                        className={cx(
                          styles.status,
                          styles[`tone_${row.status.tone ?? "neutral"}`],
                        )}
                      >
                        {row.status.label}
                      </span>
                    ) : null}
                    {showArrow && row.href ? (
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                    ) : null}
                  </div>
                </>
              );

              return (
                <li key={row.id} className={styles.rowItem}>
                  {row.href ? (
                    <Link href={row.href} className={styles.row}>
                      {content}
                    </Link>
                  ) : (
                    <div className={styles.row}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.empty}>
            <strong>{emptyTitle}</strong>
            <span>{emptyDescription}</span>
          </div>
        )}
      </div>
    </section>
  );
}
