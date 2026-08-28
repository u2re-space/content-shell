# content-shell

Прозрачная оболочка для **content-script / CRX**: хром не перехватывает клики (`pointer-events: none` на `cw-shell-content` и shadow-chrome). Попадают только слоты view, overlay и document-level toast / context menu.

Наследует [`ImmersiveShell`](../immersive-shell/): без тулбара, но **multi-view** и windowing. Слоты: default + `overlay` (нет `underlying`).

Флаг хоста `data-content-views="hidden"` прячет routed views, пока инструмент (Snip) не поставит `"visible"`.

```ts
import { ContentShell } from "content-shell";
```

```bash
cd modules/shells/content-shell
npm run ssl:localhost
npm run dev
npm run dev:8434
```
