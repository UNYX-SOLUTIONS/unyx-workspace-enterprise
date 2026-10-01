# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: _statusfix.spec.ts >> cambiar estado desde el dropdown actualiza la proforma
- Location: tests-e2e\_statusfix.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/estado actualizado a Cancelada/)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/estado actualizado a Cancelada/)

```

```yaml
- complementary:
  - paragraph: UNYX Solutions
  - paragraph: Admin Workspace
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "Proformas":
      - /url: /proformas
    - link "Clientes":
      - /url: /clientes
    - link "Productos":
      - /url: /productos
    - link "Mantenimientos":
      - /url: /mantenimientos
  - link "Configuración":
    - /url: /configuracion
  - link "Soporte":
    - /url: mailto:soporte@unyxsolutions.com
- banner:
  - region "Bienvenida al usuario":
    - heading "Bienvenido de vuelta, Admin" [level=2]
    - text: jue, 01 oct. Aquí tienes el resumen de tus proformas.
  - button "Notificaciones"
  - button "Menú de usuario": AU Administrador UNYX Administrador
- main:
  - heading "Historial de Proformas" [level=1]
  - paragraph: Consulta, revisa y gestiona las proformas emitidas.
  - button "+ Nueva Proforma"
  - paragraph: Total (página)
  - paragraph: $13.821,48
  - paragraph: Aceptadas
  - paragraph: "0"
  - paragraph: Borradores
  - paragraph: "1"
  - paragraph: Ticket Promedio
  - paragraph: $511,91
  - button "Exportar CSV"
  - button "Filtrar por estado": Todos los estados
  - text: Buscar proforma
  - searchbox "Buscar proforma"
  - table:
    - rowgroup:
      - row "Número Cliente Fecha Estado Total Acciones":
        - columnheader "Número":
          - button "Número"
        - columnheader "Cliente":
          - button "Cliente"
        - columnheader "Fecha":
          - button "Fecha"
        - columnheader "Estado":
          - button "Estado"
        - columnheader "Total":
          - button "Total"
        - columnheader "Acciones"
    - rowgroup:
      - 'row "#00000066 Cliente E2E 0865174169 0990865174169 30/9/2026 Cambiar estado de la proforma (actual: ENVIADA) $115,58 Descargar PDF de la proforma 00000066 Más acciones para la proforma 00000066"':
        - cell "#00000066":
          - button "#00000066"
        - cell "Cliente E2E 0865174169 0990865174169":
          - paragraph: Cliente E2E 0865174169
          - paragraph: "0990865174169"
        - cell "30/9/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$115,58"
        - cell "Descargar PDF de la proforma 00000066 Más acciones para la proforma 00000066":
          - button "Descargar PDF de la proforma 00000066": PDF
          - button "Más acciones para la proforma 00000066"
      - 'row "#00000065 Cliente E2E 0810341005 0990810341005 29/9/2026 Cambiar estado de la proforma (actual: CANCELADA) Cancelada por el cliente · reversible $115,58 Descargar PDF de la proforma 00000065 Más acciones para la proforma 00000065"':
        - cell "#00000065":
          - button "#00000065"
        - cell "Cliente E2E 0810341005 0990810341005":
          - paragraph: Cliente E2E 0810341005
          - paragraph: "0990810341005"
        - cell "29/9/2026"
        - 'cell "Cambiar estado de la proforma (actual: CANCELADA) Cancelada por el cliente · reversible"':
          - 'button "Cambiar estado de la proforma (actual: CANCELADA)"': CANCELADA
          - paragraph: Cancelada por el cliente · reversible
        - cell "$115,58"
        - cell "Descargar PDF de la proforma 00000065 Más acciones para la proforma 00000065":
          - button "Descargar PDF de la proforma 00000065": PDF
          - button "Más acciones para la proforma 00000065"
      - 'row "#00000064 Cliente E2E 0810157175 0990810157175 29/9/2026 Cambiar estado de la proforma (actual: ENVIADA) $115,58 Descargar PDF de la proforma 00000064 Más acciones para la proforma 00000064"':
        - cell "#00000064":
          - button "#00000064"
        - cell "Cliente E2E 0810157175 0990810157175":
          - paragraph: Cliente E2E 0810157175
          - paragraph: "0990810157175"
        - cell "29/9/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$115,58"
        - cell "Descargar PDF de la proforma 00000064 Más acciones para la proforma 00000064":
          - button "Descargar PDF de la proforma 00000064": PDF
          - button "Más acciones para la proforma 00000064"
      - 'row "#00000063 Cliente E2E 0810058518 0990810058518 29/9/2026 Cambiar estado de la proforma (actual: ENVIADA) $115,58 Descargar PDF de la proforma 00000063 Más acciones para la proforma 00000063"':
        - cell "#00000063":
          - button "#00000063"
        - cell "Cliente E2E 0810058518 0990810058518":
          - paragraph: Cliente E2E 0810058518
          - paragraph: "0990810058518"
        - cell "29/9/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$115,58"
        - cell "Descargar PDF de la proforma 00000063 Más acciones para la proforma 00000063":
          - button "Descargar PDF de la proforma 00000063": PDF
          - button "Más acciones para la proforma 00000063"
      - 'row "#00000062 Cliente E2E 0809857579 0990809857579 29/9/2026 Cambiar estado de la proforma (actual: ENVIADA) $115,58 Descargar PDF de la proforma 00000062 Más acciones para la proforma 00000062"':
        - cell "#00000062":
          - button "#00000062"
        - cell "Cliente E2E 0809857579 0990809857579":
          - paragraph: Cliente E2E 0809857579
          - paragraph: "0990809857579"
        - cell "29/9/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$115,58"
        - cell "Descargar PDF de la proforma 00000062 Más acciones para la proforma 00000062":
          - button "Descargar PDF de la proforma 00000062": PDF
          - button "Más acciones para la proforma 00000062"
      - 'row "#00000061 Cliente E2E 0809821316 0990809821316 29/9/2026 Cambiar estado de la proforma (actual: ENVIADA) $115,58 Descargar PDF de la proforma 00000061 Más acciones para la proforma 00000061"':
        - cell "#00000061":
          - button "#00000061"
        - cell "Cliente E2E 0809821316 0990809821316":
          - paragraph: Cliente E2E 0809821316
          - paragraph: "0990809821316"
        - cell "29/9/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$115,58"
        - cell "Descargar PDF de la proforma 00000061 Más acciones para la proforma 00000061":
          - button "Descargar PDF de la proforma 00000061": PDF
          - button "Más acciones para la proforma 00000061"
      - 'row "#00000056 IRRIGARDEN 0999999999 2/9/2026 Cambiar estado de la proforma (actual: BORRADOR) $34,50 Descargar PDF de la proforma 00000056 Más acciones para la proforma 00000056"':
        - cell "#00000056":
          - button "#00000056"
        - cell "IRRIGARDEN 0999999999":
          - paragraph: IRRIGARDEN
          - paragraph: "0999999999"
        - cell "2/9/2026"
        - 'cell "Cambiar estado de la proforma (actual: BORRADOR)"':
          - 'button "Cambiar estado de la proforma (actual: BORRADOR)"': BORRADOR
        - cell "$34,50"
        - cell "Descargar PDF de la proforma 00000056 Más acciones para la proforma 00000056":
          - button "Descargar PDF de la proforma 00000056": PDF
          - button "Más acciones para la proforma 00000056"
      - 'row "#00000055 STAMPACORP ECUADOR S.A.S. 0993394146001 27/8/2026 Cambiar estado de la proforma (actual: ENVIADA) $63,25 Descargar PDF de la proforma 00000055 Más acciones para la proforma 00000055"':
        - cell "#00000055":
          - button "#00000055"
        - cell "STAMPACORP ECUADOR S.A.S. 0993394146001":
          - paragraph: STAMPACORP ECUADOR S.A.S.
          - paragraph: "0993394146001"
        - cell "27/8/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$63,25"
        - cell "Descargar PDF de la proforma 00000055 Más acciones para la proforma 00000055":
          - button "Descargar PDF de la proforma 00000055": PDF
          - button "Más acciones para la proforma 00000055"
      - 'row "#00000054 ALTOSA 0992314842001 18/8/2026 Cambiar estado de la proforma (actual: CANCELADA) Cancelada por el cliente · reversible $2.070,00 Descargar PDF de la proforma 00000054 Más acciones para la proforma 00000054"':
        - cell "#00000054":
          - button "#00000054"
        - cell "ALTOSA 0992314842001":
          - paragraph: ALTOSA
          - paragraph: "0992314842001"
        - cell "18/8/2026"
        - 'cell "Cambiar estado de la proforma (actual: CANCELADA) Cancelada por el cliente · reversible"':
          - 'button "Cambiar estado de la proforma (actual: CANCELADA)"': CANCELADA
          - paragraph: Cancelada por el cliente · reversible
        - cell "$2.070,00"
        - cell "Descargar PDF de la proforma 00000054 Más acciones para la proforma 00000054":
          - button "Descargar PDF de la proforma 00000054": PDF
          - button "Más acciones para la proforma 00000054"
      - 'row "#00000053 SERVINCREIBLE S.A. 0992538902001 18/8/2026 Cambiar estado de la proforma (actual: ENVIADA) $4.726,50 Descargar PDF de la proforma 00000053 Más acciones para la proforma 00000053"':
        - cell "#00000053":
          - button "#00000053"
        - cell "SERVINCREIBLE S.A. 0992538902001":
          - paragraph: SERVINCREIBLE S.A.
          - paragraph: "0992538902001"
        - cell "18/8/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$4.726,50"
        - cell "Descargar PDF de la proforma 00000053 Más acciones para la proforma 00000053":
          - button "Descargar PDF de la proforma 00000053": PDF
          - button "Más acciones para la proforma 00000053"
      - 'row "#00000052 test 123456789 16/8/2026 Cambiar estado de la proforma (actual: ENVIADA) $141,45 Descargar PDF de la proforma 00000052 Más acciones para la proforma 00000052"':
        - cell "#00000052":
          - button "#00000052"
        - cell "test 123456789":
          - paragraph: test
          - paragraph: "123456789"
        - cell "16/8/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$141,45"
        - cell "Descargar PDF de la proforma 00000052 Más acciones para la proforma 00000052":
          - button "Descargar PDF de la proforma 00000052": PDF
          - button "Más acciones para la proforma 00000052"
      - 'row "#00000051 test 123456789 16/8/2026 Cambiar estado de la proforma (actual: ENVIADA) $141,45 Descargar PDF de la proforma 00000051 Más acciones para la proforma 00000051"':
        - cell "#00000051":
          - button "#00000051"
        - cell "test 123456789":
          - paragraph: test
          - paragraph: "123456789"
        - cell "16/8/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$141,45"
        - cell "Descargar PDF de la proforma 00000051 Más acciones para la proforma 00000051":
          - button "Descargar PDF de la proforma 00000051": PDF
          - button "Más acciones para la proforma 00000051"
      - 'row "#00000050 LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001 26/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $230,00 Descargar PDF de la proforma 00000050 Más acciones para la proforma 00000050"':
        - cell "#00000050":
          - button "#00000050"
        - cell "LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001":
          - paragraph: LUDEÑA & ASOCIADOS LUDASOCI C. LTDA.
          - paragraph: "0992922214001"
        - cell "26/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$230,00"
        - cell "Descargar PDF de la proforma 00000050 Más acciones para la proforma 00000050":
          - button "Descargar PDF de la proforma 00000050": PDF
          - button "Más acciones para la proforma 00000050"
      - 'row "#00000049 LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001 22/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $760,00 Descargar PDF de la proforma 00000049 Más acciones para la proforma 00000049"':
        - cell "#00000049":
          - button "#00000049"
        - cell "LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001":
          - paragraph: LUDEÑA & ASOCIADOS LUDASOCI C. LTDA.
          - paragraph: "0992922214001"
        - cell "22/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$760,00"
        - cell "Descargar PDF de la proforma 00000049 Más acciones para la proforma 00000049":
          - button "Descargar PDF de la proforma 00000049": PDF
          - button "Más acciones para la proforma 00000049"
      - 'row "#00000048 LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001 22/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $842,70 Descargar PDF de la proforma 00000048 Más acciones para la proforma 00000048"':
        - cell "#00000048":
          - button "#00000048"
        - cell "LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001":
          - paragraph: LUDEÑA & ASOCIADOS LUDASOCI C. LTDA.
          - paragraph: "0992922214001"
        - cell "22/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$842,70"
        - cell "Descargar PDF de la proforma 00000048 Más acciones para la proforma 00000048":
          - button "Descargar PDF de la proforma 00000048": PDF
          - button "Más acciones para la proforma 00000048"
      - 'row "#00000047 SERVINCREIBLE S.A. 0992538902001 21/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $230,00 Descargar PDF de la proforma 00000047 Más acciones para la proforma 00000047"':
        - cell "#00000047":
          - button "#00000047"
        - cell "SERVINCREIBLE S.A. 0992538902001":
          - paragraph: SERVINCREIBLE S.A.
          - paragraph: "0992538902001"
        - cell "21/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$230,00"
        - cell "Descargar PDF de la proforma 00000047 Más acciones para la proforma 00000047":
          - button "Descargar PDF de la proforma 00000047": PDF
          - button "Más acciones para la proforma 00000047"
      - 'row "#00000046 SERVINCREIBLE S.A. 0992538902001 19/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $655,50 Descargar PDF de la proforma 00000046 Más acciones para la proforma 00000046"':
        - cell "#00000046":
          - button "#00000046"
        - cell "SERVINCREIBLE S.A. 0992538902001":
          - paragraph: SERVINCREIBLE S.A.
          - paragraph: "0992538902001"
        - cell "19/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$655,50"
        - cell "Descargar PDF de la proforma 00000046 Más acciones para la proforma 00000046":
          - button "Descargar PDF de la proforma 00000046": PDF
          - button "Más acciones para la proforma 00000046"
      - 'row "#00000045 LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001 19/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $46,00 Descargar PDF de la proforma 00000045 Más acciones para la proforma 00000045"':
        - cell "#00000045":
          - button "#00000045"
        - cell "LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001":
          - paragraph: LUDEÑA & ASOCIADOS LUDASOCI C. LTDA.
          - paragraph: "0992922214001"
        - cell "19/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$46,00"
        - cell "Descargar PDF de la proforma 00000045 Más acciones para la proforma 00000045":
          - button "Descargar PDF de la proforma 00000045": PDF
          - button "Más acciones para la proforma 00000045"
      - 'row "#00000044 LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001 19/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $201,25 Descargar PDF de la proforma 00000044 Más acciones para la proforma 00000044"':
        - cell "#00000044":
          - button "#00000044"
        - cell "LUDEÑA & ASOCIADOS LUDASOCI C. LTDA. 0992922214001":
          - paragraph: LUDEÑA & ASOCIADOS LUDASOCI C. LTDA.
          - paragraph: "0992922214001"
        - cell "19/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$201,25"
        - cell "Descargar PDF de la proforma 00000044 Más acciones para la proforma 00000044":
          - button "Descargar PDF de la proforma 00000044": PDF
          - button "Más acciones para la proforma 00000044"
      - 'row "#00000043 LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001 13/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $1.380,00 Descargar PDF de la proforma 00000043 Más acciones para la proforma 00000043"':
        - cell "#00000043":
          - button "#00000043"
        - cell "LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001":
          - paragraph: LUXVIAJES AGENCIA DE VIAJES S.A.S.
          - paragraph: "0993380696001"
        - cell "13/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$1.380,00"
        - cell "Descargar PDF de la proforma 00000043 Más acciones para la proforma 00000043":
          - button "Descargar PDF de la proforma 00000043": PDF
          - button "Más acciones para la proforma 00000043"
      - 'row "#00000042 LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001 12/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $356,50 Descargar PDF de la proforma 00000042 Más acciones para la proforma 00000042"':
        - cell "#00000042":
          - button "#00000042"
        - cell "LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001":
          - paragraph: LUXVIAJES AGENCIA DE VIAJES S.A.S.
          - paragraph: "0993380696001"
        - cell "12/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$356,50"
        - cell "Descargar PDF de la proforma 00000042 Más acciones para la proforma 00000042":
          - button "Descargar PDF de la proforma 00000042": PDF
          - button "Más acciones para la proforma 00000042"
      - 'row "#00000041 SERVINCREIBLE S.A. 0992538902001 12/7/2026 Cambiar estado de la proforma (actual: ENVIADA) $34,50 Descargar PDF de la proforma 00000041 Más acciones para la proforma 00000041"':
        - cell "#00000041":
          - button "#00000041"
        - cell "SERVINCREIBLE S.A. 0992538902001":
          - paragraph: SERVINCREIBLE S.A.
          - paragraph: "0992538902001"
        - cell "12/7/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$34,50"
        - cell "Descargar PDF de la proforma 00000041 Más acciones para la proforma 00000041":
          - button "Descargar PDF de la proforma 00000041": PDF
          - button "Más acciones para la proforma 00000041"
      - 'row "#00000040 HSESERVICES SEGURIDAD SALUD Y AMBIENTE CIA LTDA 1792581931001 30/6/2026 Cambiar estado de la proforma (actual: ENVIADA) $40,25 Descargar PDF de la proforma 00000040 Más acciones para la proforma 00000040"':
        - cell "#00000040":
          - button "#00000040"
        - cell "HSESERVICES SEGURIDAD SALUD Y AMBIENTE CIA LTDA 1792581931001":
          - paragraph: HSESERVICES SEGURIDAD SALUD Y AMBIENTE CIA LTDA
          - paragraph: "1792581931001"
        - cell "30/6/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$40,25"
        - cell "Descargar PDF de la proforma 00000040 Más acciones para la proforma 00000040":
          - button "Descargar PDF de la proforma 00000040": PDF
          - button "Más acciones para la proforma 00000040"
      - 'row "#00000039 LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001 23/6/2026 Cambiar estado de la proforma (actual: ENVIADA) $346,15 Descargar PDF de la proforma 00000039 Más acciones para la proforma 00000039"':
        - cell "#00000039":
          - button "#00000039"
        - cell "LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001":
          - paragraph: LUXVIAJES AGENCIA DE VIAJES S.A.S.
          - paragraph: "0993380696001"
        - cell "23/6/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$346,15"
        - cell "Descargar PDF de la proforma 00000039 Más acciones para la proforma 00000039":
          - button "Descargar PDF de la proforma 00000039": PDF
          - button "Más acciones para la proforma 00000039"
      - 'row "#00000038 RESTAURANT EDDYS-BBQ S.A. 0992958219001 11/6/2026 Cambiar estado de la proforma (actual: ENVIADA) $230,00 Descargar PDF de la proforma 00000038 Más acciones para la proforma 00000038"':
        - cell "#00000038":
          - button "#00000038"
        - cell "RESTAURANT EDDYS-BBQ S.A. 0992958219001":
          - paragraph: RESTAURANT EDDYS-BBQ S.A.
          - paragraph: "0992958219001"
        - cell "11/6/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$230,00"
        - cell "Descargar PDF de la proforma 00000038 Más acciones para la proforma 00000038":
          - button "Descargar PDF de la proforma 00000038": PDF
          - button "Más acciones para la proforma 00000038"
      - 'row "#00000037 RESTAURANT EDDYS-BBQ S.A. 0992958219001 11/6/2026 Cambiar estado de la proforma (actual: ENVIADA) $230,00 Descargar PDF de la proforma 00000037 Más acciones para la proforma 00000037"':
        - cell "#00000037":
          - button "#00000037"
        - cell "RESTAURANT EDDYS-BBQ S.A. 0992958219001":
          - paragraph: RESTAURANT EDDYS-BBQ S.A.
          - paragraph: "0992958219001"
        - cell "11/6/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$230,00"
        - cell "Descargar PDF de la proforma 00000037 Más acciones para la proforma 00000037":
          - button "Descargar PDF de la proforma 00000037": PDF
          - button "Más acciones para la proforma 00000037"
      - 'row "#00000036 LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001 10/6/2026 Cambiar estado de la proforma (actual: ENVIADA) $368,00 Descargar PDF de la proforma 00000036 Más acciones para la proforma 00000036"':
        - cell "#00000036":
          - button "#00000036"
        - cell "LUXVIAJES AGENCIA DE VIAJES S.A.S. 0993380696001":
          - paragraph: LUXVIAJES AGENCIA DE VIAJES S.A.S.
          - paragraph: "0993380696001"
        - cell "10/6/2026"
        - 'cell "Cambiar estado de la proforma (actual: ENVIADA)"':
          - 'button "Cambiar estado de la proforma (actual: ENVIADA)"': ENVIADA
        - cell "$368,00"
        - cell "Descargar PDF de la proforma 00000036 Más acciones para la proforma 00000036":
          - button "Descargar PDF de la proforma 00000036": PDF
          - button "Más acciones para la proforma 00000036"
  - paragraph: Mostrando 27 de 27 proformas · Página 1 de 1
  - button "Anterior" [disabled]
  - button "Siguiente" [disabled]
  - paragraph: © 2026 UNYX Solutions S.A.S.
  - paragraph: UNYX Workspace
