---
"@mmanto/devbout-ui": minor
---

La superficie por defecto de alta, edición y detalle pasa de `drawer` a `page`
(pantalla completa). Aplica cuando no hay preferencia guardada en
`EntityViewProvider` (`localStorage: entity-view-mode`) ni un `view` explícito en
la tabla o en la acción; esas dos siguen teniendo prioridad. Para conservar el
drawer por defecto, fijá `TableDTO.view` o `create`/`edit`/`detail.view` en
`"drawer"`. Los navegadores que ya tengan una preferencia guardada no cambian.
