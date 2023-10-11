import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";

// components
import { BaseHtml } from "./layouts/base-html";
import { Button } from "./ui/Button";
import { chains } from "./data/chains";
const mintscanApi = "https://apis.mintscan.io/v1/";

const app = new Elysia()
  .use(cors())
  .use(html())
  .get("/", () => (
    <BaseHtml title="Mintscan Bun">
      <body>
        <section class="space-y-4 max-w-4xl mx-auto">
          <h1 class="text-blue-500 text-center text-3xl">Mintscan API</h1>
          <form class="space-y-4">
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
                <Button hx-post="/clicked" hx-swap="outerHTML" text="Submit" />
              </fieldset>
            </div>
          </form>
        </section>
      </body>
    </BaseHtml>
  ))
  .post("/transactions", async ({ body }) => {}, {
    body: t.Object({
      network: t.String(),
      address: t.String(),
    }),
  })
  .post("/clicked", () => "Test")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