```

# Test source

```ts
  1  | import { expect, test } from "./fixtures";
  2  | 
  3  | test("cambiar estado desde el dropdown actualiza la proforma", async ({ page }) => {
  4  |   await page.goto("/proformas");
  5  |   await page.waitForTimeout(800);
  6  | 
  7  |   const trigger = page.getByLabel(/Cambiar estado de la proforma/).first();
  8  |   const labelBefore = await trigger.getAttribute("aria-label");
  9  | 
  10 |   await trigger.click();
  11 |   await page.getByRole("option", { name: "CANCELADA" }).click();
  12 | 
> 13 |   await expect(page.getByText(/estado actualizado a Cancelada/)).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  14 |   const labelAfter = await trigger.getAttribute("aria-label");
  15 |   expect(labelAfter).not.toBe(labelBefore);
  16 |   expect(labelAfter).toContain("CANCELADA");
  17 | 
  18 |   const original = labelBefore?.match(/actual:\s*(.+)\)$/)?.[1];
  19 |   if (original && original !== "CANCELADA") {
  20 |     await trigger.click();
  21 |     await page.getByRole("option", { name: original }).click();
  22 |     await expect(page.getByText(new RegExp(`estado actualizado a ${original}`))).toBeVisible();
  23 |   }
  24 | });
  25 | 
```