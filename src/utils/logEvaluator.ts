import type { InspectionTemplate, FieldAlert, AlertSeverity, TemplateField } from '../types/domain';

export interface EvaluationResult {
  values: Record<string, any>;
  alerts: FieldAlert[];
  hasAlerts: boolean;
}

/**
 * Evalúa el estado de alerta individual para un campo numérico
 */
export function getFieldStatus(field: TemplateField, rawValue: any): AlertSeverity {
  if (rawValue === undefined || rawValue === null || rawValue === '' || isNaN(Number(rawValue))) {
    return 'normal';
  }

  const val = Number(rawValue);

  // Límites críticos
  if (field.minCritical !== undefined && val < field.minCritical) return 'critical';
  if (field.maxCritical !== undefined && val > field.maxCritical) return 'critical';

  // Límites de advertencia / fuera de rango normal
  if (field.minNormal !== undefined && val < field.minNormal) return 'warning';
  if (field.maxNormal !== undefined && val > field.maxNormal) return 'warning';

  return 'normal';
}

/**
 * Motor central de cálculo en tiempo real para bitácoras industriales (F-25)
 */
export function evaluateLogValues(
  rawValues: Record<string, any>,
  template: InspectionTemplate
): EvaluationResult {
  const values: Record<string, any> = { ...rawValues };
  const alerts: FieldAlert[] = [];

  // 1. RECORRER CAMPOS Y RESOLVER FÓRMULAS AUTOMÁTICAS
  for (const section of template.sections) {
    for (const field of section.fields) {
      if (field.isCalculated && field.calculation) {
        const { operation, sourceFieldA, sourceFieldB } = field.calculation;
        const valA = parseFloat(values[sourceFieldA]);
        const valB = parseFloat(values[sourceFieldB]);

        if (!isNaN(valA) && !isNaN(valB)) {
          let result = 0;
          if (operation === 'subtract') {
            result = valA - valB;
          } else if (operation === 'add') {
            result = valA + valB;
          } else if (operation === 'average') {
            result = (valA + valB) / 2;
          }
          values[field.id] = Number(result.toFixed(1));
        }
      }
    }
  }

  // 2. EVALUAR ALERTAS Y REGLAS INDUSTRIALES ESPECÍFICAS DEL FORMATO F-25
  for (const section of template.sections) {
    for (const field of section.fields) {
      const val = values[field.id];
      if (val === undefined || val === null || val === '') continue;

      const numVal = Number(val);
      if (isNaN(numVal)) continue;

      // REGLA 1: Caída de presión del filtro de agua (ΔP > 10 PSI)
      if (field.id === 'delta_p_filtro' && numVal > 10.0) {
        alerts.push({
          fieldId: field.id,
          fieldLabel: field.label,
          value: numVal,
          severity: numVal > 15.0 ? 'critical' : 'warning',
          message: `ΔP Filtro Agua (${numVal} PSI) > 10 PSI máx. Requiere limpieza de filtro 'Y'.`,
        });
        continue;
      }

      // REGLA 2: Desbalance de voltaje (> 2.0%)
      if (field.id === 'desbalance_voltaje' && numVal > 2.0) {
        alerts.push({
          fieldId: field.id,
          fieldLabel: field.label,
          value: numVal,
          severity: 'warning',
          message: `Desbalance de voltaje (${numVal}%) > 2.0%. Revisar acometida eléctrica.`,
        });
        continue;
      }

      // REGLA 3: Salto térmico del agua helada (ΔT óptimo 8 - 12 °F)
      if (field.id === 'delta_t_agua') {
        if (numVal < 8.0) {
          alerts.push({
            fieldId: field.id,
            fieldLabel: field.label,
            value: numVal,
            severity: 'warning',
            message: `ΔT Agua (${numVal} °F) inferior al óptimo (8 - 12 °F). Posible caudal excesivo o bajo salto.`,
          });
          continue;
        } else if (numVal > 12.0) {
          alerts.push({
            fieldId: field.id,
            fieldLabel: field.label,
            value: numVal,
            severity: 'warning',
            message: `ΔT Agua (${numVal} °F) superior al óptimo (8 - 12 °F). Revisar caudal de bombas primarias.`,
          });
          continue;
        }
      }

      // REGLA GENÉRICA POR RANGOS DE PLANTILLA
      const severity = getFieldStatus(field, numVal);
      if (severity !== 'normal') {
        alerts.push({
          fieldId: field.id,
          fieldLabel: field.label,
          value: numVal,
          severity,
          message: `${field.label} (${numVal} ${field.unit || ''}) fuera de especificación técnica.`,
        });
      }
    }
  }

  return {
    values,
    alerts,
    hasAlerts: alerts.length > 0,
  };
}

