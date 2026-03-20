import React from 'react';

// Base skeleton element with shimmer
export function SkeletonLine({ width = '100%', height = '14px', radius = '6px', style = {} }) {
    return (
        <div className="skeleton-shimmer" style={{ width, height, borderRadius: radius, ...style }} />
    );
}

// Card skeleton for grid layouts
export function SkeletonCard({ height = '200px', style = {} }) {
    return (
        <div className="glass-panel skeleton-shimmer" style={{ height, padding: '1.5rem', ...style }}>
            <SkeletonLine width="40%" height="12px" style={{ marginBottom: '1rem' }} />
            <SkeletonLine width="75%" height="16px" style={{ marginBottom: '0.8rem' }} />
            <SkeletonLine width="60%" height="12px" style={{ marginBottom: '0.6rem' }} />
            <SkeletonLine width="50%" height="12px" />
        </div>
    );
}

// Table skeleton rows
export function SkeletonTableRows({ rows = 5, cols = 5 }) {
    return Array.from({ length: rows }).map((_, r) => (
        <tr key={r} style={{ borderBottom: '1px solid var(--glass-border)' }}>
            {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: '1rem' }}>
                    <SkeletonLine width={c === 0 ? '60%' : c === cols - 1 ? '50%' : '80%'} height="14px" />
                </td>
            ))}
        </tr>
    ));
}

// Stat card skeleton
export function SkeletonStatCard({ style = {} }) {
    return (
        <div className="glass-panel" style={{ padding: '2rem', ...style }}>
            <SkeletonLine width="50%" height="12px" style={{ marginBottom: '1rem' }} />
            <SkeletonLine width="30%" height="36px" style={{ marginBottom: '0.5rem' }} />
            <SkeletonLine width="40%" height="12px" />
        </div>
    );
}

// Full page skeleton with sidebar placeholder
export function PageSkeleton({ children }) {
    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg-dark)', overflow: 'hidden' }}>
            {/* Sidebar skeleton */}
            <div className="glass-panel" style={{
                width: '280px', height: '100vh', padding: '2.5rem 1rem',
                display: 'flex', flexDirection: 'column',
                borderRadius: '0 24px 24px 0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none'
            }}>
                <div style={{ padding: '0 1rem', marginBottom: '3rem' }}>
                    <SkeletonLine width="140px" height="28px" style={{ marginBottom: '0.5rem' }} />
                    <SkeletonLine width="100px" height="14px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonLine key={i} width="100%" height="44px" radius="12px" />
                    ))}
                </div>
            </div>
            {/* Main content */}
            <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}

// Header skeleton
export function SkeletonHeader({ style = {} }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', ...style }}>
            <div>
                <SkeletonLine width="280px" height="28px" style={{ marginBottom: '0.5rem' }} />
                <SkeletonLine width="200px" height="14px" />
            </div>
            <SkeletonLine width="48px" height="48px" radius="50%" />
        </div>
    );
}

// Dashboard skeleton
export function DashboardSkeleton() {
    return (
        <PageSkeleton>
            <SkeletonHeader />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '200px' }}>
                    <SkeletonLine width="40%" height="18px" style={{ marginBottom: '1.5rem' }} />
                    <SkeletonLine width="90%" height="14px" style={{ marginBottom: '0.8rem' }} />
                    <SkeletonLine width="80%" height="14px" style={{ marginBottom: '0.8rem' }} />
                    <SkeletonLine width="70%" height="14px" />
                </div>
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '200px' }}>
                    <SkeletonLine width="40%" height="18px" style={{ marginBottom: '1.5rem' }} />
                    <SkeletonLine width="85%" height="14px" style={{ marginBottom: '0.8rem' }} />
                    <SkeletonLine width="75%" height="14px" style={{ marginBottom: '0.8rem' }} />
                    <SkeletonLine width="65%" height="14px" />
                </div>
            </div>
        </PageSkeleton>
    );
}

// Table page skeleton (for CourseManagement, StudentManagement, etc.)
export function TablePageSkeleton({ cols = 6 }) {
    return (
        <PageSkeleton>
            <SkeletonHeader />
            <div className="glass-panel" style={{ padding: '2.5rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <SkeletonLine width="120px" height="20px" />
                    <SkeletonLine width="160px" height="40px" radius="10px" />
                </div>
                <div style={{ background: 'var(--color-bg-light)', borderRadius: '12px', padding: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <SkeletonTableRows rows={6} cols={cols} />
                        </tbody>
                    </table>
                </div>
            </div>
        </PageSkeleton>
    );
}

// Card grid skeleton (for Enrollment page)
export function CardGridSkeleton({ cards = 6 }) {
    return (
        <PageSkeleton>
            <SkeletonHeader style={{ marginBottom: '2rem' }} />
            <SkeletonLine width="100%" height="48px" radius="50px" style={{ marginBottom: '2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {Array.from({ length: cards }).map((_, i) => (
                    <SkeletonCard key={i} height="280px" />
                ))}
            </div>
        </PageSkeleton>
    );
}

// My Courses skeleton
export function MyCoursesPageSkeleton() {
    return (
        <PageSkeleton>
            <SkeletonHeader style={{ marginBottom: '1.5rem' }} />
            <div className="glass-panel" style={{ padding: '1.2rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem' }}>
                <SkeletonLine width="44px" height="44px" radius="12px" />
                <SkeletonLine width="40px" height="24px" />
                <SkeletonLine width="60px" height="14px" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3].map(i => <SkeletonLine key={i} width="120px" height="40px" radius="0" />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-panel" style={{ padding: '1.2rem 1.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <SkeletonLine width="200px" height="16px" style={{ marginBottom: '0.5rem' }} />
                            <SkeletonLine width="300px" height="12px" />
                        </div>
                        <SkeletonLine width="80px" height="28px" radius="6px" />
                        <SkeletonLine width="60px" height="28px" radius="6px" />
                    </div>
                ))}
            </div>
        </PageSkeleton>
    );
}

