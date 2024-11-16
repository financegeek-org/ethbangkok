'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Home, Swords, Settings } from 'lucide-react'

export default function Game() {
  const [activeTab, setActiveTab] = useState('main')

  return (
    <div className="flex flex-col h-screen bg-white">
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'main' && (
          <div className="space-y-4">
            <img
              src="/placeholder.svg?height=200&width=200"
              alt="Cat character"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-100 p-2 rounded">
                  Stat {i + 1}: Value
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">Combat Actions</h2>
              <Button className="w-full">Attack</Button>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">Special Abilities</h2>
              <Button className="w-full">Use Special Ability</Button>
            </section>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center pt-10">
            <p>Settings content goes here</p>
          </div>
        )}
      </main>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t">
        <TabsList className="w-full justify-between h-16">
          <TabsTrigger value="main" className="flex-1 data-[state=active]:bg-muted">
            <Home className="w-5 h-5" />
            <span className="sr-only">Main</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex-1 data-[state=active]:bg-muted">
            <Swords className="w-5 h-5" />
            <span className="sr-only">Actions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-muted">
            <Settings className="w-5 h-5" />
            <span className="sr-only">Settings</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}