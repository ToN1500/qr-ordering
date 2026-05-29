'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import ExpiredScreen from '@/app/components/ExpiredScreen';
import { useToast } from '@/app/components/ToastNotification';
import { io } from 'socket.io-client';
import StatusDot from './components/StatusDot';

interface MenuOption {
  label: string;
  choices: string[];
}

interface MenuItem {
  id: string;
  category: string;
  name: string;
  nameTh: string;
  price: number;
  image: string;
  desc: string;
  is_available: boolean;
  options?: MenuOption[];
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Confirmed';
    case 'cooking':
      return 'Preparing';
    case 'served':
      return 'Delivered';
    default:
      return status;
  }
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'pending':
      return { dot: 'bg-gray-500', text: 'text-gray-500' };
    case 'cooking':
      return { dot: 'bg-orange-500 animate-pulse', text: 'text-orange-500' };
    case 'served':
      return { dot: 'bg-emerald-500', text: 'text-emerald-500' };
    default:
      return { dot: 'bg-gray-300', text: 'text-gray-300' }; // Default or unknown status
  }
};

function OrderingContent() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  const token = searchParams.get('token');

  const [screen, setScreen] = useState<'welcome' | 'menu' | 'cart' | 'tracking'>('welcome');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null); // null means not checked yet
  const [sessionStatus, setSessionStatus] = useState<string>('active');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isConnected, setIsConnected] = useState(false); // State for socket connection status

  // Function to fetch order status
  const fetchOrderStatus = async () => {
    if (!tableId || !token) return;
    try {
      const data = await apiFetch(`/orders?table_id=${tableId}&token=${token}`);
      setOrderStatus(data);
    } catch (err) {
      console.error('Error fetching order status:', err);
    }
  };

  // Function to validate session
  const validateSession = async () => {
    if (!tableId || !token) {
      setIsSessionValid(false);
      setIsLoadingSession(false);
      return;
    }

    try {
      const response = await apiFetch(`/sessions/validate?table_id=${tableId}&token=${token}`);
      setIsSessionValid(response.valid);
      if (response.valid) {
        setSessionStatus(response.status || 'active');
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      setIsSessionValid(false);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Session Validation Effect
  useEffect(() => {
    validateSession();
    fetchOrderStatus(); // Fetch initial order status side-by-side
  }, [tableId, token]); // Rerun if tableId or token changes

  useEffect(() => {
    if (screen === 'menu') {
      setLoading(true);
      apiFetch('/menu')
        .then(data => {
          setMenuItems(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching menu:', err);
          setLoading(false);
        });
    }
  }, [screen]);

  // useEffect for Socket.IO
  useEffect(() => {
    if (!tableId || !token || isSessionValid === false) return;

    const socket = io('http://127.0.0.1:4000');

    socket.on('connect', () => {
      console.log('Customer: Connected to Socket.IO server');
      setIsConnected(true); // Update state
    });

    socket.on('disconnect', () => { // Added disconnect event
      console.log('Customer: Disconnected from Socket.IO server');
      setIsConnected(false); // Update state
    });

    socket.on('reconnect', (attemptNumber) => { // Added reconnect event
      console.log(`Customer: Reconnected to Socket.IO server after ${attemptNumber} attempts`);
      setIsConnected(true); // Update state
    });

    socket.on('order_updated', (data: { token: string }) => {
      console.log('Customer: Received order_updated event', data);
      if (data.token === token) {
        console.log('Customer: Order updated for this session, fetching new status.');
        fetchOrderStatus();
        validateSession();
      }
    });

    socket.on('disconnect', () => {
      console.log('Customer: Disconnected from Socket.IO server');
    });

    return () => {
      socket.disconnect();
      console.log('Customer: Socket.IO disconnected on cleanup');
    };
  }, [tableId, token, isSessionValid]);

  const addToCart = (item: MenuItem, itemSelections: Record<string, string>) => {
    setCart([...cart, { ...item, cartId: Math.random(), selectedOptions: itemSelections }]);
    setSelectedItem(null);
    setSelections({});
  };

  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const callForBill = async () => {
    if (!token || !tableId) return;

    try {
      await apiFetch(`/orders/call-bill`, {
        method: 'POST',
        body: JSON.stringify({ table_id: tableId, token })
      });
      addToast('A team member will be with you shortly to assist with the settlement.', 'success');
      fetchOrderStatus();
      validateSession();
    } catch (err: any) {
      addToast(`Unable to request bill: ${err.message}`, 'error');
    }
  };

  const placeOrder = async () => {
    if (!token || !tableId) {
      addToast('Please scan the table QR code to proceed.', 'error');
      return;
    }

    const orderData = {
      table_id: tableId,
      token: token,
      items: cart.map(item => ({
        id: item.id,
        price: Number(item.price),
        quantity: item.quantity || 1,
        selectedOptions: item.selectedOptions
      })),
      total_price: cart.reduce((sum, item) => sum + Number(item.price), 0)
    };

    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      setScreen('tracking');
      setCart([]);
      fetchOrderStatus();
    } catch (err: any) {
      addToast(`Unable to process order: ${err.message}`, 'error');
    }
  };

  if (isLoadingSession) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Validating Session</p>
      </div>
    );
  }

  if (isSessionValid === false) {
    const hasPreviousOrders = orderStatus.length > 0;
    if (hasPreviousOrders) {
      return (
        <ExpiredScreen 
          message="Payment Complete" 
          subMessage="Thank you for dining with us at The Monocle. We look forward to welcoming you again soon." 
        />
      );
    }
    return <ExpiredScreen />;
  }

  if (sessionStatus === 'calling_bill') {
    const grandTotal = orderStatus.reduce((sum, item) => sum + Number(item.price), 0);

    return (
      <div className="p-8 max-w-md mx-auto bg-white min-h-screen border-x border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <header className="mb-16">
            <div className="flex justify-end gap-2 items-center mb-8">
              <StatusDot isConnected={isConnected} />
              <span className="mono text-[10px] text-gray-400 uppercase tracking-widest font-mono">Residence {tableId}</span>
            </div>
            <h2 className="text-4xl font-serif">Bill Summary</h2>
            <p className="text-gray-400 text-sm font-serif italic mt-2">Please wait. A staff member is preparing your bill and will be with you shortly.</p>
          </header>

          <div className="space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono">Order History</span>
            <div className="divide-y divide-gray-100">
              {orderStatus.map((item, idx) => (
                <div key={idx} className="flex justify-between py-4 text-sm font-serif">
                  <div>
                    <span className="text-black">{item.nameTh}</span>
                    <div className="flex flex-wrap gap-2">
                      {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                        <span key={k} className="text-[9px] text-gray-400 font-mono uppercase tracking-tight">{v as string}</span>
                      ))}
                    </div>
                  </div>
                  <span className="font-mono text-gray-500 font-mono">฿{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 space-y-6 mt-12">
          <div className="flex justify-between items-baseline">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono">Total Sum</span>
            <span className="text-3xl font-medium text-black">฿{grandTotal}</span>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.1em] mb-1 font-mono">Status</p>
            <p className="text-sm text-amber-600 font-serif italic animate-pulse">Processing Payment / กำลังเตรียมเช็คบิล</p>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'welcome') {
    return (
      <div className="flex flex-col h-screen justify-center text-center px-8 animate-in fade-in duration-500 max-w-md mx-auto">
        <span className="mono mb-6 text-sm uppercase tracking-[0.4em] text-gray-400 font-mono">The Monocle</span>
        <h1 className="text-6xl mb-10 leading-none font-serif">Residence<br/>{tableId}</h1>
        <p className="text-gray-500 mb-20 text-lg font-serif italic">
          Welcome to a refined dining experience,<br/>tailored to your unique palate.
        </p>
        <button className="btn-primary" onClick={() => setScreen('menu')}>
          View the Menu
        </button>
      </div>
    );
  }

  if (screen === 'menu') {
    const pendingItems = orderStatus.filter(o => o.status !== 'served');

    return (
      <div className="animate-in fade-in duration-500 max-w-md mx-auto bg-white min-h-screen border-x border-gray-100 shadow-sm relative">
        <header className="p-8 sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <StatusDot isConnected={isConnected} />
              <h2 className="text-4xl font-serif">The Menu</h2>
            </div>
            <div className="flex gap-8 items-baseline">
              {(orderStatus.length > 0 || pendingItems.length > 0) && (
                <div className="cursor-pointer relative" onClick={() => setScreen('tracking')}>
                  <span className="mono text-[10px] font-mono uppercase tracking-[0.2em] text-black border-b border-black pb-0.5">Orders</span>
                  {pendingItems.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                      {pendingItems.length}
                    </span>
                  )}
                </div>
              )}
              <div className="cursor-pointer relative" onClick={() => setScreen('cart')}>
                <span className="mono text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Selection</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-black text-white text-[9px] px-1.5 py-0.5 rounded-full animate-in zoom-in duration-300">
                    {cart.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-12 pb-48">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <div className="w-6 h-6 border-px border-gray-200 border-t-black rounded-full animate-spin"></div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Curating Selections</p>
            </div>
          ) : (
            menuItems.map(item => (
              <div key={item.id} className="space-y-4 group cursor-pointer" onClick={() => setSelectedItem(item)}>
                <div className="aspect-[4/3] overflow-hidden bg-gray-50 border border-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000" />
                </div>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-2xl font-serif">{item.nameTh}</h3>
                  <span className="text-xl font-medium">฿{item.price}</span>
                </div>
                <p className="mono text-[10px] text-gray-400 font-mono tracking-widest uppercase">{item.name}</p>
                <p className="text-gray-400 text-sm leading-relaxed font-serif italic">{item.desc}</p>
              </div>
            ))
          )}
        </div>

        {/* Floating Status Bar */}
        {pendingItems.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm bg-black text-white p-4 px-6 rounded-full flex justify-between items-center shadow-2xl z-40 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono">Culinary Progress ({pendingItems.length})</span>
            </div>
            <button
              onClick={() => setScreen('tracking')}
              className="text-[10px] uppercase tracking-[0.2em] font-mono border-b border-white/30 pb-0.5 hover:border-white transition-all"
            >
              Track Order
            </button>
          </div>
        )}

        {/* Customization Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in duration-500 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-10 pt-12 border-t border-gray-100 animate-in slide-in-from-bottom duration-700 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-serif">{selectedItem.nameTh}</h2>
                <span className="text-xl font-medium">฿{selectedItem.price}</span>
              </div>
              <p className="text-gray-400 text-sm mb-12 font-serif italic">{selectedItem.desc}</p>

              {selectedItem.options?.map(opt => (
                <div key={opt.label} className="mb-12">
                  <span className="mono text-[10px] uppercase tracking-[0.3em] text-gray-300 block mb-6 font-mono">{opt.label}</span>
                  <div className="flex flex-wrap gap-3">
                    {opt.choices.map(choice => (
                      <button
                        key={choice}
                        onClick={() => setSelections({...selections, [opt.label]: choice})}
                        className={`px-6 py-2.5 text-[10px] uppercase tracking-widest transition-all duration-300 border ${
                          selections[opt.label] === choice
                          ? 'border-black bg-black text-white'
                          : 'border-gray-100 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 mt-8">
                <button className="flex-1 text-[10px] tracking-[0.3em] uppercase font-mono text-gray-300 hover:text-black transition-colors" onClick={() => { setSelectedItem(null); setSelections({}); }}>Dismiss</button>
                <button className="btn-primary flex-[2] text-[10px] tracking-[0.3em] uppercase py-5" onClick={() => addToCart(selectedItem, selections)}>Add to Selection</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'tracking') {
    const preparingItems = orderStatus.filter(item => item.status !== 'served');
    const deliveredItems = orderStatus.filter(item => item.status === 'served');
    const grandTotal = orderStatus.reduce((sum, item) => sum + Number(item.price), 0);
    const isFullyServed = preparingItems.length === 0 && deliveredItems.length > 0;

    return (
      <div className="p-8 max-w-md mx-auto bg-white min-h-screen border-x border-gray-100 shadow-sm animate-in fade-in duration-500">
        <header className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <span className="mono text-[10px] cursor-pointer text-gray-400 uppercase tracking-widest hover:text-black transition-colors" onClick={() => setScreen('menu')}>Return to Menu</span>
            <div className="flex gap-2 items-center">
              <StatusDot isConnected={isConnected} />
              <span className="mono text-[10px] text-gray-400 uppercase tracking-widest">Residence {tableId}</span>
            </div>
          </div>
          <h2 className="text-4xl font-serif">Residence Summary</h2>
        </header>

        {orderStatus.length === 0 ? (
          <div className="py-24 text-center space-y-4">
             <div className="w-6 h-6 border-px border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
             <p className="text-gray-400 font-serif italic text-sm">Synchronizing with kitchen...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Preparing Group */}
            {preparingItems.length > 0 && (
              <div className="space-y-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-600">Preparing</span>
                <div className="space-y-6">
                  {preparingItems.map((item, idx) => {
                    const { dot, text } = getStatusClasses(item.status);
                    return (
                      <div key={`active-${idx}`} className="flex justify-between items-start animate-in slide-in-from-left-4 duration-700">
                        <div className="flex gap-4">
                          <div className={`mt-2 w-2 h-2 rounded-full ${dot}`} />
                          <div>
                            <h4 className="font-serif text-lg text-black">{item.nameTh}</h4>
                            <span className={`text-[9px] font-mono uppercase tracking-widest ${text} ml-2`}>
                              {getStatusLabel(item.status)}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                <span key={k} className="text-[9px] text-gray-400 font-mono uppercase tracking-tight">{v as string}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-gray-400">x 1</span>
                      </div>
                    );
                  })}                </div>
              </div>
            )}

            {/* Delivered Group */}
            {deliveredItems.length > 0 && (
              <div className="space-y-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-300">Delivered</span>
                <div className="space-y-6 opacity-40">
                  {deliveredItems.map((item, idx) => (
                    <div key={`served-${idx}`} className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="mt-2 w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <h4 className="font-serif text-lg">{item.nameTh}</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                              <span key={k} className="text-[9px] text-gray-300 font-mono uppercase tracking-tight">{v as string}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs">x 1</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing Preview */}
            <div className="mt-16 pt-12 border-t border-black">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400 block mb-8">Billing Preview</span>
              <div className="space-y-4 mb-12">
                {orderStatus.map((item, idx) => (
                  <div key={`bill-${idx}`} className="flex justify-between items-baseline font-serif text-sm">
                    <span className="text-gray-600">{item.nameTh} <span className="font-mono text-[10px] text-gray-400 ml-2">x 1</span></span>
                    <span className="font-mono text-gray-500">฿{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline mb-12">
                <span className="font-serif text-2xl">Grand Total</span>
                <span className="text-4xl font-medium">฿{grandTotal}</span>
              </div>

              <button
                onClick={callForBill}
                className={`w-full py-6 font-mono text-[10px] uppercase tracking-[0.3em] transition-all duration-700 ${
                isFullyServed
                ? 'bg-black text-white scale-[1.02] shadow-xl ring-1 ring-black ring-offset-4 active:scale-95'
                : 'bg-gray-100 text-gray-400'
              }`}>
                {isFullyServed ? 'Call for Bill' : 'Request Settlement'}
              </button>

              <p className="text-center text-[9px] text-gray-300 uppercase tracking-[0.2em] mt-6 font-mono">
                Our team will attend to your residence shortly.
              </p>
            </div>

            <div className="pt-8">
               <button
                 onClick={() => setScreen('menu')}
                 className="w-full py-5 border border-gray-100 text-[10px] uppercase tracking-[0.4em] hover:border-black transition-all font-mono text-gray-400"
               >
                 Add to Selection
               </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto bg-white min-h-screen border-x border-gray-100 shadow-sm animate-in fade-in duration-500">
      <header className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 items-center">
            <span className="mono text-[10px] cursor-pointer text-gray-400 uppercase tracking-widest hover:text-black transition-colors" onClick={() => setScreen('menu')}>Return to Menu</span>
          </div>
          <div className="flex gap-2 items-center">
            <StatusDot isConnected={isConnected} />
            <span className="mono text-[10px] text-gray-400 uppercase tracking-widest">Residence {tableId}</span>
          </div>
        </div>        <h2 className="text-5xl font-serif">Your Selection</h2>
      </header>

      {cart.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-100">
          <p className="text-gray-300 mb-10 font-serif italic text-lg">Your selection is currently empty</p>
          <button className="btn-outline w-auto px-12 border-gray-100 text-gray-400 text-[10px] tracking-[0.3em] uppercase font-mono" onClick={() => setScreen('menu')}>Browse Menu</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-gray-50">
            {cart.map((item, idx) => (
              <div key={item.cartId} className="py-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <h4 className="text-xl font-serif">{item.nameTh}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.selectedOptions).map(([k, v]) => (
                        <span key={k} className="text-[9px] px-2.5 py-1 border border-gray-50 text-gray-400 font-mono uppercase tracking-widest">{v as string}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-lg font-medium">฿{item.price}</span>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartId)}
                  className="mono text-[9px] text-gray-300 border-b border-gray-100 pb-0.5 hover:text-red-900 hover:border-red-200 transition-all uppercase tracking-[0.2em]"
                >
                  Remove Selection
                </button>
              </div>
            ))}
          </div>

          <div className="pt-12 mt-12 border-t border-black">
            <div className="flex justify-between items-baseline mb-4">
              <span className="mono text-[10px] uppercase tracking-[0.3em] text-gray-300 font-mono">Summary</span>
              <span className="text-xs font-serif italic text-gray-400">{cart.length} Curated Items</span>
            </div>
            <div className="flex justify-between items-baseline mb-16">
              <span className="text-2xl font-serif">Grand Total</span>
              <span className="text-4xl font-medium">฿{cart.reduce((sum, item) => sum + Number(item.price), 0)}</span>
            </div>
            <button className="btn-primary text-sm py-6 tracking-[0.3em] uppercase" onClick={placeOrder}>Confirm Selection</button>
            <p className="text-center text-[10px] text-gray-300 uppercase tracking-[0.3em] mt-12 leading-loose opacity-60 font-mono">
              * Your selection will be transmitted<br/>directly to the kitchen
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Loading Experience</p>
      </div>
    }>
      <OrderingContent />
    </Suspense>
  );
}
