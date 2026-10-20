---
title: Demanda y horneado en una panadería
summary: Una panadería de tres locales tiraba 1 de cada 4 productos y aun así se quedaba sin stock. Armé un pronóstico diario por local y producto y lo convertí en un plan de horneado que equilibra desperdicio y ventas perdidas.
lang: es
page: panaderia-demanda
date: 2026-10-15
cover: /projects/larkspur/weekday-es.png
tools: [Python, pandas, scikit-learn, SciPy, Jupyter]
simulated: true
highlights:
  - { value: "21%", label: "de error diario del pronóstico (vs 32% de la regla actual)" }
  - { value: "+6,9%", label: "de ganancia en la prueba de 2 semanas" }
  - { value: "1 de 4", label: "productos horneados terminaba descartado" }
---

## El problema
Larkspur Bakehouse tiene tres locales: Centro, Universidad y Puerto. Cada mañana se decide cuánto hornear de cada producto con una regla simple: lo vendido el mismo día de la semana anterior, más un poco. A la noche, o sobraba comida o el producto se había agotado horas antes del cierre. Querían un pronóstico confiable y una cantidad para hornear que maximice la ganancia.

## Qué hice
- **Limpieza** de casi 26.600 registros diarios de caja: códigos de producto distintos en un local, duplicados, dos semanas perdidas por un cambio de sistema, pedidos de catering mezclados con la venta al público, días cerrados, un producto renombrado y datos de clima en °F.
- **Demanda oculta:** cuando un producto se agota, la caja solo muestra lo que se horneó. Estimé la demanda real con un modelo de demanda censurada, que trata esos días como "la demanda fue al menos esto".
- **Pronóstico a 14 días** por local, producto y día, con calendario universitario, temporada de cruceros, feriados, clima y promociones. Lo validé en 13 ventanas pasadas contra la regla actual.
- **Plan de horneado:** para cada producto, hornear por encima del pronóstico según su margen (un faltante cuesta el margen y un sobrante cuesta el ingrediente), con más colchón en los días de promoción y festival.

![Demanda por día de la semana en cada local](/projects/larkspur/weekday-es.png)
*Demanda diaria estimada por día de la semana, últimos 12 meses. Cada local tiene su propio ritmo.*

## Resultado
El desperdicio costaba **€77k por año** y los faltantes, entre **€34k y €53k** de margen perdido. En la prueba real de dos semanas, con la Semana del Croissant y el festival del puerto en el medio, el plan ganó un **6,9% más** que la regla actual y desperdició un 20% menos. A los encargados les dejé una regla práctica por producto: cuánto hornear por encima del pronóstico.

![Pérdidas por local](/projects/larkspur/losses-es.png)
