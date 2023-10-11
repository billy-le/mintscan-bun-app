import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";

// components
import { BaseHtml } from "./layouts/base-html";
import { Button } from "./ui/Button";
import { chains } from "./data/chains";

const mintscanApi = "https://apis.mintscan.io/v1/";

const app = new Elysia()
  .use(cors())
  .use(html())
  .use(staticPlugin())
  .group("/", (app) =>
    app
      .get("/", () => (
        <BaseHtml title="Mintscan Bun">
          <body class="max-w-2xl mx-auto space-y-10">
            <section class="space-y-4">
              <h1 class="text-blue-500 text-center text-3xl">Mintscan API</h1>
              <form
                class="space-y-4"
                hx-post="/"
                hx-trigger="submit"
                hx-target="#network-response"
              >
                <div class="flex gap-4">
                  <fieldset class="space-y-1.5">
                    <label class="block" for="chain">
                      Select Chain
                    </label>
                    <select
                      class="px-3 py-2 border-none rounded-md"
                      id="chain"
                      name="chain"
                    >
                      {chains.map((chain) => (
                        <option value={chain}>{chain}</option>
                      ))}
                    </select>
                  </fieldset>
                  <fieldset class="flex-grow space-y-1.5">
                    <label for="address" class="block">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      class="border border-slate-300 rounded-md py-1 px-3 w-full"
                    />
                  </fieldset>
                  <fieldset class="flex items-end">
                    <Button type="submit" text="Submit" />
                  </fieldset>
                </div>
              </form>
            </section>
            <section>
              <code id="network-response" class="lang-json block" />
            </section>
          </body>
        </BaseHtml>
      ))
      .post(
        "/",
        ({ body }) => {
          return new Response(JSON.stringify(body, null, 2));
        },
        { body: t.Object({ chain: t.String(), address: t.String() }) }
      )
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
