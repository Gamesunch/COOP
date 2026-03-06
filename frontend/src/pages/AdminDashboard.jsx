import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function AdminDashboard({ user, token, adminPhase, setAdminPhase }) {
    const [demandData, setDemandData] = useState([]);
    const [confirmPhaseModal, setConfirmPhaseModal] = useState({ show: false, newPhase: null });
    const [stats, setStats] = useState({ totalCourses: 0, overSubscribed: 0 });

    useEffect(() => {
        const fetchDemand = async () => {
            try {
                const demandRes = await fetch('http://localhost:5000/api/admin/demand', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (demandRes.ok) {
                    const data = await demandRes.json();
                    setDemandData(data);

                    let overSubscribedCount = 0;
                    data.forEach(course => {
                        if (parseInt(course.pre_enrolled_count) > parseInt(course.capacity)) {
                            overSubscribedCount++;
                        }
                    });

                    setStats({
                        totalCourses: data.length,
                        overSubscribed: overSubscribedCount
                    });
                }
            } catch (error) {
                console.error("Failed to fetch demand data", error);
            }
        };
        fetchDemand();
    }, [token]);

    const executePhaseChange = async () => {
        const { newPhase } = confirmPhaseModal;
        if (!newPhase) return;

        setAdminPhase(newPhase);
        await fetch('http://localhost:5000/api/admin/phase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ phase: newPhase })
        });

        setConfirmPhaseModal({ show: false, newPhase: null });
        window.location.reload();
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', paddingBottom: '2rem' }}>

            {/* Admin Stats Cards */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.8rem' }}>
                <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Courses</h3>
                <div style={{ fontSize: '3.2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1 }} className="text-gradient">{stats.totalCourses}</div>
                <p style={{ fontSize: '0.95rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '20px' }}>Active</span> In Database
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.8rem' }}>
                <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Phase</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2, color: 'var(--color-primary)' }}>
                    {adminPhase === 'PRE_ENROLLMENT' ? 'Pre-Enroll' : (adminPhase === 'ENROLLMENT' ? 'Active' : 'Closed')}
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    System Enrollment State
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.8rem', background: stats.overSubscribed > 0 ? 'rgba(239, 68, 68, 0.9)' : 'var(--color-primary-dark)', color: 'white', border: 'none' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Oversubscribed</h3>
                <div style={{ fontSize: '3.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white', lineHeight: 1 }}>{stats.overSubscribed}</div>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>Courses Need Capacity Review</p>
            </motion.div>

            {/* Admin Panel Controls Core */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', border: '1px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-primary)' }}>Faculty & Admin Controls</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Manage enrollment phases and view course demand analytics</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Modify Settings Phase:</span>
                        <select
                            value={adminPhase}
                            onChange={(e) => {
                                const newPhase = e.target.value;
                                setConfirmPhaseModal({ show: true, newPhase });
                            }}
                            style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'var(--color-bg-light)', color: 'var(--color-text)', border: '1px solid var(--glass-border)', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                            <option value="PRE_ENROLLMENT">Pre-Enrollment</option>
                            <option value="ENROLLMENT">Active Enrollment</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>

                <h4 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>Course Demand Tracking</h4>
                <div style={{ overflowX: 'auto', background: 'var(--color-bg-light)', borderRadius: '12px', padding: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.8rem' }}>Course</th>
                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Capacity</th>
                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Pre-Enrolled</th>
                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Waitlisted</th>
                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Officially Enrolled</th>
                                {/* Changed Action to suggest future course management */}
                                <th style={{ padding: '0.8rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demandData.map(course => {
                                const c_cap = parseInt(course.capacity);
                                const pre_en = parseInt(course.pre_enrolled_count);
                                const isBottleneck = pre_en > c_cap;
                                return (
                                    <tr key={course.id} style={{ borderBottom: '1px solid var(--glass-border)', background: isBottleneck ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                                        <td style={{ padding: '0.8rem', fontWeight: 600 }}>{course.code} - {course.name}</td>
                                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>{course.capacity}</td>
                                        <td style={{ padding: '0.8rem', textAlign: 'center', color: isBottleneck ? '#ef4444' : 'var(--color-text)', fontWeight: isBottleneck ? 700 : 500 }}>
                                            {course.pre_enrolled_count} {isBottleneck && '⚠️'}
                                        </td>
                                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>{course.waitlisted_count}</td>
                                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>{course.enrolled_count}</td>
                                        <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                                            <button
                                                onClick={async () => {
                                                    const newCap = prompt(`Enter new capacity for ${course.code} (Current: ${course.capacity}):`, course.capacity);
                                                    if (newCap && !isNaN(newCap)) {
                                                        await fetch(`http://localhost:5000/api/admin/courses/${course.id}/capacity`, {
                                                            method: 'PUT',
                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                            body: JSON.stringify({ capacity: parseInt(newCap) })
                                                        });

                                                        // Refresh demand data
                                                        const demandRes = await fetch('http://localhost:5000/api/admin/demand', { headers: { 'Authorization': `Bearer ${token}` } });
                                                        if (demandRes.ok) {
                                                            setDemandData(await demandRes.json());
                                                        }
                                                    }
                                                }}
                                                style={{ padding: '0.4rem 0.8rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                Edit Cap
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Confirmation Modal for Phase Change */}
            {confirmPhaseModal.show && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel"
                        style={{ padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Settings size={30} color="#ef4444" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>Confirm Phase Change</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Are you sure you want to change the enrollment phase to <strong>{confirmPhaseModal.newPhase}</strong>? This might trigger automatic waitlist enrollments and change what students see.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" onClick={() => setConfirmPhaseModal({ show: false, newPhase: null })}
                                style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-text)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                                Cancel
                            </button>
                            <button className="btn" onClick={executePhaseChange}
                                style={{ flex: 1, padding: '0.8rem', background: '#ef4444', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
