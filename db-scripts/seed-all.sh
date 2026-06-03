#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TalentOS — Script maestro de datos de prueba
# Ejecuta los seeds en las 3 bases de datos
# Uso: bash db-scripts/seed-all.sh
# ═══════════════════════════════════════════════════════════════

echo "╔════════════════════════════════════════╗"
echo "║   TalentOS — Cargando datos de prueba  ║"
echo "╚════════════════════════════════════════╝"

# ── AUTH DB ─────────────────────────────────────────────────────
echo ""
echo "▶ Cargando usuarios en auth-db..."
docker exec -i talentos-auth-db psql -U postgres -d talentos_auth < db-scripts/seed-auth.sql
if [ $? -eq 0 ]; then
  echo "✅ auth-db — OK"
else
  echo "❌ auth-db — Error"
fi

# ── PAYROLL DB ───────────────────────────────────────────────────
echo ""
echo "▶ Cargando nómina y afiliaciones en payroll-db..."
docker exec -i talentos-payroll-db mysql -u payroll_user -p"${PAYROLL_DB_PASSWORD:-talentos123}" talentos_payroll < db-scripts/seed-payroll.sql
if [ $? -eq 0 ]; then
  echo "✅ payroll-db — OK"
else
  echo "❌ payroll-db — Error"
fi

# ── TRAINING DB ──────────────────────────────────────────────────
echo ""
echo "▶ Cargando capacitaciones y evaluaciones en training-db..."
docker exec -i talentos-training-db psql -U postgres -d talentos_training < db-scripts/seed-training.sql
if [ $? -eq 0 ]; then
  echo "✅ training-db — OK"
else
  echo "❌ training-db — Error"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         Datos cargados                 ║"
echo "╠════════════════════════════════════════╣"
echo "║  Usuarios creados:                     ║"
echo "║  admin@talentos.com   → ADMIN_RRHH     ║"
echo "║  gerente@talentos.com → GERENTE        ║"
echo "║  contador@talentos.com → CONTADOR      ║"
echo "║  lider.ops@talentos.com → LIDER        ║"
echo "║  ana.rodriguez@talentos.com → EMPLEADO ║"
echo "║  + 10 empleados más                    ║"
echo "║                                        ║"
echo "║  Password de todos: Talentos2025!      ║"
echo "║                                        ║"
echo "║  Datos generados:                      ║"
echo "║  • 15 usuarios del sistema             ║"
echo "║  • 40 afiliaciones SS                  ║"
echo "║  • 15 períodos de nómina               ║"
echo "║  • 6 planillas PILA                    ║"
echo "║  • 10 planes de inducción              ║"
echo "║  • 10 capacitaciones                   ║"
echo "║  • 12 evaluaciones de desempeño        ║"
echo "║  • 5 compromisos de mejora             ║"
echo "╚════════════════════════════════════════╝"
