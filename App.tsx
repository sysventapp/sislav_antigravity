import React, { useState, useEffect, useCallback } from 'react';
import {
    Company, Product, Client, Invoice, CartItem, InvoiceType,
    TenantConfig, Employee, PickupRequest, OrderStatus, Supply, Purchase, Expense, Category, Machine,
    Coupon, SYSTEM_PERMISSIONS, PermissionMap, PaymentMethodConfig, SaasBranch, SaasGlobalConfig, PausedSale
} from './types';
import {
    dbSaveCompany, dbGetEmployees, dbGetMachineImages,
    dbGetPickupRequests, dbGetCoupons, dbGetProducts, dbGetInvoices,
    dbCreateClient, dbCreateInvoice, dbSaveProduct, dbUpdateInvoiceStatus,
    dbAddPaymentToInvoice, dbCheckConnection,
    dbGetExpenses, dbCreateExpense,
    dbGetSupplies, dbCreateSupply,
    dbGetMovements, dbCreatePurchase, dbGetPurchases,
    dbGetCategories, dbCreateCategory, dbUpdateCategory,
    dbGetPaymentMethods, dbCreatePaymentMethod, dbUpdatePaymentMethod,
    dbGetMachines, dbCreateMachine, dbUpdateMachineStatus, dbUpdateInvoiceItemStatus,
    dbUpdatePickupRequestStatus,
    dbGetClients,
    dbUpdateProduct,
    dbDeleteProduct,
    dbConsumeSupplies,
    dbDeleteInvoice,
    setDbBranchContext,
    dbGetCompany,
    dbGetPausedSales,
    dbSavePausedSale,
    dbDeletePausedSale,
    dbCreateEmployee
} from './services/databaseService';
import { initTenantClient } from './services/supabaseClient';
import { updateTenantConfig, getSaasGlobalConfig } from './services/saasService';
import { sendBillToSunat } from './services/sunatService';

// View Components
import Layout from './components/Layout';
import TenantSelector from './components/TenantSelector';
import SaaSLogin from './views/SaaSLogin';
import Dashboard from './views/Dashboard';
import PointOfSale from './views/PointOfSale';
import MyOrders from './views/MyOrders';
import Operations from './views/Operations';
import Machines from './views/Machines';
import CallCenter from './views/CallCenter';
import Delivery from './views/Delivery';
import Supplies from './views/Supplies';
import Purchases from './views/Purchases';
import Inventory from './views/Inventory';
import PackageInventory from './views/PackageInventory';
import SalesHistory from './views/SalesHistory';
import Clients from './views/Clients';
import Loyalty from './views/Loyalty';
import BonusPoints from './views/BonusPoints';
import WaCampaign from './views/WaCampaign';
import Employees from './views/Employees';
import Expenses from './views/Expenses';
import Categories from './views/Categories';
import PaymentMethodsView from './views/PaymentMethods';
import Settings from './views/Settings';
import CashClosing from './views/CashClosing';
import DevConfig from './views/DevConfig';
import { SuperAdmin } from './views/SuperAdmin';
import Tracking from './views/Tracking';

// Modals
import InventoryModal from './components/InventoryModal';
import ClientModal from './components/ClientModal';
import InvoiceReceipt from './components/InvoiceReceipt';
import SupplyModal from './components/SupplyModal';
import PurchaseModal from './components/PurchaseModal';
import SuccessModal from './components/SuccessModal';

// Utils
import { calculateTotals } from './utils/calculations';

const DEFAULT_COMPANY_CONFIG: Company = {
    id: 'default',
    companyId: 'default-co',
    ruc: '20600000001',
    razonSocial: 'LAVANDERÍA DEMO S.A.C.',
    address: 'Av. Principal 123, Lima',
    ubigeo: '150101',
    solUser: 'MODDATOS',
    solPass: 'moddatos',
    apiToken: '',
    serieFactura: 'F001',
    serieBoleta: 'B001',
    serieNotaVenta: 'NV01',
    sunatEnvironment: 'BETA',
    sunatUrl: 'https://apisu.sysventa.com/API_SUNAT/post.php',
    orderCurrentNumber: 1,
    orderCurrentSuffix: 'A',
    orderMaxNumber: 10000,
    useOrderSuffix: false,
    orderZerosCount: 7,
    orderFontSize: 32,
    orderSuffixPosition: 'AFTER',
    currencySymbol: 'S/',
    pointsEquivalency: 10
};

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
    { id: '1', name: 'Efectivo', sunatCode: '009', isActive: true, color: '#16a34a', icon: 'banknote' },
    { id: '2', name: 'Yape', sunatCode: '009', isActive: true, color: '#a855f7', icon: 'smartphone' },
    { id: '3', name: 'Plin', sunatCode: '009', isActive: true, color: '#0ea5e9', icon: 'smartphone' },
    { id: '4', name: 'Visa', sunatCode: '006', isActive: true, color: '#2563eb', icon: 'credit-card' }
];

