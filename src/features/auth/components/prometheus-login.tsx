"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  prometheusLoginSchema,
  type PrometheusLoginInput,
} from "@/features/auth/schemas";

import styles from "./prometheus-login.module.css";

export type PrometheusLoginPayload = PrometheusLoginInput;

type PrometheusLoginProps = {
  onSubmit: (payload: PrometheusLoginPayload) => void | Promise<void>;
  onForgotPassword: () => void;
  loading?: boolean;
  error?: string;
  artSrc?: string;
  markSrc?: string;
  motion?: "off" | "subtle" | "ambient";
};

export function PrometheusLogin({
  onSubmit,
  onForgotPassword,
  loading = false,
  error = "",
  artSrc = "/auth/prometheus-moving-gradient.png",
  markSrc = "/auth/prometheus-mark.png",
  motion = "ambient",
}: PrometheusLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrometheusLoginInput>({
    resolver: zodResolver(prometheusLoginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const visibleError = error || errors.root?.message;

  return (
    <main className={styles.page}>
      <section className={styles.authPanel} aria-labelledby="login-heading">
        <div className={styles.authInner}>
          <div className={styles.brand}>
            <Image
              src={markSrc}
              alt=""
              width={42}
              height={42}
              className={styles.mark}
              priority
            />
            <div>
              <div className={styles.brandName}>Prometheus</div>
              <div className={styles.brandSub}>VIRTUAL OFFICE</div>
            </div>
          </div>

          <div className={styles.formHeader}>
            <p className={styles.eyebrow}>WELCOME BACK</p>
            <h1 id="login-heading">Sign in</h1>
            <p>Access your workspace and continue building what matters.</p>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className={styles.field}>
              <label htmlFor="email">COMPANY EMAIL</label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                autoFocus
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email ? (
                <p id="email-error" className={styles.fieldError}>
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="password">PASSWORD</label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  {...register("password")}
                />
                <button
                  className={styles.eyeButton}
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p id="password-error" className={styles.fieldError}>
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div className={styles.formRow}>
              <label className={styles.remember}>
                <input type="checkbox" {...register("remember")} />
                <span>Keep me signed in</span>
              </label>
              <button
                type="button"
                className={styles.forgot}
                onClick={onForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            {visibleError ? (
              <div className={styles.error} role="alert">
                {visibleError}
              </div>
            ) : null}

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in to Prometheus"}
            </button>

            <p className={styles.helper}>
              Your access is managed by your organization. Contact your
              administrator for login assistance.
            </p>
          </form>
        </div>
      </section>

      <section
        className={[
          styles.artPanel,
          motion === "off" ? "" : styles[`motion_${motion}`],
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Prometheus artwork"
      >
        <div
          className={styles.artBase}
          style={{ backgroundImage: `url(${artSrc})` }}
          aria-hidden="true"
        />
        <div className={styles.artAtmosphere} aria-hidden="true" />
        <div className={styles.artGrain} aria-hidden="true" />
        <div className={styles.artCaption}>
          <span>PEOPLE / WORK / PROGRESS</span>
          <strong>Bring the work into the light.</strong>
        </div>
      </section>
    </main>
  );
}
