export type Shift = 'mañana' | 'tarde' | 'noche';
export type AlertSeverity = 'normal' | 'warning' | 'critical';
export type FieldInputType = 'number' | 'text' | 'boolean' | 'select';
export type UserRoles = 'operator'|'supervisor'|'admin';


export interface FieldCalculation {
    operation: 'subtract' | 'add' | 'average';
    sourceFieldA: string;
    sourceFieldB: string;
}

export interface TemplateField {
    id: string;
    label: string;
    unit?: string;
    type: FieldInputType;
    required?: boolean;
    placeholder?: string;
    step?: number;

    minNormal?: number;
    maxNormal?: number;
    minCritical?: number;
    maxCritical?: number;

    isCalculated?: boolean;
    calculation?: FieldCalculation;

    options?: string[];
}

export interface TemplateSection {
    id: string;
    title: string;
    description?: string;
    iconName?: string;
    fields: TemplateField[];
}

export interface InspectionTemplate {
    id: string;
    code: string;
    name: string;
    category: 'chiller' | 'bomba' | 'torre' | 'subestacion' | 'general';
    version: number;
    sections: TemplateSection[];
    createdAt?: string;
}

export interface Equipment {
    id: string;
    tag: string;
    name: string;
    model: string;
    serialNumber?: string;
    capacity?: string;
    refrigerant?: string;
    location: string;
    templateId: string;
    status: 'operational' | 'maintenance' | 'out_of_service';
}

export interface FieldAlert {
    fieldId: string;
    fieldLabel: string;
    value: number;
    severity: AlertSeverity;
    message: string;
}

export interface LogEntry {
    id: string;
    equipmentId: string;
    templateId: string;
    date: string;
    shift: Shift;
    technicianName: string;
    technicianId?: string;

    values: Record<string, number | string | boolean>;

    alerts: FieldAlert[];
    hasAlerts: boolean;

    observations?: string;
    createdAt: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    roles: UserRoles;
    badgeNumber?: string;
    assignedArea?:string;
    defaultShift?:Shift;
}