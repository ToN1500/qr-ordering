'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/components/ToastNotification';

export default function MenuManagementPage() {
  const { addToast } = useToast();
  const [menu, setMenu] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', nameTh: '', price: '', category: 'Main' });

  const fetchMenu = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/menu');
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect this placeholder action with actual database API for menu creation
    addToast(`เพิ่มเมนู "${newItem.nameTh}" เรียบร้อยแล้ว`, 'success');
    setNewItem({ name: '', nameTh: '', price: '', category: 'Main' });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-white">
      <div className="flex justify-between items-baseline mb-8">
        <h1 className="text-4xl font-serif">Menu Management</h1>
        <a href="/admin" className="mono text-accent">← Back to Orders</a>
      </div>

      <section className="mb-12 p-6 bg-gray-50 border border-gray-100">
        <h2 className="text-xl mb-4 font-bold">เพิ่มเมนูใหม่</h2>
        <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" placeholder="ชื่อภาษาอังกฤษ" 
            className="p-2 border" 
            value={newItem.name}
            onChange={e => setNewItem({...newItem, name: e.target.value})}
          />
          <input 
            type="text" placeholder="ชื่อภาษาไทย" 
            className="p-2 border" 
            value={newItem.nameTh}
            onChange={e => setNewItem({...newItem, nameTh: e.target.value})}
          />
          <input 
            type="number" placeholder="ราคา" 
            className="p-2 border" 
            value={newItem.price}
            onChange={e => setNewItem({...newItem, price: e.target.value})}
          />
          <select 
            className="p-2 border"
            value={newItem.category}
            onChange={e => setNewItem({...newItem, category: e.target.value})}
          >
            <option>Signature</option>
            <option>Pasta</option>
            <option>Salad</option>
            <option>Drink</option>
          </select>
          <button type="submit" className="btn-primary md:col-span-2">บันทึกเมนู</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl mb-4 font-bold">รายการอาหารปัจจุบัน</h2>
        <div className="space-y-4">
          {menu.map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 border border-gray-100">
              <div>
                <p className="font-bold">{item.nameTh}</p>
                <p className="text-xs text-muted">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">฿{item.price}</p>
                <span className="text-[10px] text-red-500 cursor-pointer mono">Delete</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
