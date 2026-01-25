import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

type Tab = 'status' | 'approvals' | 'results' | 'brain';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('status');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'status', label: 'Status' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'results', label: 'Results' },
    { id: 'brain', label: 'Brand Brain' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">LIV8</span>
          </div>
          <h1 className="font-semibold text-slate-900">Command Center</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            System Active
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {activeTab === 'status' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="col-span-full md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">AEO Growth Loop</h3>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white">
                   <div className="text-center">
                     <div className="text-2xl font-bold">85%</div>
                     <div className="text-xs text-slate-400">Discoverability</div>
                   </div>
                   <div className="text-2xl text-slate-500">→</div>
                   <div className="text-center">
                     <div className="text-2xl font-bold">124</div>
                     <div className="text-xs text-slate-400">Conversations</div>
                   </div>
                   <div className="text-2xl text-slate-500">→</div>
                   <div className="text-center">
                     <div className="text-2xl font-bold">18</div>
                     <div className="text-xs text-slate-400">Bookings</div>
                   </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Active AI Staff</h3>
                <div className="space-y-3">
                   {['Receptionist', 'Missed Call Agent', 'Review Collector'].map((role) => (
                     <div key={role} className="flex items-center gap-2 text-sm">
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                       <span className="text-slate-700">{role}</span>
                     </div>
                   ))}
                </div>
              </Card>

               <Card className="col-span-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                  <Button variant="ghost" className="text-xs">View Log</Button>
                </div>
                <div className="space-y-0 divide-y divide-slate-100">
                  {[
                    { action: "Replied to Google Review", time: "2m ago", type: "auto" },
                    { action: "Recovered Missed Call (+1 555-0123)", time: "15m ago", type: "success" },
                    { action: "Booked Appointment (Sarah J.)", time: "1h ago", type: "success" },
                    { action: "Drafted Blog Post: 'Summer Maintenance'", time: "3h ago", type: "pending" },
                  ].map((item, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className={`w-2 h-2 rounded-full ${item.type === 'auto' ? 'bg-blue-400' : item.type === 'success' ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                         <span className="text-sm text-slate-700">{item.action}</span>
                      </div>
                      <span className="text-xs text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'approvals' && (
             <div className="space-y-4">
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                 <span className="text-xl">⚠️</span>
                 <div>
                   <h4 className="font-semibold text-yellow-900 text-sm">Action Required</h4>
                   <p className="text-yellow-700 text-sm">LIV8AI has drafted content that needs your review before publishing.</p>
                 </div>
               </div>
               
               <Card>
                 <div className="flex items-start justify-between">
                   <div>
                     <span className="inline-block px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600 mb-2">AEO Content</span>
                     <h3 className="font-semibold text-slate-900">Blog Post: "Why regular maintenance saves money"</h3>
                     <p className="text-sm text-slate-500 mt-1 max-w-xl">Generated based on recent FAQs about pricing. Targeting "cost effective" keywords.</p>
                   </div>
                   <div className="flex gap-2">
                     <Button variant="outline">Edit</Button>
                     <Button>Approve & Publish</Button>
                   </div>
                 </div>
               </Card>
             </div>
          )}

           {activeTab === 'brain' && (
            <Card>
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-slate-900">Brand Identity</h3>
                <p className="text-slate-500">This is the "Brain" used by all your AI agents. Updates here affect all conversations immediately.</p>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Core Description</label>
                    <textarea className="w-full border-slate-200 rounded-lg text-sm p-3 bg-slate-50" rows={3} defaultValue="We provide premium HVAC services to the greater Austin area, focusing on energy efficiency and same-day repairs." />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tone of Voice</label>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm flex gap-2">
                          <span className="bg-white border px-2 py-1 rounded shadow-sm">Professional</span>
                          <span className="bg-white border px-2 py-1 rounded shadow-sm">Helpful</span>
                          <span className="bg-white border px-2 py-1 rounded shadow-sm">Direct</span>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Do Not Say</label>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-red-600">
                          "I don't know", "Maybe", "Guaranteed"
                        </div>
                     </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button>Save Updates</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'results' && (
             <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                  <p className="mb-2">Charts initialized via Recharts...</p>
                  <span className="text-xs">Data collection in progress (24h required)</span>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
