'use client'

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Home, Swords, Settings } from 'lucide-react'
import { signIn, signOut, useSession } from "next-auth/react";
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js'

const claimTokens = async () => {
  const res = await fetch('/api/initiate-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // Added header for JSON
    body: JSON.stringify({ action: "claim", customerWallet: "0x6871D69057bf6e1Da3C9be4164048c78B5beFd41" }), // Added JSON body
  });
}

const sendPayment = async () => {
  const res = await fetch('/api/initiate-payment', {
    method: 'POST',
  });
  const { id } = await res.json();

  const payload: PayCommandInput = {
    reference: id,
    to: '0xfF9311E69306394Fc117165D9844BD72102AcFa1', // Test address
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: tokenToDecimals(1, Tokens.WLD).toString(),
      },
      {
        symbol: Tokens.USDCE,
        token_amount: tokenToDecimals(3, Tokens.USDCE).toString(),
      },
    ],
    description: 'Pay to train your cat',
  }

  if (MiniKit.isInstalled()) {
    return
  }

  const { finalPayload } = await MiniKit.commandsAsync.pay(payload)

  if (finalPayload.status == 'success') {
    const res = await fetch(`/api/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
    })
    const payment = await res.json()
    if (payment.success) {
      // Congrats your payment was successful!
    }
  }
}

export function Game() {
  const [activeTab, setActiveTab] = useState('main')
  const [imageHeight, setImageHeight] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const updateImageHeight = () => {
      if (imageRef.current) {
        const width = imageRef.current.width
        const height = imageRef.current.height
        const aspectRatio = width / height
        const newHeight = (window.innerWidth * 0.8) / aspectRatio
        setImageHeight(newHeight)
      }
    }

    window.addEventListener('resize', updateImageHeight)
    updateImageHeight()

    return () => window.removeEventListener('resize', updateImageHeight)
  }, [])

  
  const stats = [
    { name: 'Health', value: 10, max: 10, color: 'bg-red-500' },
    { name: 'Hunger', value: 3, max: 10, color: 'bg-blue-500' },
    { name: 'Cuddles', value: 5, max: 10, color: 'bg-yellow-500' },
    { name: 'Cuteness', value: 10, max: 10, color: 'bg-yellow-500' },
  ]

  return (
    <div className="flex flex-col h-screen bg-white">
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'main' && (
          <div className="space-y-4">
            <img
              src="/avatar.png"
              alt="Cat character"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="bg-gray-100 rounded-lg p-4 shadow-inner">
              <h2 className="text-xl font-bold mb-4 text-center">Character Stats</h2>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{stat.name}</span>
                      <span>{stat.value}/{stat.max}</span>
                    </div>
                    <Progress
                      value={(stat.value / stat.max) * 100}
                      className="h-2"
                      indicatorClassName={stat.color}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">Claim CAT TOkens</h2>
              <Button className="w-full" onClick={claimTokens}>Claim</Button>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">Get stronger</h2>
              <Button className="w-full" onClick={sendPayment}>Train</Button>
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