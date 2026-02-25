'use client'

import AuthLayout from '@/components/auth/AuthLayout'
import AuthSuccess from '@/components/auth/AuthSuccess'

export default function SuccessPage() {
    return (
        <AuthLayout
            title="You're in!"
            subtitle="Your account has been verified successfully."
        >
            <AuthSuccess
                message="Authentication complete"
                redirectTo="/dashboard"
                redirectDelay={3000}
            />
        </AuthLayout>
    )
}
