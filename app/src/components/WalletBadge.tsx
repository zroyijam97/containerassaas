"use client"
import { useEffect, useState } from 'react'

export default function WalletBadge() {
  const [balance, setBalance] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/wallet/balance')
      .then(r => r.json())
      .then(d => setBalance(d.balance))
      .catch(() => setBalance(null))
  }, [])
  return (
    <span>{balance === null ? 'Balance —' : `Balance RM ${balance}`}</span>
  )
}
