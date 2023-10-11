import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { format as formatDate, parseISO } from "date-fns";

// components
import { BaseHtml } from "./layouts/base-html";
import { Button } from "./ui/Button";
import { chains } from "./data/chains";

const mintscanApi = "https://apis.mintscan.io/v1";

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
                      class="px-3 py-1.5 border border-slate-300 rounded-md bg-transparent"
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
                </div>
                <div class="flex gap-4">
                  <fieldset class="space-y-1.5 space-x-2">
                    <label for="fromDate">From</label>
                    <input
                      type="date"
                      id="fromDate"
                      name="from"
                      class="border border-slate-300 px-3 py-1 rounded-md"
                    />
                  </fieldset>
                  <fieldset class="space-y-1.5 space-x-2">
                    <label for="toDate">To</label>
                    <input
                      type="date"
                      id="toDate"
                      name="to"
                      class="border border-slate-300 px-3 py-1 rounded-md"
                    />
                  </fieldset>
                  <fieldset class="flex-grow flex items-end justify-end">
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
          try {
            const url = new URL(
              `${mintscanApi}/${body.chain}/accounts/${body.address}/transactions`
            );

            if (body.from) {
              url.searchParams.set(
                "fromDateTime",
                formatDate(parseISO(body.from), "yyyy-MM-dd")
              );
            }

            if (body.to) {
              url.searchParams.set(
                "toDateTime",
                formatDate(parseISO(body.to), "yyyy-MM-dd")
              );
            }

            const data = fetch(url, {
              method: "get",
              headers: {
                Authorization: `Bearer ${process.env.MINTSCAN_API_KEY}`,
                "Content-Type": "application/json",
              },
            }).then((data) => data.json());

            return data;
          } catch (err) {
            console.log(err);
            return { error: "There was an error" };
          }
        },
        {
          body: t.Object({
            chain: t.String(),
            address: t.String(),
            from: t.Optional(t.String()),
            to: t.Optional(t.String()),
          }),
        }
      )
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
