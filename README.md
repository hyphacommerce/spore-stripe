# Stripe for Hypha

Card payments for a [Hypha](https://github.com/hyphacommerce/hypha) store, as a **spore**:
a Rust crate compiled into the store's API. It's also the worked example of a spore built
outside Hypha's repository; read it beside Hypha's guide, `docs/spores/README.md`.

What it adds:

- the payment provider `spore_stripe`: a cart's payment started before its order
  (a PaymentIntent), captured, voided and refunded from the admin;
- Stripe's webhook, `POST /spores/stripe/webhook`, which completes a checkout the shopper
  never came back to and records refunds made in Stripe;
- the admin's `order.payment` block;
- the storefront's `<stripe-payment>` element, served at
  `GET /spores/stripe/elements/payment.js` (`element/payment-element.ts`, bundled into the
  `.js` beside it).

## Using it

In a deployment: `hypha spores add stripe`, then `hypha deploy`. The deploy pins it to this
repository's head, clones it, and builds the API with it. Then in the admin, under Apps →
Stripe, enter the secret and publishable keys and the webhook secret, and point a Stripe
webhook at `<API>/spores/stripe/webhook`.

Settings in `hypha.config.toml`, for the operator: `[spores.stripe] api_base` (Stripe's
API by default; the tests point it at a fake).

## Developing

It depends on Hypha through git (`Cargo.toml`); `Cargo.lock` pins the commit, and
`cargo update -p hypha-spore` moves it. While Hypha's repository is private, Cargo fetches
it with your git credentials (`.cargo/config.toml`).

```bash
cargo test                                       # unit, provider and route tests
cargo build --lib --target wasm32-unknown-unknown  # spores run on Workers too
pnpm install && pnpm build                       # after changing the element
```

The route tests (`tests/routes.rs`) run a host built with the spore against a fake
Stripe, on Postgres: start Hypha's compose services (`docker compose up -d` in a Hypha
checkout) for `postgres-test` at `HYPHA_TEST_DATABASE_URL`.

To run Hypha with your working copy of the spore, keep this checkout beside Hypha's
(`../spore-stripe` from it) and start Hypha with `HYPHA_SPORES=stripe pnpm dev`.

To try a change to Hypha itself before it's pushed, point the git dependency at your
checkout for a while, without committing it:

```toml
# .cargo/config.toml
[patch."https://github.com/hyphacommerce/hypha"]
hypha-spore = { path = "../hypha/crates/hypha-spore" }
hypha-host-axum = { path = "../hypha/crates/hypha-host-axum" }
hypha-http = { path = "../hypha/crates/hypha-http" }
```

## License

MIT or Apache-2.0, at your option.
