'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/app/components/ToastNotification';
import { io } from 'socket.io-client';
import StatusDot from '../components/StatusDot';

export default function AdminPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isOpeningTable, setIsOpeningTable] = useState(false);
  const [isClosingTable, setIsClosingTable] = useState(false);
  const [tableToClose, setTableToClose] = useState<string | null>(null);
  const [view, setView] = useState<'orders' | 'tables' | 'history'>('orders');
  const [isMounted, setIsMounted] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false); // State for socket connection status

  const adminTokenRef = useRef<string | null>(null);

  // Financial Stats
  const historyTotal = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  const pendingTotal = orders
    .filter(o => o.status !== 'paid')
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  const handleAuthError = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const fetchOrders = async (token: string) => {
    try {
      const data = await apiFetch('/admin/orders', {}, token);
      setOrders(data);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) handleAuthError();
    }
  };

  const fetchTables = async (token: string) => {
    try {
      const data = await apiFetch('/admin/tables/status', {}, token);
      setTables(data);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) handleAuthError();
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken) {
      router.push('/admin/login');
      return;
    }
    setAdminToken(storedToken);
    adminTokenRef.current = storedToken;

    fetchOrders(storedToken);
    fetchTables(storedToken);

    // Socket.IO Setup
    const socket = io('http://127.0.0.1:4000');

    socket.on('connect', () => {
      console.log('Admin: Connected to Socket.IO');
      setIsConnected(true); // Update state
    });

    socket.on('disconnect', () => { // Added disconnect event
      console.log('Admin: Disconnected from Socket.IO');
      setIsConnected(false); // Update state
    });

    socket.on('reconnect', (attemptNumber) => { // Added reconnect event
      console.log(`Admin: Reconnected to Socket.IO after ${attemptNumber} attempts`);
      setIsConnected(true); // Update state
    });

    socket.on('new_order', () => {
      console.log('Admin: Received new_order event');
      if (adminTokenRef.current) {
        fetchOrders(adminTokenRef.current);
        fetchTables(adminTokenRef.current);
      }
    });

    socket.on('order_updated', () => {
      console.log('Admin: Received order_updated event');
      if (adminTokenRef.current) {
        fetchOrders(adminTokenRef.current);
        fetchTables(adminTokenRef.current);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const updateStatus = async (id: string, nextStatus: string) => {
    if (!adminToken) return;
    try {
      await apiFetch(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      }, adminToken);
      // Data will refresh via Socket event
    } catch (err: any) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const openTable = async (tableId: string) => {
    if (!adminToken) return;
    setIsOpeningTable(true);
    try {
      const data = await apiFetch(`/admin/tables/${tableId}/open`, { method: 'POST' }, adminToken);
      const link = `${window.location.origin}?table=${tableId}&token=${data.token}`;
      setGeneratedLink(link);
      fetchTables(adminToken);
    } catch (err: any) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsOpeningTable(false);
    }
  };

  const closeTable = async (tableId: string) => {
    if (!adminToken) return;
    setIsClosingTable(true);
    try {
      await apiFetch(`/admin/tables/${tableId}/close`, { method: 'POST' }, adminToken);
      setSelectedTableId(null);
      // Refresh will happen via socket or manual fetch
      fetchTables(adminToken);
      fetchOrders(adminToken);
      addToast('Table successfully closed.', 'success');
    } catch (err: any) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsClosingTable(false);
      setTableToClose(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (!isMounted) return null;

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const tableOrders = selectedTable 
    ? orders.filter(o => o.table_id === selectedTable.id && o.session_token === selectedTable.current_session && o.status !== 'paid')
    : [];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-white text-black font-sans">
      {/* Table Sidebar */}
      {selectedTableId && selectedTable && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="fixed inset-0" onClick={() => !isClosingTable && setSelectedTableId(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <button onClick={() => setSelectedTableId(null)} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors font-mono">CLOSE</button>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-2 font-mono">Overview</span>
            <h2 className="text-4xl font-serif mb-8 text-black">Table {selectedTable.id}</h2>
            
            <div className="space-y-8">
              {generatedLink && (
                <div className="bg-emerald-50 p-8 border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-white p-6 border border-emerald-100 flex flex-col items-center justify-center mb-6 shadow-inner">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`} alt="QR" className="w-48 h-48 mb-4 border-8 border-white shadow-sm" />
                    <p className="text-[10px] font-mono text-gray-400 text-center uppercase tracking-tighter">Session QR Code</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(generatedLink!); addToast('Link copied.', 'success'); }} className="w-full py-4 bg-black text-white text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-gray-800 transition-all">Copy Link</button>
                </div>
              )}

              {selectedTable.status === 'available' ? (
                <div className="p-12 border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-8 font-mono tracking-[0.2em]">Ready for guests</p>
                  <button onClick={() => openTable(selectedTable.id)} disabled={isOpeningTable} className="w-full py-5 bg-black text-white font-mono text-[10px] uppercase tracking-[0.3em] disabled:bg-gray-400">{isOpeningTable ? 'Initializing...' : 'Open Table'}</button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                    <h3 className="mono text-[10px] uppercase tracking-widest text-gray-400 font-mono">Current Activity</h3>
                    <span className={`text-[10px] mono px-2 py-0.5 rounded uppercase tracking-[0.2em] font-mono ${selectedTable.status === 'calling_bill' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-rose-50 text-rose-600'}`}>{selectedTable.status}</span>
                  </div>
                  
                  {selectedTable.status === 'calling_bill' && (
                    <div className="bg-amber-50/50 border border-amber-100 p-4 text-center animate-in fade-in duration-500">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-amber-800 mb-1">Billing Requested</p>
                      <p className="text-xs font-serif italic text-amber-900">Guest has requested the final bill summary.</p>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    {tableOrders.length === 0 ? <p className="text-gray-300 italic text-xs py-8 text-center font-serif">Awaiting orders...</p> : tableOrders.map(order => (
                      <div key={order.id} className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] text-gray-300 mono font-mono uppercase tracking-widest"><span>Order #{order.id.slice(-4)}</span><span>{new Date(order.created_at).toLocaleTimeString()}</span></div>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm text-black">
                            <div className="flex flex-col"><span className="font-serif italic">{item.nameTh} <span className="text-[10px] text-gray-300 font-mono not-italic">x{item.quantity || 1}</span></span>
                            {item.selectedOptions && <p className="text-[9px] text-gray-400 font-mono uppercase tracking-tighter">{typeof item.selectedOptions === 'string' ? item.selectedOptions : JSON.stringify(item.selectedOptions)}</p>}</div>
                            <span className="font-medium">฿{item.price * (item.quantity || 1)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="pt-6 flex justify-between items-baseline border-t border-black">
                      <span className="mono text-[10px] font-bold uppercase tracking-widest font-mono">Due Amount</span>
                      <span className="text-3xl font-bold text-black">฿{selectedTable.total_amount}</span>
                    </div>
                  </div>

                  <div className="pt-8 space-y-4">
                     {!generatedLink && <button onClick={() => setGeneratedLink(`${window.location.origin}?table=${selectedTable.id}&token=${selectedTable.current_session}`)} className="w-full py-4 border border-black text-[10px] uppercase tracking-[0.2em] font-mono">Show QR Again</button>}
                     <button onClick={() => setTableToClose(selectedTable.id)} disabled={isClosingTable} className={`w-full py-5 text-white text-[10px] uppercase tracking-[0.3em] font-mono disabled:opacity-50 transition-all ${selectedTable.status === 'calling_bill' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-black hover:bg-gray-800'}`}>{isClosingTable ? 'Processing...' : selectedTable.status === 'calling_bill' ? 'Confirm Payment & Close Table' : 'Finalize & Close Table'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-end mb-16 border-b border-gray-100 pb-10">
        <div>
          <span className="mono text-[10px] uppercase tracking-[0.3em] text-gray-400 block mb-3 font-mono">Terminal Access</span>
          <h1 className="text-5xl font-serif text-black leading-none">Staff Dashboard</h1>
          <nav className="flex gap-8 mt-8">
            {['orders', 'tables', 'history'].map((v: any) => (
              <button key={v} onClick={() => setView(v)} className={`text-[10px] font-mono uppercase tracking-[0.3em] pb-2 border-b transition-all ${view === v ? 'border-black text-black' : 'border-transparent text-gray-300 hover:text-black'}`}>{v}</button>
            ))}
          </nav>
        </div>
        <div className="text-right flex items-center justify-end gap-2">
          <StatusDot isConnected={isConnected} />
          <div>
            <button onClick={logout} className="mono text-[10px] uppercase tracking-widest text-gray-300 hover:text-black font-mono transition-colors block mb-2 underline underline-offset-4 decoration-gray-100">SIGN OUT</button>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          {view === 'orders' ? (
            <div className="grid gap-8">
              {orders.filter(o => o.status !== 'paid').length === 0 ? <p className="text-center py-20 text-gray-300 font-serif italic border border-dashed border-gray-100">No active orders in terminal.</p> : orders.filter(o => o.status !== 'paid').map(order => (
                <div key={order.id} className="bg-white p-10 border border-gray-100 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-3xl font-serif text-black mb-1">Table {order.table_id}</h3>
                      <p className="text-[10px] text-gray-400 mono font-mono tracking-[0.2em] uppercase">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                    <span className={`px-4 py-1 text-[9px] font-mono uppercase tracking-[0.2em] border ${order.status === 'pending' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}>{order.status}</span>
                  </div>
                  <div className="space-y-4 mb-10 border-y border-gray-50 py-8">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-black"><span className="text-lg font-serif italic">{item.nameTh}</span><span className="font-mono text-sm">฿{item.price}</span></div>
                    ))}
                  </div>
                  <button onClick={() => updateStatus(order.id, order.status === 'pending' ? 'cooking' : 'served')} className="w-full py-5 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-mono disabled:bg-gray-50 disabled:text-gray-200 transition-all hover:bg-gray-800" disabled={order.status === 'served'}>{order.status === 'pending' ? 'Prepare Order' : 'Mark as Delivered'}</button>
                </div>
              ))}
            </div>
          ) : view === 'tables' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tables.map(table => (
                <div key={table.id} onClick={() => { setSelectedTableId(table.id); setGeneratedLink(null); }} className={`p-8 border transition-all cursor-pointer h-48 flex flex-col justify-between group relative overflow-hidden ${
                  table.status === 'available' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                  table.status === 'calling_bill' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500 animate-pulse text-amber-900' :
                  'bg-rose-50 border-rose-100 text-rose-900'
                }`}>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-4xl font-serif italic">#{table.id}</span>
                    <div className={`w-2 h-2 rounded-full ${table.status === 'available' ? 'bg-emerald-400' : table.status === 'calling_bill' ? 'bg-amber-600 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
                  </div>
                  <div className="relative z-10">
                    <span className="block text-[9px] mono uppercase tracking-widest opacity-40 mb-1 font-mono">{table.status}</span>
                    {table.status !== 'available' && <span className="text-2xl font-bold tracking-tight">฿{table.total_amount}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {orders.filter(o => o.status === 'paid').map(order => (
                <div key={order.id} className="p-8 border border-gray-100 flex justify-between items-center text-black hover:bg-gray-50 transition-all">
                  <div className="flex gap-12 items-baseline"><div className="space-y-1"><span className="mono text-[10px] text-gray-300 block uppercase font-mono tracking-widest">Residence {order.table_id}</span><span className="text-2xl font-serif italic">#{order.id.slice(-4)}</span></div><span className="text-[10px] text-gray-300 font-mono uppercase tracking-[0.2em]">{new Date(order.created_at).toLocaleDateString()}</span></div>
                  <span className="text-3xl font-serif font-bold italic">฿{order.total_price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-16">
          <section className="bg-gray-50/50 p-10 border border-gray-100 rounded-sm">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-400 mb-10 border-b border-gray-100 pb-4">Financial Overview</h2>
            <div className="space-y-10">
               <div className="space-y-2"><span className="text-[10px] mono uppercase text-emerald-600 block font-mono tracking-[0.2em]">Realized Revenue</span><span className="text-5xl font-serif text-emerald-600 leading-none">฿{historyTotal.toLocaleString()}</span></div>
               <div className="space-y-2"><span className="text-[10px] mono uppercase text-rose-600 block font-mono tracking-[0.2em]">Pending Settlement</span><span className="text-5xl font-serif text-rose-600 leading-none">฿{pendingTotal.toLocaleString()}</span></div>
            </div>
          </section>
          <section className="bg-black text-white p-10 shadow-xl">
             <h3 className="text-xl font-serif italic mb-6">Operations</h3>
             <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] leading-loose font-mono italic">Select residence grid to manage guest sessions and finalize culinary transactions in the active terminal.</p>
          </section>
        </div>
      </div>

      {/* Custom Confirmation Modal for Closing Table */}
      {tableToClose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <span className="mono text-[10px] uppercase tracking-[0.3em] text-red-700 block mb-4 font-mono">Confirmation Required</span>
            <h3 className="text-2xl font-serif mb-4 text-black leading-tight">Close Table {tableToClose}?</h3>
            <p className="text-gray-400 text-sm font-serif italic mb-8">
              This action will mark all active orders for Table {tableToClose} as paid and release the table session.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => !isClosingTable && setTableToClose(null)} 
                className="flex-1 py-4 border border-black text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors"
                disabled={isClosingTable}
              >
                Cancel
              </button>
              <button 
                onClick={() => closeTable(tableToClose)} 
                className="flex-1 py-4 bg-black text-white text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-gray-800 disabled:opacity-50 transition-all"
                disabled={isClosingTable}
              >
                {isClosingTable ? 'Closing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
