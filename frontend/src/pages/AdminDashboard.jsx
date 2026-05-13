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
        const header = "ID_Subiect,Email,Puls_Control,Mișcare_Control,Puls_Distras,Mișcare_Distras,Somn(h),Telefon(h),Stres(1-10),SAS_Dependenta,Acc_Control,RT_Control,Scor_ML_Control,Acc_Distras,RT_Distras,Scor_ML_Distras\n";
        
        const rows = stats.map(s => {
            return `${s.user_id},${s.email},${s.pulse_normal||''},${s.move_normal||''},${s.pulse_distracted||''},${s.move_distracted||''},${s.sleep_hours||''},${s.phone_usage_hours||''},${s.stress_level||''},${s.sas_score||''},${s.acc_normal||''},${s.rt_normal||''},${s.prod_normal||''},${s.acc_distracted||''},${s.rt_distracted||''},${s.prod_distracted||''}`;
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
            <div className="max-w-[1600px] mx-auto bg-white rounded-3xl p-6 shadow-2xl border-4 border-[#8338ec]">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase text-[#8338ec]">Baza de Date Cercetare</h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/dashboard')} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition uppercase text-sm">
                            Înapoi la Dashboard
                        </button>
                        <button onClick={exportToCSV} className="bg-[#3a86ff] text-white px-6 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition uppercase text-sm">
                            Descarcă CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                        <thead>
                            <tr className="bg-gray-900 text-white uppercase text-xs tracking-wider text-center">
                                <th className="p-3 border-r border-gray-700">Subiect</th>
                                <th className="p-3 bg-[#7cb518]/30 border-r border-gray-700" colSpan="2">Bio Control</th>
                                <th className="p-3 bg-[#ff006e]/30 border-r border-gray-700" colSpan="2">Bio Distras</th>
                                <th className="p-3 bg-blue-900/40 border-r border-gray-700" colSpan="4">Profil Formular</th>
                                <th className="p-3 bg-[#7cb518]/20 border-r border-gray-700" colSpan="3">Teste & ML (Control)</th>
                                <th className="p-3 bg-[#ff006e]/20" colSpan="3">Teste & ML (Distras)</th>
                            </tr>
                            <tr className="bg-gray-100 text-gray-600 uppercase text-[10px] font-black border-b-2 border-gray-300 text-center">
                                <th className="p-2 border-r text-left">ID & Email</th>
                                
                                <th className="p-2">Puls</th>
                                <th className="p-2 border-r">Mișcare</th>
                                
                                <th className="p-2">Puls</th>
                                <th className="p-2 border-r">Mișcare</th>
                                
                                <th className="p-2">Somn</th>
                                <th className="p-2">Telefon</th>
                                <th className="p-2">Stres(1-10)</th>
                                <th className="p-2 border-r text-blue-600">SAS-SV</th>
                                
                                <th className="p-2">Acc</th>
                                <th className="p-2">Timp R.</th>
                                <th className="p-2 border-r">Scor ML</th>
                                
                                <th className="p-2">Acc</th>
                                <th className="p-2">Timp R.</th>
                                <th className="p-2">Scor ML</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-center">
                                    <td className="p-2 border-r text-gray-800 text-left">
                                        #{row.user_id} <span className="text-xs font-normal text-gray-500 block">{row.email}</span>
                                    </td>
                                    
                                    <td className="p-2 text-[#7cb518]">{row.pulse_normal ? `${row.pulse_normal}` : '-'}</td>
                                    <td className="p-2 border-r text-gray-500">{row.move_normal || '-'}</td>
                                    
                                    <td className="p-2 text-[#ff006e]">{row.pulse_distracted ? `${row.pulse_distracted}` : '-'}</td>
                                    <td className="p-2 border-r text-gray-500">{row.move_distracted || '-'}</td>
                                    
                                    <td className="p-2">{row.sleep_hours ? `${row.sleep_hours}h` : '-'}</td>
                                    <td className="p-2">{row.phone_usage_hours ? `${row.phone_usage_hours}h` : '-'}</td>
                                    <td className="p-2 text-orange-500">{row.stress_level || '-'}</td>
                                    <td className="p-2 border-r font-black text-blue-600">{row.sas_score || '-'}</td>
                                    
                                    {/* Control */}
                                    <td className="p-2 text-blue-600">{row.acc_normal ? `${row.acc_normal}%` : '-'}</td>
                                    <td className="p-2 text-gray-500">{row.rt_normal ? `${row.rt_normal}ms` : '-'}</td>
                                    <td className="p-2 font-black text-[#8338ec] border-r">{row.prod_normal || '-'}</td>

                                    {/* Distras */}
                                    <td className="p-2 text-red-600">{row.acc_distracted ? `${row.acc_distracted}%` : '-'}</td>
                                    <td className="p-2 text-gray-500">{row.rt_distracted ? `${row.rt_distracted}ms` : '-'}</td>
                                    <td className="p-2 font-black text-[#ff006e]">{row.prod_distracted || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
            </div>
        </div>
    );
}