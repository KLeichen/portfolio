---
title: Ausencias en clínicas veterinarias
summary: Un grupo de cuatro clínicas perdía 1 de cada 5 turnos por ausencias. Encontré qué las causa, armé un modelo para priorizar llamadas y comparé políticas de seña.
lang: es
page: northgate-ausencias
date: 2026-10-08
cover: /projects/northgate/drivers-es.png
tools: [Python, pandas, scikit-learn, matplotlib, Jupyter]
embed: /projects/northgate/planner.html
simulated: true
highlights:
  - { value: "18,5%", label: "de los turnos terminaban en ausencia" }
  - { value: "48%", label: "de las ausencias alcanzadas con 40 llamadas (vs 27% al azar)" }
  - { value: "20–29k", label: "por año recuperables con seña + llamadas" }
---

## El problema
Northgate, un grupo de cuatro clínicas veterinarias, sentía que muchos clientes no venían a sus turnos. Con 40 llamadas de confirmación por semana y la opción de pedir seña, querían saber a quién llamar y cuándo cobrarla.

## Qué hice
- **Auditoría y limpieza** de 13.680 turnos, mascotas y dueños, con un registro de cada corrección.
- **Análisis exploratorio:** la clínica casi no importa; sí importan la anticipación del turno, la seña, el historial del dueño y la distancia.
- **Modelo predictivo:** regresión logística validada en el tiempo (entrenada con meses anteriores, evaluada en los 6 siguientes), sin filtrar información del futuro.
- **Simulación de políticas:** comparé llamadas, distintas reglas de seña y combinaciones, con supuestos explícitos y un escenario conservador.

![Qué explica las ausencias](/projects/northgate/drivers-es.png)
*Tasa de ausencias según cada factor. La línea punteada es el promedio (18,5%).*

## Resultado
Recomendé combinar las dos palancas: **seña en controles y peluquería** (nunca en consultas por enfermedad) y **las 40 llamadas ordenadas por el modelo**. Eso evita unas 6 a 10 ausencias por semana. Descarté una regla de seña por puntaje de riesgo porque castigaba a quienes viven lejos.

También dejé una herramienta interactiva para que el equipo pruebe las políticas (botón de arriba).
