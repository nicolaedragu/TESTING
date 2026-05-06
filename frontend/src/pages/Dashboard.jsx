import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const colors = [
    { name: 'GALBEN', hex: '#ffbe0b' },
    { name: 'PORTOCALIU', hex: '#fb5607' },
    { name: 'ROZ', hex: '#ff006e' },
    { name: 'MOV', hex: '#8338ec' },
    { name: 'ALBASTRU', hex: '#3a86ff' },
    { name: 'VERDE', hex: '#7cb518' }
];

export default function Dashboard() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [bioResults, setBioResults] = useState(null);
    
    const [isDistractedUpload, setIsDistractedUpload] = useState(false);    
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadStatus('');
    };

    const handleFileUpload = async () => {
        if (!file) {
            setUploadStatus('Selectează un fișier CSV.');
            return;
        }

        const formData = new FormData();
        formData.append('csvfile', file);
        formData.append('is_distracted', isDistractedUpload.toString());
        
        try {
            setUploadStatus('Se procesează...');
            const response = await fetch('http://localhost:5000/biometrics/upload', {
                method: 'POST',
                headers: {
                    'token': localStorage.getItem('token')
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('Date salvate cu succes în PROFIL!');
                setBioResults({ pulse: data.avg_pulse, movement: data.avg_movement, mode: data.is_distracted ? 'Experimental (Distras)' : 'Normal' });
            } else {
                setUploadStatus(`Eroare: ${data.message}`);
            }
        } catch (error) {
            setUploadStatus('Eroare de conexiune.');
        }
    };
    
    // Pentru predicție
    const [predictionResult, setPredictionResult] = useState(null);

const generateMLPrediction = async () => {
        const savedProfileStr = localStorage.getItem('userProfileData');
        
        if (!savedProfileStr) {
            alert("Te rog completează formularul de Profil mai întâi!");
            return;
        }

        const savedProfile = JSON.parse(savedProfileStr);

        const stroopAcc = Number(localStorage.getItem('realAccuracy'));
        const stroopRt = Number(localStorage.getItem('realReactionTime'));
        const cptAcc = Number(localStorage.getItem('cptAccuracy'));
        const cptRt = Number(localStorage.getItem('cptReactionTime'));

        let totalAcc = 0;
        let totalRt = 0;
        let testsCount = 0;

        if (stroopAcc > 0) { totalAcc += stroopAcc; totalRt += stroopRt; testsCount++; }
        if (cptAcc > 0) { totalAcc += cptAcc; totalRt += cptRt; testsCount++; }

        if (testsCount === 0) {
            alert("Trebuie să dai măcar Testul Stroop sau CPT ca să poți vedea scorul de productivitate!");
            return;
        }

        const payload = {
            sleep_hours: Number(savedProfile.sleep_hours),
            phone_usage_hours: Number(savedProfile.phone_usage_hours),
            stress_level: Number(savedProfile.stress_level),
            accuracy: Number((totalAcc / testsCount).toFixed(2)),
            reaction_time: Number((totalRt / testsCount).toFixed(2))
        };

        console.log("payload:", payload);

        try {
            const response = await fetch('http://localhost:5000/predict/productivity', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            if (response.ok) {
                setPredictionResult({...data, tests_used: testsCount});
            } else {
                alert("Eroare de la model: " + data.message);
            }
        } catch (error) {
            alert("Eroare la comunicarea cu serverul ML.");
        }
    };
    
    return (
        <div className="min-h-screen bg-[#ffffff] p-8 pb-32 relative">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">TESTING</h1>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => navigate('/admin')} 
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition shadow-md">
                                PANOU DE CERCETARE
                            </button>
                            
                            <button 
                                onClick={() => navigate('/profile')} 
                                className="bg-[#8338ec] text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition shadow-md">
                                PROFIL
                            </button>
                            <button 
                                onClick={handleLogout} 
                                className="bg-[#ff006e] text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition shadow-md">
                                DELOGARE
                            </button>
                        </div>
                </div>
                <div className="grid gap-8 max-w-3xl mx-auto px-4">
                    {/* STROOP TEST */}
                    <div className="bg-[#3a86ff] rounded-2xl p-10 shadow-xl border-4 border-[#8338ec]">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">TESTUL STROOP</h2>
                        <p className="text-white font-semibold text-lg mb-6 leading-relaxed">
                            Vei vedea cuvinte colorate și trebuie să selectezi <strong>CULOAREA</strong> cu care este scris cuvântul, nu textul citit.
                        </p>
                        <button 
                            onClick={() => navigate('/stroop-test')}
                            className="bg-[#8338ec] text-white px-10 py-4 rounded-xl text-xl font-black hover:scale-105 transition-transform shadow-lg"
                        >
                            MERGI LA PAGINA TESTULUI
                        </button>
                    </div>

                    {/*CPT TEST */}
                    <div className="bg-[#8338ec] rounded-2xl p-10 shadow-xl border-4 border-[#3a86ff]">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">CPT - PERECHI IDENTICE</h2>
                        <p className="text-white font-semibold text-lg mb-6 leading-relaxed">
                            Vei vedea numere aleatorii și trebuie să identifici perechile de numere <strong>IDENTICE</strong> care se succed pe ecran.
                        </p>
                        <button 
                            onClick={() => navigate('/cpt-test')}
                            className="bg-[#3a86ff] text-white px-10 py-4 rounded-xl text-xl font-black hover:scale-105 transition-transform shadow-lg"
                        >
                            MERGI LA PAGINA TESTULUI
                        </button>
                    </div>
                    
                    {/* Datele biometrice */}
                    <div className="bg-[#3a86ff] rounded-2xl p-10 shadow-xl border-4 border-[#8338ec]">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            DATELE BIOMETRICE
                        </h2>
                        <p className="text-white font-semibold text-lg mb-6 leading-relaxed">
                            Aici încarci <strong>.CSV</strong> exportat din aplicația O2 Insight Pro.
                            Exportă-l și încarcă-l o dată după ce dai testele în mediu normal, iar încă o dată după ce dai testele în mod experimental.
                        </p>
                        {/* Selector pentru tipul de fișier */}
                        <div className="bg-white/10 p-4 rounded-xl mb-6 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <label className="text-white font-black uppercase tracking-wider text-sm cursor-pointer">
                                MEDIU:
                            </label>
                            <div className="flex bg-white/20 rounded-lg p-1">
                                <button 
                                    onClick={() => setIsDistractedUpload(false)}
                                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${!isDistractedUpload ? 'bg-white text-[#3a86ff] shadow-sm' : 'text-white opacity-70 hover:opacity-100'}`}
                                >
                                    Normal
                                </button>
                                <button 
                                    onClick={() => setIsDistractedUpload(true)}
                                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${isDistractedUpload ? 'bg-[#ff006e] text-white shadow-sm' : 'text-white opacity-70 hover:opacity-100'}`}
                                >
                                    Experimental (Cu Notificări)
                                </button>
                            </div>
                        </div>
                        
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input 
                                type="file" 
                                accept=".csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-300 file:uppercase file:mr-4 text-xl file:py-4 file:px-10 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-[#e0e7ff] file:text-[#3a86ff] hover:scale-105 transition-transform hover:file:bg-[#c7d2fe] cursor-pointer"
                            />
                            <button 
                                onClick={handleFileUpload}
                                className="bg-[#ffffff] text-gray-800 px-10 py-4 rounded-xl text-xl font-black hover:scale-105 transition-transform shadow-lg"
                            >
                                PROCESEAZĂ
                            </button>
                        </div>
                        {uploadStatus && (
                            <div className={`mt-4 text-sm font-bold p-3 rounded-lg ${uploadStatus.includes('Eroare') ? 'bg-red-100 text-red-600' : 'bg-white/20 text-white'}`}>
                                {uploadStatus}
                            </div>
                        )}

                        {bioResults && (
                            <div className="mt-6 flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="text-center w-full mb-2">
                                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full text-white ${bioResults.mode.includes('Distras') ? 'bg-[#ff006e]' : 'bg-[#7cb518]'}`}>
                                        Sesiune: {bioResults.mode}
                                    </span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 text-center border-r border-gray-300">
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Puls Mediu</p>
                                        <p className="text-3xl font-black text-red-500">{bioResults.pulse} <span className="text-sm">BPM</span></p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nivel Mișcare</p>
                                        <p className="text-3xl font-black text-orange-500">{bioResults.movement} <span className="text-sm">din 10</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Predicția */}
                    <div className="bg-[#ffffff] rounded-2xl p-10 shadow-xl border-4 border-gray-800 text-center">
                        <h2 className="text-3xl font-black text-gray-800 mb-4 uppercase">
                            Predicție Productivitate
                        </h2>
                        <p className="text-gray-600 font-semibold mb-6">
                            Folosind Machine Learning, algoritmul Random Forest analizează profilul tău și rezultatele din teste pentru a estima un <strong>scor de productivitate</strong>. Am ales un timp de 1 sec ca răspuns optim.
                        </p>
                        
                        <button 
                            onClick={generateMLPrediction}
                            className="bg-gray-800 text-white px-10 py-4 rounded-xl text-xl font-black hover:scale-105 transition-transform shadow-lg uppercase w-full"
                        >
                            Calculează Scorul
                        </button>

                        {predictionResult && (
                            <div className="mt-8 bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
                                <h3 className="text-lg font-black uppercase mb-4 text-gray-500 tracking-widest border-b pb-2">Rezultatele tale (scoruri din 100)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-400 flex flex-col items-center justify-center text-center">
                                        <p className="text-xs font-black text-gray-400 uppercase">Acuratețe răspunsuri</p>
                                        <p className="text-3xl font-black text-green-500">{predictionResult.accuracy}%</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-400 flex flex-col items-center justify-center text-center">
                                        <p className="text-xs font-black text-gray-400 uppercase">Viteza răspunsurilor</p>
                                        <p className="text-3xl font-black text-[#8338ec]">{predictionResult.speed_score}</p>
                                    </div>
                                    <div className="bg-[#3a86ff] p-4 rounded-xl shadow-md border-2 text-white flex flex-col items-center justify-center text-center">
                                        <p className="text-xs font-black text-white/80 uppercase">Scorul de concentrare</p>
                                        <p className="text-4xl font-black">{predictionResult.focus_score}</p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black uppercase mb-4 text-gray-500 tracking-widest border-b pb-2">Productivitate Estimată</h3>
                                
                                <div className={`p-8 rounded-xl border-4 flex flex-col items-center justify-center ${predictionResult.prediction >= 50 ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
                                    <div className="text-6xl font-black">
                                        {predictionResult.prediction} <span className="text-2xl opacity-50">/ 100</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-full flex">
                {colors.map((color, index) => (
                    <div 
                        key={`legend-${index}`}
                        className="flex-1 h-24 sm:h-3"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    >
                    </div>
                ))}
            </div>
            
        </div>
    );
}