// Grades page skeleton
export function GradesPageSkeleton() {
    return (
        <PageSkeleton>
            <SkeletonHeader style={{ marginBottom: '1.5rem' }} />
            <div className="glass-panel" style={{ padding: '1.2rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <SkeletonLine width="44px" height="44px" radius="12px" />
                    <SkeletonLine width="100px" height="14px" />
                    <SkeletonLine width="50px" height="28px" />
                </div>
                <SkeletonLine width="140px" height="36px" radius="10px" />
            </div>
            {[1, 2].map(i => (
                <div key={i} className="glass-panel" style={{ marginBottom: '1.5rem', overflow: 'hidden', borderRadius: '16px' }}>
                    <SkeletonLine width="100%" height="44px" radius="0" />
                    <div style={{ padding: '1rem' }}>
                        <SkeletonTableRows rows={3} cols={4} />
                    </div>
                </div>
            ))}
        </PageSkeleton>
    );
}

// Settings page skeleton
export function SettingsPageSkeleton() {
    return (
        <PageSkeleton>
            <SkeletonHeader />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <SkeletonLine width="40%" height="20px" style={{ marginBottom: '2rem' }} />
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                        <SkeletonLine width="100px" height="100px" radius="50%" />
                        <div>
                            <SkeletonLine width="120px" height="16px" style={{ marginBottom: '0.5rem' }} />
                            <SkeletonLine width="100px" height="32px" radius="8px" />
                        </div>
                    </div>
                    <SkeletonLine width="100%" height="80px" radius="8px" style={{ marginBottom: '1.5rem' }} />
                    <SkeletonLine width="100%" height="40px" radius="8px" />
                </div>
                <div className="glass-panel" style={{ padding: '2.5rem', alignSelf: 'start' }}>
                    <SkeletonLine width="40%" height="20px" style={{ marginBottom: '2rem' }} />
                    <SkeletonLine width="100%" height="40px" radius="8px" style={{ marginBottom: '1.5rem' }} />
                    <SkeletonLine width="100%" height="40px" radius="8px" style={{ marginBottom: '1.5rem' }} />
                    <SkeletonLine width="100%" height="40px" radius="8px" />
                </div>
            </div>
        </PageSkeleton>
    );
}

// StudyPath skeleton
export function StudyPathSkeleton() {
    return (
        <PageSkeleton>
            <div style={{ minWidth: 'fit-content' }}>
                <SkeletonHeader style={{ marginBottom: '2rem' }} />
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <SkeletonLine key={i} width={`${i === 1 ? 480 : i === 2 ? 480 : 240}px`} height="40px" radius="12px" />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {[1, 2, 3, 4, 5, 6].map(sem => (
                        <div key={sem} style={{ minWidth: '240px', flex: 1 }}>
                            <SkeletonLine width="100%" height="36px" radius="8px" style={{ marginBottom: '1.5rem' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {[1, 2, 3].map(c => (
                                    <SkeletonCard key={c} height="160px" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageSkeleton>
    );
}

// Professor pages skeletons
export function ProfessorDashboardSkeleton() {
    return (
        <PageSkeleton>
            <SkeletonHeader />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '180px' }}>
                    <SkeletonLine width="40%" height="18px" style={{ marginBottom: '1rem' }} />
                    <SkeletonLine width="90%" height="50px" radius="12px" style={{ marginBottom: '0.8rem' }} />
                    <SkeletonLine width="90%" height="50px" radius="12px" />
                </div>
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '180px' }}>
                    <SkeletonLine width="40%" height="18px" style={{ marginBottom: '1rem' }} />
                    <SkeletonLine width="90%" height="50px" radius="12px" style={{ marginBottom: '0.8rem' }} />
                    <SkeletonLine width="90%" height="50px" radius="12px" />
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '2.5rem', minHeight: '250px' }}>
                <SkeletonLine width="30%" height="20px" style={{ marginBottom: '2rem' }} />
                <SkeletonLine width="100%" height="180px" radius="16px" />
            </div>
        </PageSkeleton>
    );
}

export function ProfessorCoursesPageSkeleton() {
    return (
        <PageSkeleton>
            <SkeletonHeader />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3].map(i => (
                    <SkeletonCard key={i} height="220px" />
                ))}
            </div>
        </PageSkeleton>
    );
}

export function ProfessorClassDetailsSkeleton() {
    return (
        <PageSkeleton>
            <SkeletonHeader />
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '3rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <SkeletonTableRows rows={5} cols={5} />
                    </tbody>
                </table>
            </div>
            <SkeletonLine width="200px" height="24px" style={{ marginBottom: '1.5rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '200px' }}>
                    <SkeletonLine width="60%" height="16px" style={{ marginBottom: '1rem' }} />
                    <SkeletonLine width="100%" height="36px" radius="8px" style={{ marginBottom: '1rem' }} />
                    <SkeletonLine width="100%" height="80px" radius="8px" style={{ marginBottom: '1rem' }} />
                    <SkeletonLine width="100%" height="40px" radius="8px" />
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '200px' }}>
                    <SkeletonLine width="60%" height="16px" style={{ marginBottom: '1rem' }} />
                    <SkeletonLine width="100%" height="60px" radius="12px" style={{ marginBottom: '0.8rem' }} />
                    <SkeletonLine width="100%" height="60px" radius="12px" />
                </div>
            </div>
        </PageSkeleton>
    );
}
