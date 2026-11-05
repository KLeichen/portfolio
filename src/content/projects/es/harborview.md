---
title: Triage de pedidos de mantenimiento con NLP
summary: Una administradora de 18 edificios leía a mano 700 pedidos por mes y 4 de cada 10 emergencias quedaban en la cola normal. Entrené un modelo de texto, en inglés y español, que decide el oficio y si hay que avisar a guardia en el momento en que llega el pedido.
lang: es
page: triage-mantenimiento
date: 2026-10-29
cover: /projects/harborview/cover-es.png
tools: [Python, pandas, scikit-learn, TF-IDF, regex, Jupyter, JavaScript]
embed: /projects/harborview/triage.html
embedHeight: 960
caseStudy: /projects/harborview/case.html
simulated: true
highlights:
  - { value: "95,5%", label: "de oficios correctos en 1.400 pedidos revisados a mano (el menú del portal: 45%)" }
  - { value: "32 / 32", label: "emergencias reales detectadas en el lote nuevo (recepción: 18)" }
  - { value: "15 h → 1 h", label: "espera mediana de las emergencias que recepción no marcaba" }
---

## El problema
Harborview Residential administra 18 edificios de alquiler. Los inquilinos piden arreglos por portal, app, email y teléfono, en inglés y en español, y todo cae en una sola cola. Dos personas leían cada pedido para decidir qué oficio necesita y si es una emergencia. Con 700 pedidos por mes, **4 de cada 10 emergencias quedaban en la cola normal** y esperaban hasta la mañana siguiente. El menú del portal no ayudaba: daba el oficio correcto en menos de la mitad de los casos.

## Qué hice
- **Limpieza** de 15.271 pedidos y 14.805 órdenes de trabajo: horas en UTC y en hora local, edificios escritos como dirección o como nombre, seis formas de escribir un departamento, 516 pedidos reenviados y 18 formas de escribir 8 proveedores.
- **NLP paso a paso:** convertí cada pedido en números con TF-IDF de palabras, pares de palabras y fragmentos de 3 a 5 letras (para los errores de tipeo y las notas abreviadas de la recepción), y entrené una regresión logística con las órdenes de trabajo. Le gana a las etiquetas con las que se entrenó: 95,5% contra 92,9%.
- **Emergencias:** pasé la lista de emergencias de la clienta a reglas en inglés y español, y las combiné con un modelo de texto. El umbral prioriza no perder ninguna: un aviso falso se descarta en un minuto, un techo goteando toda la noche cuesta miles.
- **Operaciones:** medí cuánto esperan las emergencias y comparé proveedores con un experimento natural (diferencia en diferencias).

![Por qué el modelo elige un oficio: aporte de cada palabra](/projects/harborview/nlp-es.png)
*El modelo es explicable: cada palabra suma o resta hacia cada oficio.*

## Resultado
En el lote nuevo de 334 pedidos, la clienta confirmó **330 oficios correctos y las 32 emergencias reales detectadas**. El análisis encontró además un plomero "más barato" que tarda 28 horas más y vuelve 1 de cada 3 veces, una caldera fallando en un edificio de 1962 y una plaga que sube piso por piso en otro.

![Horas hasta despachar una emergencia](/projects/harborview/wait-es.png)
*Las emergencias que recepción no marcaba (naranja) esperaban una mediana de 15 horas.*

Más abajo podés probar el modelo con los 334 pedidos nuevos o escribir uno propio. Corre entero en el navegador, con los mismos pesos que en Python. El caso completo explica cada paso del NLP con ejemplos interactivos.
