

export enum InvoiceType {
  BOLETA = '03',
  FACTURA = '01',
  NOTA_CREDITO = '07',
  NOTA_VENTA = '80'
}

export enum IgvType {
  GRAVADO = '10',
  EXONERADO = '20',
  INAFECTO = '30',
}

export enum UnitCode {
  NIU = 'NIU',
  ZZ = 'ZZ',
  KGM = 'KGM',
  LTR = 'LTR',
  BX = 'BX',
  GLL = 'GLL',
}

export enum PaymentMethod {
  CONTADO = 'Contado',
  CREDITO = 'Credito'
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  sunatCode: string;
  description?: string;
  isActive: boolean;
  icon?: string;
  color?: string;
}

export const SUNAT_PAYMENT_CODES = [
  { code: '001', label: 'Depósito en cuenta' },
  { code: '002', label: 'Giro' },
  { code: '003', label: 'Transferencia de fondos' },
  { code: '004', label: 'Orden de pago' },
  { code: '005', label: 'Tarjeta de débito' },
  { code: '006', label: 'Tarjeta de crédito' },
  { code: '008', label: 'Efectivo (Sin obligación medios pago)' },
  { code: '009', label: 'Efectivo (General)' },
  { code: '999', label: 'Otros medios de pago' }
];

export enum IdentityDocumentType {
  SIN_DOCUMENTO = '0',
  DNI = '1',
  CARNET_EXTRANJERIA = '4',
  RUC = '6',
  PASAPORTE = '7',
}

export type OrderStatus = 'PENDING' | 'WASHING' | 'DRYING' | 'READY' | 'IN_ROUTE_DELIVERY' | 'DELIVERED';

export interface CashClosing {
  id: string;
  cajero: string;
  caja: string;
  turno: string;
  fechaApertura: string;
  fechaCierre: string;
  openingBalance: number;
  cashSales: number;
  otherSales: Record<string, number>;
  expenses: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  transactions: any[];
}

export interface RecipeItem {
  supplyId: string;
  name: string;
  quantity: number;
  cost: number;
  unit: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  estimatedTime?: string;
}

export interface Coupon {
  id: string;
  code: string;
  amount: number;
  expirationDate: string;
  conditions?: string;
  isUsed: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  igvType: IgvType;
  unitCode: UnitCode;
  cost?: number;
  recipe?: RecipeItem[];
  trackStock?: boolean;
  processingTime?: string;
  pointsPrice?: number;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  provider: string;
  providerPhone: string;
  rating: number;
  isRecommended: boolean;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
  details?: string;
  images?: string[];
  audioNote?: string;
  itemDeliveryDate?: string;
  status?: OrderStatus;
}

export interface Client {
  id?: string;
  docType: 'DNI' | 'RUC' | '-';
  docNumber: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  birthday?: string;
  gender?: 'Masculino' | 'Femenino' | 'Otro';
  alertMessage?: string;
  alertColor?: 'red' | 'orange' | 'green' | 'blue';
  points?: number;
  latitude?: number;
  longitude?: number;
}

export type PermissionMap = Record<string, boolean>;

