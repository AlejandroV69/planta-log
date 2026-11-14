import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Equipment, LogEntry } from '../types/domain';
import { SEED_EQUIPMENTS } from '../mocks/seedData';

export async function exportF25ToExcel(
  logs: LogEntry[],
  equipments: Equipment[] = SEED_EQUIPMENTS
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PlantaLog Industrial Suite';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Bitácora Operación F-25', {
    views: [{ state: 'frozen', xSplit: 4, ySplit: 6 }],
  });

  // Título principal
  sheet.mergeCells('A1:Z1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'BITÁCORA DE OPERACIÓN Y MANTENIMIENTO — CHILLER YORK ENFRIADO POR AIRE (350 TR) [°F]';
  titleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F243E' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 24;

  // Subtítulo
  sheet.mergeCells('A2:Z2');
  const subCell = sheet.getCell('A2');
  subCell.value =
    'Formato F-25 | Registro diario por turno en grados Fahrenheit (°F) | Incluye diferenciales automáticos y validación de tolerancias';
  subCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FFD9E1F2' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  sheet.getRow(2).height = 18;

  // Ficha técnica resumida (Fila 4)
  sheet.getCell('A4').value = 'Planta / Área:';
  sheet.getCell('B4').value = 'Cuarto de Máquinas / Azotea Central';
  sheet.getCell('E4').value = 'Diseño Dif. Agua (°F):';
  sheet.getCell('F4').value = '8.0 - 12.0 °F (Nominal 10 °F)';
  sheet.getCell('I4').value = 'Dif. Filtro Máx (PSI):';
  sheet.getCell('J4').value = '10.0 PSI';
  sheet.getCell('M4').value = 'Voltaje Nominal:';
  sheet.getCell('N4').value = '460 V (Desbalance < 2%)';
  sheet.getRow(4).font = { name: 'Calibri', size: 9, bold: true };

  // Encabezados de columnas (Fila 6)
  const headers = [
    'Fecha',
    'Hora',
    'Turno',
    'Equipo',
    'Estado',
    'Setpoint (°F)',
    'EWT Entrada (°F)',
    'LWT Salida (°F)',
    'Dif. Agua (°F)',
    'Temp. Amb (°F)',
    '% Carga',
    'C1 Succión (PSI)',
    'C1 Descarga (PSI)',
    'C1 Sobrecal. (°F)',
    'C1 Aceite',
    'C2 Succión (PSI)',
    'C2 Descarga (PSI)',
    'C2 Sobrecal. (°F)',
    'C2 Aceite',
    'Voltaje L-L (V)',
    'Desbalance (%)',
    'Amperaje Total (A)',
    'P. Entrada (PSI)',
    'P. Salida (PSI)',
    'Dif. Filtro (PSI)',
    'Ventiladores',
    'Operador',
    'Observaciones / Novedades',
  ];

  const headerRow = sheet.getRow(6);
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      right: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    };
  });
  headerRow.height = 26;

  // Filas de datos
  logs.forEach((log, index) => {
    const eq = equipments.find((e) => e.id === log.equipmentId);
    const v = log.values || {};
    const row = sheet.getRow(7 + index);

    const rowValues = [
      log.date,
      v.hora ?? '--',
      v.turno ?? log.shift,
      eq ? eq.tag : log.equipmentId,
      v.estado_equipo ?? 'ON',
      v.setpoint_agua ?? '--',
      v.ewt_temp ?? '--',
      v.lwt_temp ?? '--',
      v.delta_t_agua ?? '--',
      v.temp_ambiente ?? '--',
      v.carga_porcentaje !== undefined ? `${v.carga_porcentaje}%` : '--',
      v.c1_pres_succion ?? '--',
      v.c1_pres_descarga ?? '--',
      v.c1_sobrecalent ?? '--',
      v.c1_nivel_aceite ?? '--',
      v.c2_pres_succion ?? '--',
      v.c2_pres_descarga ?? '--',
      v.c2_sobrecalent ?? '--',
      v.c2_nivel_aceite ?? '--',
      v.voltaje_prom ?? '--',
      v.desbalance_voltaje !== undefined ? `${v.desbalance_voltaje}%` : '--',
      v.amperaje_total ?? '--',
      v.pres_agua_entrada ?? '--',
      v.pres_agua_salida ?? '--',
      v.delta_p_filtro ?? '--',
      v.ventiladores_cond ?? '--',
      log.technicianName,
      v.alarmas_observaciones || log.observations || '',
    ];

    rowValues.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val as string | number;
      cell.font = { name: 'Calibri', size: 9 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIdx >= 26 ? 'left' : 'center',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };

      // Resaltar diferenciales calculados
      if (colIdx === 8 || colIdx === 24) {
        cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF0F4C81' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      }
    });
    row.height = 19;
  });

  // Ajustar anchos
  sheet.columns.forEach((col, i) => {
    col.width = i >= 26 ? 34 : 13;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const dateStamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `F-25_Bitacora_Chiller_${dateStamp}.xlsx`);
}

