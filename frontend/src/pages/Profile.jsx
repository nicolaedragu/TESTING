import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const navigate = useNavigate();
    
    // Inițializare cu valori goale, vor fi setate din localStorage în useEffect
    const [profileData, setProfileData] = useState({
        sleep_hours: 7,
        phone_usage_hours: 4,
        stress_level: 5
    });

    // Stări pentru a stoca rezultatele biometrice aduse din backend
    const [normalBiometrics, setNormalBiometrics] = useState(null);
    const [distractedBiometrics, setDistractedBiometrics] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Încărcăm datele salvate local pentru formular
    useEffect(() => {
        const savedData = localStorage.getItem('userProfileData');
        if (savedData) {
            try {
                setProfileData(JSON.parse(savedData));
            } catch (e) {
                console.error("Eroare la parsarea datelor din localStorage", e);
            }
        }
    }, []);

    // 2. Aducem datele biometrice din PostgreSQL (pentru utilizatorul curent)
    useEffect(() => {
        const fetchBiometrics = async () => {
            try {
                const response = await fetch('http://localhost:5000/biometrics/user', {
                    headers: { 'token': localStorage.getItem('token') }
                });
                if (response.ok) {
                    const data = await response.json();
                    
                    // Separăm datele în funcție de coloana is_distracted (pe care o vom crea)
                    const normal = data.find(item => item.is_distracted === false);
                    const distracted = data.find(item => item.is_distracted === true);
                    
                    if (normal) setNormalBiometrics(normal);
                    if (distracted) setDistractedBiometrics(distracted);
                }
            } catch (err) {
                console.error("Eroare la încărcarea biometricelor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBiometrics();
    }, []);

    const handleChange = (e) => {
        // Când se modifică formularul, updatăm starea și localStorage INSTANT
        const updatedData = { ...profileData, [e.target.name]: Number(e.target.value) };
        setProfileData(updatedData);
        localStorage.setItem('userProfileData', JSON.stringify(updatedData));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Nu mai e nevoie de salvare aici, o facem onChange
        console.log("Date profil pregătite pentru ML:", profileData);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-8 relative">
            <div className="max-w-4xl bg-white p-10 rounded-2xl shadow-2xl border-4 border-[#3a86ff] w-full grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Partea Stângă: Formularul de Profil */}
                <div>
                    <h1 className="text-3xl font-black text-[#8338ec] mb-2 uppercase tracking-tight">Profil Utilizator</h1>
                    <p className="text-gray-500 font-semibold mb-8 text-sm leading-relaxed">
                        Te rugăm să completezi următoarele date. Acestea vor fi utilizate pentru algoritmul de predicție a concentrării. Ele sunt salvate anonim.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Ore de Somn */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                            <label className="block text-sm font-black text-[#3a86ff] uppercase tracking-wider mb-2">
                                Ore de somn (noaptea trecută): <span className="text-[#8338ec]">{profileData.sleep_hours} ore</span>
                            </label>
                            <input 
                                type="range" name="sleep_hours" min="0" max="15" step="0.5" 
                                value={profileData.sleep_hours} onChange={handleChange}
                                className="w-full accent-[#3a86ff] cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 font-bold mt-1 uppercase">
                                <span>0 ore</span>
                                <span>15 ore</span>
                            </div>
                        </div>

                        {/* Ore pe Telefon */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                            <label className="block text-sm font-black text-[#3a86ff] uppercase tracking-wider mb-2">
                                Ore pe telefon zilnic (medie): <span className="text-[#8338ec]">{profileData.phone_usage_hours} ore</span>
                            </label>
                            <input 
                                type="range" name="phone_usage_hours" min="0" max="15" step="0.5" 
                                value={profileData.phone_usage_hours} onChange={handleChange}
                                className="w-full accent-[#3a86ff] cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 font-bold mt-1 uppercase">
                                <span>0 ore</span>
                                <span>15 ore</span>
                            </div>
                        </div>

                        {/* Nivel de Stres */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                            <label className="block text-sm font-black text-[#3a86ff] uppercase tracking-wider mb-2">
                                Nivel de stres acum (1-10): <span className="text-[#8338ec]">{profileData.stress_level}</span>
                            </label>
                            <input 
                                type="range" name="stress_level" min="1" max="10" 
                                value={profileData.stress_level} onChange={handleChange}
                                className="w-full accent-[#3a86ff] cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 font-bold mt-1 uppercase">
                                <span>Relaxat</span>
                                <span>Stresat</span>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-[#3a86ff] text-white py-4 rounded-xl font-black uppercase text-xl hover:scale-105 transition shadow-xl mt-6 border-2 border-[#8338ec]">
                            MERGI LA DASHBOARD
                        </button>
                    </form>
                </div>

                {/* Partea Dreaptă: Analiza Biometrică Comparativă */}
                <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
                    <h2 className="text-2xl font-black text-gray-800 mb-6 uppercase border-b-2 border-gray-200 pb-2">Analiza Fiziologică</h2>
                    
                    {loading ? (
                        <div className="flex-grow flex items-center justify-center text-gray-500 font-bold">Se încarcă datele...</div>
                    ) : (
                        <div className="space-y-6 flex-grow">
                            
                            {/* Card Mediu Normal */}
                            <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500 relative">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">Mediu normal</h3>
                                {normalBiometrics ? (
                                    <div className="flex justify-between">
                                        <div className="text-center">
                                            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Puls Mediu</p>
                                            <p className="text-2xl font-black text-gray-800">{normalBiometrics.avg_pulse} <span className="text-sm font-bold text-red-500">BPM</span></p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Nivel Mișcare</p>
                                            <p className="text-2xl font-black text-gray-800">{normalBiometrics.avg_movement} <span className="text-sm font-bold text-red-500">din 10</span></p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm font-medium italic">Fără date încărcate. Le vei vedea când încarci primul fișier CSV în Dashboard.</p>
                                )}
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500 relative">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">Mediu experimental (cu Notificări)</h3>
                                {distractedBiometrics ? (
                                    <div className="flex justify-between">
                                        <div className="text-center">
                                            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Puls Mediu</p>
                                            <p className="text-2xl font-black text-gray-800">{distractedBiometrics.avg_pulse} <span className="text-sm font-bold text-red-500">BPM</span></p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Nivel Mișcare</p>
                                            <p className="text-2xl font-black text-gray-800">{distractedBiometrics.avg_movement} <span className="text-sm font-bold text-red-500">din 10</span></p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm font-medium italic">Fără date încărcate. Le vei vedea când încarci al doilea fișier CSV în Dashboard.</p>
                                )}
                            </div>

                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}