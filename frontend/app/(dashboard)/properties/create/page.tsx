'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Shield, Brain, CheckCircle2, AlertTriangle,
    XCircle, Loader2, MapPin, DollarSign, Text,
    Layers, Search, Check, Info, ArrowRight,
    Building2, Layout, Zap, Upload, Sparkles
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function CreatePropertyPage() {
    const router = useRouter()
    const { accessToken } = useAuthStore()

    // ─── Form State ──────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        latitude: '22.5726',
        longitude: '88.3639',
        kyc_verified: 1,
        registry_match: 1,
        ownership_match_score: 0.85,
        inside_kolkata: 1,
        duplicate_token: 0
    })

    // ─── Logic State ────────────────────────────────────────────────────────
    const [verifying, setVerifying] = useState(false)
    const [verificationReport, setVerificationReport] = useState<any>(null)
    const [pricing, setPricing] = useState(false)
    const [predictedPrice, setPredictedPrice] = useState<number | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // ─── Input Handler ──────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Reset verification if location or price changes (since they affect price/validity)
        if (['latitude', 'longitude', 'price'].includes(name)) {
            setVerificationReport(null)
            setPredictedPrice(null)
        }
    }

    const toggleCheck = (name: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: (prev as any)[name] === 1 ? 0 : (name === 'ownership_match_score' ? 0.85 : 1)
        }))
        setVerificationReport(null)
    }

    // ─── Verification Flow ──────────────────────────────────────────────────
    const handleVerify = async () => {
        if (!formData.title) return toast.error("Enter a title first")

        setVerifying(true)
        setVerificationReport(null)

        try {
            const data = await api.post('/verify-listing', {
                kyc_verified: Number(formData.kyc_verified),
                registry_match: Number(formData.registry_match),
                ownership_match_score: Number(formData.ownership_match_score),
                inside_kolkata: Number(formData.inside_kolkata),
                duplicate_token: Number(formData.duplicate_token)
            }, accessToken)

            setVerificationReport(data)
            if (data.is_verified) {
                toast.success("AI Verification Passed")
            } else {
                toast.error("Verification Blocked")
            }
        } catch (e: any) {
            toast.error(e.message || "Verification failed")
        } finally {
            setVerifying(false)
        }
    }

    // ─── AI Pricing Flow ─────────────────────────────────────────────────────
    const handleGetPrice = async () => {
        if (!verificationReport?.is_verified) return toast.error("Complete verification first")

        setPricing(true)
        try {
            const data = await api.post('/prediction/predict-price', {
                lat: parseFloat(formData.latitude),
                lng: parseFloat(formData.longitude)
            }, accessToken)

            setPredictedPrice(data.predicted_price)
            toast.success("AI Price Predicted")
        } catch (e: any) {
            toast.error(e.message || "Pricing engine failed")
        } finally {
            setPricing(false)
        }
    }

    // ─── Submission Flow ─────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!predictedPrice) return toast.error("Calculate AI price first")

        setSubmitting(true)
        try {
            await api.post('/properties', {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price) || predictedPrice * 1000, // Fallback to a sane value if price empty
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                predicted_price: predictedPrice,
                is_verified: true,
                images: [],
                features: ["AI Verified", "Kolkata Region"]
            }, accessToken)

            toast.success("Property uploaded successfully!")
            router.push('/portfolio')
        } catch (e: any) {
            toast.error(e.message || "Upload failed")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/[0.08]">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse" />
                        <span className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em]">Institutional Node Ingestion</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter text-gradient">Create New Asset</h1>
                        <p className="text-slate-400 mt-2 font-medium max-w-lg">
                            Submit your property for AI synthesis, verification, and on-chain valuation.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Core Form */}
                <div className="space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-white uppercase tracking-widest text-[10px] font-black">
                            <Layout size={16} className="text-cyan-400" />
                            Core Metadata
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Property Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Institutional Hub / Luxury Node"
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Summarize asset utility and market characteristics..."
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Latitude</label>
                                    <input
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        type="number" step="0.000001"
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Longitude</label>
                                    <input
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        type="number" step="0.000001"
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Verification Data (Simulation Inputs) */}
                    <section className="space-y-6 pt-4">
                        <div className="flex items-center gap-3 text-white uppercase tracking-widest text-[10px] font-black">
                            <Shield size={16} className="text-emerald-400" />
                            Verification Parameters
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { id: 'kyc_verified', label: 'KYC Verified' },
                                { id: 'registry_match', label: 'Registry Match' },
                                { id: 'inside_kolkata', label: 'Inside Kolkata' },
                                { id: 'duplicate_token', label: 'Unique Token', inverse: true },
                            ].map((check) => (
                                <button
                                    key={check.id}
                                    onClick={() => toggleCheck(check.id)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                                        (check.inverse ? (formData as any)[check.id] === 0 : (formData as any)[check.id] === 1)
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                            : "bg-white/[0.02] border-white/[0.08] text-slate-500 hover:border-white/20"
                                    )}
                                >
                                    <span className="text-[10px] font-black uppercase">{check.label}</span>
                                    {(check.inverse ? (formData as any)[check.id] === 0 : (formData as any)[check.id] === 1) ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase flex justify-between">
                                Ownership Match Score
                                <span>{Math.round(formData.ownership_match_score * 100)}%</span>
                            </label>
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={formData.ownership_match_score}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, ownership_match_score: parseFloat(e.target.value) }))
                                    setVerificationReport(null)
                                }}
                                className="w-full h-1 bg-white/[0.08] rounded-full appearance-none accent-emerald-500"
                            />
                        </div>
                    </section>
                </div>

                {/* Right: AI Intelligence Panel */}
                <div className="space-y-8">
                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/[0.06] bg-[#0A0E17]/80 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <Brain size={24} className="text-cyan-400" />
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Intelligence Engine</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Automated Asset Verification</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-8">
                            {/* Verification Block */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleVerify}
                                    disabled={verifying}
                                    className="w-full py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {verifying ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                                    {verifying ? 'Scanning Registry...' : 'Trigger AI Verification'}
                                </button>

                                <AnimatePresence mode="wait">
                                    {verificationReport && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className={cn(
                                                "p-5 rounded-2xl border flex flex-col gap-4",
                                                verificationReport.is_verified
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : "bg-rose-500/5 border-rose-500/20"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {verificationReport.is_verified ? <CheckCircle2 size={20} className="text-emerald-400" /> : <XCircle size={20} className="text-rose-400" />}
                                                    <span className={cn("text-xs font-black uppercase tracking-widest", verificationReport.is_verified ? "text-emerald-400" : "text-rose-400")}>
                                                        {verificationReport.label}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-bold opacity-50">{verificationReport.timestamp.split('T')[0]}</span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {Object.entries(verificationReport.checks).map(([key, check]: [string, any]) => (
                                                    <div key={key} className="flex items-center justify-between text-[10px]">
                                                        <span className="text-slate-500 font-bold">{key}</span>
                                                        <span className={cn("font-black uppercase tracking-widest", check.status === 'PASS' ? "text-emerald-500" : "text-rose-500")}>
                                                            {check.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Pricing Block */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleGetPrice}
                                    disabled={pricing || !verificationReport?.is_verified}
                                    className="w-full py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
                                >
                                    {pricing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                    {pricing ? 'Predicting Market...' : 'Synthesize AI Price'}
                                </button>

                                <AnimatePresence>
                                    {predictedPrice && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-6 rounded-3xl bg-gradient-to-br from-cyan-600/20 to-blue-700/20 border border-cyan-500/30 text-center space-y-2 relative overflow-hidden"
                                        >
                                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-400/10 blur-3xl rounded-full" />
                                            <p className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em]">Market Price Index (Per Sq.Ft)</p>
                                            <p className="text-4xl font-black text-white tracking-tighter">₹{predictedPrice.toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] font-bold text-slate-500 italic">Confidence Rating: 98.4% — Neural Sync Active</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Final Submission */}
                        <div className="mt-8 pt-8 border-t border-white/[0.06]">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !predictedPrice}
                                className="w-full py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.3em] hover:bg-cyan-400 hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                {submitting ? 'Initializing Node...' : 'Commit Asset to Network'}
                            </button>
                            <p className="text-[9px] text-center text-slate-600 font-bold mt-4 uppercase tracking-widest">
                                By committing, you verify this data is accurate per the Intelligence Engine guidelines.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
