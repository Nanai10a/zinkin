import { z } from "zod";
import * as c from "./credential";

const BASE_URL = "https://zk.n7i.dev/-api/";

export const register = async () => {
  const url = new URL("auth/register", BASE_URL);
  const method = "POST";
  const headers = { "content-type": "application/json" };

  const clg = await fetch(url, { headers, method, body: "null" });
  if (clg.status !== 202) {
    throw new Error("failed to create challenge");
  }

  const cco = await c.CreateOptions.strict().parseAsync(await clg.json());

  const ctrl = new AbortController();
  const cred = await navigator.credentials
    .create({ ...cco, signal: ctrl.signal })
    .catch((e) => {
      console.error(e);
      ctrl.abort();
    });

  if (!cred) {
    return "no credential";
  }

  const body = JSON.stringify(c.toRegisterPublicKeyCredential(cred));
  const res = await fetch(url, { headers, method, body });
  switch (res.status) {
    case 200:
      return "success";

    case 400:
      throw new Error(await res.text());

    case 401:
      return "unauthorized";

    default:
      throw new Error("unknown status");
  }
};

export const claim = async () => {
  const url = new URL("auth/claim", BASE_URL);
  const method = "POST";
  const headers = { "content-type": "application/json" };

  const clg = await fetch(url, { headers, method, body: "null" });
  if (clg.status === 200) {
    return "success";
  }

  if (clg.status !== 202) {
    throw new Error("failed to create challenge");
  }

  const cgo = await c.GetOptions.strict().parseAsync(await clg.json());

  const ctrl = new AbortController();
  const cred = await navigator.credentials
    .get({ ...cgo, signal: ctrl.signal })
    .catch((e) => {
      console.error(e);
      ctrl.abort();
    });

  if (!cred) {
    return "no credential";
  }

  const body = JSON.stringify(c.toPublicKeyCredential(cred));
  const res = await fetch(url, { headers, method, body });

  switch (res.status) {
    case 200:
      return "success";

    case 400:
      throw new Error(await res.text());

    case 401:
      return "unauthorized";

    default:
      throw new Error("unknown status");
  }
};

export const refresh = async () => {
  const url = new URL("auth/refresh", BASE_URL);
  const method = "GET";

  const res = await fetch(url, { method });
  switch (res.status) {
    case 200:
      return "success";

    case 400:
      throw new Error(await res.text());

    case 401:
      return "unauthorized";

    default:
      throw new Error("unknown status");
  }
};

const Checked = z.object({
  refresh: z.boolean(),
  session: z.boolean(),
  status: z.boolean(),
});

export const check = async () => {
  const url = BASE_URL + "/auth/check";
  const method = "GET";

  const res = await fetch(url, { method });
  switch (res.status) {
    case 200:
      return Checked.strict().parseAsync(await res.json());

    default:
      throw new Error("unknown status");
  }
};