export interface PermissionDefinition {
  id: string;
  label: string;
  group: 'PRINCIPAL' | 'LOGISTICA' | 'MARKETING' | 'GESTION' | 'ADMIN' | 'DEV';
  description?: string;
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  { id: 'view:dashboard', label: 'Dashboard', group: 'PRINCIPAL', description: 'Vista general de estadísticas' },
  { id: 'view:pos', label: 'Punto de Venta', group: 'PRINCIPAL', description: 'Módulo para registrar nuevas ventas' },
  { id: 'view:orders', label: 'Mis Órdenes', group: 'PRINCIPAL', description: 'Listado y seguimiento de pedidos' },
  { id: 'view:operations', label: 'Operaciones (Lavado)', group: 'PRINCIPAL', description: 'Gestión de flujo de lavado/secado' },
  { id: 'view:cash_closing', label: 'Cierre de Caja', group: 'PRINCIPAL', description: 'Arqueo de caja y cierres de turno' },
  { id: 'view:history', label: 'Documentos Elec.', group: 'PRINCIPAL', description: 'Historial de ventas y facturas SUNAT' },
  { id: 'view:machines', label: 'Mis Máquinas', group: 'LOGISTICA', description: 'Administración de lavadoras y secadoras' },
  { id: 'view:callcenter', label: 'Call Center', group: 'LOGISTICA', description: 'Recepción de pedidos telefónicos' },
  { id: 'view:delivery', label: 'Delivery (Chofer)', group: 'LOGISTICA', description: 'Gestión de rutas de recojo/entrega' },
  { id: 'view:supplies', label: 'Insumos', group: 'LOGISTICA', description: 'Control de stock de detergentes y químicos' },
  { id: 'view:purchases', label: 'Compras', group: 'LOGISTICA', description: 'Registro de facturas de proveedores' },
  { id: 'view:loyalty', label: 'Fidelización', group: 'MARKETING', description: 'Gestión de cupones y puntos' },
  { id: 'view:wa_campaign', label: 'Campaña WhatsApp', group: 'MARKETING', description: 'Envío masivo de promociones' },
  { id: 'view:inventory', label: 'Servicios/Precios', group: 'GESTION', description: 'Catálogo de productos y servicios' },
  { id: 'view:package_inventory', label: 'Inv. Paquetes', group: 'GESTION', description: 'Auditoría de paquetes en almacén' },
  { id: 'view:clients', label: 'Módulo Clientes', group: 'GESTION', description: 'Cartera de clientes y base de datos' },
  { id: 'view:employees', label: 'Empleados', group: 'GESTION', description: 'Gestión de personal y permisos' },
  { id: 'view:expenses', label: 'Gastos', group: 'GESTION', description: 'Registro de egresos operativos' },
  { id: 'view:categories', label: 'Categorías', group: 'ADMIN', description: 'Gestión de categorías de servicios' },
  { id: 'view:payment_methods', label: 'Tipos de Pago', group: 'ADMIN', description: 'Configurar Yape, Plin, Tarjetas, etc.' },
  { id: 'view:settings', label: 'Configuración', group: 'ADMIN', description: 'Ajustes globales y APIs del sistema' },
  { id: 'view:dev_config', label: 'Config. Programador', group: 'DEV', description: 'Carga masiva de datos (Solo Dueño)' },
];

export interface Company {
  id: string;
  companyId: string;
  ruc: string;
  razonSocial: string;
  address: string;
  ubigeo: string;
  solUser: string;
  solPass: string;
  logoUrl?: string;
  apiToken?: string;
  whatsappInstance?: string;
  whatsappToken?: string;
  whatsappInstanceName?: string;
  whatsappLogoUrl?: string;
  serieFactura: string;
  serieBoleta: string;
  serieNcFactura?: string;
  serieNcBoleta?: string;
  serieNotaVenta: string;
  certPath?: string;
  certPassword?: string;
  sunatEnvironment?: 'BETA' | 'PRODUCTION';
  sunatUrl?: string;
  currencySymbol?: string;
  pointsEquivalency?: number;
  msgPickup?: string;
  msgDelivery?: string;
  msgReady?: string;
  msgInvoice?: string;
  msgCollected?: string;
  ticketPolicies?: string;
  ticketLogoUrl?: string;
  ticketLogoWidth?: number;
  printAnnouncements?: boolean;
  businessHours?: string;
  promoImageUrl?: string;
  promoImageWidth?: number;
  orderCurrentNumber?: number;
  orderCurrentSuffix?: string;
  orderMaxNumber?: number;
  useOrderSuffix?: boolean;
  orderZerosCount?: number;
  orderFontSize?: number;
  orderSuffixPosition?: 'BEFORE' | 'AFTER';
}

export interface PausedSale {
  id: string;
  client: Client | null;
  cart: CartItem[];
  docType: InvoiceType;
  date: string;
}

export interface GlobalCategoryImage {
  url: string;
  name: string;
}

export interface GlobalPaymentImage {
  url: string;
  name: string;
}

