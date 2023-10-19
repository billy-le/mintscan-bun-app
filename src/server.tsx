import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import {
  endOfDay,
  format as formatDate,
  isAfter,
  parseISO,
  startOfDay,
} from "date-fns";

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
            <section class="overflow-hidden h-96">
              <code
                id="network-response"
                class="lang-json block h-full overflow-y-auto"
                style="word-break:break-word;"
              />
            </section>
          </body>
        </BaseHtml>
      ))
      .post(
        "/",
        async ({ body }) => {
          try {
            const url = new URL(
              `${mintscanApi}/${body.chain}/accounts/${body.address}/transactions`
            );

            let fromDateTime, toDateTime;

            if (body.from) {
              fromDateTime = startOfDay(parseISO(body.from));
              url.searchParams.set(
                "fromDateTime",
                formatDate(fromDateTime, "yyyy-MM-dd")
              );
            }

            if (body.to) {
              toDateTime = endOfDay(parseISO(body.to));
              url.searchParams.set(
                "toDateTime",
                formatDate(toDateTime, "yyyy-MM-dd")
              );
            }

            if (
              fromDateTime &&
              toDateTime &&
              isAfter(fromDateTime, toDateTime)
            ) {
              const res = new Response(
                '{"error": "From Date cannot be after To Date"}',
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                }
              );

              return res;
            }

            let transactions: any[] = [];

            async function getData(url: URL) {
              const data = await fetch(url, {
                method: "get",
                headers: {
                  Authorization: `Bearer ${process.env.MINTSCAN_API_KEY}`,
                  accept: "application/json",
                },
              }).then((res) => {
                if (res.ok) {
                  return res.json();
                }
                return { transactions: [], pagination: {} };
              });

              if (data.transactions.length) {
                transactions.push(...data.transactions);
              }

              if (data.pagination.searchAfter) {
                url.searchParams.set(
                  "searchAfter",
                  data.pagination.searchAfter
                );

                await getData(url);
              }
            }

            await getData(url);

            return JSON.stringify(transactions, null, 2);
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
