import { useState, useEffect } from 'react';
import { Users, Loader2, Mail, Phone, Calendar, IdCard, ExternalLink, X, MapPin, GraduationCap, Briefcase, Code, FileText, Download, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [memberDetail, setMemberDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/admin/members');
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetail = async (id) => {
    setDetailLoading(true);
    setSelectedMemberId(id);
    try {
      const res = await api.get(`/api/admin/members/${id}`);
      setMemberDetail(res.data);
    } catch (err) {
      console.error('Failed to fetch member details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Members</h1>
          <p style={{ fontSize: 16, color: '#737373', margin: 0 }}>View and manage registered portal members.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        {members.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Community</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Membership ID</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{member.first_name} {member.last_name}</div>
                      <div style={{ fontSize: 13, color: '#737373' }}>ID: {member.id.substring(0, 8)}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#525252', marginBottom: 4 }}>
                        <Mail size={14} color="#A3A3A3" /> {member.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#525252' }}>
                        <Phone size={14} color="#A3A3A3" /> {member.phone}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ padding: '4px 10px', background: '#F5F5F5', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                        {member.community || 'Not Set'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      {member.member_id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 700, fontSize: 14 }}>
                          <IdCard size={18} /> {member.member_id}
                        </div>
                      ) : (
                        <div style={{ color: '#DC2626', fontWeight: 600, fontSize: 14, fontStyle: 'italic' }}>
                          No ID Card
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <button 
                        onClick={() => fetchMemberDetail(member.id)}
                        style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #E5E5E5', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        View Details <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#737373' }}>
            <Users size={48} color="#D4D4D4" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>No members found.</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedMemberId && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMemberId(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: 'relative', width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: 24, boxShadow: '0 25px 80px rgba(0,0,0,0.4)', padding: 0 }}>
              
              {detailLoading ? (
                <div style={{ padding: 100, textAlign: 'center' }}>
                  <Loader2 size={40} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#737373', fontWeight: 600 }}>Fetching profile details...</p>
                </div>
              ) : memberDetail && (
                <>
                  {/* Header */}
                  <div style={{ padding: '32px 40px', background: 'linear-gradient(135deg, #1A1A1A, var(--color-primary))', color: 'white', position: 'relative' }}>
                    <button onClick={() => setSelectedMemberId(null)} style={{ position: 'absolute', top: 24, right: 24, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={20} />
                    </button>
                    <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{memberDetail.member.first_name} {memberDetail.member.last_name}</h2>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                        <Mail size={16} /> {memberDetail.member.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                        <Phone size={16} /> {memberDetail.member.phone}
                      </div>
                      {memberDetail.member.member_id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--color-gold)' }}>
                          <IdCard size={16} /> {memberDetail.member.member_id}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                      
                      {/* Membership ID Card Section */}
                      <section style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IdCard size={20} color="white" />
                          </div>
                          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1A1A1A', margin: 0 }}>Membership Status</h3>
                        </div>
                        
                        {memberDetail.member.member_id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div style={{ flex: 1, background: 'white', border: '1px solid #A7F3D0', padding: 16, borderRadius: 12, borderLeft: '6px solid #10B981' }}>
                              <p style={{ fontSize: 13, color: '#047857', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>Verified ID</p>
                              <p style={{ fontSize: 20, fontWeight: 900, color: '#064E3B', margin: 0 }}>{memberDetail.member.member_id}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px' }}>Community</p>
                              <p style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>{memberDetail.member.community || 'Not Provided'}</p>
                            </div>
                          </div>
                        ) : (
                          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 16, borderRadius: 12, borderLeft: '6px solid #EF4444' }}>
                            <p style={{ fontSize: 15, color: '#991B1B', fontWeight: 700, margin: 0 }}>ID Card Not Generated</p>
                            <p style={{ fontSize: 13, color: '#B91C1C', margin: '4px 0 0' }}>This member has not completed their membership profile yet.</p>
                          </div>
                        )}
                      </section>
                      {memberDetail.jobProfile ? (
                        <>
                          {/* Address */}
                          <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin size={18} color="#0EA5E9" />
                              </div>
                              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Location & Address</h3>
                            </div>
                            <p style={{ fontSize: 15, color: '#525252', lineHeight: 1.6, margin: 0 }}>
                              {memberDetail.jobProfile.address_line1}<br />
                              {memberDetail.jobProfile.address_line2 && <>{memberDetail.jobProfile.address_line2}<br /></>}
                              {memberDetail.jobProfile.city}, {memberDetail.jobProfile.state} - {memberDetail.jobProfile.postal_code}<br />
                              {memberDetail.jobProfile.country}
                            </p>
                          </section>

                          {/* Education */}
                          <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={18} color="#22C55E" />
                              </div>
                              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Education</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              {memberDetail.jobProfile.education?.map((edu, idx) => (
                                <div key={idx} style={{ padding: 16, borderRadius: 12, border: '1px solid #F0F0F0' }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{edu.institute_name}</div>
                                  <div style={{ fontSize: 14, color: '#737373' }}>{edu.degree} in {edu.area_of_study}</div>
                                  <div style={{ fontSize: 13, color: '#A3A3A3', marginTop: 4 }}>
                                    Graduated: {edu.graduation_year} | {edu.grade_type === 'cgpa' ? `CGPA: ${edu.grade_value}` : `${edu.grade_value}%`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Experience */}
                          <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Briefcase size={18} color="#F97316" />
                              </div>
                              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Work Experience</h3>
                            </div>
                            <div style={{ fontSize: 14, color: '#737373', marginBottom: 16 }}>Total Experience: <b>{memberDetail.jobProfile.work_experience_years} Years</b></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              {memberDetail.jobProfile.work_history?.map((work, idx) => (
                                <div key={idx} style={{ padding: 16, borderRadius: 12, border: '1px solid #F0F0F0' }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{work.job_title} at {work.company_name}</div>
                                  <div style={{ fontSize: 14, color: '#737373' }}>{work.employment_type} | {work.start_month} {work.start_year} - {work.is_current ? 'Present' : `${work.end_month} ${work.end_year}`}</div>
                                  {work.responsibilities && <p style={{ fontSize: 13, color: '#525252', marginTop: 8, whiteSpace: 'pre-line' }}>{work.responsibilities}</p>}
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Skills */}
                          <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Code size={18} color="#6366F1" />
                              </div>
                              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Skills</h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {memberDetail.jobProfile.skills?.map(skill => (
                                <span key={skill} style={{ padding: '6px 14px', background: '#F5F5F5', color: '#525252', borderRadius: 50, fontSize: 13, fontWeight: 600 }}>{skill}</span>
                              ))}
                            </div>
                          </section>

                          {/* Resume */}
                          <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={18} color="#EF4444" />
                              </div>
                              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Resume</h3>
                            </div>
                            {memberDetail.jobProfile.resume_url ? (
                              <a 
                                href={memberDetail.jobProfile.resume_url} 
                                target="_blank" rel="noopener noreferrer" 
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', background: '#F9FAFB', borderRadius: 16, border: '1.5px solid #E5E5E5', color: '#1A1A1A', fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}
                              >
                                <Download size={20} /> Download Resume ({memberDetail.jobProfile.resume_filename})
                              </a>
                            ) : (
                              <p style={{ color: '#737373', fontSize: 14, fontStyle: 'italic' }}>No resume uploaded.</p>
                            )}
                          </section>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertCircle size={32} color="#D4D4D4" />
                          </div>
                          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>Job Profile Incomplete</h3>
                          <p style={{ color: '#737373', maxWidth: 300, margin: '0 auto' }}>This member has not yet completed their professional job profile.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default Members;
