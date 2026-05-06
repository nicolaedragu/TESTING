import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/admin/stats', {
                    headers: { token: localStorage.getItem('token') }
                });
                
                if (!res.ok) {
                    alert("Acces refuzat sau eroare server!");
                    navigate('/dashboard');
                    return;
                }
                
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Eroare:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [navigate]);

    const exportToCSV = () => {
        const header = "ID_Subiect,Email,Puls_Control,Puls_Distras,Miscare_Control,Miscare_Distras,Somn(h),Telefon(h),Stres(1-10),Acuratete_Teste(%),TimpReac_Mediu(ms),Productivitate_Estimata\n";
        
        const rows = stats.map(s => {
            return `${s.user_id},${s.email},${s.pulse_normal || 'N/A'},${s.pulse_distracted || 'N/A'},${s.move_normal || 'N/A'},${s.move_distracted || 'N/A'},${s.sleep_hours || 'N/A'},${s.phone_usage_hours || 'N/A'},${s.stress_level || 'N/A'},${s.accuracy || 'N/A'},${s.reaction_time || 'N/A'},${s.productivity_score || 'N/A'}`;
        }).join("\n");
        
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'date_centrale_licenta.csv';
        a.click();
    };

    if (loading) return <div className="p-10 text-center font-bold">Se încarcă datele...</div>;

    return (
        <div className="p-4 sm:p-10 bg-[#f5f5f5] min-h-screen">
            <div className="max-w-[1400px] mx-auto bg-white rounded-3xl p-6 shadow-2xl border-4 border-[#8338ec]">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase text-[#8338ec]">Rezultatele testelor</h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Acest panou este vizibil doar pentru contul de administrator.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/dashboard')} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition uppercase text-sm">
                            Înapoi la Dashboard
                        </button>
                        <button onClick={exportToCSV} className="bg-[#3a86ff] text-white px-6 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition uppercase text-sm border-2 border-transparent">
                            Descarcă CSV cu toate rezultatele
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-gray-800 text-white uppercase text-xs tracking-wider">
                                <th className="p-4 border-r border-gray-700">Subiect</th>
                                <th className="p-4 bg-[#7cb518]/20 border-r border-gray-700 text-center" colSpan="2">Date Biometrice Control</th>
                                <th className="p-4 bg-[#ff006e]/20 border-r border-gray-700 text-center" colSpan="2">Date Biometrice Distras</th>
                                <th className="p-4 bg-blue-900/20 border-r border-gray-700 text-center" colSpan="3">Profil Formular</th>
                                <th className="p-4 bg-purple-900/20 text-center" colSpan="3">Rezultate Teste & ML</th>
                            </tr>
                            <tr className="bg-gray-100 text-gray-600 uppercase text-[10px] font-black border-b-2 border-gray-300">
                                <th className="p-3 border-r">ID & Email</th>
                                <th className="p-3">Puls</th>
                                <th className="p-3 border-r">Mișcare</th>
                                <th className="p-3">Puls</th>
                                <th className="p-3 border-r">Mișcare</th>
                                <th className="p-3">Somn</th>
                                <th className="p-3">Telefon</th>
                                <th className="p-3 border-r">Stres</th>
                                <th className="p-3">Acuratețe</th>
                                <th className="p-3">Timp Reac.</th>
                                <th className="p-3">Scor ML</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition text-sm font-semibold">
                                    <td className="p-3 border-r text-gray-800">
                                        #{row.user_id} <span className="text-xs font-normal text-gray-500 block">{row.email}</span>
                                    </td>
                                    
                                    {/* Control */}
                                    <td className="p-3 text-[#7cb518]">{row.pulse_normal ? `${row.pulse_normal} bpm` : '-'}</td>
                                    <td className="p-3 border-r text-gray-500">{row.move_normal || '-'}</td>
                                    
                                    {/* Distras */}
                                    <td className="p-3 text-[#ff006e]">{row.pulse_distracted ? `${row.pulse_distracted} bpm` : '-'}</td>
                                    <td className="p-3 border-r text-gray-500">{row.move_distracted || '-'}</td>
                                    
                                    {/* Profil */}
                                    <td className="p-3">{row.sleep_hours ? `${row.sleep_hours}h` : '-'}</td>
                                    <td className="p-3">{row.phone_usage_hours ? `${row.phone_usage_hours}h` : '-'}</td>
                                    <td className="p-3 border-r text-orange-500">{row.stress_level || '-'}</td>
                                    
                                    {/* Teste & ML */}
                                    <td className="p-3 text-blue-600">{row.accuracy ? `${row.accuracy}%` : '-'}</td>
                                    <td className="p-3 text-gray-500">{row.reaction_time ? `${row.reaction_time}ms` : '-'}</td>
                                    <td className="p-3 font-black text-xl text-[#8338ec]">
                                        {row.productivity_score || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
            </div>
        </div>
    );
}