---
title: Test A/B del registro de una suscripción de comida
summary: Una empresa de cajas de comida semanales probó un registro más corto con 50% off en la primera caja. Traía 25% más registros, pero al revisar el test y seguir a los clientes 8 semanas, resultó que ganaba 10% menos plata por visitante.
lang: es
page: test-ab-registro
date: 2026-10-22
cover: /projects/tidewater/money-es.png
tools: [Python, pandas, SciPy, Jupyter]
embed: /projects/tidewater/readout.html
simulated: true
highlights:
  - { value: "+25%", label: "de registros con el flujo nuevo (rango probable +19% a +30%)" }
  - { value: "−10%", label: "de ganancia por visitante en las primeras 8 semanas" }
  - { value: "−$670k", label: "al año si se lanzaba a todos, en vez del \"+35%\" que mostraba el tablero" }
---

## El problema
Tidewater Kitchen Co. vende cajas semanales con recetas e ingredientes. Durante cuatro semanas probó un registro nuevo: 2 pantallas en vez de 4 y **50% off** en la primera caja en vez de **$20 off**. Después de una semana, el tablero de marketing mostraba 35% más registros y querían lanzarlo a todos. Finanzas sospechaba que el descuento atraía gente que cancelaba enseguida. La pregunta: ¿el test es confiable, qué pasó realmente y conviene lanzarlo?

## Qué hice
- **Revisé que el test fuera justo.** El reparto 50/50 estaba roto (p < 0,000001). Lo rastreé hasta una versión de la app de Android que, durante seis días, dejó de registrar las visitas al flujo nuevo. Saqué esa semana de Android de los dos grupos por igual y el reparto volvió a 49,8% / 50,2%.
- **Limpié y uní tres fuentes** (≈194.000 visitas, 6.400 registros, 51.000 pedidos): nombres de grupo de dos versiones del SDK, IDs de la app en otro formato, horarios de la app en hora local y de la web en UTC, cuentas de QA en producción, IDs viejos de facturación y pedidos corporativos fuera de lo normal.
- **Medí lo que importa:** además de la tasa de registro, seguí a cada suscripto 8 semanas (cajas, retención, descuentos, reembolsos) y comparé la **ganancia por visitante que vio la página**, no por suscripto.
- **Corté por canal** con rangos de confianza y una prueba de heterogeneidad, para no sobreleer grupos chicos.

![Visitantes de Android por día](/projects/tidewater/android-es.png)
*La semana en que la app 6.14.0 dejó de registrar el flujo nuevo. La gente lo seguía viendo y registrándose, así que inflaba sus resultados.*

## Resultado
El flujo nuevo **sí trae más registros: +25%**, no +35% (el tablero miraba una sola semana e incluía cuentas de prueba). Pero la caja a mitad de precio cuesta más de lo que suman esos registros extra, y esos clientes cancelan antes: 54% sigue suscripto en la semana 8, contra 60%. En total, el flujo nuevo gana **$5,07 por visitante contra $5,63** (−10%, rango probable −$0,91 a −$0,21). Lanzado a 1,2 millones de visitantes al año, serían unos 17.000 registros más pero **unos $670.000 menos**.

Mi recomendación fue **no lanzarlo así**. El test cambió dos cosas a la vez, así que el próximo test debería separar el registro corto del descuento grande (por ejemplo, 2 pantallas + $20 off) y evitar el 50% off en redes sociales pagas, donde más gente se va tras la primera caja. Abajo podés explorar el resultado y armar la próxima versión con la calculadora.
