---
title: Signup A/B test for a meal-kit subscription
summary: A weekly meal-kit company tested a shorter signup with 50% off the first box. It brought 25% more signups, but once I fixed the test and followed customers for 8 weeks, it made 10% less money per visitor.
lang: en
page: test-ab-registro
date: 2026-10-22
cover: /projects/tidewater/money-en.png
tools: [Python, pandas, SciPy, Jupyter]
embed: /projects/tidewater/readout.html?lang=en
simulated: true
highlights:
  - { value: "+25%", label: "more signups with the new flow (likely range +19% to +30%)" }
  - { value: "−10%", label: "money per visitor over the first 8 weeks" }
  - { value: "−$670k", label: "a year if rolled out to everyone, instead of the dashboard's \"+35%\"" }
---

## The problem
Tidewater Kitchen Co. sells weekly boxes of recipes and ingredients. For four weeks it tested a new signup flow: 2 screens instead of 4, and **50% off** the first box instead of **$20 off**. After one week the marketing dashboard showed 35% more signups and marketing wanted to roll it out. Finance suspected the discount brought in people who cancel straight away. The question: can the test be trusted, what really happened, and should they ship it?

## What I did
- **Checked the test was fair.** The 50/50 split was broken (p < 0.000001). I traced it to an Android app release that, for six days, stopped logging visits to the new flow. I left that Android week out of both groups equally, and the split went back to 49.8% / 50.2%.
- **Cleaned and joined three sources** (≈194,000 visits, 6,400 signups, 51,000 orders): group names from two SDK versions, app IDs in another format, app times in local time and web times in UTC, QA accounts on production, old billing IDs and unusual corporate orders.
- **Measured what matters:** beyond the signup rate, I followed every subscriber for 8 weeks (boxes, retention, discounts, refunds) and compared **money per visitor who saw the page**, not per subscriber.
- **Cut it by channel** with confidence intervals and a heterogeneity test, so small groups don't get over-read.

![Android visitors per day](/projects/tidewater/android-en.png)
*The week app 6.14.0 stopped logging the new flow. People still saw it and signed up, so it inflated the new flow's results.*

## Result
The new flow **does bring more signups: +25%**, not +35% (the dashboard read a single week and included test accounts). But the half-price box costs more than those extra signups bring in, and those customers cancel sooner: 54% are still subscribed at week 8, against 60%. Overall the new flow makes **$5.07 per visitor against $5.63** (−10%, likely range −$0.91 to −$0.21). Rolled out to 1.2 million visitors a year, that's about 17,000 more signups but **about $670,000 less**.

My recommendation was **not to ship it as is**. The test changed two things at once, so the next test should separate the short flow from the big discount (for example, 2 screens + $20 off) and avoid 50% off on paid social, where the most people leave after the first box. Below you can explore the result and design the next version with the calculator.
