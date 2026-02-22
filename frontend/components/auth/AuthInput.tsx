'use client'

import { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon
    error?: string
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    ({ icon: Icon, type, error, className = '', ...props }, ref) => {
        const [focused, setFocused] = useState(false)
        const [showPassword, setShowPassword] = useState(false)
        const isPassword = type === 'password'
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

        return (
            <div className="relative">
                <motion.div
                    animate={{
                        boxShadow: focused
                            ? '0 0 20px rgba(14, 165, 233, 0.15), 0 0 40px rgba(14, 165, 233, 0.05)'
                            : '0 0 0px rgba(14, 165, 233, 0)',
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-xl"
                >
                    {Icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            <Icon
                                size={16}
                                className={`transition-colors duration-300 ${focused ? 'text-cyan-400' : 'text-zinc-500'
                                    }`}
                            />
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={inputType}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className={`
              w-full h-12 rounded-xl text-sm text-white
              placeholder:text-zinc-500
              bg-white/[0.03] 
              border transition-all duration-300
              focus:outline-none
              ${focused
                                ? 'border-cyan-500/40 bg-white/[0.06]'
                                : 'border-white/[0.08] hover:border-white/[0.12]'}
              ${Icon ? 'pl-11' : 'pl-4'} 
              ${isPassword ? 'pr-11' : 'pr-4'}
              ${error ? 'border-red-500/50' : ''}
              ${className}
            `}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    )}
                </motion.div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 mt-1.5 pl-1"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        )
    }
)

AuthInput.displayName = 'AuthInput'
export default AuthInput