export default function App() {
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const [isSaaSAuthenticated, setIsSaaSAuthenticated] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const [currentTenant, setCurrentTenant] = useState<TenantConfig | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [globalConfig, setGlobalConfig] = useState<SaasGlobalConfig | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [view, setView] = useState('DASHBOARD');
    const [company, setCompany] = useState<Company>(DEFAULT_COMPANY_CONFIG);
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [pausedSales, setPausedSales] = useState<PausedSale[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(DEFAULT_PAYMENT_METHODS);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);

    // Modals visibility
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);
    const [isHistoryCopy, setIsHistoryCopy] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [pendingPickup, setPendingPickup] = useState<PickupRequest | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    const effectiveApiToken = company.apiToken || globalConfig?.apiToken || '';

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tId = params.get('tracking');
        if (tId) setTrackingId(tId);
        loadGlobal();
    }, []);

    const loadGlobal = async () => {
        const cfg = await getSaasGlobalConfig();
        setGlobalConfig(cfg);
    };

    useEffect(() => {
        if (currentTenant) {
            setDbBranchContext(currentTenant.id);
            initTenantClient(currentTenant);
            const root = document.documentElement;
            root.style.setProperty('--primary-color', currentTenant.primaryColor || '#0054A6');
            root.style.setProperty('--secondary-color', currentTenant.secondaryColor || '#10B981');
            loadData(currentTenant);
        }
    }, [currentTenant]);

    const loadData = async (tenant: TenantConfig) => {
        const branchConfig = await dbGetCompany({
            ...DEFAULT_COMPANY_CONFIG,
            id: tenant.id,
            razonSocial: tenant.name,
            logoUrl: tenant.logoUrl
        });
        setCompany(branchConfig);

        const [
            dbClients, dbProds, dbInvs, dbEmps,
            dbExp, dbSupp, dbPurch, dbCats, dbPayMethods, dbMachines, dbPaused
        ] = await Promise.all([
            dbGetClients(), dbGetProducts(), dbGetInvoices(), dbGetEmployees(),
            dbGetExpenses(), dbGetSupplies(), dbGetPurchases(), dbGetCategories(),
            dbGetPaymentMethods(), dbGetMachines(), dbGetPausedSales()
        ]);

        setClients(dbClients); setProducts(dbProds); setInvoices(dbInvs); setEmployees(dbEmps);
        setExpenses(dbExp); setSupplies(dbSupp); setPurchases(dbPurch); setCategories(dbCats);
        setMachines(dbMachines); setPausedSales(dbPaused);
        if (dbPayMethods.length > 0) setPaymentMethods(dbPayMethods);
        if (dbEmps.length > 0 && !currentUser) {
            setCurrentUser(dbEmps.find(e => e.role === 'ADMINISTRADOR') || dbEmps[0]);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && !!item.pointsPrice === !!product.pointsPrice);
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && !!item.pointsPrice === !!product.pointsPrice) ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const updateCartItemDetails = (id: string, details: string, images?: string[], audioNote?: string, itemDeliveryDate?: string) => {
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, details, images, audioNote, itemDeliveryDate } : item
        ));
    };

    const handleCheckout = async (docType: InvoiceType, client: Client, paymentMethodStr: string, deliveryDate?: string, notes?: string, prePaymentAmount?: number) => {
        let serieStr = docType === InvoiceType.FACTURA ? company.serieFactura : (docType === InvoiceType.NOTA_VENTA ? company.serieNotaVenta : company.serieBoleta);
        const fiscalCorrelativo = invoices.filter(i => i.serie === serieStr).length + 1;
        const nextOrderNumber = String(company.orderCurrentNumber).padStart(company.orderZerosCount || 7, '0');
        const totals = calculateTotals(cart);

        const newInvoice: Invoice = {
            id: Date.now().toString(),
            serie: serieStr,
            correlativo: fiscalCorrelativo,
            ordenNumber: nextOrderNumber,
            type: docType,
            client,
            paymentMethod: paymentMethodStr,
            items: cart.map(it => ({ ...it, status: 'PENDING' })),
            totals,
            date: new Date().toISOString(),
            deliveryDate,
            notes,
            prePaymentAmount,
            qrCodeData: 'DEMO-QR',
            sunatStatus: 'INTERNAL',
            orderStatus: 'PENDING',
            pickupId: pendingPickup?.id
        };

        if (pendingPickup) await dbUpdatePickupRequestStatus(pendingPickup.id, 'COMPLETED');
        await dbCreateInvoice(newInvoice);

        // Actualizar correlativo de orden de la empresa
        const nextOrderCounter = (company.orderCurrentNumber || 1) + 1;
        await dbSaveCompany({ ...company, orderCurrentNumber: nextOrderCounter });

        setCart([]); setPendingPickup(null);
        setSelectedReceipt(newInvoice);
        loadData(currentTenant!);
    };

    const hasPermission = (permissionId: string) => isOwner || (currentUser?.permissions?.[permissionId] !== false);

    const handleSaaSLogin = (role: 'SUPERADMIN' | 'USER') => {
        setIsSaaSAuthenticated(true);
        if (role === 'SUPERADMIN') {
            setIsSuperAdmin(true);
            setIsOwner(true);
        }
    };

    const handleLogout = () => {
        setIsSaaSAuthenticated(false);
        setIsSuperAdmin(false);
        setIsOwner(false);
        setCurrentTenant(null);
    };

    // --- RENDER MODES ---
    if (trackingId) return <Tracking id={trackingId} />;

    // 1. Primer Filtro: Login SaaS
    if (!isSaaSAuthenticated) return <SaaSLogin onLogin={handleSaaSLogin} />;

    // 2. Segundo Filtro: SuperAdmin Dashboard
    if (isSuperAdmin && !currentTenant) {
        return <SuperAdmin
            onSelectTenant={(t) => { setCurrentTenant(t); setIsOwner(true); }}
            onLogout={handleLogout}
        />;
    }

    // 3. Tercer Filtro: Selección de Tenant (solo si no es SuperAdmin o si SuperAdmin quiere cambiar)
    if (!currentTenant) {
        return <TenantSelector
            onSelect={(t) => { setCurrentTenant(t); setIsOwner(false); }}
            onSuperAdminLogin={() => setIsSuperAdmin(true)}
        />;
    }

    // 4. Render Principal: Sistema Operativo
    return (
        <Layout currentView={view} setView={setView} company={company} onLogout={handleLogout} clients={clients} helpVideos={globalConfig?.defaultHelpVideos || []} isOwner={isOwner}>

            {/* VISTAS PRINCIPALES */}
            {view === 'DASHBOARD' && hasPermission('view:dashboard') && (
                <Dashboard invoices={invoices} products={products} clients={clients} company={company} onNavigateToPos={() => setView('POS')} />
            )}

            {view === 'POS' && hasPermission('view:pos') && (
                <PointOfSale
                    products={products} clients={clients} cart={cart} categories={categories}
                    addToCart={addToCart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} updateDetails={updateCartItemDetails}
                    onCheckout={handleCheckout}
                    onAddClient={async c => { const s = await dbCreateClient(c); loadData(currentTenant); return s; }}
                    onOpenInventoryModal={() => setIsInventoryModalOpen(true)}
                    paymentMethods={paymentMethods} initialPickupRequest={pendingPickup} onClearPickupRequest={() => setPendingPickup(null)}
                    isEditing={!!editingInvoice} onUpdateOrder={async () => { }}
                    onCancelEdit={() => { setCart([]); setEditingInvoice(null); setView('ORDERS'); }}
                    apiToken={effectiveApiToken} globalColors={globalConfig?.defaultColors} company={company}
                    pausedSales={pausedSales}
                    onPauseSale={async s => { await dbSavePausedSale(s); setPausedSales(await dbGetPausedSales()); setCart([]); }}
                    onResumeSale={s => { setCart(s.cart); dbDeletePausedSale(s.id).then(async () => setPausedSales(await dbGetPausedSales())); }}
                    onDeletePausedSale={async id => { await dbDeletePausedSale(id); setPausedSales(await dbGetPausedSales()); }}
                />
            )}

            {view === 'ORDERS' && hasPermission('view:orders') && (
                <MyOrders
                    invoices={invoices} company={company} clients={clients}
                    onUpdateStatus={async (id, status) => { await dbUpdateInvoiceStatus(id, status); loadData(currentTenant); }}
                    onEditOrder={inv => { setEditingInvoice(inv); setCart(inv.items); setView('POS'); }}
                    onAddPayment={async (id, amt, meth) => { await dbAddPaymentToInvoice(id, amt, meth); loadData(currentTenant); }}
                    onUpdateItemStatus={(ord, items, st) => { dbUpdateInvoiceItemStatus(items, st); loadData(currentTenant); }}
                    onConvertInvoice={async () => { }}
                    onAddClient={async c => { const s = await dbCreateClient(c); loadData(currentTenant); return s; }}
                    paymentMethods={paymentMethods} globalColors={globalConfig?.defaultColors}
                />
            )}

            {view === 'OPERATIONS' && hasPermission('view:operations') && (
                <Operations
                    invoices={invoices} machines={machines}
                    onUpdateItemStatus={(ord, items, st, mach, dur) => {
                        dbUpdateInvoiceItemStatus(items, st);
                        if (mach) dbUpdateMachineStatus(mach, { status: 'BUSY', currentOrderId: ord, startTime: new Date().toISOString(), estimatedDuration: dur });
                        loadData(currentTenant);
                    }}
                />
            )}

            {view === 'CASH_CLOSING' && hasPermission('view:cash_closing') && (
                <CashClosing invoices={invoices} expenses={expenses} currentUser={currentUser} company={company} />
            )}

            {view === 'HISTORY' && hasPermission('view:history') && (
                <SalesHistory
                    invoices={invoices} company={company}
                    onViewReceipt={setSelectedReceipt}
                    onDeleteInvoice={async (inv) => { await dbDeleteInvoice(inv.id); loadData(currentTenant); }}
                    onVoidInvoice={async (inv, reason) => { /* Lógica de anulación con NC */ }}
                />
            )}

            {/* VISTAS LOGÍSTICA */}
            {view === 'MACHINES' && hasPermission('view:machines') && (
                <Machines
                    machines={machines} invoices={invoices}
                    onAddMachine={async m => { await dbCreateMachine(m); loadData(currentTenant); }}
                    onUpdateMachineStatus={async (id, updates) => { await dbUpdateMachineStatus(id, updates); loadData(currentTenant); }}
                />
            )}

            {view === 'CALL_CENTER' && hasPermission('view:callcenter') && (
                <CallCenter apiToken={effectiveApiToken} company={company} onRefreshData={() => loadData(currentTenant)} clients={clients} />
            )}

            {view === 'DELIVERY' && hasPermission('view:delivery') && (
                <Delivery onConvertToOrder={p => { setPendingPickup(p); setView('POS'); }} company={company} />
            )}

            {view === 'SUPPLIES' && hasPermission('view:supplies') && (
                <Supplies supplies={supplies} company={company} onOpenModal={() => setIsSupplyModalOpen(true)} />
            )}

            {view === 'PURCHASES' && hasPermission('view:purchases') && (
                <Purchases purchases={purchases} company={company} onOpenModal={() => setIsPurchaseModalOpen(true)} />
            )}

            {/* VISTAS MARKETING */}
            {view === 'LOYALTY' && hasPermission('view:loyalty') && (
                <Loyalty company={company} />
            )}

            {view === 'BONUS_POINTS' && hasPermission('view:loyalty') && (
                <BonusPoints
                    company={company} products={products}
                    onSaveCompany={async c => { await dbSaveCompany(c); setCompany(c); }}
                    onUpdateProduct={async (id, p) => { await dbUpdateProduct(id, p); loadData(currentTenant); }}
                />
            )}

            {view === 'WA_CAMPAIGN' && hasPermission('view:wa_campaign') && (
                <WaCampaign clients={clients} company={company} />
            )}

            {/* VISTAS GESTIÓN */}
            {view === 'INVENTORY' && hasPermission('view:inventory') && (
                <Inventory
                    products={products} categories={categories} company={company}
                    onOpenModal={() => { setEditingProduct(null); setIsInventoryModalOpen(true); }}
                    onEdit={p => { setEditingProduct(p); setIsInventoryModalOpen(true); }}
                    onDelete={async id => { await dbDeleteProduct(id); loadData(currentTenant); }}
                />
            )}

            {view === 'PACKAGE_INVENTORY' && hasPermission('view:package_inventory') && (
                <PackageInventory invoices={invoices} company={company} onUpdateStatus={() => { }} />
            )}

            {view === 'CLIENTS' && hasPermission('view:clients') && (
                <Clients
                    clients={clients} company={company}
                    onOpenModal={() => { setEditingClient(null); setIsClientModalOpen(true); }}
                    onEdit={c => { setEditingClient(c); setIsClientModalOpen(true); }}
                />
            )}

            {view === 'EMPLOYEES' && hasPermission('view:employees') && (
                <Employees employees={employees} onSave={async emp => { await dbCreateEmployee(emp); loadData(currentTenant); }} />
            )}

            {view === 'EXPENSES' && hasPermission('view:expenses') && (
                <Expenses expenses={expenses} company={company} onSave={async e => { await dbCreateExpense(e); loadData(currentTenant); }} />
            )}

            {/* VISTAS ADMIN */}
            {view === 'CATEGORIES' && hasPermission('view:categories') && (
                <Categories
                    categories={categories} globalCatalog={globalConfig?.defaultCategoryImages}
                    onSave={async c => { await dbCreateCategory(c); loadData(currentTenant); }}
                    onUpdate={async (id, c) => { await dbUpdateCategory(id, c); loadData(currentTenant); }}
                />
            )}

            {view === 'PAYMENT_METHODS' && hasPermission('view:payment_methods') && (
                <PaymentMethodsView
                    methods={paymentMethods} globalPaymentCatalog={globalConfig?.defaultPaymentImages}
                    onSave={async pm => { await dbCreatePaymentMethod(pm); loadData(currentTenant); }}
                    onUpdate={async (id, pm) => { await dbUpdatePaymentMethod(id, pm); loadData(currentTenant); }}
                />
            )}

            {view === 'SETTINGS' && hasPermission('view:settings') && (
                <Settings company={company} setCompany={c => { dbSaveCompany(c); setCompany(c); }} />
            )}

            {view === 'DEV_CONFIG' && isOwner && (
                <DevConfig
                    onRefreshData={() => loadData(currentTenant)}
                    company={company}
                    onSaveCompany={async c => { await dbSaveCompany(c); setCompany(c); }}
                />
            )}

            {/* MODALES GLOBALES */}
            {selectedReceipt && <InvoiceReceipt invoice={selectedReceipt} company={company} isHistoryCopy={isHistoryCopy} onClose={() => setSelectedReceipt(null)} />}

            <ClientModal
                isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)}
                onSave={async c => { await dbCreateClient(c); loadData(currentTenant); }}
                apiToken={effectiveApiToken} clientsList={clients} initialData={editingClient}
            />

            <InventoryModal
                isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)}
                onSave={async p => {
                    if (editingProduct) await dbUpdateProduct(editingProduct.id, p);
                    else await dbSaveProduct(p);
                    loadData(currentTenant);
                    setIsInventoryModalOpen(false);
                }}
                supplies={supplies} categories={categories} company={company} initialData={editingProduct}
            />

            <SupplyModal
                isOpen={isSupplyModalOpen} onClose={() => setIsSupplyModalOpen(false)}
                onSave={async s => { await dbCreateSupply(s); loadData(currentTenant); }}
            />

            <PurchaseModal
                isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)}
                onSave={async p => { await dbCreatePurchase(p); loadData(currentTenant); }}
                supplies={supplies} company={company}
            />

            <SuccessModal isOpen={!!successMessage} onClose={() => setSuccessMessage(null)} message={successMessage || ""} />
        </Layout>
    );
}