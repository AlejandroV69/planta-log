<div align="center">

# PlantaLog

**Control operativo y bitácoras digitales F-25 para cuartos de máquinas y chillers.**

![React](https://img.shields.io/badge/React-19-0284C7?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-0F172A?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_PostgreSQL-10B981?style=flat-square&logo=supabase&logoColor=white)

</div>

---

## ¿Qué hace?

- **Multi-empresa con roles:** Acceso por compañía (`operator`, `supervisor`, `admin`) con aislamiento real mediante RLS en Supabase.
- **Dashboard en vivo:** Salto térmico promedio (°F), diferencial máximo de filtro (PSI), equipos activos, filtro por máquina y vista por turno (*Mañana*, *Tarde*, *Noche*).
- **Toma de rondas F-25:** Wizard guiado en 6 pasos con diales en tiempo real, cálculo automático de diferenciales y detección de alertas fuera de rango.
- **Gestión de equipos (CRUD):** Alta, edición, búsqueda y estado operativo de chillers, bombas y manejadoras.
- **Historial y Excel:** Bitácoras filtrables y exportación directa a `.xlsx` con el formato oficial F-25.
- **Modo Día / Noche + Mobile-First:** Interfaz adaptable a escritorio y teléfono con perfil móvil integrado.

---

## Puesta en marcha

1. **Instala dependencias:**
   ```bash
   npm install
   ```

2. **Configura Supabase:**
   - Ejecuta [`supabase/schema.sql`](supabase/schema.sql) en el **SQL Editor** de tu proyecto.
   - Copia `.env.example` como `.env` y agrega tus credenciales:
     ```env
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu_anon_public_key
     ```

3. **Arranca la app:**
   ```bash
   npm run dev
   ```

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run lint     # Revisión con ESLint
npm run preview  # Vista previa del build
```
