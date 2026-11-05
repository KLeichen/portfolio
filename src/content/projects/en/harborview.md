---
title: Maintenance request triage with NLP
summary: A property manager with 18 buildings read 700 requests a month by hand, and 4 in 10 emergencies landed in the normal queue. I trained a text model, in English and Spanish, that decides the trade and whether to page on-call the moment a request arrives.
lang: en
page: triage-mantenimiento
date: 2026-10-29
cover: /projects/harborview/cover-en.png
tools: [Python, pandas, scikit-learn, TF-IDF, regex, Jupyter, JavaScript]
embed: /projects/harborview/triage.html?lang=en
embedHeight: 960
caseStudy: /projects/harborview/case.html?lang=en
simulated: true
highlights:
  - { value: "95.5%", label: "trades right on 1,400 hand-checked requests (the portal dropdown: 45%)" }
  - { value: "32 / 32", label: "real emergencies caught in the new batch (intake: 18)" }
  - { value: "15 h → 1 h", label: "median wait for the emergencies intake used to miss" }
---

## The problem
Harborview Residential manages 18 rental buildings. Tenants request repairs through a portal, an app, email and phone, in English and Spanish, and everything lands in one queue. Two people read each request to decide which trade it needs and whether it is an emergency. At 700 requests a month, **4 in 10 emergencies ended up in the normal queue** and waited until the next morning. The portal dropdown didn't help: it gave the right trade in fewer than half the cases.

## What I did
- **Cleaned** 15,271 requests and 14,805 work orders: times in UTC and local time, buildings written as street address or name, six ways of writing a unit, 516 resubmitted requests and 18 spellings of 8 vendors.
- **NLP step by step:** I turned each request into numbers with TF-IDF over words, word pairs and 3–5 letter pieces (for typos and the front desk's shorthand notes), and trained a logistic regression on the work orders. It beats the labels it was trained on: 95.5% against 92.9%.
- **Emergencies:** I turned the client's emergency list into rules in English and Spanish and combined them with a text model. The threshold puts not missing any first: a false page is dismissed in a minute, a ceiling leaking all night costs thousands.
- **Operations:** I measured how long emergencies wait and compared vendors with a natural experiment (difference in differences).

![Why the model picks a trade: each word's contribution](/projects/harborview/nlp-en.png)
*The model is explainable: every word adds to or subtracts from each trade.*

## Result
On the new batch of 334 requests, the client confirmed **330 trades right and all 32 real emergencies caught**. The analysis also found a "cheaper" plumber that takes 28 hours longer and gets called back 1 time in 3, a failing boiler in a 1962 building and a pest outbreak climbing floor by floor in another.

![Hours to dispatch an emergency](/projects/harborview/wait-en.png)
*Emergencies intake missed (orange) waited a median of 15 hours.*

Below you can try the model on the 334 new requests or write your own. It runs entirely in the browser, with the same weights as in Python. The full case study explains every NLP step with interactive examples.
