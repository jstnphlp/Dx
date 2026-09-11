"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { loginAction } from "@/features/auth/actions";
import {
  PrometheusLogin,
  type PrometheusLoginPayload,
} from "@/features/auth/components/prometheus-login";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(values: PrometheusLoginPayload) {
    setError("");
    startTransition(async () => {
      const result = await loginAction(values);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    });
  }

  return (
    <PrometheusLogin
      onSubmit={submit}
      onForgotPassword={() => router.push("/forgot-password")}
      loading={isPending}
      error={error}
    />
  );
}
