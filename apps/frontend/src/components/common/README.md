# Componentes comunes

Ubicación recomendada:

```text
apps/frontend/src/components/common/
```

Puedes importar cada componente directamente:

```jsx
import InputField from "../../../components/common/InputField";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
```

También puedes usar el archivo `index.js`:

```jsx
import {
  InputField,
  LoadingSpinner,
} from "../../../components/common";
```

Si configuras el alias `@` en Vite:

```jsx
import {
  InputField,
  LoadingSpinner,
} from "@/components/common";
```
