---
title: Vet clinic no-shows
summary: A group of four clinics was losing 1 in 5 appointments to no-shows. I found what drives them, built a model to prioritise reminder calls and compared deposit policies.
lang: en
page: northgate-ausencias
date: 2026-10-08
cover: /projects/northgate/drivers-en.png
tools: [Python, pandas, scikit-learn, matplotlib, Jupyter]
embed: /projects/northgate/planner.html
simulated: true
highlights:
  - { value: "18.5%", label: "of bookings ended as no-shows" }
  - { value: "48%", label: "of no-shows reached with 40 calls (vs 27% at random)" }
  - { value: "20–29k", label: "a year recoverable with deposits + calls" }
---

## The problem
Northgate, a group of four vet clinics, felt that too many owners were missing appointments. With 40 confirmation calls a week and the option to ask for a deposit, they wanted to know whom to call and when to charge.

## What I did
- **Audited and cleaned** 13,680 bookings plus pet and owner records, logging every fix.
- **Exploratory analysis:** the clinic barely matters; lead time, deposits, the owner's history and distance do.
- **Predictive model:** logistic regression validated over time (trained on earlier months, tested on the next 6), with no leakage from the future.
- **Policy simulation:** compared calls, several deposit rules and combinations, with explicit assumptions and a conservative scenario.

![What drives no-shows](/projects/northgate/drivers-en.png)
*No-show rate by each factor. The dashed line is the average (18.5%).*

## Result
I recommended using both levers: **a deposit on follow-up and grooming visits** (never on illness consults) and **the 40 calls ranked by the model**. That prevents about 6 to 10 no-shows a week. I ruled out a risk-score deposit rule because it penalised owners who live far away.

I also left an interactive tool so the team can try out the policies (button above).
