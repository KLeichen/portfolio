---
title: Bakery demand and bake planning
summary: A three-shop bakery threw away 1 in 4 items and still sold out. I built a daily forecast per shop and product and turned it into a bake plan that balances waste against missed sales.
lang: en
page: panaderia-demanda
date: 2026-10-15
cover: /projects/larkspur/weekday-en.png
tools: [Python, pandas, scikit-learn, SciPy, Jupyter]
simulated: true
highlights:
  - { value: "21%", label: "daily forecast error (vs 32% for the current rule)" }
  - { value: "+6.9%", label: "profit in the 2-week live test" }
  - { value: "1 in 4", label: "baked items ended up thrown away" }
---

## The problem
Larkspur Bakehouse has three shops: Downtown, University and Harbor. Every morning the bakers decided how much of each item to make with a simple rule: what sold on the same weekday last week, plus a bit. By evening they had either leftovers or items that had sold out hours before closing. They wanted a reliable forecast and a bake quantity that makes the most money.

## What I did
- **Cleaned** about 26,600 daily till records: product codes written differently in one shop, duplicates, two weeks lost to a till change, catering orders mixed with walk-in sales, closed days, a renamed product and weather data in °F.
- **Hidden demand:** when an item sells out, the till only shows what was baked. I estimated real demand with a censored-demand model, which treats those days as "demand was at least this much".
- **A 14-day forecast** per shop, product and day, using the university calendar, cruise season, public holidays, weather and promotions. I validated it on 13 past windows against the current rule.
- **Bake plan:** for each product, bake above the forecast in line with its margin (a sell-out costs the margin, a leftover costs the ingredients), with extra cushion on promotion and festival days.

![Demand by weekday in each shop](/projects/larkspur/weekday-en.png)
*Estimated daily demand by weekday over the last 12 months. Each shop has its own rhythm.*

## Result
Waste cost **€77k a year** and sell-outs **€34k to €53k** in lost margin. In the live two-week test, which included Croissant Week and the Harbor Festival, the plan made **6.9% more profit** than the current rule and wasted 20% less. I left the shop managers a practical rule per product: how far above the forecast to bake.

![Losses by shop](/projects/larkspur/losses-en.png)
