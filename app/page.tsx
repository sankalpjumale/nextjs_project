'use client'

import { useEffect, useState, useRef } from "react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"


interface CounterData {
  date: string
  dailyCount: number
  totalCount: number
}

const SIX_HOURS = 6 * 60 * 60 * 1000

export default function Home() {

  const [data, setData] = useState<CounterData | null>(null)
  const [loading, setLoading] = useState(true)
  // const [increment, setIncrement] = useState(false)
  // const [reset, setReset] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pendingRef = useRef(0)
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  useEffect(() => {
    fetchCounter()
    scheduleMidnightReset()

    return () => {
      if(flushTimerRef.current) clearTimeout(flushTimerRef.current)
      if(midnightTimerRef.current) clearTimeout(midnightTimerRef.current)
    }
  }, [])

  async function fetchCounter() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/counter")
      if(!res.ok) throw new Error("Fialed to fetch counter")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError("Could not load counter. Please try again")
    } finally {
      setLoading(false)
    }
  }

  function scheduleFlush() {
    if(flushTimerRef.current) clearTimeout(flushTimerRef.current)
    flushTimerRef.current = setTimeout(async () => {
      await flushIncrement()
      scheduleFlush()
    }, SIX_HOURS)
  }

  async function flushIncrement() {
    const amount = pendingRef.current
    if(amount === 0) return
    pendingRef.current = 0

    try {
      const res = await fetch("/api/counter/increment", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({amount})
      })
      if(!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
      toast(`+${amount} saved!`, {description: "Counter synced to database"})
    } catch (error) {
      pendingRef.current += amount
      setData((prev) => 
        prev
          ? {...prev, dailyCount: prev.dailyCount - amount, totalCount: prev.totalCount - amount}
          : prev
      )
      toast("Synce failed", {description: "Will try on next flush"})
    }     
  }

  function scheduleMidnightReset() {
    const now = new Date()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - now.getTime()

    midnightTimerRef.current = setTimeout(async () => {
      await flushIncrement() //flush any pending befor reset
      await triggerReset() //add daily to total, reset daily to 0
      scheduleMidnightReset() //reschedule for nextmidnight
    }, msUntilMidnight)
  }

  async function triggerReset() {
    try {
      const res = await fetch("/api/counter/reset", {method: "POST"})
      if(!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
      toast("New day!", {description: "Daily count added to total and reset"})
    } catch (error) {
      toast("Reset failed", {description: "Could not reset daily count"})
    }
  }

  async function handleIncrement() {
    pendingRef.current += 1
      setData((prev) =>
        prev
          ? { ...prev, dailyCount: prev.dailyCount + 1, totalCount: prev.totalCount + 1 }
          : prev
      );
      if(!flushTimerRef.current) {
        scheduleFlush()
      }
      // const res = await fetch("/api/counter/increment", { method: "POST" });
      // if (!res.ok) throw new Error("Failed to increment");
      // const json = await res.json();
      // setData(json);
      // toast("Incremented!", {description: "Count updated successfully." });
  }

  // async function handleReset() {
  //   try {
  //     setReset(true);
  //     const res = await fetch("/api/counter/reset", { method: "POST" });
  //     if (!res.ok) throw new Error("Failed to reset");
  //     const json = await res.json();
  //     setData(json);
  //     toast("Daily reset!", {description: "Today's count has been reset to 0." });
  //   } catch (error) {
  //     toast("Error", {description: "Failed to reset."});
  //   } finally {
  //     setReset(false)
  //   }
  // }

  return (
    //  <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
    //   <Toaster />

    //   <h1 className="text-4xl font-bold tracking-tight mb-2">Counter</h1>
    //   <p className="text-zinc-400 text-sm mb-10">
    //     {data?.date ?? "Loading date..."}
    //   </p>

    //   {loading && (
    //     <p className="text-zinc-500 animate-pulse text-lg">Loading...</p>
    //   )}

    //   {error && (
    //     <p className="text-red-400 text-sm mb-4">{error}</p>
    //   )}

    //   {!loading && data && (
    //     <div className="grid grid-cols-2 gap-6 mb-10 w-full max-w-sm">
    //       <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
    //         <span className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Today</span>
    //         <span className="text-5xl font-bold tabular-nums">{data.dailyCount}</span>
    //       </div>
    //       <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
    //         <span className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Total</span>
    //         <span className="text-5xl font-bold tabular-nums">{data.totalCount}</span>
    //       </div>
    //     </div>
    //   )}

    //   {!loading && data && (
    //     <div className="flex flex-col gap-3 w-full max-w-sm">
    //       <Button
    //         onClick={handleIncrement}
    //         disabled={increment}
    //         className="w-full h-12 text-base bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl"
    //       >
    //         {increment ? "Incrementing..." : "+ Increment"}
    //       </Button>
    //       <Button
    //         onClick={handleReset}
    //         disabled={reset}
    //         variant="outline"
    //         className="w-full h-12 text-base border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl"
    //       >
    //         {reset ? "Resetting..." : "Reset Daily"}
    //       </Button>
    //     </div>
    //   )}
    // </main>

    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
      <Toaster />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Counter</h1>
      <p className="text-zinc-400 text-sm mb-10">{data?.date ?? "Loading date..."}</p>

      {loading && <p className="text-zinc-500 animate-pulse text-lg">Loading...</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {!loading && data && (
        <div className="grid grid-cols-2 gap-6 mb-10 w-full max-w-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
            <span className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Today</span>
            <span className="text-5xl font-bold tabular-nums">{data.dailyCount}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
            <span className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Total</span>
            <span className="text-5xl font-bold tabular-nums">{data.totalCount}</span>
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Button
            onClick={handleIncrement}
            className="w-full h-12 text-base bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl"
          >
            + Increment
          </Button>
        </div>
      )}
    </main>
  );
}