export interface GlobalColor {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface GlobalHelpVideo {
  title: string;
  url: string;
  category: string;
}

export interface SaasGlobalConfig {
  apiToken: string;
  whatsappIconUrl: string;
  defaultCategoryImages: GlobalCategoryImage[];
  defaultPaymentImages: GlobalPaymentImage[];
  defaultColors: GlobalColor[];
  defaultHelpVideos: GlobalHelpVideo[];
}

export interface SaasCompany {
  id: string;
  ruc: string;
  name: string;
  logoUrl?: string;
  ownerName?: string;
  phone?: string;
  paymentPlan?: string;
  nextPaymentDate?: string;
  lastPaymentDate?: string;
  paymentStatus?: 'PAID' | 'PENDING' | 'OVERDUE';
  isActive: boolean;
  createdAt: string;
}

export interface SaasBranch {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  config: Company;
  createdAt: string;
}

export interface SunatResponse {
  success: boolean;
  cdrZip?: string;
  description: string;
  xmlSigned: string;
  ticket?: string;
  hash?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  cdrUrl?: string;
}

export interface InvoiceTotals {
  gravada: number;
  exonerada: number;
  inafecta: number;
  igv: number;
  total: number;
}

export interface RelatedDocument {
  serie: string;
  correlativo: number;
  type: InvoiceType;
  motiveCode: string;
  motiveDescription: string;
}

export interface Invoice {
  id: string;
  serie: string;
  correlativo: number;
  ordenNumber: string;
  type: InvoiceType;
  client: Client;
  paymentMethod: string;
  items: CartItem[];
  totals: InvoiceTotals;
  date: string;
  deliveryDate?: string;
  ticketNumber?: string;
  qrCodeData: string;
  sunatStatus?: 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'INTERNAL';
  sunatResponse?: SunatResponse;
  relatedDocument?: RelatedDocument;
  orderStatus?: OrderStatus;
  origin?: 'STORE' | 'DELIVERY';
  notes?: string;
  prePaymentAmount?: number;
  pointsEarned?: number;
  pointsSpent?: number;
  pickupId?: string; // ID del recojo de origen para tracking
  // Fix: Added missing proofImages property to Invoice interface
  proofImages?: string[];
}

export interface TenantConfig {
  id: string;
  name: string;
  isActive: boolean;
  contractDate: string;
  primaryColor: string;
  secondaryColor?: string;
  logoUrl?: string;
  supabaseUrl: string;
  supabaseKey: string;
  enableElectronicBilling: boolean;
  enableWhatsApp: boolean;
  modules?: PermissionMap;
  isOnline: boolean;
  adminMessage?: string;
  contactPhone?: string;
  monthlyFee?: number;
  lastPaymentDate?: string;
}

export interface Supply {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  lastCost: number;
  averageCost?: number;
  color?: string;
}

export interface StockMovement {
  id: string;
  supplyId: string;
  supplyName: string;
  type: 'COMPRA' | 'CONSUMO_LAVADO' | 'CONSUMO_AJUSTE';
  quantity: number;
  cost: number;
  date: string;
}

export interface PurchaseItem {
  supplyId: string;
  name: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplier: string;
  documentNumber?: string;
  items: PurchaseItem[];
  totalAmount: number;
}

export enum EmployeeRole {
  CAJA = 'CAJA',
  OPERARIO = 'OPERARIO',
  DELIVERY = 'DELIVERY',
  PLANTA = 'PLANTA',
  ADMINISTRADOR = 'ADMINISTRADOR',
  CONTADOR = 'CONTADOR'
}

export interface Employee {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: EmployeeRole;
  phone?: string;
  photoUrl?: string;
  isActive: boolean;
  permissions?: PermissionMap;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  paymentMethod: string;
}

export type PickupStatus = 'PENDING' | 'IN_ROUTE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PickupRequest {
  id: string;
  clientName: string;
  address: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  scheduledDate: string;
  timeRange: string;
  notes?: string;
  priority: 'NORMAL' | 'ALTA';
  status: PickupStatus;
  driverId?: string;
  failedReason?: string;
  proofImages?: string[];
  createdAt: string;
  completedAt?: string;
  inRouteAt?: string; // Fecha de inicio de ruta
}

// Fix: Exporting missing types for Machines and Campaigns
export interface Machine {
  id: string;
  name: string;
  type: 'LAVADORA' | 'SECADORA';
  status: 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
  capacityKg: number;
  imageUrl: string;
  totalOrders: number;
  totalKg: number;
  totalMinutes: number;
  maintenanceIntervalHours?: number;
  maintenanceIntervalKg?: number;
  currentOrderId?: string | null;
  startTime?: string | null;
  estimatedDuration?: number | null;
}

export interface MachineImage {
  id: string;
  name: string;
  url: string;
  type: 'LAVADORA' | 'SECADORA';
}

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}

export interface CampaignTemplate {
  text: string;
}

export enum CampaignStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

export interface CampaignMetrics {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}
