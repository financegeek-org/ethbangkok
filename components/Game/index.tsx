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
              <h2 className="text-lg font-semibold mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15 3H14V4H13H12H11H10V3H9H8H7V4H6V5H5V6V7V8H4H3V9V10V11V12V13V14H4H5V15V16V17V18V19V20V21H6H7H8H9H10H11H12H13H14H15H16H17H18H19V20V19V18V17V16V15V14H20H21V13V12V11V10V9V8H20H19V7V6V5H18V4H17V3H16H15ZM7 7V6H8V5H9H10V6H11V7V8H10H9H8H7V7ZM16 8H17V7V6H16V5H15H14V6H13V7V8H14H15H16ZM7 17V18V19H8H9H10H11V18V17V16V15V14H10H9H8H7V15V16V17ZM5 12H6H7H8H9H10H11V11V10H10H9H8H7H6H5V11V12ZM13 16V15V14H14H15H16H17V15V16V17V18V19H16H15H14H13V18V17V16ZM14 12H13V11V10H14H15H16H17H18H19V11V12H18H17H16H15H14Z" fill="black" />
                </svg>
              </h2>
              <Button className="w-full" onClick={claimTokens}>
                Claim Daily Tokens
              </Button>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11 6H12V7V8V9H11V10H10V11H11H12H13H14H15V12V13H14V14H13V15H12V16H11V17H10V18H9V17V16V15H10V14H11V13H10H9H8H7H6V12V11H7V10H8V9H9V8H10V7H11V6ZM15 6H14V7V8H15H16H17V9V10V11V12V13V14V15V16H16H15H14V17V18H15H16H17H18H19V17V16V15V14V13V12V11V10V9V8V7V6H18H17H16H15ZM21 9H20V10V11V12V13V14V15H21H22V14V13V12V11V10V9H21ZM6 16H7V17V18H6H5H4H3H2V17V16V15V14V13V12V11V10V9V8V7V6H3H4H5H6H7V7V8H6H5H4V9V10V11V12V13V14V15V16H5H6Z" fill="black" />
              </svg>
              </h2>
              <Button className="w-full" onClick={sendPayment}>Train to get Stronger</Button>
            </section>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center pt-10">
            Token Contract:<br />
            0xC143a7c1d9a75C99219D06b0AbF457E48093AF9b<br />
            <br />
            Explorer: <br /><a href="https://worldchain-sepolia.explorer.alchemy.com/address/0xC143a7c1d9a75C99219D06b0AbF457E48093AF9b">Blockscout Explorer</a>
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